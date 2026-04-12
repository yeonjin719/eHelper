import type { MutableRefObject } from 'react';
import { COURSE_FILTER_ALL } from '../content/ui/constants';
import {
    createUiStore,
    initializeRuntimeState,
    syncStoreFromRuntime,
} from '../content/ui/runtime/dashboardRuntimeSetup';
import { UiStore } from '../content/ui/store/UiStore';
import type { DashboardItem, DashboardRuntime } from '../content/ui/types';
import { normalizeHiddenItemIds } from '../content/ui/utils/hiddenItems';
import {
    createPreviewScenarios,
    type PreviewScenario,
    type PreviewScenarioId,
} from './mockDashboardData';
import { type PreviewPageId, wait } from './previewShared';

export function createPreviewRuntime(
    pageModeRef: MutableRefObject<boolean>,
): DashboardRuntime {
    return {
        constants: {
            ROOT_ID: 'ecdash-root',
        },
        TYPE_LABEL: {
            ASSIGNMENT: '과제',
            QUIZ: '퀴즈',
            LECTURE: '강의',
            FORUM: '토론',
            RESOURCE: '자료',
            NOTICE: '공지',
        },
        isDashboardPage() {
            return pageModeRef.current;
        },
        isDashboardSMU() {
            return pageModeRef.current;
        },
        normalizeCourseCache(courses: unknown) {
            return Array.isArray(courses) ? courses : [];
        },
        filterSmClassCourses(courses: any[], includeSmClass: boolean) {
            return {
                courses: includeSmClass
                    ? courses
                    : courses.filter((course) => !course?.isSmClass),
            };
        },
        statusLabel(status: string) {
            if (status === 'TODO') return '미완료';
            if (status === 'DONE') return '완료';
            return '상태 미상';
        },
        statusClass(status: string) {
            if (status === 'TODO') return 'todo';
            if (status === 'DONE') return 'done';
            return 'unknown';
        },
        ddayLabel(dueAt: number) {
            const diff = dueAt - Date.now();
            const hour = 60 * 60 * 1000;
            const day = 24 * hour;

            if (diff < 0) return '마감';
            if (diff < day) return `D-${Math.max(0, Math.ceil(diff / hour))}h`;
            return `D-${Math.ceil(diff / day)}`;
        },
        normalizeUrl(url: string) {
            return url;
        },
    };
}

export function applyScenario(
    runtime: DashboardRuntime,
    store: UiStore,
    scenario: PreviewScenario,
    options?: { preserveUiState?: boolean },
) {
    window.__ECDASH_ITEMS__ = scenario.items;
    window.__ECDASH_COURSES__ = scenario.courses;
    runtime.__hiddenItemIds = normalizeHiddenItemIds(scenario.hiddenItemIds);
    runtime.__lastBadge = scenario.badge;
    runtime.__lastSub = scenario.sub;
    runtime.__isLoading = false;
    runtime.__loadingMessage = '프리뷰 준비 완료';

    if (!options?.preserveUiState) {
        runtime.__courseFilter = COURSE_FILTER_ALL;
        runtime.__hidePastLectures = false;
        runtime.__hidePastAssignments = false;
        runtime.__hidePastForums = false;
        runtime.__hideDoneLectures = false;
        runtime.__hideDoneAssignments = false;
    }

    syncStoreFromRuntime(runtime, store, scenario.items);
    const nextState = {
        badge: scenario.badge,
        sub: scenario.sub,
        loading: false,
        loadingMessage: '프리뷰 준비 완료',
        hiddenItemIds: normalizeHiddenItemIds(scenario.hiddenItemIds),
    };

    if (options?.preserveUiState) {
        store.setState(nextState);
        return;
    }

    store.setState({
        ...nextState,
        settingsOpen: false,
        collapsed: false,
        filter: [],
        typeFilter: [],
        courseFilter: COURSE_FILTER_ALL,
    });
}

