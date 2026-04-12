import type { HiddenItemPreview } from '../types';

export function normalizeSearchText(value: string) {
    return String(value || '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

export function getHiddenStatusTagClass(statusLabel: string) {
    if (/완료/.test(statusLabel)) {
        return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    }

    if (/미상|사라짐/.test(statusLabel)) {
        return 'border-zinc-200 bg-zinc-100 text-zinc-600';
    }

    return 'border-amber-200 bg-amber-50 text-amber-700';
}

export function sortHiddenItems(hiddenItems: HiddenItemPreview[]) {
    return [...hiddenItems].sort((a, b) => {
        const byCourse = a.courseName.localeCompare(b.courseName);
        if (byCourse !== 0) return byCourse;
        return a.title.localeCompare(b.title);
    });
}

export function filterHiddenItems(
    hiddenItems: HiddenItemPreview[],
    query: string,
) {
    const normalizedQuery = normalizeSearchText(query);
    const sortedItems = sortHiddenItems(hiddenItems);

    if (!normalizedQuery) return sortedItems;

    return sortedItems.filter((item) =>
        normalizeSearchText(
            [
                item.title,
                item.courseName,
                item.typeLabel,
                item.statusLabel,
                item.dueLabel,
            ].join(' '),
        ).includes(normalizedQuery),
    );
}

export function buildHiddenSummaryText(
    hiddenItemCount: number,
    filteredItemCount: number,
    searchQuery: string,
) {
    return searchQuery.trim()
        ? `${hiddenItemCount}개 중 ${filteredItemCount}개 표시`
        : `${hiddenItemCount}개 숨김됨`;
}
