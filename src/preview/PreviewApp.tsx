import React, {
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
    parseGlobalStyleSnapshot,
    type GlobalStyleSnapshot,
} from '../dev/globalStyleSnapshot';
import { DashboardApp } from '../content/ui/components/DashboardApp';
import { ensureDashboardShadowMount } from '../content/ui/runtime/dashboardShadowMount';
import { UiStore } from '../content/ui/store/UiStore';
import type { DashboardRuntime } from '../content/ui/types';
import {
    PreviewChipButton,
    PreviewSidebar,
    SiteTopBar,
} from './components/PreviewChrome';
import { PreviewLandingPage } from './components/PreviewLandingPage';
import { installPreviewChromeMock } from './mockChrome';
import {
    createPreviewCanvasCards,
    createPreviewScenarios,
    PREVIEW_SCENARIO_ORDER,
    type PreviewScenarioId,
} from './mockDashboardData';
import { usePreviewGlobalStyleSnapshot } from './usePreviewGlobalStyleSnapshot';
import { DashboardScene } from './scenes/DashboardScene';
import { VodScene } from './scenes/VodScene';
import {
    PREVIEW_BROWSER_SCALE,
    PREVIEW_GLOBAL_STYLE_SNAPSHOT_KEY,
    type PreviewPageId,
} from './previewShared';
import { trackPreviewPageView } from './analytics';
import {
    applyScenario,
    configurePreviewShadowHost,
    initializePreviewRuntime,
} from './previewRuntime';