interface InitializePreviewRuntimeArgs {
    pageModeRef: MutableRefObject<boolean>;
    previewPage: PreviewPageId;
    scenarioId: PreviewScenarioId;
    scenarioIdRef: MutableRefObject<PreviewScenarioId>;
    scenarioMapRef: MutableRefObject<
        Record<PreviewScenarioId, PreviewScenario>
    >;
}

export function initializePreviewRuntime({
    pageModeRef,
    previewPage,
    scenarioId,
    scenarioIdRef,
    scenarioMapRef,
}: InitializePreviewRuntimeArgs) {
    const initialScenario = scenarioMapRef.current[scenarioId];

    pageModeRef.current = previewPage === 'dashboard';

    const runtime = createPreviewRuntime(pageModeRef);
    window.__ECDASH__ = runtime;
    window.__ECDASH_ITEMS__ = initialScenario.items;
    window.__ECDASH_COURSES__ = initialScenario.courses;
    runtime.__courseFilter = COURSE_FILTER_ALL;
    runtime.__hidePastLectures = false;
    runtime.__hidePastAssignments = false;
    runtime.__hidePastForums = false;
    runtime.__hideDoneLectures = false;
    runtime.__hideDoneAssignments = false;
    runtime.__includeSmClass = false;
    runtime.__hiddenItemIds = normalizeHiddenItemIds(
        initialScenario.hiddenItemIds,
    );
    runtime.__lastBadge = initialScenario.badge;
    runtime.__lastSub = initialScenario.sub;
    runtime.__isLoading = false;
    runtime.__loadingMessage = '프리뷰 준비 완료';

    initializeRuntimeState(runtime);
    const store = createUiStore(runtime);

    runtime.render = function render(items: DashboardItem[]) {
        const nextItems = Array.isArray(items) ? items : [];
        window.__ECDASH_ITEMS__ = nextItems;
        syncStoreFromRuntime(runtime, store, nextItems);
    };

    runtime.refreshAll = async function refreshAllPreview() {
        if (store.getState().loading) return;

        store.setState({
            loading: true,
            loadingMessage: '프리뷰 데이터를 다시 그리는 중...',
        });

        await wait(650);

        scenarioMapRef.current = createPreviewScenarios(Date.now());
        const refreshedScenario = scenarioMapRef.current[scenarioIdRef.current];
        applyScenario(runtime, store, refreshedScenario, {
            preserveUiState: true,
        });
        store.setState({
            loading: false,
            loadingMessage: '프리뷰 준비 완료',
            sub: `${refreshedScenario.sub} · ${new Date().toLocaleTimeString('ko-KR')}`,
        });
    };

    return { runtime, store };
}

export function configurePreviewShadowHost(
    runtime: DashboardRuntime,
    previewPage: PreviewPageId,
) {
    runtime.__syncShadowHostEnvironmentCustom = ({
        hostEl,
    }: {
        hostEl: HTMLElement;
    }) => {
        if (previewPage === 'dashboard') {
            hostEl.style.position = 'absolute';
            hostEl.style.top = '0';
            hostEl.style.left = '0';
            hostEl.style.right = '0';
            hostEl.style.bottom = '0';
            hostEl.style.width = '100%';
            hostEl.style.height = '100%';
            hostEl.style.zIndex = '2147483647';
            hostEl.style.isolation = 'isolate';
            hostEl.style.overflow = 'visible';
            hostEl.style.pointerEvents = 'none';
            hostEl.style.fontSize = '16px';
            hostEl.style.lineHeight = '1.5';
            hostEl.style.colorScheme = 'light';
            return;
        }

        hostEl.style.position = 'fixed';
        hostEl.style.top = '0';
        hostEl.style.left = '0';
        hostEl.style.right = '0';
        hostEl.style.bottom = '0';
        hostEl.style.width = '100vw';
        hostEl.style.height = '100vh';
        hostEl.style.zIndex = '2147483647';
        hostEl.style.isolation = 'isolate';
        hostEl.style.overflow = 'visible';
        hostEl.style.pointerEvents = 'none';
        hostEl.style.fontSize = '16px';
        hostEl.style.lineHeight = '1.5';
        hostEl.style.colorScheme = 'light';
    };
}
