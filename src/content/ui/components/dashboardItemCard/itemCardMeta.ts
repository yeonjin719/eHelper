import type { DashboardItem, DashboardRuntime, ItemStatus } from '../../types';
import {
    getEffectiveItemStatus,
    splitMetaByPeriod,
} from '../../utils/itemStatus';

function formatDueDate(dueAt?: number, includeYear = false) {
    if (typeof dueAt !== 'number') return '';
    const date = new Date(dueAt);
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    if (includeYear) return `${year}-${month}-${day} ${hour}:${minute}`;
    return `${month}.${day} ${hour}:${minute}`;
}

function normalizeMetaKey(value: string) {
    return String(value || '')
        .toLowerCase()
        .replace(/\s+/g, '');
}

function uniqueMetaLines(value: string) {
    const lines = String(value || '')
        .split(/\s*·\s*/)
        .map((line) => String(line || '').trim())
        .filter(Boolean);

    const seen = new Set<string>();
    const out: string[] = [];
    for (const line of lines) {
        const key = line.toLowerCase().replace(/\s+/g, '');
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(line);
    }
    return out;
}

function shouldHideDetailMetaLine(line: string) {
    const normalized = normalizeMetaKey(line);

    if (!normalized.startsWith('출석')) return false;
    if (normalized.includes('미완료')) return false;
    if (normalized.includes('0%')) return false;

    return normalized.includes('완료') || normalized.includes('100%');
}

function getAssignmentBadgeText(
    item: DashboardItem,
    normalizedStatusText: string,
) {
    const meta = String(item.meta || '');

    if (/미제출|not\s*submitted|no\s*attempt/i.test(meta)) {
        return '미제출';
    }

    if (/제출\s*완료|submitted(?:\s+for\s+grading)?/i.test(meta)) {
        return '제출 완료';
    }

    if (item.status === 'TODO' || /미완료/.test(normalizedStatusText)) {
        return '미제출';
    }

    if (item.status === 'DONE' || normalizedStatusText === '완료') {
        return '제출 완료';
    }

    if (typeof item.dueAt === 'number') {
        return `마감 ${formatDueDate(item.dueAt)}`;
    }

    return '제출 확인필요';
}

function getQuizBadgeText(item: DashboardItem, normalizedStatusText: string) {
    const metaLines = uniqueMetaLines(item.meta || '');
    const gradeLine =
        metaLines.find((line) => /^(?:성적|grade)\s*[:：]/i.test(line)) || '';

    if (gradeLine) {
        return gradeLine;
    }

    if (item.status === 'DONE' || normalizedStatusText === '완료') {
        return '응시 완료';
    }

    if (typeof item.dueAt === 'number') {
        return `마감 ${formatDueDate(item.dueAt)}`;
    }

    if (item.status === 'TODO' || /미완료/.test(normalizedStatusText)) {
        return '미응시';
    }

    return '응시 확인필요';
}

function extractAssignmentDeadlineLine(
    dueAt: number | undefined,
    periodText: string,
) {
    if (typeof dueAt === 'number') {
        return `마감: ${formatDueDate(dueAt, true)}`;
    }

    const normalizedPeriodText = String(periodText || '').trim();
    if (!normalizedPeriodText) return '';

    const periodBody = normalizedPeriodText.replace(
        /^(?:기간|period)\s*:\s*/i,
        '',
    );
    const rangeParts = periodBody
        .split(/\s*(?:~|∼|〜|～)\s*/g)
        .filter(Boolean);
    if (rangeParts.length >= 2) {
        return `마감: ${rangeParts[rangeParts.length - 1]}`;
    }

    return periodBody ? `마감: ${periodBody}` : '';
}

export interface DashboardItemCardMeta {
    detailMetaLines: string[];
    extraMetaLines: string[];
    periodMetaLines: string[];
    effectiveStatus: ItemStatus;
    unifiedStateText: string;
}

export function buildDashboardItemCardMeta(
    item: DashboardItem,
    runtime: DashboardRuntime,
): DashboardItemCardMeta {
    const { detailText, periodText } = splitMetaByPeriod(item.meta, item.type);
    const effectiveStatus = getEffectiveItemStatus(item);
    const rawDdayText = item.dueAt ? runtime.ddayLabel?.(item.dueAt) || '' : '';
    const ddayText =
        rawDdayText === '마감' && effectiveStatus !== 'TODO' ? '' : rawDdayText;
    const statusTextRaw = String(
        runtime.statusLabel?.(effectiveStatus) || effectiveStatus,
    );
    const normalizedStatusText = /상태\s*미상|unknown/i.test(statusTextRaw)
        ? '확인필요'
        : statusTextRaw;
    const assignmentBadgeText =
        item.type === 'ASSIGNMENT'
            ? getAssignmentBadgeText(item, normalizedStatusText)
            : '';
    const quizBadgeText =
        item.type === 'QUIZ' ? getQuizBadgeText(item, normalizedStatusText) : '';
    const unifiedStateText =
        item.type === 'NOTICE'
            ? ''
            : item.type === 'ASSIGNMENT'
              ? assignmentBadgeText
              : item.type === 'QUIZ'
                ? quizBadgeText
                : [ddayText, normalizedStatusText].filter(Boolean).join(' · ');
    const primaryBadgeMetaText =
        item.type === 'ASSIGNMENT'
            ? assignmentBadgeText
            : item.type === 'QUIZ'
              ? quizBadgeText
              : '';

    const detailMetaLines = uniqueMetaLines(
        [detailText]
            .map((value) => String(value || '').trim())
            .filter(Boolean)
            .join(' · '),
    )
        .filter((line) => !shouldHideDetailMetaLine(line))
        .filter(
            (line) =>
                !(
                    item.type === 'ASSIGNMENT' &&
                    typeof item.dueAt === 'number' &&
                    /^(?:마감(?:\s*일시)?|종료(?:\s*일시)?|due(?:\s*date)?|until)(?::|\s|$)/i.test(
                        line,
                    )
                ),
        )
        .filter(
            (line) =>
                !(
                    (item.type === 'ASSIGNMENT' || item.type === 'QUIZ') &&
                    primaryBadgeMetaText &&
                    normalizeMetaKey(line) === normalizeMetaKey(primaryBadgeMetaText)
                ),
        );
    const rawPeriodMetaLines = uniqueMetaLines(
        [periodText]
            .map((value) => String(value || '').trim())
            .filter(Boolean)
            .join(' · '),
    );
    const periodMetaLines =
        item.type === 'ASSIGNMENT' || item.type === 'QUIZ'
            ? []
            : rawPeriodMetaLines;
    const metaLineKeys = new Set(
        [...detailMetaLines, ...periodMetaLines].map((line) =>
            normalizeMetaKey(line),
        ),
    );
    const assignmentDeadlineLine =
        item.type === 'ASSIGNMENT' || item.type === 'QUIZ'
            ? extractAssignmentDeadlineLine(item.dueAt, periodText)
            : '';
    const extraMetaLines =
        assignmentDeadlineLine &&
        !metaLineKeys.has(normalizeMetaKey(assignmentDeadlineLine))
            ? [assignmentDeadlineLine]
            : [];

    return {
        detailMetaLines,
        extraMetaLines,
        periodMetaLines,
        effectiveStatus,
        unifiedStateText,
    };
}
