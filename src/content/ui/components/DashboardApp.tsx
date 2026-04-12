import React, {
    useEffect,
    useMemo,
    useRef,
    useSyncExternalStore,
} from 'react';
import {
    COURSE_FILTER_ALL,
    UI_COLLAPSED_KEY,
    UI_HIDE_DONE_ASSIGNMENTS_KEY,
    UI_HIDE_DONE_LECTURES_KEY,
    UI_HIDE_NOTICES_KEY,
    UI_HIDE_PAST_ASSIGNMENTS_KEY,
    UI_HIDE_PAST_FORUMS_KEY,
    UI_HIDE_PAST_LECTURES_KEY,
    UI_HIDE_RESOURCES_KEY,
    UI_INCLUDE_SM_CLASS_KEY,
} from '../constants';
import { useCourseOpenMap } from '../hooks/useCourseOpenMap';
import { useDashboardSettingsLifecycle } from '../hooks/useDashboardSettingsLifecycle';
import { UiStore } from '../store/UiStore';
import type {
    DashboardRuntime,
    FilterValue,
    TypeFilterValue,
} from '../types';
import {
    collectCourseNames,
    collectNewCourseNames,
    normalizeCourseName,
} from '../utils/courseNames';
import {
    persistUiPreference,
    updateBooleanPreference,
    updateStoredHiddenItemIds,
} from '../utils/dashboardPersistence';
import { buildErrorReportMailto } from '../utils/errorReporting';
import {
    buildHiddenItemPreviews,
    normalizeHiddenItemIds,
} from '../utils/hiddenItems';
import { selectFilteredItems } from '../utils/itemFiltering';
import { cleanText } from '../utils/text';
import { DashboardContent } from './DashboardContent';
import { DashboardDevPanel } from './DashboardDevPanel';
import { DashboardShell } from './DashboardShell';

interface DashboardAppProps {
    store: UiStore;
    runtime: DashboardRuntime;
}

