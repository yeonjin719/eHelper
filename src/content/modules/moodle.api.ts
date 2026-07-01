// @ts-nocheck
(() => {
    const E = window.__ECDASH__;
    if (!E) return;

    const REST_ENDPOINT = 'https://ecampus.smu.ac.kr/webservice/rest/server.php';
    E.__missingMoodleFunctions = E.__missingMoodleFunctions || new Set();
    let availableFunctionsPromise = null;
    let siteInfoPromise = null;

    async function getStoredMoodleToken() {
        try {
            const key = E.constants?.MOODLE_TOKEN_KEY || 'ecdash:smu:moodleToken';
            const res = await chrome.storage?.local?.get?.([key]);
            return E.cleanText(res?.[key]);
        } catch {
            return '';
        }
    }

    async function requestMoodleApi(wsfunction, params = {}) {
        const token = await getStoredMoodleToken();
        if (!token) {
            E.__moodleTokenMissing = true;
            throw new Error('Moodle token missing');
        }

        const query = new URLSearchParams({
            wstoken: token,
            wsfunction,
            moodlewsrestformat: 'json',
        });

        Object.entries(params || {}).forEach(([key, value]) => {
            if (value == null) return;
            query.set(key, String(value));
        });

        const res = await fetch(`${REST_ENDPOINT}?${query.toString()}`, {
            cache: 'no-store',
        });
        if (!res.ok) throw new Error(`Moodle API failed ${res.status}`);

        const data = await res.json();
        if (data?.exception || data?.errorcode || data?.error) {
            if (
                data?.errorcode === 'invalidrecord' &&
                /external_functions/i.test(E.cleanText(data?.message))
            ) {
                E.__missingMoodleFunctions.add(wsfunction);
            }
            throw new Error(data.message || data.error || data.errorcode);
        }

        return data;
    }

    E.getMoodleSiteInfo = async function getMoodleSiteInfo() {
        if (!siteInfoPromise) {
            siteInfoPromise = requestMoodleApi(
                'core_webservice_get_site_info',
            ).catch(() => null);
        }

        return await siteInfoPromise;
    };

    E.getAvailableMoodleFunctions = async function getAvailableMoodleFunctions() {
        if (!availableFunctionsPromise) {
            availableFunctionsPromise = E.getMoodleSiteInfo()
                .then((data) => {
                    const names = (Array.isArray(data?.functions)
                        ? data.functions
                        : []
                    )
                        .map((fn) => E.cleanText(fn?.name))
                        .filter(Boolean);
                    return names.length ? new Set(names) : null;
                })
                .catch(() => null);
        }

        return await availableFunctionsPromise;
    };

    E.isMoodleFunctionAvailable = async function isMoodleFunctionAvailable(
        wsfunction,
    ) {
        if (E.__missingMoodleFunctions.has(wsfunction)) return false;

        const available = await E.getAvailableMoodleFunctions();
        if (!available) return true;

        const ok = available.has(wsfunction);
        if (!ok) E.__missingMoodleFunctions.add(wsfunction);
        return ok;
    };

    E.callMoodleApi = async function callMoodleApi(wsfunction, params = {}) {
        if (wsfunction !== 'core_webservice_get_site_info') {
            const available = await E.isMoodleFunctionAvailable(wsfunction);
            if (!available) {
                throw new Error(`Moodle API function unavailable: ${wsfunction}`);
            }
        }

        return await requestMoodleApi(wsfunction, params);
    };

    async function applyMoodleCompletionStatus(_courseId, items) {
        const source = Array.isArray(items) ? items : [];
        return source.map((item) => {
            const { __cmid, ...cleanItem } = item;
            return cleanItem;
        });
    };

    E.fetchMoodleAssignmentItems = async function fetchMoodleAssignmentItems({
        courseId,
        courseName,
        courseIsNew = false,
        statusConcurrency = 2,
    }) {
        const data = await E.callMoodleApi('mod_assign_get_assignments', {
            'courseids[0]': courseId,
        });

        const course = (data?.courses || []).find(
            (it) => String(it?.id) === String(courseId),
        );
        const assignments = Array.isArray(course?.assignments)
            ? course.assignments
            : [];

        const items = assignments
            .map((assignment) => {
                const title = E.cleanText(assignment?.name);
                const cmid = assignment?.cmid;
                if (!title || !cmid) return null;

                const url = new URL(
                    `/mod/assign/view.php?id=${cmid}`,
                    location.origin,
                ).toString();
                const dueAt = Number(assignment?.duedate || 0) * 1000;

                return {
                    id: E.makeId('ASSIGNMENT', courseId, title, url),
                    type: 'ASSIGNMENT',
                    courseId,
                    courseName,
                    courseIsNew: Boolean(courseIsNew),
                    title,
                    url,
                    dueAt: dueAt > 0 ? dueAt : undefined,
                    dueScore: dueAt > 0 ? 3 : 0,
                    status: 'UNKNOWN',
                    meta: undefined,
                    __cmid: cmid,
                };
            })
            .filter(Boolean);

        return await applyMoodleCompletionStatus(courseId, items);
    };

    E.fetchMoodleCourseContents = async function fetchMoodleCourseContents(
        courseId,
    ) {
        const data = await E.callMoodleApi('core_course_get_contents', {
            courseid: courseId,
        });
        return Array.isArray(data) ? data : [];
    };

    function getModuleUrl(module) {
        return E.normalizeUrl(
            module?.url ||
                module?.contents?.[0]?.fileurl ||
                module?.contents?.[0]?.url ||
                '',
        );
    }

    function getModuleCompletionStatus(module) {
        const state = Number(module?.completiondata?.state);
        if (!Number.isFinite(state)) return 'UNKNOWN';
        return state > 0 ? 'DONE' : 'TODO';
    }

    E.fetchMoodleResourceItems = async function fetchMoodleResourceItems({
        courseId,
        courseName,
        courseIsNew = false,
        contents,
    }) {
        const sections =
            contents || (await E.fetchMoodleCourseContents(courseId));
        const items = [];

        for (const section of sections) {
            const sectionName = E.cleanText(section?.name) || undefined;
            const modules = Array.isArray(section?.modules)
                ? section.modules
                : [];

            for (const module of modules) {
                const modname = E.cleanText(module?.modname).toLowerCase();
                if (
                    ![
                        'resource',
                        'folder',
                        'url',
                        'page',
                        'file',
                        'ubfile',
                    ].includes(modname)
                ) {
                    continue;
                }

                const title = E.cleanText(module?.name);
                const url = getModuleUrl(module);
                if (!title || !url) continue;

                items.push({
                    id: E.makeId('RESOURCE', courseId, title, url),
                    type: 'RESOURCE',
                    courseId,
                    courseName,
                    courseIsNew: Boolean(courseIsNew),
                    title,
                    url,
                    section: sectionName,
                    dueAt: undefined,
                    dueScore: 0,
                    status: getModuleCompletionStatus(module),
                    meta: E.cleanText(module?.modplural) || undefined,
                    __cmid: module.id,
                });
            }
        }

        return await applyMoodleCompletionStatus(courseId, items);
    };

    E.fetchMoodleLectureItems = async function fetchMoodleLectureItems({
        courseId,
        courseName,
        courseIsNew = false,
        contents,
    }) {
        const sections =
            contents || (await E.fetchMoodleCourseContents(courseId));
        const items = [];

        for (const section of sections) {
            const sectionName = E.cleanText(section?.name) || undefined;
            const modules = Array.isArray(section?.modules)
                ? section.modules
                : [];

            for (const module of modules) {
                const modname = E.cleanText(module?.modname).toLowerCase();
                const title = E.cleanText(module?.name);
                const url = getModuleUrl(module);
                if (!title || !url) continue;

                const looksLikeLecture =
                    [
                        'vod',
                        'video',
                        'econtents',
                        'ubonline',
                        'ubvod',
                        'contents',
                    ].includes(modname) ||
                    /(vod|강의영상|동영상|온라인\s*강의|lecture|e-?contents)/i.test(
                        `${modname} ${title}`,
                    );
                if (!looksLikeLecture) continue;

                items.push({
                    id: E.makeId('LECTURE', courseId, title, url),
                    type: 'LECTURE',
                    courseId,
                    courseName,
                    courseIsNew: Boolean(courseIsNew),
                    title,
                    url,
                    section: sectionName,
                    dueAt: undefined,
                    dueScore: 0,
                    status: 'UNKNOWN',
                    meta: E.cleanText(module?.modplural) || undefined,
                    __cmid: module.id,
                });
            }
        }

        return await applyMoodleCompletionStatus(courseId, items);
    };

    E.fetchMoodleNoticeItems = async function fetchMoodleNoticeItems({
        courseId,
        courseName,
        courseIsNew = false,
        contents,
    }) {
        const sections =
            contents || (await E.fetchMoodleCourseContents(courseId));
        const boards = [];

        for (const section of sections) {
            const sectionName = E.cleanText(section?.name) || undefined;
            const modules = Array.isArray(section?.modules)
                ? section.modules
                : [];

            for (const module of modules) {
                const modname = E.cleanText(module?.modname).toLowerCase();
                const url = getModuleUrl(module);
                if (modname !== 'ubboard' || !url) continue;

                boards.push({
                    url,
                    boardTitle: E.cleanText(module?.name) || '공지사항',
                    section: sectionName,
                });
            }
        }

        if (!boards.length || typeof E.parseUbboardItemsFromHtml !== 'function') {
            return [];
        }

        const chunks = await E.mapWithConcurrency(
            boards,
            Math.min(2, boards.length),
            async (board) => {
                try {
                    const html = await E.fetchHtml(board.url);
                    return E.parseUbboardItemsFromHtml(
                        html,
                        courseId,
                        courseName,
                        courseIsNew,
                        board,
                    );
                } catch {
                    return [];
                }
            },
        );

        return E.dedupeItems(chunks.flat());
    };

    E.fetchMoodleQuizItems = async function fetchMoodleQuizItems({
        courseId,
        courseName,
        courseIsNew = false,
        contents,
    }) {
        const sections =
            contents || (await E.fetchMoodleCourseContents(courseId));
        const items = [];

        for (const section of sections) {
            const sectionName = E.cleanText(section?.name) || undefined;
            const modules = Array.isArray(section?.modules)
                ? section.modules
                : [];

            for (const module of modules) {
                const modname = E.cleanText(module?.modname).toLowerCase();
                if (modname !== 'quiz') continue;

                const title = E.cleanText(module?.name);
                const url = getModuleUrl(module);
                if (!title || !url) continue;

                items.push({
                    id: E.makeId('QUIZ', courseId, title, url),
                    type: 'QUIZ',
                    courseId,
                    courseName,
                    courseIsNew: Boolean(courseIsNew),
                    title,
                    url,
                    section: sectionName,
                    dueAt: undefined,
                    dueScore: 0,
                    status: getModuleCompletionStatus(module),
                    meta: undefined,
                    __cmid: module.id,
                });
            }
        }

        return await applyMoodleCompletionStatus(courseId, items);
    };
})();
