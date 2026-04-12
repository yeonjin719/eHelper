export type ItemType =
    | 'ASSIGNMENT'
    | 'QUIZ'
    | 'LECTURE'
    | 'FORUM'
    | 'RESOURCE'
    | 'NOTICE';
export type ItemStatus = 'TODO' | 'DONE' | 'UNKNOWN';
export type FilterValue = 'DUE_SOON' | 'OVERDUE' | 'TODO_ONLY' | 'NOT_DONE';
export type TypeFilterValue = ItemType;
export type DashboardDevDataSource = 'real' | 'mock';

export interface DashboardItem {
    id: string;
    type: ItemType;
    courseId: string;
    courseName: string;
    courseIsNew?: boolean;
    title: string;
    url?: string;
    section?: string;
    dueAt?: number;
    dueScore?: number;
    status: ItemStatus;
    meta?: string;
}

export interface UiState {
    items: DashboardItem[];
    filter: FilterValue[];
    typeFilter: TypeFilterValue[];
    hiddenItemIds: string[];
    courseFilter: string;
    hidePastLectures: boolean;
    hidePastAssignments: boolean;
    hidePastForums: boolean;
    hideDoneLectures: boolean;
    hideDoneAssignments: boolean;
    hideResources: boolean;
    hideNotices: boolean;
    includeSmClass: boolean;
    collapsed: boolean;
    loading: boolean;
    loadingMessage: string;
    badge: string;
    sub: string;
    settingsOpen: boolean;
    devPanelOpen: boolean;
    devDataSource: DashboardDevDataSource;
    devScenarioId: string;
}

export type DashboardRuntime = Record<string, any>;
