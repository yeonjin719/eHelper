import React from 'react';
import type { DashboardItem, DashboardRuntime } from '../types';
import {
    getEffectiveItemStatus,
    itemCardToneClass,
    stateBadgeClass,
    splitMetaByPeriod,
    triggerResourceDownload,
    typeBadgeClass,
} from '../utils/dashboardUi';
import {
    MdOutlineAssignment,
    MdOutlineCampaign,
    MdOutlineFileDownload,
    MdOutlineFolderOpen,
    MdOutlineForum,
    MdOutlinePlayCircleOutline,
    MdOutlineQuiz,
    MdOutlineVisibilityOff,
} from 'react-icons/md';
interface DashboardItemCardProps {
    item: DashboardItem;
    runtime: DashboardRuntime;
    onHideItem: (itemId: string) => void;
}

function TypeBadgeIcon({ type }: { type: DashboardItem['type'] }) {
    if (type === 'ASSIGNMENT')
        return <MdOutlineAssignment aria-hidden="true" />;
    if (type === 'QUIZ') return <MdOutlineQuiz aria-hidden="true" />;
    if (type === 'LECTURE')
        return <MdOutlinePlayCircleOutline aria-hidden="true" />;
    if (type === 'FORUM') return <MdOutlineForum aria-hidden="true" />;
    if (type === 'RESOURCE') return <MdOutlineFolderOpen aria-hidden="true" />;
    return <MdOutlineCampaign aria-hidden="true" />;
}

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

export function DashboardItemCard({
    item,
    runtime,
    onHideItem,
}: DashboardItemCardProps) {
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
    const openItem = () => {
        if (item.url) {
            window.open(item.url, '_blank');
        }
    };

    return (
        <div
            role="button"
            tabIndex={0}
            className={[
                'w-full rounded-xl border px-3 py-3 text-left shadow-[0_4px_10px_rgba(15,23,42,0.05)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100',
                itemCardToneClass(item.type),
            ].join(' ')}
            onClick={() => {
                openItem();
            }}
            onKeyDown={(event) => {
                if (event.target !== event.currentTarget) return;
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                openItem();
            }}
        >
            <div className="flex min-w-0 flex-col gap-1.5">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        {item.section && (
                            <p className="mb-0 text-[12px] leading-4 break-words whitespace-normal text-zinc-500">
                                {item.section}
                            </p>
                        )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                        {unifiedStateText && (
                            <span
                                className={[
                                    'inline-flex self-start rounded-md px-2 py-0.5 text-[12px] font-semibold',
                                    stateBadgeClass(
                                        runtime,
                                        effectiveStatus,
                                        item.dueAt,
                                    ),
                                ].join(' ')}
                            >
                                {unifiedStateText}
                            </span>
                        )}

                        <button
                            type="button"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 p-0 text-[14px] text-zinc-700 transition hover:border-zinc-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100"
                            title="이 항목 숨기기"
                            aria-label="이 항목 숨기기"
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                onHideItem(item.id);
                            }}
                        >
                            <MdOutlineVisibilityOff />
                        </button>

                        {item.type === 'RESOURCE' && item.url && (
                            <button
                                type="button"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 p-0 text-[14px] text-zinc-700 transition hover:border-zinc-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100"
                                title="자료 다운로드"
                                aria-label="자료 다운로드"
                                onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    triggerResourceDownload(
                                        runtime,
                                        item.url,
                                        item.title,
                                    );
                                }}
                            >
                                <MdOutlineFileDownload />
                            </button>
                        )}
                    </div>
                </div>

                <div className="mb-[2px] flex items-center gap-1.5">
                    {(() => {
                        const typeLabel =
                            runtime.TYPE_LABEL?.[item.type] || item.type;
                        return (
                            <span
                                className={[
                                    'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[14px]',
                                    typeBadgeClass(item.type),
                                ].join(' ')}
                                title={typeLabel}
                                aria-label={typeLabel}
                            >
                                <TypeBadgeIcon type={item.type} />
                                <span className="sr-only">{typeLabel}</span>
                            </span>
                        );
                    })()}
                    <span className=" text-[13px] font-semibold leading-5 text-zinc-900">
                        {item.title}
                    </span>
                </div>

                <div className="flex flex-col gap-0.5">
                    {detailMetaLines.map((line, index) => (
                        <p
                            key={`detail-${item.id}-${index}`}
                            className="mb-0 mt-0.5 text-[12px] leading-5 break-words whitespace-normal text-zinc-500"
                        >
                            {line}
                        </p>
                    ))}

                    {extraMetaLines.map((line, index) => (
                        <p
                            key={`extra-${item.id}-${index}`}
                            className="mb-0 mt-0.5 text-[12px] leading-5 break-words whitespace-normal text-zinc-500"
                        >
                            {line}
                        </p>
                    ))}

                    {periodMetaLines.map((line, index) => (
                        <p
                            key={`period-${item.id}-${index}`}
                            className="mb-0 mt-0.5 text-[12px] leading-5 break-words whitespace-normal text-zinc-500"
                        >
                            {line}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    );
}
