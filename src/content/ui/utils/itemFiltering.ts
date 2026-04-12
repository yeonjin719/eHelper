import { COURSE_FILTER_ALL } from '../constants';
import type { DashboardItem, UiState } from '../types';
import { normalizeCourseName } from './courseNames';
import { getEffectiveItemStatus, isOverdueItem } from './itemStatus';
import { cleanText } from './text';

export function selectFilteredItems(state: UiState) {
    const now = Date.now();
    const in3days = now + 3 * 24 * 60 * 60 * 1000;
    const normalizedCourseFilter = normalizeCourseName(state.courseFilter);
    const selectedFilters = Array.isArray(state.filter) ? state.filter : [];
    const selectedTypes = Array.isArray(state.typeFilter)
        ? state.typeFilter
        : [];
    const hiddenItemIdSet = new Set(
        Array.isArray(state.hiddenItemIds) ? state.hiddenItemIds : [],
    );

    const filtered = state.items.filter((item) => {
        if (hiddenItemIdSet.has(cleanText(item.id))) {
            return false;
        }

        const itemCourseName = normalizeCourseName(item.courseName);
        if (
            normalizedCourseFilter !== COURSE_FILTER_ALL &&
            itemCourseName !== normalizedCourseFilter
        ) {
            return false;
        }

        if (selectedTypes.length && !selectedTypes.includes(item.type)) {
            return false;
        }

        if (state.hideResources && item.type === 'RESOURCE') {
            return false;
        }

        if (state.hideNotices && item.type === 'NOTICE') {
            return false;
        }

        if (
            state.hidePastLectures &&
            item.type === 'LECTURE' &&
            typeof item.dueAt === 'number' &&
            item.dueAt < now
        ) {
            return false;
        }

        if (
            state.hidePastAssignments &&
            (item.type === 'ASSIGNMENT' || item.type === 'QUIZ') &&
            typeof item.dueAt === 'number' &&
            item.dueAt < now
        ) {
            return false;
        }

        if (
            state.hidePastForums &&
            item.type === 'FORUM' &&
            typeof item.dueAt === 'number' &&
            item.dueAt < now
        ) {
            return false;
        }

        if (
            state.hideDoneLectures &&
            item.type === 'LECTURE' &&
            getEffectiveItemStatus(item) === 'DONE'
        ) {
            return false;
        }

        if (
            state.hideDoneAssignments &&
            (item.type === 'ASSIGNMENT' || item.type === 'QUIZ') &&
            getEffectiveItemStatus(item) === 'DONE'
        ) {
            return false;
        }

        if (!selectedFilters.length) return true;

        const matchesFilter = selectedFilters.some((filterValue) => {
            if (filterValue === 'DUE_SOON') {
                return (
                    item.dueAt != null &&
                    item.dueAt <= in3days &&
                    item.dueAt >= now
                );
            }

            if (filterValue === 'OVERDUE') {
                return isOverdueItem(item, now);
            }

            if (filterValue === 'TODO_ONLY') {
                return getEffectiveItemStatus(item) === 'TODO';
            }

            if (filterValue === 'NOT_DONE') {
                return (
                    (item.type === 'ASSIGNMENT' ||
                        item.type === 'QUIZ' ||
                        item.type === 'LECTURE' ||
                        item.type === 'FORUM') &&
                    getEffectiveItemStatus(item) !== 'DONE'
                );
            }

            return false;
        });

        if (!matchesFilter) {
            return false;
        }

        return true;
    });

    filtered.sort((a, b) => {
        const aDue = a.dueAt ?? Number.POSITIVE_INFINITY;
        const bDue = b.dueAt ?? Number.POSITIVE_INFINITY;
        if (aDue !== bDue) return aDue - bDue;
        const aCourseName = normalizeCourseName(a.courseName);
        const bCourseName = normalizeCourseName(b.courseName);
        if (aCourseName !== bCourseName)
            return aCourseName.localeCompare(bCourseName);
        return a.title.localeCompare(b.title);
    });

    const groups = new Map<string, DashboardItem[]>();
    filtered.forEach((item) => {
        const normalizedCourseName =
            normalizeCourseName(item.courseName) || cleanText(item.courseName);
        if (!groups.has(normalizedCourseName)) {
            groups.set(normalizedCourseName, []);
        }
        groups.get(normalizedCourseName)?.push(item);
    });

    return { filtered, groups };
}