export function PreviewApp() {
    installPreviewChromeMock();

    const pageModeRef = useRef(true);
    const scenarioIdRef = useRef<PreviewScenarioId>('mixed');
    const scenarioMapRef = useRef(createPreviewScenarios());
    const [scenarioId, setScenarioId] = useState<PreviewScenarioId>('mixed');
    const [previewPage, setPreviewPage] = useState<PreviewPageId>('dashboard');
    const [globalStyleSnapshot] = useState<GlobalStyleSnapshot | null>(() => {
        try {
            const raw = window.localStorage.getItem(
                PREVIEW_GLOBAL_STYLE_SNAPSHOT_KEY,
            );
            return raw ? parseGlobalStyleSnapshot(raw) : null;
        } catch {
            return null;
        }
    });
    const runtimeRef = useRef<DashboardRuntime | null>(null);
    const storeRef = useRef<UiStore | null>(null);
    const browserShellRef = useRef<HTMLDivElement | null>(null);
    const browserChromeRef = useRef<HTMLDivElement | null>(null);
    const [shadowParent, setShadowParent] = useState<HTMLDivElement | null>(
        null,
    );
    const [browserShellHeight, setBrowserShellHeight] = useState(0);
    const [browserChromeHeight, setBrowserChromeHeight] = useState(0);

    if (!runtimeRef.current || !storeRef.current) {
        const { runtime, store } = initializePreviewRuntime({
            pageModeRef,
            previewPage,
            scenarioId,
            scenarioIdRef,
            scenarioMapRef,
        });
        runtimeRef.current = runtime;
        storeRef.current = store;
    }

    const runtime = runtimeRef.current!;
    const store = storeRef.current!;
    configurePreviewShadowHost(runtime, previewPage);

    const shadowMount = useMemo(
        () =>
            previewPage === 'dashboard' && shadowParent
                ? ensureDashboardShadowMount(runtime, shadowParent)
                : null,
        [previewPage, runtime, shadowParent],
    );
    usePreviewGlobalStyleSnapshot(globalStyleSnapshot);

    useEffect(() => {
        const shellEl = browserShellRef.current;
        const chromeEl = browserChromeRef.current;
        if (!shellEl) return;

        const syncMetrics = () => {
            setBrowserShellHeight(shellEl.getBoundingClientRect().height);
            setBrowserChromeHeight(
                chromeEl?.getBoundingClientRect().height || 0,
            );
        };

        syncMetrics();

        const observer = new ResizeObserver(() => {
            syncMetrics();
        });
        observer.observe(shellEl);
        if (chromeEl) {
            observer.observe(chromeEl);
        }
        window.addEventListener('resize', syncMetrics);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', syncMetrics);
        };
    }, [previewPage, scenarioId]);

    useLayoutEffect(() => {
        if (!shadowMount) return;

        runtime.__syncShadowHostEnvironment?.();
        window.addEventListener('resize', runtime.__syncShadowHostEnvironment);

        return () => {
            window.removeEventListener(
                'resize',
                runtime.__syncShadowHostEnvironment,
            );
        };
    }, [previewPage, runtime, scenarioId, shadowMount]);

    useEffect(() => {
        pageModeRef.current = previewPage === 'dashboard';
        trackPreviewPageView(previewPage);
        if (previewPage !== 'dashboard') {
            setShadowParent(null);
            store.setState({ settingsOpen: false });
        }
    }, [previewPage, store]);

    useEffect(() => {
        scenarioIdRef.current = scenarioId;
        applyScenario(runtime, store, scenarioMapRef.current[scenarioId]);
    }, [runtime, scenarioId, store]);

    const activeScenario = scenarioMapRef.current[scenarioId];

    return (
        <>
            <PreviewLandingPage>
                <div className="flex rounded-[36px]">
                    <div className="flex mx-auto h-[98vh] w-full items-start justify-center overflow-visible">
                        <div
                            ref={browserShellRef}
                            className="relative flex w-full shrink-0 max-h-[98vh] flex-col overflow-hidden rounded-[28px] border border-[#bcc4d0] bg-[#eef0f3] shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
                            style={{
                                width: `${100 / PREVIEW_BROWSER_SCALE}%`,
                                transform: `scale(${PREVIEW_BROWSER_SCALE})`,
                                transformOrigin: 'top center',
                            }}
                        >
                            <div
                                ref={browserChromeRef}
                                className="border-b border-[#ced4dd] bg-[#e8edf3] px-4 py-4 md:px-5"
                            >
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                                        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                                        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                                    </div>

                                    <div className="min-w-0 flex-1 rounded-full border border-white/70 bg-white/90 px-4 py-2 text-[13px] text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                                        https://ecampus.smu.ac.kr/{previewPage}
                                    </div>
                                </div>

                                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex flex-wrap gap-2">
                                        <PreviewChipButton
                                            active={previewPage === 'dashboard'}
                                            label="대시보드 페이지"
                                            onClick={() => {
                                                setPreviewPage('dashboard');
                                            }}
                                        />
                                        <PreviewChipButton
                                            active={previewPage === 'vod'}
                                            label="VOD 페이지"
                                            onClick={() => {
                                                setPreviewPage('vod');
                                            }}
                                        />
                                    </div>

                                    {previewPage === 'dashboard' ? (
                                        <div className="flex flex-wrap gap-2">
                                            {PREVIEW_SCENARIO_ORDER.map(
                                                (id) => {
                                                    const scenario =
                                                        scenarioMapRef.current[
                                                            id
                                                        ];
                                                    return (
                                                        <PreviewChipButton
                                                            key={id}
                                                            active={
                                                                scenarioId ===
                                                                id
                                                            }
                                                            label={
                                                                scenario.label
                                                            }
                                                            onClick={() => {
                                                                setScenarioId(
                                                                    id,
                                                                );
                                                            }}
                                                        />
                                                    );
                                                },
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-[12px] font-medium text-slate-500">
                                            VOD 패널 토글, 배속 메뉴, 1000배속
                                            버튼 상태를 바로 확인할 수 있습니다.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {previewPage === 'dashboard' ? (
                                <div
                                    ref={setShadowParent}
                                    className="pointer-events-none fixed inset-x-0 bottom-0 z-[2147483647] overflow-visible"
                                    style={{
                                        top: browserChromeHeight,
                                    }}
                                />
                            ) : null}

                            <div className="relative overflow-y-scroll">
                                <SiteTopBar />

                                <div className="grid grid-cols-[72px_minmax(0,1fr)] lg:grid-cols-[264px_minmax(0,1fr)]">
                                    <PreviewSidebar page={previewPage} />

                                    <main className="relative mt-[67px] min-h-[calc(100vh-208px)] overflow-hidden bg-[#f3f4f6]">
                                        {previewPage === 'dashboard' ? (
                                            <DashboardScene
                                                scenario={activeScenario}
                                                snapshotApplied={Boolean(
                                                    globalStyleSnapshot,
                                                )}
                                            />
                                        ) : (
                                            <VodScene
                                                scenario={activeScenario}
                                            />
                                        )}
                                    </main>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </PreviewLandingPage>

            {previewPage === 'dashboard' && shadowMount
                ? createPortal(
                      <DashboardApp store={store} runtime={runtime} />,
                      shadowMount.mountEl,
                  )
                : null}
        </>
    );
}
