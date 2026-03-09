// @ts-nocheck
(() => {
    const E = (window.__ECDASH__ = window.__ECDASH__ || {});
    const storagePrefix =
        (typeof E.getStoragePrefix === 'function'
            ? E.getStoragePrefix('ecdash:smu')
            : 'ecdash:smu') || 'ecdash:smu';

    // 크롤러, 화면, 동영상 모듈에서 공통으로 쓰는 상수와 순수 유틸 함수.
    E.constants = {
        ROOT_ID: 'ecdash-root',
        STORAGE_KEY: `${storagePrefix}:lastItems`,
        STORAGE_LAST_RUN: `${storagePrefix}:lastRunAt`,
        STORAGE_COURSES_KEY: `${storagePrefix}:courses`,
        STORAGE_COURSES_LAST_SYNC: `${storagePrefix}:courses:lastSyncAt`,
        CRAWL_CONCURRENCY: 3,
        VOD_AUTO_CLOSE_KEY: `${storagePrefix}:vod:autoClose`,
        VOD_LANG_KEY: `${storagePrefix}:vod:lang`,
        VOD_PLAYBACK_RATE_KEY: `${storagePrefix}:vod:playbackRate`,
    };

    E.TYPE_LABEL = {
        ASSIGNMENT: '과제',
        LECTURE: '강의',
        FORUM: '토론',
        RESOURCE: '자료',
        NOTICE: '공지',
    };

    E.cleanText = function cleanText(value) {
        return String(value || '')
            .replace(/\s+/g, ' ')
            .trim();
    };

    E.normalizeUrl = function normalizeUrl(url) {
        try {
            const u = new URL(url, location.origin);
            u.hash = '';
            return u.toString();
        } catch {
            return '';
        }
    };

    E.canonicalTitle = function canonicalTitle(title) {
        return E.cleanText(title)
            .toLowerCase()
            .replace(/[\s\[\](){}<>\-_:·.,]/g, '');
    };

    E.makeId = function makeId(type, courseId, title, url) {
        return `${type}::${courseId}::${title}::${url || ''}`.slice(0, 240);
    };

    E.toTimestampFromParts = function toTimestampFromParts(
        year,
        month,
        day,
        hour,
        minute,
        ampm,
    ) {
        let h = Number(hour || 0);
        const m = Number(minute || 0);
        const marker = String(ampm || '').toLowerCase();

        if (marker === '오후' || marker === 'pm') {
            if (h < 12) h += 12;
        } else if (marker === '오전' || marker === 'am') {
            if (h === 12) h = 0;
        }

        const dt = new Date(Number(year), Number(month) - 1, Number(day), h, m);
        const ts = dt.getTime();
        return Number.isNaN(ts) ? undefined : ts;
    };

    E.extractDateCandidates = function extractDateCandidates(text) {
        const source = E.cleanText(text);
        if (!source) return [];

        const out = [];

        const fullDatePattern =
            /(\d{4})\s*[.\-/년]\s*(\d{1,2})\s*[.\-/월]\s*(\d{1,2})\s*일?(?:\s*\([^)]+\))?\s*(?:(오전|오후|AM|PM|am|pm)\s*)?(\d{1,2})?\s*:?\s*(\d{2})?/g;

        let match = fullDatePattern.exec(source);
        while (match) {
            const ts = E.toTimestampFromParts(
                match[1],
                match[2],
                match[3],
                match[5],
                match[6],
                match[4],
            );
            if (typeof ts === 'number') out.push(ts);
            match = fullDatePattern.exec(source);
        }

        const shortDatePattern =
            /(?:^|[^0-9])(\d{1,2})\s*\/\s*(\d{1,2})(?:\s*\([^)]+\))?\s*(?:(오전|오후|AM|PM|am|pm)\s*)?(\d{1,2})?\s*:?\s*(\d{2})?/g;

        let shortMatch = shortDatePattern.exec(source);
        while (shortMatch) {
            const year = new Date().getFullYear();
            const ts = E.toTimestampFromParts(
                year,
                shortMatch[1],
                shortMatch[2],
                shortMatch[4],
                shortMatch[5],
                shortMatch[3],
            );
            if (typeof ts === 'number') out.push(ts);
            shortMatch = shortDatePattern.exec(source);
        }

        const normalized = source
            .replace(/년\s*/g, '-')
            .replace(/월\s*/g, '-')
            .replace(/일/g, '')
            .replace(/\./g, '-')
            .replace(/\s*\([^)]*\)\s*/g, ' ')
            .replace(/오전/g, 'AM')
            .replace(/오후/g, 'PM');

        const fallback = new Date(normalized).getTime();
        if (!Number.isNaN(fallback)) out.push(fallback);

        return [...new Set(out)].filter((v) => Number.isFinite(v));
    };

    E.parseDueAt = function parseDueAt(text) {
        if (!text) return undefined;
        const candidates = E.extractDateCandidates(text);
        if (!candidates.length) return undefined;
        return Math.max(...candidates);
    };

    E.parseDueSignalFromText = function parseDueSignalFromText(text) {
        const source = E.cleanText(text);
        if (!source) return undefined;

        const candidates = E.extractDateCandidates(source);
        if (!candidates.length) return undefined;

        const hasDueKeyword =
            /(마감|종료|제출|deadline|due|until|\bends?\b|\bclosing\b)/i.test(
                source,
            );
        const hasStartKeyword =
            /(시작|개시|오픈|열림|공개|게시|available\s*from|\bstarts?\b|\bbegins?\b|\bopens?\b)/i.test(
                source,
            );
        const hasRangeKeyword =
            /(기간|period|부터|까지|[~∼〜～]|(?:\bto\b))/i.test(source);
        const isRange = hasRangeKeyword || candidates.length >= 2;

        if (hasStartKeyword && !hasDueKeyword && !isRange) {
            return undefined;
        }

        let dueScore = 1;
        if (isRange) dueScore = 2;
        if (hasDueKeyword) dueScore = isRange ? 4 : 3;

        return {
            dueAt: Math.max(...candidates),
            dueScore,
        };
    };

    E.pickDueSignalFromTexts = function pickDueSignalFromTexts(texts) {
        if (!Array.isArray(texts) || !texts.length) return undefined;

        let best;
        for (const text of texts) {
            const signal = E.parseDueSignalFromText(text);
            if (!signal?.dueAt) continue;

            if (
                !best ||
                signal.dueScore > best.dueScore ||
                (signal.dueScore === best.dueScore &&
                    signal.dueAt > best.dueAt)
            ) {
                best = signal;
            }
        }

        return best;
    };

    E.pickPreferredDueInfo = function pickPreferredDueInfo(current, incoming) {
        const currentDueAt =
            typeof current?.dueAt === 'number' ? current.dueAt : undefined;
        const incomingDueAt =
            typeof incoming?.dueAt === 'number' ? incoming.dueAt : undefined;
        const currentDueScore = Number(current?.dueScore || 0);
        const incomingDueScore = Number(incoming?.dueScore || 0);

        if (typeof currentDueAt !== 'number' && typeof incomingDueAt !== 'number') {
            return { dueAt: undefined, dueScore: 0 };
        }

        if (typeof currentDueAt !== 'number') {
            return {
                dueAt: incomingDueAt,
                dueScore: incomingDueScore,
            };
        }

        if (typeof incomingDueAt !== 'number') {
            return {
                dueAt: currentDueAt,
                dueScore: currentDueScore,
            };
        }

        if (incomingDueScore > currentDueScore) {
            return {
                dueAt: incomingDueAt,
                dueScore: incomingDueScore,
            };
        }

        if (currentDueScore > incomingDueScore) {
            return {
                dueAt: currentDueAt,
                dueScore: currentDueScore,
            };
        }

        if (incomingDueAt >= currentDueAt) {
            return {
                dueAt: incomingDueAt,
                dueScore: incomingDueScore,
            };
        }

        return {
            dueAt: currentDueAt,
            dueScore: currentDueScore,
        };
    };

    E.extractProgressPercent = function extractProgressPercent(text) {
        const match = E.cleanText(text).match(/(\d{1,3})\s*%/);
        if (!match) return undefined;
        const value = Number(match[1]);
        if (!Number.isFinite(value)) return undefined;
        if (value < 0 || value > 100) return undefined;
        return value;
    };

    E.parseTimeToSeconds = function parseTimeToSeconds(text) {
        const t = E.cleanText(text);
        if (!t) return undefined;

        const match = t.match(/(\d{1,2}:){0,2}\d{1,2}/);
        if (!match) return undefined;

        const parts = match[0].split(':').map((v) => Number(v));
        if (parts.some((v) => !Number.isFinite(v))) return undefined;

        if (parts.length === 3) {
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
        if (parts.length === 2) {
            return parts[0] * 60 + parts[1];
        }
        return parts[0];
    };

    E.inferStatusFromPlayTimes = function inferStatusFromPlayTimes(
        videoDurationText,
        progressDurationText,
    ) {
        const videoSec = E.parseTimeToSeconds(videoDurationText);
        const progressSec = E.parseTimeToSeconds(progressDurationText);

        if (!Number.isFinite(videoSec) || videoSec <= 0) return 'UNKNOWN';
        if (!Number.isFinite(progressSec)) return 'UNKNOWN';
        if (progressSec <= 0) return 'TODO';
        if (progressSec >= videoSec) return 'DONE';
        return 'TODO';
    };

    E.inferStatusFromText = function inferStatusFromText(text) {
        const t = E.cleanText(text).toLowerCase();
        if (!t) return 'UNKNOWN';

        const pct = E.extractProgressPercent(t);
        if (typeof pct === 'number') {
            return pct >= 100 ? 'DONE' : 'TODO';
        }

        const hasTodo =
            /(미제출|미완료|미수강|미참여|not\s+completed|incomplete|not\s+done|pending|todo|진행\s*중|참여\s*필요)/i.test(
                t,
            );

        const hasDone =
            /(제출\s*완료|수강\s*완료|완료됨|완료|참여\s*완료|completed|done|passed)/i.test(
                t,
            );

        if (hasTodo && !hasDone) return 'TODO';
        if (hasDone && !hasTodo) return 'DONE';
        if (hasTodo && hasDone) return 'TODO';
        return 'UNKNOWN';
    };

    E.pickDueAtFromTexts = function pickDueAtFromTexts(texts) {
        return E.pickDueSignalFromTexts(texts)?.dueAt;
    };

    E.pickMetaFromTexts = function pickMetaFromTexts(texts) {
        for (const rawText of texts) {
            const text = E.cleanText(rawText);
            if (!text) continue;

            const pct = E.extractProgressPercent(text);
            if (typeof pct === 'number') {
                return `진도 ${pct}%`;
            }

            // 점검 필요: 현재 테마/페이지 구조에 따라 조정할 기간 표기 패턴
            const periodRangeMatch = text.match(
                /(\d{4}\s*[.\-/]\s*\d{1,2}\s*[.\-/]\s*\d{1,2}\s+\d{1,2}:\d{2}(?::\d{2})?\s*[~\-]\s*\d{4}\s*[.\-/]\s*\d{1,2}\s*[.\-/]\s*\d{1,2}\s+\d{1,2}:\d{2}(?::\d{2})?)/,
            );
            if (periodRangeMatch?.[1]) {
                return `기간: ${E.cleanText(periodRangeMatch[1])}`;
            }

            const keywordMatch = text.match(
                /(기간[^|,]{0,45}|마감[^|,]{0,45}|종료[^|,]{0,45}|due[^|,]{0,45}|until[^|,]{0,45})/i,
            );
            if (keywordMatch) {
                return E.cleanText(keywordMatch[1]);
            }
        }

        return undefined;
    };

    E.ddayLabel = function ddayLabel(dueAt) {
        if (!dueAt) return 'INFO';
        const now = Date.now();
        const diff = dueAt - now;
        if (diff < 0) return '마감';
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'D-DAY';
        return `D-${days}`;
    };

    E.statusClass = function statusClass(status) {
        if (status === 'DONE') return 'done';
        if (status === 'TODO') return 'todo';
        return 'unknown';
    };

    E.statusLabel = function statusLabel(status) {
        if (status === 'DONE') return '완료';
        if (status === 'TODO') return '미완료';
        return '상태미상';
    };

    E.saveSnapshot = function saveSnapshot(items) {
        try {
            chrome.storage?.local?.set?.({
                [E.constants.STORAGE_KEY]: items,
                [E.constants.STORAGE_LAST_RUN]: Date.now(),
            });
        } catch (_) {
            // 무시
        }
    };

    E.loadSnapshot = async function loadSnapshot() {
        try {
            const res = await chrome.storage?.local?.get?.([
                E.constants.STORAGE_KEY,
                E.constants.STORAGE_LAST_RUN,
            ]);
            return {
                items: res?.[E.constants.STORAGE_KEY] || [],
                lastRunAt: res?.[E.constants.STORAGE_LAST_RUN] || 0,
            };
        } catch (_) {
            return { items: [], lastRunAt: 0 };
        }
    };

    E.summarizeCounts = function summarizeCounts(items) {
        const counts = {
            ASSIGNMENT: 0,
            LECTURE: 0,
            FORUM: 0,
            RESOURCE: 0,
            NOTICE: 0,
        };

        for (const item of items) {
            if (counts[item.type] != null) counts[item.type] += 1;
        }

        return `과제 ${counts.ASSIGNMENT} · 강의 ${counts.LECTURE} · 토론 ${counts.FORUM} · 자료 ${counts.RESOURCE} · 공지 ${counts.NOTICE}`;
    };
})();
