import {
    COURSE_FILTER_ALL,
    UI_COLLAPSED_KEY,
    UI_HIDDEN_ITEM_IDS_KEY,
    UI_HIDE_DONE_ASSIGNMENTS_KEY,
    UI_HIDE_DONE_LECTURES_KEY,
    UI_HIDE_NOTICES_KEY,
    UI_HIDE_PAST_ASSIGNMENTS_KEY,
    UI_HIDE_PAST_FORUMS_KEY,
    UI_HIDE_PAST_LECTURES_KEY,
    UI_HIDE_RESOURCES_KEY,
    UI_INCLUDE_SM_CLASS_KEY,
} from '../constants';
import { UiStore } from '../store/UiStore';
import type { DashboardItem, DashboardRuntime } from '../types';
import { normalizeCourseName } from '../utils/courseNames';
import { normalizeHiddenItemIds } from '../utils/hiddenItems';
import { cleanText } from '../utils/text';

// window.__ECDASH__의 UI 관련 필드를 안전한 기본값으로 맞춘다.
export function initializeRuntimeState(runtime: DashboardRuntime) {
    runtime.__isLoading = Boolean(runtime.__isLoading);
    runtime.__loadingMessage = cleanText(
        runtime.__loadingMessage || '데이터를 가져오는 중...',
    );
    runtime.__courseFilter =
        normalizeCourseName(runtime.__courseFilter || COURSE_FILTER_ALL) ||
        COURSE_FILTER_ALL;
    runtime.__hidePastLectures = Boolean(runtime.__hidePastLectures);
    runtime.__hidePastAssignments = Boolean(runtime.__hidePastAssignments);
    runtime.__hidePastForums = Boolean(runtime.__hidePastForums);
    runtime.__hideDoneLectures = Boolean(runtime.__hideDoneLectures);
    runtime.__hideDoneAssignments = Boolean(runtime.__hideDoneAssignments);
    runtime.__hideResources = Boolean(runtime.__hideResources);
    runtime.__hideNotices = Boolean(runtime.__hideNotices);
    runtime.__includeSmClass = Boolean(runtime.__includeSmClass);
    runtime.__hiddenItemIds = normalizeHiddenItemIds(runtime.__hiddenItemIds);
    runtime.__lastBadge = cleanText(runtime.__lastBadge || '');
    runtime.__lastSub = cleanText(runtime.__lastSub || '');
}

// 런타임 값을 기준으로 UIStore의 초기 상태를 생성한다.
export function createUiStore(runtime: DashboardRuntime) {
    return new UiStore({
        items: Array.isArray(window.__ECDASH_ITEMS__)
            ? (window.__ECDASH_ITEMS__ as DashboardItem[])
            : [],
        filter: [],
        typeFilter: [],
        hiddenItemIds: normalizeHiddenItemIds(runtime.__hiddenItemIds),
        courseFilter: runtime.__courseFilter || COURSE_FILTER_ALL,
        hidePastLectures: Boolean(runtime.__hidePastLectures),
        hidePastAssignments: Boolean(runtime.__hidePastAssignments),
        hidePastForums: Boolean(runtime.__hidePastForums),
        hideDoneLectures: Boolean(runtime.__hideDoneLectures),
        hideDoneAssignments: Boolean(runtime.__hideDoneAssignments),
        hideResources: Boolean(runtime.__hideResources),
        hideNotices: Boolean(runtime.__hideNotices),
        includeSmClass: Boolean(runtime.__includeSmClass),
        collapsed: false,
        loading: Boolean(runtime.__isLoading),
        loadingMessage: runtime.__loadingMessage || '데이터를 가져오는 중...',
        badge: runtime.__lastBadge || '',
        sub: runtime.__lastSub || '대시보드에서 과목을 찾고 활동을 크롤링해요.',
        settingsOpen: false,
        devPanelOpen: false,
        devDataSource: 'real',
        devScenarioId: 'mixed',
    });
}

