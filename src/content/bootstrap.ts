// @ts-nocheck
(() => {
    const E = window.__ECDASH__;
    if (!E) return;
    if (E.isBlockedPage?.()) return;

    // 진입 오케스트레이터: 캐시 초기화, 크롤링 스케줄링, 자동 새로고침.
    let inFlight = false;
    const storagePrefix =
        (typeof E.getStoragePrefix === 'function'
            ? E.getStoragePrefix('ecdash:smu')
            : 'ecdash:smu') || 'ecdash:smu';
    const UI_INCLUDE_SM_CLASS_KEY = `${storagePrefix}:ui:includeSmClass`;
    const UI_HIDE_RESOURCES_KEY = `${storagePrefix}:ui:hideResources`;
    const UI_HIDE_NOTICES_KEY = `${storagePrefix}:ui:hideNotices`;

    function setKnownCourses(courses) {
        window.__ECDASH_COURSES__ = E.normalizeCourseCache(courses || []);
    }

    function isSmClassCourse(course) {
        if (typeof E.isSmClassCourse === 'function') {
            return E.isSmClassCourse(course);
        }
        return Boolean(course?.isSmClass);
    }

    function getFilteredCourseState(courses, includeSmClass) {
        if (typeof E.filterSmClassCourses === 'function') {
            return E.filterSmClassCourses(courses, includeSmClass);
        }

        const normalized = E.normalizeCourseCache(courses || []);
        if (includeSmClass) {
            return {
                courses: normalized,
                excludedCourseIds: new Set(),
            };
        }

        const excludedCourseIds = new Set();
        const visibleCourses = normalized.filter((course) => {
            if (Boolean(course?.isSmClass)) {
                excludedCourseIds.add(String(course.courseId));
                return false;
            }
            return true;
        });

        return {
            courses: visibleCourses,
            excludedCourseIds,
        };
    }

    function filterItemsByExcludedCourses(items, excludedCourseIds) {
        const source = Array.isArray(items) ? items : [];
        if (!excludedCourseIds || !excludedCourseIds.size) return source;
        return source.filter(
            (item) => !excludedCourseIds.has(String(item?.courseId)),
        );
    }

    async function loadIncludeSmClassSetting() {
        let includeSmClass = Boolean(E.__includeSmClass);
        try {
            const res = await chrome.storage?.local?.get?.([
                UI_INCLUDE_SM_CLASS_KEY,
            ]);
            includeSmClass = Boolean(res?.[UI_INCLUDE_SM_CLASS_KEY]);
        } catch (_) {
            // 무시
        }
        E.__includeSmClass = includeSmClass;
        return includeSmClass;
    }

    async function loadCrawlVisibilitySettings() {
        let hideResources = Boolean(E.__hideResources);
        let hideNotices = Boolean(E.__hideNotices);

        try {
            const res = await chrome.storage?.local?.get?.([
                UI_HIDE_RESOURCES_KEY,
                UI_HIDE_NOTICES_KEY,
            ]);
            hideResources = Boolean(res?.[UI_HIDE_RESOURCES_KEY]);
            hideNotices = Boolean(res?.[UI_HIDE_NOTICES_KEY]);
        } catch (_) {
            // 무시
        }

        E.__hideResources = hideResources;
        E.__hideNotices = hideNotices;

        return {
            hideResources,
            hideNotices,
        };
    }

    function isDashboardPage() {
        if (typeof E.isDashboardPage === 'function') {
            return Boolean(E.isDashboardPage());
        }
        return Boolean(E.isDashboardSMU?.());
    }

    function collectDashboardCourses() {
        if (typeof E.collectDashboardCourses === 'function') {
            const courses = E.collectDashboardCourses();
            return Array.isArray(courses) ? courses : [];
        }

        return E.collectCoursesFromDashboardSMU?.() || [];
    }

    async function loadStoredCourseCache() {
        const cached = await E.loadCourseCache();
        return Array.isArray(cached.courses) ? cached.courses : [];
    }

    async function syncDashboardCourseCache() {
        try {
            const courses = isDashboardPage()
                ? collectDashboardCourses()
                : await E.fetchDashboardCourses?.();
            const normalized = E.normalizeCourseCache(courses || []);
            if (!normalized.length) return [];

            await E.saveCourseCache?.(normalized);
            setKnownCourses(normalized);
            return normalized;
        } catch (err) {
            console.warn('[ECDASH] dashboard course sync failed.', err);
            return [];
        }
    }

    async function hydrateKnownCourses() {
        const cachedCourses = await loadStoredCourseCache();
        if (cachedCourses.length) {
            setKnownCourses(cachedCourses);
            return cachedCourses;
        }

        const syncedCourses = await syncDashboardCourseCache();
        if (syncedCourses.length) {
            return syncedCourses;
        }

        setKnownCourses([]);
        return [];
    }

    async function crawlAllDashboardItems(courses) {
        if (typeof E.crawlAllItemsFromDashboard === 'function') {
            const items = await E.crawlAllItemsFromDashboard(courses);
            return Array.isArray(items) ? items : [];
        }

        const fallback = await E.crawlAllItemsFromDashboardSMU?.(courses);
        return Array.isArray(fallback) ? fallback : [];
    }

    function getCurrentCourse() {
        if (typeof E.getCurrentCourse === 'function') {
            return E.getCurrentCourse() || null;
        }
        return E.getCurrentCourseFromLocation?.() || null;
    }

    function isProgressPage() {
        if (typeof E.isProgressPage === 'function') {
            return Boolean(E.isProgressPage());
        }
        return Boolean(E.isUbcompletionProgressPage?.());
    }

    function isPluginFilePage() {
        const pathname = String(location.pathname || '').toLowerCase();
        return pathname.includes('/pluginfile.php');
    }

    async function collectProgressPageItems() {
        if (typeof E.collectProgressPageItems === 'function') {
            const items = await E.collectProgressPageItems();
            return Array.isArray(items) ? items : [];
        }

        const fallback = await E.collectLectureItemsFromCurrentProgressPage?.();
        return Array.isArray(fallback) ? fallback : [];
    }

    function groupItemsByCourseId(items) {
        const grouped = new Map();

        (Array.isArray(items) ? items : []).forEach((item) => {
            const courseId = String(item?.courseId || '').trim();
            if (!courseId) return;

            if (!grouped.has(courseId)) {
                grouped.set(courseId, []);
            }
            grouped.get(courseId).push(item);
        });

        return grouped;
    }

    function bindItemsToCourse(items, course) {
        const courseId = String(course?.courseId || '').trim();
        if (!courseId) return [];

        const courseName =
            E.cleanText(course?.courseName || '') || `course-${courseId}`;
        const courseIsNew = Boolean(course?.isNew ?? course?.courseIsNew);

        return (Array.isArray(items) ? items : []).map((item) => ({
            ...item,
            courseId,
            courseName,
            courseIsNew,
        }));
    }

    function errorMessage(err) {
        return E.cleanText(err?.stack || err?.message || err || 'unknown error');
    }

    function buildFailureLog(failures) {
        const rows = Array.isArray(failures) ? failures : [];
        if (!rows.length) return '';

        return [
            '[eHelper] eCampus 수집 실패 로그',
            `time=${new Date().toLocaleString()}`,
            `url=${location.href}`,
            `failures=${rows.length}`,
            '',
            ...rows.map((failure, index) => {
                const course = failure?.course || {};
                const html = String(
                    E.__lastCourseCrawlHtml?.[String(course.courseId)] || '',
                ).trim();
                return [
                    `#${index + 1}`,
                    `courseId=${course.courseId || '-'}`,
                    `courseName=${course.courseName || '-'}`,
                    `reason=${failure?.reason || '-'}`,
                    `message=${failure?.message || '-'}`,
                    html
                        ? `html=\n----- HTML START -----\n${html}\n----- HTML END -----`
                        : 'html=-',
                ].join('\n');
            }),
        ].join('\n');
    }

    async function crawlCoursesWithResults(courses) {
        if (typeof E.crawlCoursesWithConcurrency === 'function') {
            const results = await E.crawlCoursesWithConcurrency(courses);
            return Array.isArray(results) ? results : [];
        }

        return await E.mapWithConcurrency(
            courses,
            E.constants.CRAWL_CONCURRENCY,
            async (course) => {
                try {
                    const items = await E.crawlCourseItems(course);
                    if (!Array.isArray(items) || !items.length) {
                        return {
                            course,
                            items: [],
                            ok: false,
                            reason: 'empty_items',
                            message: '과목 수집 결과가 비어 있음',
                        };
                    }

                    return {
                        course,
                        items,
                        ok: true,
                    };
                } catch (err) {
                    console.warn(
                        `[ECDASH] cached course crawl skipped. courseId=${course.courseId}`,
                        err,
                    );
                    return {
                        course,
                        items: [],
                        ok: false,
                        reason: 'exception',
                        message: errorMessage(err),
                    };
                }
            },
        );
    }

    function describeIncrementalRefresh(plan) {
        if (plan.crawlCourseCount > 0 && plan.reusedCourseCount > 0) {
            return `과목 ${plan.crawlCourseCount}개 갱신 중… ${plan.reusedCourseCount}개는 과목 캐시 재사용`;
        }

        if (plan.crawlCourseCount > 0) {
            return `과목 ${plan.crawlCourseCount}개 갱신 중…`;
        }

        if (plan.reusedCourseCount > 0) {
            return `과목 ${plan.reusedCourseCount}개는 과목 캐시로 바로 표시 중…`;
        }

        return `과목 ${plan.totalCourseCount}개 기준으로 갱신 중…`;
    }

    function summarizeRefreshOutcome(items, stats) {
        const countSummary = E.summarizeCounts(items);
        const timeLabel = new Date().toLocaleTimeString();

        if (stats.failedCourseCount > 0 && stats.reusedCourseCount > 0) {
            return `${countSummary} · 일부 과목은 이전 캐시 유지 · ${stats.reusedCourseCount}개 캐시 재사용 · ${timeLabel}`;
        }

        if (stats.failedCourseCount > 0) {
            return `${countSummary} · 일부 과목은 이전 캐시 유지 · ${timeLabel}`;
        }

        if (stats.crawledCourseCount === 0 && stats.reusedCourseCount > 0) {
            return `${countSummary} · 과목 캐시 ${stats.reusedCourseCount}개 재사용 · ${timeLabel}`;
        }

        if (stats.reusedCourseCount > 0) {
            return `${countSummary} · ${stats.crawledCourseCount}개 갱신 / ${stats.reusedCourseCount}개 캐시 재사용 · ${timeLabel}`;
        }

        return `${countSummary} · 마지막 갱신 ${timeLabel}`;
    }

    async function collectIncrementalCourseItems(
        courses,
        snapshotItems,
        { force = false, onPlan } = {},
    ) {
        const normalized = E.normalizeCourseCache(courses || []);
        if (!normalized.length) {
            const emptyPlan = {
                totalCourseCount: 0,
                reusedCourseCount: 0,
                crawlCourseCount: 0,
            };
            onPlan?.(emptyPlan);
            return {
                items: [],
                reusedCourseCount: 0,
                crawledCourseCount: 0,
                failedCourseCount: 0,
                failures: [],
            };
        }

        const snapshotItemsByCourse = groupItemsByCourseId(snapshotItems);
        const courseRunMap = await E.loadCourseRunMap?.();
        const ttlMs = Math.max(
            0,
            Number(E.constants?.COURSE_CACHE_TTL_MS || 0),
        );
        const now = Date.now();
        const reusedItems = [];
        const coursesToCrawl = [];
        let reusedCourseCount = 0;

        normalized.forEach((course) => {
            const courseId = String(course?.courseId || '').trim();
            const lastRunAt = Number(courseRunMap?.[courseId] || 0);
            const isFresh =
                !force &&
                lastRunAt > 0 &&
                ttlMs > 0 &&
                now - lastRunAt < ttlMs;

            if (isFresh) {
                reusedCourseCount += 1;
                reusedItems.push(
                    ...bindItemsToCourse(snapshotItemsByCourse.get(courseId), course),
                );
                return;
            }

            coursesToCrawl.push(course);
        });

        onPlan?.({
            totalCourseCount: normalized.length,
            reusedCourseCount,
            crawlCourseCount: coursesToCrawl.length,
        });

        const crawledItems = [];
        let failedCourseCount = 0;
        const failures = [];

        if (coursesToCrawl.length) {
            const results = await crawlCoursesWithResults(coursesToCrawl);
            const handledCourseIds = new Set();
            const nextRunMap = {};

            results.forEach((result, index) => {
                const fallbackCourse = coursesToCrawl[index];
                const course = result?.course || fallbackCourse;
                const courseId = String(course?.courseId || '').trim();
                if (!courseId) return;

                handledCourseIds.add(courseId);
                const resultItems = Array.isArray(result?.items)
                    ? result.items
                    : [];
                if (result?.ok === false || !resultItems.length) {
                    const failureReason =
                        E.__lastCourseCrawlFailureReason?.[courseId] ||
                        result.reason ||
                        'crawl_failed';
                    failedCourseCount += 1;
                    failures.push({
                        course,
                        reason: failureReason,
                        message:
                            result.message ||
                            (failureReason === 'moodle_token_missing'
                                ? '설정에서 eCampus API 로그인이 필요함'
                                : '') ||
                            (!resultItems.length
                                ? '과목 수집 결과가 비어 있음'
                                : '과목 수집 실패'),
                    });
                    crawledItems.push(
                        ...bindItemsToCourse(
                            snapshotItemsByCourse.get(courseId),
                            course,
                        ),
                    );
                    return;
                }

                nextRunMap[courseId] = now;
                crawledItems.push(...bindItemsToCourse(resultItems, course));
            });

            coursesToCrawl.forEach((course) => {
                const courseId = String(course?.courseId || '').trim();
                if (!courseId || handledCourseIds.has(courseId)) return;

                failedCourseCount += 1;
                failures.push({
                    course,
                    reason: 'missing_result',
                    message: '과목 수집 결과 누락',
                });
                crawledItems.push(
                    ...bindItemsToCourse(snapshotItemsByCourse.get(courseId), course),
                );
            });

            if (Object.keys(nextRunMap).length) {
                await E.saveCourseRunMap?.(nextRunMap);
            }
        }

        return {
            items: E.dedupeItems([...reusedItems, ...crawledItems]),
            reusedCourseCount,
            crawledCourseCount: coursesToCrawl.length,
            failedCourseCount,
            failures,
        };
    }

    async function refreshAll({ force = false } = {}) {
        if (inFlight) return;
        inFlight = true;

        try {
            E.ensureRoot();
            const includeSmClass = await loadIncludeSmClassSetting();
            await loadCrawlVisibilitySettings();

            let preflightCourses = [];
            if (isDashboardPage()) {
                preflightCourses = collectDashboardCourses();
                if (preflightCourses.length) {
                    await E.saveCourseCache?.(preflightCourses);
                    setKnownCourses(preflightCourses);
                }
            } else {
                preflightCourses = await syncDashboardCourseCache();
            }

            const snap = await E.loadSnapshot();
            let fallbackCourses = preflightCourses;
            if (!fallbackCourses.length) {
                fallbackCourses = await loadStoredCourseCache();
                if (fallbackCourses.length) {
                    setKnownCourses(fallbackCourses);
                }
            }
            const fallbackFiltered = getFilteredCourseState(
                fallbackCourses,
                includeSmClass,
            );
            const visibleSnapshotItems = filterItemsByExcludedCourses(
                snap.items,
                fallbackFiltered.excludedCourseIds,
            );

            if (
                !force &&
                snap.lastRunAt &&
                Date.now() - snap.lastRunAt < 3 * 60 * 1000
            ) {
                window.__ECDASH_ITEMS__ = visibleSnapshotItems;
                E.setBadge('CACHE');
                E.setSub(
                    '최근 캐시 데이터를 사용 중이에요. ↻로 강제 새로고침 가능',
                );
                E.render(visibleSnapshotItems);
                return;
            }
            E.setLoading?.(
                true,
                force
                    ? '최신 항목을 다시 불러오는 중이에요. 기존 목록은 그대로 유지돼요.'
                    : '데이터를 가져오는 중...',
            );

            if (isDashboardPage()) {
                // 대시보드 과목 목록이 일시적으로 비면 기존 과목 캐시를 대체값으로 사용.
                const dashboardCourses = collectDashboardCourses();
                let crawlCourses = [];
                let excludedCourseIds = new Set();

                if (dashboardCourses.length) {
                    await E.saveCourseCache?.(dashboardCourses);
                    setKnownCourses(dashboardCourses);
                    const filtered = getFilteredCourseState(
                        dashboardCourses,
                        includeSmClass,
                    );
                    crawlCourses = filtered.courses;
                    excludedCourseIds = filtered.excludedCourseIds;
                } else {
                    const cachedCourses = await E.loadCourseCache();
                    const rawCachedCourses = Array.isArray(
                        cachedCourses.courses,
                    )
                        ? cachedCourses.courses
                        : [];
                    setKnownCourses(rawCachedCourses);
                    const filtered = getFilteredCourseState(
                        rawCachedCourses,
                        includeSmClass,
                    );
                    crawlCourses = filtered.courses;
                    excludedCourseIds = filtered.excludedCourseIds;
                }

                if (!crawlCourses.length) {
                    E.setBadge('WAIT');
                    E.setSub(
                        includeSmClass
                            ? '과목 목록을 아직 찾지 못해 기존 캐시를 유지해요. 잠시 후 다시 시도해 주세요.'
                            : 'SM-Class 제외 설정으로 현재 크롤링할 과목이 없어요. 설정에서 포함할 수 있어요.',
                    );
                    window.__ECDASH_ITEMS__ = filterItemsByExcludedCourses(
                        snap.items,
                        excludedCourseIds,
                    );
                    E.render(window.__ECDASH_ITEMS__);
                    return;
                }

                const refreshed = await collectIncrementalCourseItems(
                    crawlCourses,
                    snap.items,
                    {
                        force,
                        onPlan: (plan) => {
                            E.setBadge(plan.crawlCourseCount > 0 ? 'CRAWL' : 'CACHE');
                            E.setSub(describeIncrementalRefresh(plan));
                        },
                    },
                );
                const preservedExcludedItems = (
                    Array.isArray(snap.items) ? snap.items : []
                ).filter((item) =>
                    excludedCourseIds.has(String(item?.courseId)),
                );
                const mergedSnapshotItems = E.dedupeItems([
                    ...preservedExcludedItems,
                    ...refreshed.items,
                ]);
                const visibleItems = filterItemsByExcludedCourses(
                    mergedSnapshotItems,
                    excludedCourseIds,
                );
                window.__ECDASH_ITEMS__ = visibleItems;
                E.saveSnapshot(mergedSnapshotItems);

                E.setBadge(
                    refreshed.crawledCourseCount === 0 &&
                        refreshed.reusedCourseCount > 0
                        ? 'CACHE'
                        : 'OK',
                );
                E.setErrorLog?.(buildFailureLog(refreshed.failures));
                E.setSub(summarizeRefreshOutcome(visibleItems, refreshed));
                E.render(visibleItems);
                return;
            }

            const currentCourse = getCurrentCourse();

            // 비-대시보드 페이지에서는 캐시된 과목 목록을 기준으로 재크롤링.
            // 현재 라우트가 대시보드가 아니어도 루트 페이지에서 과목명을 동기화해 둔다.
            // 현재 페이지의 과목 식별자를 우선 반영해 캐시 신선도를 유지.
            const rawCachedCourses = [
                ...(preflightCourses.length
                    ? preflightCourses
                    : await loadStoredCourseCache()),
            ];
            const filteredCourses = getFilteredCourseState(
                rawCachedCourses,
                includeSmClass,
            );
            let crawlCourses = [...filteredCourses.courses];
            const excludedCourseIds = filteredCourses.excludedCourseIds;

            if (currentCourse?.courseId) {
                const currentCourseId = String(currentCourse.courseId);
                const rawIndex = rawCachedCourses.findIndex(
                    (course) => String(course.courseId) === currentCourseId,
                );
                const knownCurrent =
                    rawIndex >= 0 ? rawCachedCourses[rawIndex] : null;
                const skipCurrentCourse =
                    !includeSmClass &&
                    isSmClassCourse(knownCurrent || currentCourse);

                if (skipCurrentCourse) {
                    excludedCourseIds.add(currentCourseId);
                } else {
                    if (rawIndex === -1) {
                        rawCachedCourses.unshift(currentCourse);
                    } else if (
                        currentCourse.courseName &&
                        currentCourse.courseName !==
                            `course-${currentCourse.courseId}`
                    ) {
                        rawCachedCourses[rawIndex] = {
                            ...rawCachedCourses[rawIndex],
                            courseName: currentCourse.courseName,
                            isNew:
                                Boolean(rawCachedCourses[rawIndex]?.isNew) ||
                                Boolean(currentCourse.isNew),
                        };
                    }

                    const crawlIndex = crawlCourses.findIndex(
                        (course) => String(course.courseId) === currentCourseId,
                    );
                    if (crawlIndex === -1) {
                        crawlCourses.unshift(currentCourse);
                    } else if (
                        currentCourse.courseName &&
                        currentCourse.courseName !==
                            `course-${currentCourse.courseId}`
                    ) {
                        crawlCourses[crawlIndex] = {
                            ...crawlCourses[crawlIndex],
                            courseName: currentCourse.courseName,
                            isNew:
                                Boolean(crawlCourses[crawlIndex]?.isNew) ||
                                Boolean(currentCourse.isNew),
                        };
                    }
                }
            }
            setKnownCourses(
                rawCachedCourses.length ? rawCachedCourses : crawlCourses,
            );

            if (!crawlCourses.length) {
                window.__ECDASH_ITEMS__ = filterItemsByExcludedCourses(
                    snap.items,
                    excludedCourseIds,
                );
                E.setBadge('WAIT');
                E.setSub(
                    includeSmClass
                        ? '저장된 과목 목록이 아직 없어요. 잠시 후 다시 시도해 주세요.'
                        : 'SM-Class 제외 설정으로 현재 크롤링할 과목이 없어요. 설정에서 포함할 수 있어요.',
                );
                E.render(window.__ECDASH_ITEMS__);
                return;
            }

            await E.saveCourseCache?.(
                rawCachedCourses.length ? rawCachedCourses : crawlCourses,
            );
            const refreshed = await collectIncrementalCourseItems(
                crawlCourses,
                snap.items,
                {
                    force,
                    onPlan: (plan) => {
                        E.setBadge(plan.crawlCourseCount > 0 ? 'CRAWL' : 'CACHE');
                        E.setSub(describeIncrementalRefresh(plan));
                    },
                },
            );
            const refreshedItems = filterItemsByExcludedCourses(
                refreshed.items,
                excludedCourseIds,
            );
            const targetIds = new Set(
                crawlCourses.map((course) => String(course.courseId)),
            );
            const knownCourseIds = new Set(
                (rawCachedCourses.length ? rawCachedCourses : crawlCourses).map(
                    (course) => String(course.courseId),
                ),
            );
            // 새로 크롤링한 과목만 교체하고, 나머지 과목 항목은 기존 스냅샷을 유지.
            const keepItems = filterItemsByExcludedCourses(
                (Array.isArray(snap.items) ? snap.items : []).filter(
                    (item) =>
                        !targetIds.has(String(item.courseId)) &&
                        knownCourseIds.has(String(item.courseId)),
                ),
                excludedCourseIds,
            );
            const mergedItems = E.dedupeItems([...keepItems, ...refreshedItems]);

            window.__ECDASH_ITEMS__ = mergedItems;
            E.saveSnapshot(mergedItems);

            E.setBadge(
                refreshed.crawledCourseCount === 0 &&
                    refreshed.reusedCourseCount > 0
                    ? 'CACHE'
                    : 'OK',
            );
            E.setErrorLog?.(buildFailureLog(refreshed.failures));
            E.setSub(summarizeRefreshOutcome(mergedItems, refreshed));
            E.render(mergedItems);
        } catch (e) {
            console.error(e);
            E.setBadge('ERR');
            E.setErrorLog?.(
                buildFailureLog([
                    {
                        course: getCurrentCourse() || {},
                        reason: 'refresh_exception',
                        message: errorMessage(e),
                    },
                ]),
            );
            E.setSub(
                '크롤링 중 오류가 발생했어요. (로그인 상태/권한/네트워크 확인)',
            );
        } finally {
            E.setLoading?.(false);
            inFlight = false;
        }
    }

    async function boot() {
        E.__realRefreshAll = refreshAll;
        E.refreshAll = async function refreshAllPublic(options = {}) {
            if (
                E.__devDataSource === 'mock' &&
                typeof E.__refreshDevMockScenario === 'function'
            ) {
                return E.__refreshDevMockScenario();
            }

            return refreshAll(options);
        };

        E.initVodEnhancements();

        if (isPluginFilePage()) {
            // 파일 직접 보기 페이지(PDF/리소스 원본)에서는 대시보드를 렌더링하지 않음.
            return;
        }

        if (E.isVodPlayerPage() && !isDashboardPage()) {
            // 동영상 페이지에서는 탭 타이틀 기능만 유지하고 사이드바는 강제로 띄우지 않음.
            return;
        }

        E.ensureRoot();
        const knownCourses = isDashboardPage()
            ? await hydrateKnownCourses()
            : await loadStoredCourseCache();
        setKnownCourses(knownCourses);

        const includeSmClass = await loadIncludeSmClassSetting();
        const snap = await E.loadSnapshot();
        const cachedCourseFilter = getFilteredCourseState(
            knownCourses,
            includeSmClass,
        );
        const visibleSnapItems = filterItemsByExcludedCourses(
            snap.items,
            cachedCourseFilter.excludedCourseIds,
        );

        if (visibleSnapItems.length) {
            window.__ECDASH_ITEMS__ = visibleSnapItems;
            E.setBadge('CACHE');
            E.setSub(
                isDashboardPage()
                    ? `${E.summarizeCounts(visibleSnapItems)} · 캐시 표시 중 (↻로 갱신)`
                    : `${E.summarizeCounts(visibleSnapItems)} · 저장된 캐시 표시 중 (↻로 갱신)`,
            );
            E.render(visibleSnapItems);
        } else {
            window.__ECDASH_ITEMS__ = [];
            E.setBadge(isDashboardPage() ? 'READY' : 'WAIT');
            E.setSub(
                isDashboardPage()
                    ? '대시보드 첫 진입 시 한 번만 자동으로 가져와요.'
                    : '자동 갱신은 대시보드 첫 진입에서만 실행돼요. ↻로 수동 갱신할 수 있어요.',
            );
            E.render([]);
        }

        if (isDashboardPage()) {
            refreshAll({ force: false });
        }
    }

    boot();
})();
