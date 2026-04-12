import type { DashboardItem, ItemStatus, ItemType } from '../types';
import { cleanText } from './text';

export function splitMetaByPeriod(
    metaText: string | undefined,
    itemType: ItemType,
) {
    const raw = cleanText(metaText || '');
    if (!raw) return { detailText: '', periodText: '' };

    const parts = raw
        .split(/\s*·\s*/)
        .map((part) => cleanText(part))
        .filter(Boolean);

    const detailParts: string[] = [];
    const periodParts: string[] = [];

    for (const part of parts) {
        if (/^(?:기간|period)\s*(?::|：|\s|$)/i.test(part)) {
            periodParts.push(part);
        } else if (itemType === 'RESOURCE' && /\d{1,3}\s*%/.test(part)) {
            continue;
        } else {
            detailParts.push(part);
        }
    }

    return {
        detailText: detailParts.join(' · '),
        periodText: periodParts.join(' · '),
    };
}

export function hasQuizGradeMeta(item: Pick<DashboardItem, 'type' | 'meta'>) {
    if (item.type !== 'QUIZ') return false;
    return /(?:^|·)\s*(?:성적|grade)\s*[:：]\s*\S+/i.test(
        cleanText(item.meta || ''),
    );
}

export function getEffectiveItemStatus(item: DashboardItem): ItemStatus {
    if (item.status === 'DONE') return 'DONE';
    if (hasQuizGradeMeta(item)) return 'DONE';
    return item.status;
}

export function isOverdueItem(item: DashboardItem, now = Date.now()) {
    if (item.type === 'NOTICE') return false;
    if (typeof item.dueAt !== 'number') return false;
    if (item.dueAt >= now) return false;
    return getEffectiveItemStatus(item) === 'TODO';
}