// 저장소 설정을 읽어 런타임/스토어 상태에 반영한다.
export async function applyInitialStateFromStorage(
    runtime: DashboardRuntime,
    store: UiStore,
) {
    try {
        const res = await chrome.storage?.local?.get?.([
            UI_COLLAPSED_KEY,
            UI_HIDE_PAST_LECTURES_KEY,
            UI_HIDE_PAST_ASSIGNMENTS_KEY,
            UI_HIDE_PAST_FORUMS_KEY,
            UI_HIDE_DONE_LECTURES_KEY,
            UI_HIDE_DONE_ASSIGNMENTS_KEY,
            UI_HIDE_RESOURCES_KEY,
            UI_HIDE_NOTICES_KEY,
            UI_INCLUDE_SM_CLASS_KEY,
            UI_HIDDEN_ITEM_IDS_KEY,
        ]);

        const nextCollapsed = Boolean(res?.[UI_COLLAPSED_KEY]);
        const nextHidePastLectures = Boolean(res?.[UI_HIDE_PAST_LECTURES_KEY]);
        const nextHidePastAssignments = Boolean(
            res?.[UI_HIDE_PAST_ASSIGNMENTS_KEY],
        );
        const nextHidePastForums = Boolean(res?.[UI_HIDE_PAST_FORUMS_KEY]);
        const nextHideDoneLectures = Boolean(res?.[UI_HIDE_DONE_LECTURES_KEY]);
        const nextHideDoneAssignments = Boolean(
            res?.[UI_HIDE_DONE_ASSIGNMENTS_KEY],
        );
        const nextHideResources = Boolean(res?.[UI_HIDE_RESOURCES_KEY]);
        const nextHideNotices = Boolean(res?.[UI_HIDE_NOTICES_KEY]);
        const nextIncludeSmClass = Boolean(res?.[UI_INCLUDE_SM_CLASS_KEY]);
        const nextHiddenItemIds = normalizeHiddenItemIds(
            res?.[UI_HIDDEN_ITEM_IDS_KEY],
        );

        runtime.__hidePastLectures = nextHidePastLectures;
        runtime.__hidePastAssignments = nextHidePastAssignments;
        runtime.__hidePastForums = nextHidePastForums;
        runtime.__hideDoneLectures = nextHideDoneLectures;
        runtime.__hideDoneAssignments = nextHideDoneAssignments;
        runtime.__hideResources = nextHideResources;
        runtime.__hideNotices = nextHideNotices;
        runtime.__includeSmClass = nextIncludeSmClass;
        runtime.__hiddenItemIds = nextHiddenItemIds;

        store.setState({
            collapsed: nextCollapsed,
            hidePastLectures: nextHidePastLectures,
            hidePastAssignments: nextHidePastAssignments,
            hidePastForums: nextHidePastForums,
            hideDoneLectures: nextHideDoneLectures,
            hideDoneAssignments: nextHideDoneAssignments,
            hideResources: nextHideResources,
            hideNotices: nextHideNotices,
            includeSmClass: nextIncludeSmClass,
            hiddenItemIds: nextHiddenItemIds,
        });
    } catch {
        // ignore
    }

    if (typeof runtime.render === 'function') {
        runtime.render(window.__ECDASH_ITEMS__ || []);
    }
}

// runtime.render 호출 시 런타임 값을 기준으로 스토어를 동기화한다.
export function syncStoreFromRuntime(
    runtime: DashboardRuntime,
    store: UiStore,
    items: DashboardItem[],
) {
    store.setState({
        items,
        courseFilter:
            normalizeCourseName(runtime.__courseFilter || COURSE_FILTER_ALL) ||
            COURSE_FILTER_ALL,
        hidePastLectures: Boolean(runtime.__hidePastLectures),
        hidePastAssignments: Boolean(runtime.__hidePastAssignments),
        hidePastForums: Boolean(runtime.__hidePastForums),
        hideDoneLectures: Boolean(runtime.__hideDoneLectures),
        hideDoneAssignments: Boolean(runtime.__hideDoneAssignments),
        hideResources: Boolean(runtime.__hideResources),
        hideNotices: Boolean(runtime.__hideNotices),
        includeSmClass: Boolean(runtime.__includeSmClass),
        hiddenItemIds: normalizeHiddenItemIds(runtime.__hiddenItemIds),
    });
}
