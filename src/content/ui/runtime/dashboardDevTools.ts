import {
    createMockDashboardScenarios,
    type MockDashboardScenarioId,
} from '../../../dev/mockDashboardScenarios';
import { COURSE_FILTER_ALL } from '../constants';
import { UiStore } from '../store/UiStore';
import type { DashboardItem, DashboardRuntime, UiState } from '../types';
import { normalizeHiddenItemIds } from '../utils/hiddenItems';
import { syncStoreFromRuntime } from './dashboardRuntimeSetup';

const DEV_COMMAND_EVENT = 'ecdash:dev-command';

interface AttachDashboardDevToolsParams {
    runtime: DashboardRuntime;
    store: UiStore;
    mountReactRoot: () => HTMLElement;
}

interface DashboardDevRealSnapshot {
    items: DashboardItem[];
    courses: Array<Record<string, any>>;
    hiddenItemIds: string[];
    badge: string;
    sub: string;
    loading: boolean;
    loadingMessage: string;
    filter: UiState['filter'];
    typeFilter: UiState['typeFilter'];
    courseFilter: UiState['courseFilter'];
    hidePastLectures: boolean;
    hidePastAssignments: boolean;
    hidePastForums: boolean;
    hideDoneLectures: boolean;
    hideDoneAssignments: boolean;
    hideResources: boolean;
    hideNotices: boolean;
    includeSmClass: boolean;
}

function captureRealSnapshot(
    runtime: DashboardRuntime,
    store: UiStore,
): DashboardDevRealSnapshot {
    const state = store.getState();

    return {
        items: Array.isArray(window.__ECDASH_ITEMS__)
            ? ([...window.__ECDASH_ITEMS__] as DashboardItem[])
            : [],
        courses: Array.isArray(window.__ECDASH_COURSES__)
            ? [...window.__ECDASH_COURSES__]
            : [],
        hiddenItemIds: normalizeHiddenItemIds(runtime.__hiddenItemIds),
        badge: String(runtime.__lastBadge || state.badge || ''),
        sub: String(runtime.__lastSub || state.sub || ''),
        loading: Boolean(runtime.__isLoading ?? state.loading),
        loadingMessage: String(
            runtime.__loadingMessage || state.loadingMessage || '',
        ),
        filter: [...state.filter],
        typeFilter: [...state.typeFilter],
        courseFilter: state.courseFilter || COURSE_FILTER_ALL,
        hidePastLectures: Boolean(runtime.__hidePastLectures),
        hidePastAssignments: Boolean(runtime.__hidePastAssignments),
        hidePastForums: Boolean(runtime.__hidePastForums),
        hideDoneLectures: Boolean(runtime.__hideDoneLectures),
        hideDoneAssignments: Boolean(runtime.__hideDoneAssignments),
        hideResources: Boolean(runtime.__hideResources),
        hideNotices: Boolean(runtime.__hideNotices),
        includeSmClass: Boolean(runtime.__includeSmClass),
    };
}

function setRuntimeItems(
    runtime: DashboardRuntime,
    store: UiStore,
    items: DashboardItem[],
) {
    const nextItems = Array.isArray(items) ? items : [];
    if (typeof runtime.render === 'function') {
        runtime.render(nextItems);
        return;
    }

    window.__ECDASH_ITEMS__ = nextItems;
    syncStoreFromRuntime(runtime, store, nextItems);
}

