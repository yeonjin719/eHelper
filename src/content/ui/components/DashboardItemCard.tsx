import type { DashboardItem, DashboardRuntime } from '../types';
import { MdOutlineFileDownload, MdOutlineVisibilityOff } from 'react-icons/md';
import {
    itemCardToneClass,
    stateBadgeClass,
    typeBadgeClass,
} from '../utils/itemAppearance';
import { triggerResourceDownload } from '../utils/resourceDownload';
import { buildDashboardItemCardMeta } from './dashboardItemCard/itemCardMeta';
import { TypeBadgeIcon } from './dashboardItemCard/TypeBadgeIcon';

interface DashboardItemCardProps {
    item: DashboardItem;
    runtime: DashboardRuntime;
    onHideItem: (itemId: string) => void;
}

export function DashboardItemCard({
    item,
    runtime,
    onHideItem,
}: DashboardItemCardProps) {
    const canOpenItem = Boolean(item.url) && !runtime.__disableItemNavigation;
    const {
        detailMetaLines,
        extraMetaLines,
        periodMetaLines,
        effectiveStatus,
        unifiedStateText,
    } = buildDashboardItemCardMeta(item, runtime);
    const typeLabel = runtime.TYPE_LABEL?.[item.type] || item.type;
    const openItem = () => {
        if (canOpenItem && item.url) {
            window.open(item.url, '_blank');
        }
    };

    return (
        <div
            role={canOpenItem ? 'button' : undefined}
            tabIndex={canOpenItem ? 0 : undefined}
            className={[
                'w-full relative rounded-xl border px-3 py-3 text-left shadow-[0_4px_10px_rgba(15,23,42,0.05)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100',
                canOpenItem ? 'cursor-pointer' : 'cursor-default',
                itemCardToneClass(item.type),
            ].join(' ')}
            onClick={canOpenItem ? openItem : undefined}
            onKeyDown={(event) => {
                if (!canOpenItem) return;
                if (event.target !== event.currentTarget) return;
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                openItem();
            }}
        >
            <div className="flex min-w-0 flex-col">
                <div className="flex items-center justify-between gap-1">
                    <div className="min-w-0">
                        {item.section && (
                            <p className="mb-0 text-[12px] break-words whitespace-normal text-zinc-500">
                                {item.section}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        {unifiedStateText && (
                            <span
                                className={[
                                    'inline-flex rounded-md px-2 py-0.5 text-[12px] font-semibold',
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
                    </div>
                </div>

                <div className="mb-[2px] flex items-center gap-1.5">
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
                    <div className="flex w-fit absolute right-2 bottom-3">
                        {item.type === 'RESOURCE' && item.url && (
                            <button
                                type="button"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-none bg-white p-0 text-[14px] text-zinc-700 transition hover:border-zinc-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100"
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
                        <button
                            type="button"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-none bg-white p-0 text-[14px] text-zinc-700 transition hover:border-zinc-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100"
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
                    </div>
                </div>
            </div>
        </div>
    );
}
