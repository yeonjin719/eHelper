// @ts-nocheck
(() => {
    // 대시보드 과목 목록을 순회하면서 과목별 수집 결과를 통합한다.
    const E = window.__ECDASH__;
    E.crawlCoursesWithConcurrency = async function crawlCoursesWithConcurrency(
        coursesInput,
    ) {
        const courses = Array.isArray(coursesInput)
            ? E.normalizeCourseCache(coursesInput)
            : E.collectCoursesFromDashboardSMU();
        if (!courses.length) return [];

        return await E.mapWithConcurrency(
            courses,
            E.constants.CRAWL_CONCURRENCY,
            async (course) => {
                try {
                    return {
                        course,
                        items: await E.crawlCourseItems(course),
                        ok: true,
                    };
                } catch (err) {
                    console.warn(
                        `[ECDASH] course crawl skipped. courseId=${course.courseId}`,
                        err,
                    );
                    return {
                        course,
                        items: [],
                        ok: false,
                    };
                }
            },
        );
    };

    E.crawlAllItemsFromDashboardSMU =
        async function crawlAllItemsFromDashboardSMU(coursesInput) {
            const courses = Array.isArray(coursesInput)
                ? E.normalizeCourseCache(coursesInput)
                : E.collectCoursesFromDashboardSMU();
            if (!courses.length) return [];

            E.setBadge?.('CRAWL');
            E.setSub?.(
                `과목 ${courses.length}개에서 과제/퀴즈/강의/토론/자료 정보를 가져오는 중…`,
            );

            const perCourse = await E.crawlCoursesWithConcurrency(courses);

            return E.dedupeItems(
                perCourse.flatMap((result) =>
                    Array.isArray(result?.items) ? result.items : [],
                ),
            );
        };
})();