function applyMockScenario(
    runtime: DashboardRuntime,
    store: UiStore,
    scenarioId: MockDashboardScenarioId,
    options?: { preserveUiState?: boolean },
) {
    const scenarios = createMockDashboardScenarios(Date.now());
    const scenario = scenarios[scenarioId] || scenarios.mixed;
    const preserveUiState = Boolean(options?.preserveUiState);

    if (runtime.__devDataSource !== 'mock' || !runtime.__devRealSnapshot) {
        runtime.__devRealSnapshot = captureRealSnapshot(runtime, store);
    }

    window.__ECDASH_COURSES__ = Array.isArray(scenario.courses)
        ? [...scenario.courses]
        : [];
    runtime.__lastBadge = scenario.badge;
    runtime.__lastSub = scenario.sub;
    runtime.__isLoading = false;
    runtime.__loadingMessage = '실페이지 mock 시나리오를 표시 중이에요.';
    runtime.__hiddenItemIds = preserveUiState
        ? normalizeHiddenItemIds(runtime.__hiddenItemIds)
        : normalizeHiddenItemIds(scenario.hiddenItemIds);
    runtime.__devDataSource = 'mock';
    runtime.__devScenarioId = scenario.id;

    setRuntimeItems(runtime, store, scenario.items);
    store.setState({
        loading: false,
        loadingMessage: '실페이지 mock 시나리오를 표시 중이에요.',
        badge: scenario.badge,
        sub: scenario.sub,
        hiddenItemIds: normalizeHiddenItemIds(runtime.__hiddenItemIds),
        devDataSource: 'mock',
        devScenarioId: scenario.id,
        ...(preserveUiState
            ? {}
            : {
                  filter: [],
                  typeFilter: [],
                  courseFilter: COURSE_FILTER_ALL,
                  settingsOpen: false,
              }),
    });
}

function restoreRealSnapshot(runtime: DashboardRuntime, store: UiStore) {
    const snapshot = runtime.__devRealSnapshot as
        | DashboardDevRealSnapshot
        | undefined;

    runtime.__devDataSource = 'real';
    if (!snapshot) {
        store.setState({ devDataSource: 'real' });
        return;
    }

    window.__ECDASH_COURSES__ = [...snapshot.courses];
    runtime.__hiddenItemIds = normalizeHiddenItemIds(snapshot.hiddenItemIds);
    runtime.__lastBadge = snapshot.badge;
    runtime.__lastSub = snapshot.sub;
    runtime.__isLoading = snapshot.loading;
    runtime.__loadingMessage = snapshot.loadingMessage;
    runtime.__hidePastLectures = snapshot.hidePastLectures;
    runtime.__hidePastAssignments = snapshot.hidePastAssignments;
    runtime.__hidePastForums = snapshot.hidePastForums;
    runtime.__hideDoneLectures = snapshot.hideDoneLectures;
    runtime.__hideDoneAssignments = snapshot.hideDoneAssignments;
    runtime.__hideResources = snapshot.hideResources;
    runtime.__hideNotices = snapshot.hideNotices;
    runtime.__includeSmClass = snapshot.includeSmClass;

    setRuntimeItems(runtime, store, snapshot.items);
    store.setState({
        filter: [...snapshot.filter],
        typeFilter: [...snapshot.typeFilter],
        courseFilter: snapshot.courseFilter,
        loading: snapshot.loading,
        loadingMessage: snapshot.loadingMessage,
        badge: snapshot.badge,
        sub: snapshot.sub,
        hiddenItemIds: normalizeHiddenItemIds(snapshot.hiddenItemIds),
        devDataSource: 'real',
    });

    runtime.__devRealSnapshot = null;
}

function attachContentDevApi(
    runtime: DashboardRuntime,
    store: UiStore,
    mountReactRoot: () => HTMLElement,
) {
    const devApi = (window.__ECDASH_DEV__ = window.__ECDASH_DEV__ || {});

    devApi.openDevPanel = function openDevPanel() {
        mountReactRoot();
        store.setState({ devPanelOpen: true });
    };

    devApi.closeDevPanel = function closeDevPanel() {
        store.setState({ devPanelOpen: false });
    };

    devApi.toggleDevPanel = function toggleDevPanel() {
        mountReactRoot();
        store.setState({ devPanelOpen: !store.getState().devPanelOpen });
    };

    devApi.useMockScenario = function useMockScenario(
        scenarioId: MockDashboardScenarioId = 'mixed',
    ) {
        mountReactRoot();
        applyMockScenario(runtime, store, scenarioId);
    };

    devApi.useRealData = function useRealData() {
        mountReactRoot();
        restoreRealSnapshot(runtime, store);
    };

    devApi.refreshMockScenario = function refreshMockScenario() {
        mountReactRoot();
        applyMockScenario(
            runtime,
            store,
            (runtime.__devScenarioId as MockDashboardScenarioId) || 'mixed',
            {
                preserveUiState: true,
            },
        );
    };

    devApi.refreshRealData = function refreshRealData() {
        mountReactRoot();
        restoreRealSnapshot(runtime, store);
        return runtime.__realRefreshAll?.({ force: true });
    };

    devApi.openSettings = function openSettings() {
        mountReactRoot();
        store.setState({
            collapsed: false,
            settingsOpen: true,
            devPanelOpen: true,
        });
    };
}

