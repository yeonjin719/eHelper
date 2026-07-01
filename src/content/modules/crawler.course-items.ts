// @ts-nocheck
(() => {
    // 과목 단위 수집 오케스트레이터: 모듈 파싱 + 리포트 보강 + 과제 인덱스를 합친다.
    const E = window.__ECDASH__;
    E.crawlCourseItems = async function crawlCourseItems({
        courseId,
        courseName,
        courseIsNew = false,
    }) {
        // 과목 단위 크롤링은 "과목 페이지 허브 + 상세 보고서 보강 + 과제 인덱스"를 합산.
        const all = [];
        let assignmentFallbackItems = [];
        let quizFallbackItems = [];
        const normalizedCourseName =
            (typeof E.cleanCourseDisplayName === 'function'
                ? E.cleanCourseDisplayName(courseName)
                : E.stripCourseNewToken(courseName)) || `course-${courseId}`;
        const normalizedCourseIsNew =
            Boolean(courseIsNew) ||
            /\bnew\b/i.test(E.cleanText(courseName || ''));
        const shouldSkipResources = Boolean(E.__hideResources);
        const shouldSkipNotices = Boolean(E.__hideNotices);
        const detailEnrichConcurrency = Math.max(
            1,
            Number(E.constants?.DETAIL_ENRICH_CONCURRENCY || 2),
        );
        const crawlApiFallback = async () => {
            if (typeof E.fetchMoodleCourseContents !== 'function') return [];

            const contents = await E.fetchMoodleCourseContents(courseId);
            if (!Array.isArray(contents) || !contents.length) return [];

            const [assignments, quizzes, lectures, resources] =
                await Promise.all([
                    typeof E.fetchMoodleAssignmentItems === 'function'
                        ? E.fetchMoodleAssignmentItems({
                              courseId,
                              courseName: normalizedCourseName,
                              courseIsNew: normalizedCourseIsNew,
                          })
                        : Promise.resolve([]),
                    typeof E.fetchMoodleQuizItems === 'function'
                        ? E.fetchMoodleQuizItems({
                              courseId,
                              courseName: normalizedCourseName,
                              courseIsNew: normalizedCourseIsNew,
                              contents,
                          })
                        : Promise.resolve([]),
                    typeof E.fetchMoodleLectureItems === 'function'
                        ? E.fetchMoodleLectureItems({
                              courseId,
                              courseName: normalizedCourseName,
                              courseIsNew: normalizedCourseIsNew,
                              contents,
                          })
                        : Promise.resolve([]),
                    !shouldSkipResources &&
                    typeof E.fetchMoodleResourceItems === 'function'
                        ? E.fetchMoodleResourceItems({
                              courseId,
                              courseName: normalizedCourseName,
                              courseIsNew: normalizedCourseIsNew,
                              contents,
                          })
                        : Promise.resolve([]),
                ]);

            return E.dedupeItems([
                ...assignments,
                ...quizzes,
                ...lectures,
                ...resources,
            ]);
        };
        const crawlAssignmentItems = async () => {
            try {
                const assignHtml = await E.fetchHtml(
                    `/mod/assign/index.php?id=${courseId}`,
                );
                const assignItems = E.parseAssignIndexHtml(
                    assignHtml,
                    courseId,
                    normalizedCourseName,
                    normalizedCourseIsNew,
                );
                if (assignItems.length) {
                    return await E.enrichAssignmentItems(
                        assignItems,
                        detailEnrichConcurrency,
                    );
                }

                if (assignmentFallbackItems.length) {
                    console.debug(
                        `[ECDASH] assignment index empty. using course-view fallback. courseId=${courseId} count=${assignmentFallbackItems.length}`,
                    );
                    return await E.enrichAssignmentItems(
                        assignmentFallbackItems,
                        detailEnrichConcurrency,
                    );
                }

                return [];
            } catch (err) {
                console.warn(
                    `[ECDASH] assignment crawl failed. courseId=${courseId} (${normalizedCourseName})`,
                    err,
                );
                if (!assignmentFallbackItems.length) {
                    return [];
                }

                console.debug(
                    `[ECDASH] assignment fallback used from course view. courseId=${courseId} count=${assignmentFallbackItems.length}`,
                );
                return await E.enrichAssignmentItems(
                    assignmentFallbackItems,
                    detailEnrichConcurrency,
                );
            }
        };
        const crawlQuizItems = async () => {
            try {
                const quizHtml = await E.fetchHtml(
                    `/mod/quiz/index.php?id=${courseId}`,
                );
                const quizItems = E.parseQuizIndexHtml(
                    quizHtml,
                    courseId,
                    normalizedCourseName,
                    normalizedCourseIsNew,
                );
                if (quizItems.length) {
                    return await E.enrichQuizItems(
                        quizItems,
                        detailEnrichConcurrency,
                    );
                }

                if (quizFallbackItems.length) {
                    console.debug(
                        `[ECDASH] quiz index empty. using course-view fallback. courseId=${courseId} count=${quizFallbackItems.length}`,
                    );
                    return await E.enrichQuizItems(
                        quizFallbackItems,
                        detailEnrichConcurrency,
                    );
                }

                return [];
            } catch (err) {
                const msg = String(err?.message || err || '');
                const is404 = msg.includes('Fetch failed 404');

                if (!is404) {
                    console.warn(
                        `[ECDASH] quiz crawl failed. courseId=${courseId} (${normalizedCourseName})`,
                        err,
                    );
                }

                if (!quizFallbackItems.length) {
                    return [];
                }

                console.debug(
                    `[ECDASH] quiz fallback used from course view. courseId=${courseId} count=${quizFallbackItems.length}`,
                );
                return await E.enrichQuizItems(
                    quizFallbackItems,
                    detailEnrichConcurrency,
                );
            }
        };

        let courseDoc;
        try {
            const courseHtml = await E.fetchHtml(
                `/course/view.php?id=${courseId}`,
            );
            E.__lastCourseCrawlHtml = E.__lastCourseCrawlHtml || {};
            E.__lastCourseCrawlHtml[String(courseId)] = String(
                courseHtml || '',
            ).slice(0, 50000);
            courseDoc = new DOMParser().parseFromString(
                courseHtml,
                'text/html',
            );

            const moduleItems = E.collectModuleItemsFromCourseView(
                courseDoc,
                courseId,
                normalizedCourseName,
                normalizedCourseIsNew,
                true,
            );
            assignmentFallbackItems = moduleItems.filter(
                (it) => it.type === 'ASSIGNMENT',
            );
            quizFallbackItems = moduleItems.filter((it) => it.type === 'QUIZ');
            let lectureLinkCandidates =
                E.collectActivityLinkCandidatesFromCourseView(courseDoc);

            const vodLectureLinkCandidates =
                await E.collectVodLectureLinkCandidates(courseDoc, courseId);
            if (vodLectureLinkCandidates.length) {
                lectureLinkCandidates = [
                    ...lectureLinkCandidates,
                    ...vodLectureLinkCandidates,
                ];
            }

            let lectureItems = moduleItems.filter(
                (it) => it.type === 'LECTURE',
            );
            const forumItems = moduleItems.filter((it) => it.type === 'FORUM');
            const resourceItems = shouldSkipResources
                ? []
                : moduleItems.filter((it) => it.type === 'RESOURCE');

            // 강의 정보가 비었거나 불완전하면 리포트를 사용해 강의 상태를 보강한다.
            const needsLectureFallback =
                lectureItems.length === 0 ||
                lectureItems.some((it) => it.status === 'UNKNOWN' || !it.meta);
            const hasAttendanceMenuLink = Boolean(
                courseDoc.querySelector(
                    'a[href*="/report/ubcompletion/progress.php"], a[href*="/report/ubcompletion/user_progress"]',
                ),
            );
            const shouldTryLectureReport =
                needsLectureFallback ||
                lectureItems.length > 0 ||
                hasAttendanceMenuLink;

            if (shouldTryLectureReport) {
                // 리포트 결과는 상태 보강 + 누락 강의 생성 모두에 사용.
                const reportUrls = E.collectProgressReportUrls(
                    courseDoc,
                    courseId,
                );
                let bestReportMap = null;
                let bestReportUrl = '';
                let bestReportScore = -1;

                // 후보 리포트는 제한 병렬로 가져오고, 데이터가 가장 풍부한 소스를 선택한다.
                const reportCandidates = await E.mapWithConcurrency(
                    reportUrls,
                    Math.min(
                        Math.max(
                            1,
                            Number(E.constants?.REPORT_FETCH_CONCURRENCY || 2),
                        ),
                        reportUrls.length,
                    ),
                    async (reportUrl) => {
                        try {
                            const reportHtml = await E.fetchHtml(reportUrl);
                            const reportMap =
                                E.parseStatusRowsFromReportHtml(reportHtml);
                            const rowsCount = Array.isArray(reportMap.rows)
                                ? reportMap.rows.length
                                : 0;
                            const byUrlCount = reportMap.byUrl?.size || 0;
                            const byTitleCount = reportMap.byTitle?.size || 0;
                            const hasReportData =
                                rowsCount > 0 ||
                                byUrlCount > 0 ||
                                byTitleCount > 0;
                            if (!hasReportData) return null;

                            return {
                                reportUrl,
                                reportMap,
                                reportScore:
                                    rowsCount * 100 +
                                    byUrlCount * 10 +
                                    byTitleCount +
                                    (reportUrl.includes('/report/ubcompletion/')
                                        ? 1000
                                        : 0),
                            };
                        } catch (err) {
                            const msg = String(err?.message || err || '');
                            const is404 = msg.includes('Fetch failed 404');

                            // 404는 "해당 경로 미지원"으로 간주해서 로그 노이즈를 줄인다.
                            if (is404) {
                                if (
                                    reportUrl.includes(
                                        '/report/progress/index.php',
                                    )
                                ) {
                                    E.reportPathSupport.progress = false;
                                }
                                if (
                                    reportUrl.includes(
                                        '/report/completion/index.php',
                                    )
                                ) {
                                    E.reportPathSupport.completion = false;
                                }
                                return null;
                            }

                            console.warn(
                                '[ECDASH] progress report crawl failed:',
                                reportUrl,
                                err,
                            );
                            return null;
                        }
                    },
                );

                reportCandidates.filter(Boolean).forEach((candidate) => {
                    if (candidate.reportScore <= bestReportScore) return;

                    bestReportScore = candidate.reportScore;
                    bestReportMap = candidate.reportMap;
                    bestReportUrl = candidate.reportUrl;
                });

                // 선택된 리포트 결과를 현재 강의 목록에 반영한다.
                if (bestReportMap) {
                    lectureItems = E.applyReportStatus(
                        lectureItems,
                        bestReportMap,
                    );

                    if (
                        Array.isArray(bestReportMap.rows) &&
                        bestReportMap.rows.length
                    ) {
                        const fallbackBase = new URL(
                            `/report/ubcompletion/progress.php?id=${courseId}`,
                            location.origin,
                        ).toString();

                        const fromReport = E.buildLectureItemsFromReportRows(
                            bestReportMap.rows,
                            courseId,
                            normalizedCourseName,
                            fallbackBase,
                            normalizedCourseIsNew,
                        );
                        const courseViewUrl = new URL(
                            `/course/view.php?id=${courseId}`,
                            location.origin,
                        ).toString();
                        const resolvedFromReport = E.resolveLectureUrlsByCandidates(
                            fromReport,
                            lectureLinkCandidates,
                            courseViewUrl,
                        );

                        lectureItems = E.dedupeItems([
                            ...lectureItems,
                            ...resolvedFromReport,
                        ]);
                    }

                    console.info(
                        '[ECDASH] lecture report source selected:',
                        bestReportUrl,
                        {
                            rows: bestReportMap.rows?.length || 0,
                            byUrl: bestReportMap.byUrl?.size || 0,
                            byTitle: bestReportMap.byTitle?.size || 0,
                        },
                    );
                }
            }

            lectureItems = E.resolveLectureUrlsByCandidates(
                lectureItems,
                lectureLinkCandidates,
                new URL(
                    `/course/view.php?id=${courseId}`,
                    location.origin,
                ).toString(),
            );

            const forumPromise = E.enrichForumItems(
                forumItems,
                detailEnrichConcurrency,
            );
            const resourcePromise = E.enrichResourceItems(
                resourceItems,
                detailEnrichConcurrency,
            );
            const noticePromise = shouldSkipNotices
                ? Promise.resolve([])
                : E.collectNoticeItemsFromCourseView(
                      courseDoc,
                      courseId,
                      normalizedCourseName,
                      normalizedCourseIsNew,
                  );
            const [enrichedForums, enrichedResources, noticeItems] =
                await Promise.all([
                    forumPromise,
                    resourcePromise,
                    noticePromise,
                ]);

            all.push(
                ...lectureItems,
                ...enrichedForums,
                ...enrichedResources,
                ...noticeItems,
            );
        } catch (err) {
            console.warn(
                `[ECDASH] course hub crawl failed. courseId=${courseId} (${normalizedCourseName})`,
                err,
            );
        }

        const [assignmentItems, quizItems] = await Promise.all([
            crawlAssignmentItems(),
            crawlQuizItems(),
        ]);

        all.push(...assignmentItems, ...quizItems);

        const items = E.dedupeItems(all);
        if (items.length) return items;

        try {
            return await crawlApiFallback();
        } catch (err) {
            if (/Moodle token missing/i.test(String(err?.message || err))) {
                E.__lastCourseCrawlFailureReason =
                    E.__lastCourseCrawlFailureReason || {};
                E.__lastCourseCrawlFailureReason[String(courseId)] =
                    'moodle_token_missing';
            }
            console.debug(
                `[ECDASH] Moodle API fallback failed. courseId=${courseId}`,
                err,
            );
            return [];
        }
    };
})();
