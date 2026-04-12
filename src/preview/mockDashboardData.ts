import {
    createMockDashboardScenarios,
    MOCK_DASHBOARD_SCENARIO_ORDER,
    type MockDashboardScenario as PreviewScenario,
    type MockDashboardScenarioId as PreviewScenarioId,
} from '../dev/mockDashboardScenarios';

export type { PreviewScenario, PreviewScenarioId };

function daysFromNow(now: number, days: number) {
    return now + days * 24 * 60 * 60 * 1000;
}

export function createPreviewScenarios(now = Date.now()) {
    return createMockDashboardScenarios(now);
}

export const PREVIEW_SCENARIO_ORDER = MOCK_DASHBOARD_SCENARIO_ORDER;

export function createPreviewCanvasCards(now = Date.now()) {
    const { mixed } = createPreviewScenarios(now);
    const urgentCount = mixed.items.filter(
        (item) =>
            item.status === 'TODO' &&
            typeof item.dueAt === 'number' &&
            item.dueAt <= daysFromNow(now, 1),
    ).length;
    const weeklyCount = mixed.items.filter(
        (item) =>
            item.status === 'TODO' &&
            typeof item.dueAt === 'number' &&
            item.dueAt <= daysFromNow(now, 7),
    ).length;

    return [
        {
            title: '임박한 마감',
            value: `${urgentCount}건`,
            note: '오늘 마감 과제와 이미 지난 토론을 같이 확인할 수 있어요.',
        },
        {
            title: '이번 주 마감',
            value: `${weeklyCount}건`,
            note: '강의, 과제, 토론이 섞인 학기 중간 흐름을 반영했어요.',
        },
        {
            title: '숨김 항목',
            value: `${mixed.hiddenItemIds.length}개`,
            note: '공지와 자료를 숨겨 둔 상태라 복원 동선도 함께 볼 수 있어요.',
        },
    ];
}