export function attachDashboardDevTools({
    runtime,
    store,
    mountReactRoot,
}: AttachDashboardDevToolsParams) {
    if (runtime.__dashboardDevToolsAttached) {
        return;
    }

    runtime.__dashboardDevToolsAttached = true;
    runtime.__devDataSource = runtime.__devDataSource || 'real';
    runtime.__devScenarioId = runtime.__devScenarioId || 'mixed';
    runtime.__toggleDevPanel = () => {
        mountReactRoot();
        store.setState({ devPanelOpen: !store.getState().devPanelOpen });
    };
    runtime.__applyDevMockScenario = (
        scenarioId: MockDashboardScenarioId,
        options?: { preserveUiState?: boolean },
    ) => {
        mountReactRoot();
        applyMockScenario(runtime, store, scenarioId, options);
    };
    runtime.__restoreDevRealSnapshot = () => {
        mountReactRoot();
        restoreRealSnapshot(runtime, store);
    };
    runtime.__refreshDevMockScenario = () => {
        mountReactRoot();
        applyMockScenario(
            runtime,
            store,
            (runtime.__devScenarioId as MockDashboardScenarioId) || 'mixed',
            {
                preserveUiState: true,
            },
        );
    };

    attachContentDevApi(runtime, store, mountReactRoot);

    window.addEventListener('keydown', (event) => {
        if (!event.altKey || !event.shiftKey) return;
        if (String(event.key || '').toLowerCase() !== 'd') return;

        event.preventDefault();
        runtime.__toggleDevPanel();
    });

    window.addEventListener(DEV_COMMAND_EVENT, ((event: Event) => {
        const detail = (event as CustomEvent)?.detail || {};
        const command = String(detail.command || '');

        switch (command) {
            case 'open-panel':
                mountReactRoot();
                store.setState({ devPanelOpen: true });
                break;
            case 'close-panel':
                store.setState({ devPanelOpen: false });
                break;
            case 'toggle-panel':
                runtime.__toggleDevPanel();
                break;
            case 'use-real-data':
                runtime.__restoreDevRealSnapshot();
                break;
            case 'use-mock-scenario':
                runtime.__applyDevMockScenario(
                    (detail.scenarioId as MockDashboardScenarioId) || 'mixed',
                );
                break;
            case 'refresh-mock-scenario':
                runtime.__refreshDevMockScenario();
                break;
            case 'refresh-real-data':
                runtime.__restoreDevRealSnapshot();
                void runtime.__realRefreshAll?.({ force: true });
                break;
            case 'open-settings':
                mountReactRoot();
                store.setState({
                    collapsed: false,
                    settingsOpen: true,
                    devPanelOpen: true,
                });
                break;
            case 'preview-error-log':
                runtime.setErrorLog?.(
                    String(
                        detail.text ||
                            `[eHelper] eCampus 수집 실패 로그
time=${new Date().toLocaleString()}
url=${location.href}
failures=1

#1
courseId=96598
courseName=커리어디자인
reason=empty_items
message=과목 수집 결과가 비어 있음`,
                    ),
                );
                break;
            case 'clear-error-log':
                runtime.setErrorLog?.('');
                break;
            default:
                break;
        }
    }) as EventListener);
}