export function DashboardApp({ store, runtime }: DashboardAppProps) {
    // UIStore를 React 상태처럼 구독해 렌더링한다.
    const state = useSyncExternalStore(
        store.subscribe,
        store.getState,
        store.getState,
    );
    const lastSettingsCloseAtRef = useRef(0);
    const locationHref = useDashboardSettingsLifecycle(store);
    const isDashboardPage = useMemo(
        () => Boolean(runtime.isDashboardPage?.() ?? runtime.isDashboardSMU?.()),
        [runtime, locationHref],
    );

    const allCourses = useMemo(
        () => collectCourseNames(runtime, state.items, state.includeSmClass),
        [runtime, state.items, state.includeSmClass],
    );
    const newCourseNames = useMemo(
        () =>
            collectNewCourseNames(runtime, state.items, state.includeSmClass),
        [runtime, state.items, state.includeSmClass],
    );
    const normalizedCourseFilter = useMemo(
        () => normalizeCourseName(state.courseFilter) || COURSE_FILTER_ALL,
        [state.courseFilter],
    );
    const hiddenItems = useMemo(
        () =>
            buildHiddenItemPreviews(runtime, state.items, state.hiddenItemIds),
        [runtime, state.hiddenItemIds, state.items],
    );

    useEffect(() => {
        // 필터 대상 과목이 사라졌으면 전체 과목 필터로 자동 복귀한다.
        if (
            normalizedCourseFilter !== COURSE_FILTER_ALL &&
            !allCourses.includes(normalizedCourseFilter)
        ) {
            runtime.__courseFilter = COURSE_FILTER_ALL;
            store.setState({ courseFilter: COURSE_FILTER_ALL });
        }
    }, [allCourses, normalizedCourseFilter, runtime, store]);

    useEffect(() => {
        if (!isDashboardPage && state.settingsOpen) {
            store.setState({ settingsOpen: false });
        }
    }, [isDashboardPage, state.settingsOpen, store]);

    useEffect(() => {
        const nextTypeFilter = state.typeFilter.filter((type) => {
            if (state.hideResources && type === 'RESOURCE') return false;
            if (state.hideNotices && type === 'NOTICE') return false;
            return true;
        });

        if (nextTypeFilter.length !== state.typeFilter.length) {
            store.setState({ typeFilter: nextTypeFilter });
        }
    }, [state.hideNotices, state.hideResources, state.typeFilter, store]);

    const { filtered, groups } = useMemo(
        () => selectFilteredItems(state),
        [state],
    );
    const groupEntries = useMemo(() => Array.from(groups.entries()), [groups]);
    const { courseOpenMap, setCourseOpenMap } = useCourseOpenMap(groupEntries);

    const contactLink = useMemo(
        () => buildErrorReportMailto(state.sub),
        [state.sub],
    );
    const isMockMode = state.devDataSource === 'mock';

    return (
        <>
            <DashboardShell
                collapsed={state.collapsed}
                sub={state.sub}
                loading={state.loading}
                loadingMessage={state.loadingMessage}
                isDashboardPage={isDashboardPage}
                filter={state.filter}
                typeFilter={state.typeFilter}
                hideResources={state.hideResources}
                hideNotices={state.hideNotices}
                allCourses={allCourses}
                newCourseNames={newCourseNames}
                courseFilter={normalizedCourseFilter}
                courseFilterAllValue={COURSE_FILTER_ALL}
                settingsOpen={state.settingsOpen}
                contactLink={contactLink}
                hidePastLectures={state.hidePastLectures}
                hidePastAssignments={state.hidePastAssignments}
                hidePastForums={state.hidePastForums}
                hideDoneLectures={state.hideDoneLectures}
                hideDoneAssignments={state.hideDoneAssignments}
                includeSmClass={state.includeSmClass}
                hiddenItemCount={state.hiddenItemIds.length}
                hiddenItems={hiddenItems}
                onToggleCollapsed={async () => {
                    const nextCollapsed = !state.collapsed;
                    store.setState({ collapsed: nextCollapsed });
                    await persistUiPreference(UI_COLLAPSED_KEY, nextCollapsed);
                }}
                onFilterChange={(values) => {
                    store.setState({ filter: values as FilterValue[] });
                }}
                onTypeFilterChange={(values) => {
                    store.setState({ typeFilter: values as TypeFilterValue[] });
                }}
                onRefresh={() => {
                    runtime.refreshAll?.({ force: true });
                }}
                onOpenSettings={() => {
                    if (Date.now() - lastSettingsCloseAtRef.current < 250) return;
                    store.setState({ settingsOpen: true });
                }}
                onSelectCourse={(courseName) => {
                    runtime.__courseFilter = courseName;
                    store.setState({ courseFilter: courseName });
                }}
                onCloseSettings={() => {
                    lastSettingsCloseAtRef.current = Date.now();
                    store.setState({ settingsOpen: false });
                }}
                onHidePastLecturesChange={async (checked) => {
                    if (isMockMode) {
                        runtime.__hidePastLectures = checked;
                        store.setState({ hidePastLectures: checked });
                        return;
                    }

                    await updateBooleanPreference(store, runtime, {
                        checked,
                        storageKey: UI_HIDE_PAST_LECTURES_KEY,
                        runtimeKey: '__hidePastLectures',
                        stateKey: 'hidePastLectures',
                    });
                }}
                onHidePastAssignmentsChange={async (checked) => {
                    if (isMockMode) {
                        runtime.__hidePastAssignments = checked;
                        store.setState({ hidePastAssignments: checked });
                        return;
                    }

                    await updateBooleanPreference(store, runtime, {
                        checked,
                        storageKey: UI_HIDE_PAST_ASSIGNMENTS_KEY,
                        runtimeKey: '__hidePastAssignments',
                        stateKey: 'hidePastAssignments',
                    });
                }}
                onHidePastForumsChange={async (checked) => {
                    if (isMockMode) {
                        runtime.__hidePastForums = checked;
                        store.setState({ hidePastForums: checked });
                        return;
                    }

                    await updateBooleanPreference(store, runtime, {
                        checked,
                        storageKey: UI_HIDE_PAST_FORUMS_KEY,
                        runtimeKey: '__hidePastForums',
                        stateKey: 'hidePastForums',
                    });
                }}
                onHideDoneLecturesChange={async (checked) => {
                    if (isMockMode) {
                        runtime.__hideDoneLectures = checked;
                        store.setState({ hideDoneLectures: checked });
                        return;
                    }

                    await updateBooleanPreference(store, runtime, {
                        checked,
                        storageKey: UI_HIDE_DONE_LECTURES_KEY,
                        runtimeKey: '__hideDoneLectures',
                        stateKey: 'hideDoneLectures',
                    });
                }}
                onHideDoneAssignmentsChange={async (checked) => {
                    if (isMockMode) {
                        runtime.__hideDoneAssignments = checked;
                        store.setState({ hideDoneAssignments: checked });
                        return;
                    }

                    await updateBooleanPreference(store, runtime, {
                        checked,
                        storageKey: UI_HIDE_DONE_ASSIGNMENTS_KEY,
                        runtimeKey: '__hideDoneAssignments',
                        stateKey: 'hideDoneAssignments',
                    });
                }}
                onHideResourcesChange={async (checked) => {
                    if (isMockMode) {
                        runtime.__hideResources = checked;
                        store.setState({ hideResources: checked });
                        return;
                    }

                    await updateBooleanPreference(store, runtime, {
                        checked,
                        storageKey: UI_HIDE_RESOURCES_KEY,
                        runtimeKey: '__hideResources',
                        stateKey: 'hideResources',
                    });
                }}
                onHideNoticesChange={async (checked) => {
                    if (isMockMode) {
                        runtime.__hideNotices = checked;
                        store.setState({ hideNotices: checked });
                        return;
                    }

                    await updateBooleanPreference(store, runtime, {
                        checked,
                        storageKey: UI_HIDE_NOTICES_KEY,
                        runtimeKey: '__hideNotices',
                        stateKey: 'hideNotices',
                    });
                }}
                onIncludeSmClassChange={async (checked) => {
                    if (isMockMode) {
                        runtime.__includeSmClass = checked;
                        store.setState({ includeSmClass: checked });
                        return;
                    }

                    await updateBooleanPreference(store, runtime, {
                        checked,
                        storageKey: UI_INCLUDE_SM_CLASS_KEY,
                        runtimeKey: '__includeSmClass',
                        stateKey: 'includeSmClass',
                    });

                    if (typeof runtime.refreshAll === 'function') {
                        runtime.refreshAll({ force: true });
                    } else {
                        runtime.render(window.__ECDASH_ITEMS__ || []);
                    }
                }}
                onUnhideItem={async (itemId) => {
                    const normalizedItemId = cleanText(itemId);
                    if (!normalizedItemId) return;
                    if (!state.hiddenItemIds.includes(normalizedItemId)) return;

                    const nextHiddenItemIds = state.hiddenItemIds.filter(
                        (hiddenItemId) => hiddenItemId !== normalizedItemId,
                    );
                    if (isMockMode) {
                        runtime.__hiddenItemIds = normalizeHiddenItemIds(
                            nextHiddenItemIds,
                        );
                        store.setState({
                            hiddenItemIds: normalizeHiddenItemIds(nextHiddenItemIds),
                        });
                        return;
                    }

                    await updateStoredHiddenItemIds(
                        store,
                        runtime,
                        normalizeHiddenItemIds(nextHiddenItemIds),
                    );
                }}
                onResetHiddenItems={async () => {
                    if (!state.hiddenItemIds.length) return;
                    if (isMockMode) {
                        runtime.__hiddenItemIds = [];
                        store.setState({ hiddenItemIds: [] });
                        return;
                    }

                    await updateStoredHiddenItemIds(store, runtime, []);
                }}
            >
                <DashboardContent
                    runtime={runtime}
                    hasItems={state.items.length > 0}
                    loading={state.loading}
                    loadingMessage={state.loadingMessage}
                    hiddenItemCount={state.hiddenItemIds.length}
                    filteredItems={filtered}
                    groupEntries={groupEntries}
                    courseOpenMap={courseOpenMap}
                    onToggleCourse={(courseName) => {
                        setCourseOpenMap((prev) => ({
                            ...prev,
                            [courseName]: !(prev[courseName] ?? true),
                        }));
                    }}
                    onHideItem={async (itemId) => {
                        const normalizedItemId = cleanText(itemId);
                        if (!normalizedItemId) return;
                        if (state.hiddenItemIds.includes(normalizedItemId)) return;

                        const nextHiddenItemIds = normalizeHiddenItemIds([
                            ...state.hiddenItemIds,
                            normalizedItemId,
                        ]);
                        if (isMockMode) {
                            runtime.__hiddenItemIds = nextHiddenItemIds;
                            store.setState({
                                hiddenItemIds: nextHiddenItemIds,
                            });
                            return;
                        }

                        await updateStoredHiddenItemIds(
                            store,
                            runtime,
                            nextHiddenItemIds,
                        );
                    }}
                />
            </DashboardShell>

            <DashboardDevPanel
                visible={state.devPanelOpen}
                dataSource={state.devDataSource}
                scenarioId={state.devScenarioId}
                itemCount={state.items.length}
                courseCount={allCourses.length}
                isDashboardPage={isDashboardPage}
                settingsOpen={state.settingsOpen}
                onClose={() => {
                    store.setState({ devPanelOpen: false });
                }}
                onUseRealData={() => {
                    runtime.__restoreDevRealSnapshot?.();
                }}
                onRefreshRealData={() => {
                    runtime.__restoreDevRealSnapshot?.();
                    runtime.__realRefreshAll?.({ force: true });
                }}
                onUseMockScenario={(scenarioId) => {
                    runtime.__applyDevMockScenario?.(scenarioId);
                }}
                onRefreshMockScenario={() => {
                    runtime.__refreshDevMockScenario?.();
                }}
                onOpenSettings={() => {
                    store.setState({
                        collapsed: false,
                        settingsOpen: true,
                    });
                }}
            />
        </>
    );
}
