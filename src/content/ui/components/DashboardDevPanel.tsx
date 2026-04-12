import {
    MOCK_DASHBOARD_SCENARIO_ORDER,
    createMockDashboardScenarios,
} from '../../../dev/mockDashboardScenarios';
import type { DashboardDevDataSource } from '../types';

interface DashboardDevPanelProps {
    visible: boolean;
    dataSource: DashboardDevDataSource;
    scenarioId: string;
    itemCount: number;
    courseCount: number;
    isDashboardPage: boolean;
    settingsOpen: boolean;
    onClose: () => void;
    onUseRealData: () => void;
    onRefreshRealData: () => void;
    onUseMockScenario: (scenarioId: string) => void;
    onRefreshMockScenario: () => void;
    onOpenSettings: () => void;
}

export function DashboardDevPanel({
    visible,
    dataSource,
    scenarioId,
    itemCount,
    courseCount,
    isDashboardPage,
    settingsOpen,
    onClose,
    onUseRealData,
    onRefreshRealData,
    onUseMockScenario,
    onRefreshMockScenario,
    onOpenSettings,
}: DashboardDevPanelProps) {
    const scenarios = createMockDashboardScenarios();

    if (!visible) return null;

    return (
        <aside className="pointer-events-auto fixed bottom-3 left-3 z-[1000000] w-[min(360px,calc(100vw-24px))] rounded-[24px] border border-zinc-200 bg-white/98 p-4 text-zinc-900 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-600">
                        Dev Mode
                    </p>
                    <h2 className="mt-1 text-[18px] font-bold tracking-tight text-zinc-950">
                        실제 e-Campus 테스트
                    </h2>
                    <p className="mt-1 text-[12px] leading-5 text-zinc-600">
                        `Alt+Shift+D`로 다시 열고 닫을 수 있어요.
                    </p>
                </div>
                <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-[15px] text-zinc-700 shadow-[0_6px_14px_rgba(15,23,42,0.06)] transition hover:border-zinc-300 hover:bg-zinc-100"
                    aria-label="개발 패널 닫기"
                    onClick={onClose}
                >
                    ✕
                </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2">
                    <div className="text-[11px] font-medium text-zinc-500">
                        데이터 소스
                    </div>
                    <div className="mt-1 text-[13px] font-semibold text-zinc-900">
                        {dataSource === 'mock' ? 'Mock' : 'Real'}
                    </div>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2">
                    <div className="text-[11px] font-medium text-zinc-500">
                        현재 상태
                    </div>
                    <div className="mt-1 text-[13px] font-semibold text-zinc-900">
                        항목 {itemCount}개 · 과목 {courseCount}개
                    </div>
                </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-600">
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5">
                    {isDashboardPage ? '대시보드 페이지' : '비대시보드 페이지'}
                </span>
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5">
                    설정 {settingsOpen ? '열림' : '닫힘'}
                </span>
                {dataSource === 'mock' ? (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-700">
                        시나리오 {scenarioId}
                    </span>
                ) : null}
            </div>

            <div className="mt-4 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        className={[
                            'rounded-2xl border px-3 py-2.5 text-[12px] font-medium transition',
                            dataSource === 'real'
                                ? 'border-sky-300 bg-sky-50 text-sky-800'
                                : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50',
                        ].join(' ')}
                        onClick={onUseRealData}
                    >
                        실제 데이터 복원
                    </button>
                    <button
                        type="button"
                        className="rounded-2xl border border-zinc-200 bg-white px-3 py-2.5 text-[12px] font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
                        onClick={onRefreshRealData}
                    >
                        실제 새로고침
                    </button>
                </div>
                <button
                    type="button"
                    className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2.5 text-[12px] font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
                    onClick={onOpenSettings}
                >
                    설정 모달 열기
                </button>
            </div>

            <div className="mt-4 rounded-[20px] border border-zinc-200 bg-zinc-50/85 p-3">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h3 className="text-[13px] font-semibold text-zinc-950">
                            Mock 시나리오
                        </h3>
                        <p className="mt-1 text-[11px] leading-5 text-zinc-600">
                            실제 e-Campus 위에서 프리뷰용 데이터를 그대로
                            덮어씁니다.
                        </p>
                    </div>
                    {dataSource === 'mock' ? (
                        <button
                            type="button"
                            className="shrink-0 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[11px] font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
                            onClick={onRefreshMockScenario}
                        >
                            mock 새로고침
                        </button>
                    ) : null}
                </div>

                <div className="mt-3 grid gap-2">
                    {MOCK_DASHBOARD_SCENARIO_ORDER.map((id) => {
                        const scenario = scenarios[id];
                        const selected =
                            dataSource === 'mock' && scenarioId === id;

                        return (
                            <button
                                key={id}
                                type="button"
                                className={[
                                    'rounded-2xl border px-3 py-3 text-left transition',
                                    selected
                                        ? 'border-amber-300 bg-amber-50 text-amber-900'
                                        : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50',
                                ].join(' ')}
                                onClick={() => {
                                    onUseMockScenario(id);
                                }}
                            >
                                <div className="text-[12px] font-semibold">
                                    {scenario.label}
                                </div>
                                <div className="mt-1 text-[11px] leading-5 text-zinc-600">
                                    {scenario.description}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}
