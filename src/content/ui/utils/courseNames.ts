import type { DashboardItem, DashboardRuntime } from '../types';
import { cleanText } from './text';

function stripCourseDecorators(value: string) {
    let text = cleanText(value || '');
    if (!text) return '';

    text = text.replace(/^\s*(?:\[[^\]]+\]\s*)+/, '');
    text = text.replace(/\s*(?:\[[^\]]+\]\s*)+$/, '');

    let prev = '';
    while (text && prev !== text) {
        prev = text;
        text = text.replace(/\s*\([^()]*\)\s*$/, '').trim();
    }

    return cleanText(text);
}

export function normalizeCourseName(value: unknown) {
    const text = cleanText(value || '');
    if (!text) return '';
    const noNew = cleanText(text.replace(/\s*\bnew\b\s*$/i, ''));
    return stripCourseDecorators(noNew) || noNew;
}

export function hasCourseNewToken(value: unknown) {
    return /\bnew\b\s*$/i.test(cleanText(value || ''));
}

function getVisibleCachedCourses(
    runtime: DashboardRuntime,
    includeSmClass: boolean,
) {
    const cachedCourses = Array.isArray(window.__ECDASH_COURSES__)
        ? window.__ECDASH_COURSES__
        : [];

    const normalizedCourses =
        typeof runtime.normalizeCourseCache === 'function'
            ? runtime.normalizeCourseCache(cachedCourses)
            : cachedCourses;

    return includeSmClass
        ? normalizedCourses
        : typeof runtime.filterSmClassCourses === 'function'
          ? runtime.filterSmClassCourses(normalizedCourses, false)?.courses ||
            []
          : normalizedCourses.filter(
                (course: any) => !Boolean(course?.isSmClass),
            );
}

export function collectCourseNames(
    runtime: DashboardRuntime,
    items: DashboardItem[],
    includeSmClass: boolean,
) {
    const visibleCachedCourses = getVisibleCachedCourses(
        runtime,
        includeSmClass,
    );

    return [
        ...new Set(
            [
                ...items.map((item) => normalizeCourseName(item?.courseName)),
                ...visibleCachedCourses.map((course: any) =>
                    normalizeCourseName(course?.courseName),
                ),
            ].filter(Boolean),
        ),
    ].sort((a, b) => a.localeCompare(b));
}

export function collectNewCourseNames(
    runtime: DashboardRuntime,
    items: DashboardItem[],
    includeSmClass: boolean,
) {
    const visibleCachedCourses = getVisibleCachedCourses(
        runtime,
        includeSmClass,
    );

    return [
        ...new Set(
            [
                ...items
                    .filter(
                        (item) =>
                            Boolean(item?.courseIsNew) ||
                            hasCourseNewToken(item?.courseName),
                    )
                    .map((item) => normalizeCourseName(item?.courseName)),
                ...visibleCachedCourses
                    .filter(
                        (course: any) =>
                            Boolean(course?.isNew) ||
                            hasCourseNewToken(course?.courseName),
                    )
                    .map((course: any) =>
                        normalizeCourseName(course?.courseName),
                    ),
            ].filter(Boolean),
        ),
    ].sort((a, b) => a.localeCompare(b));
}
