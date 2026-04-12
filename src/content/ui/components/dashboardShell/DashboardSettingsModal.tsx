import { useEffect, useMemo, useState } from 'react';
import type { HiddenItemPreview } from './types';
import { DashboardFiltersSection } from './settings/DashboardFiltersSection';
import { DashboardHiddenItemsSection } from './settings/DashboardHiddenItemsSection';
import {
    buildHiddenSummaryText,
    filterHiddenItems,
} from './settings/settingsUtils';

interface DashboardSettingsModalProps {
    visible: boolean;
    hidePastLectures: boolean;
    hidePastAssignments: boolean;
    hidePastForums: boolean;
    hideDoneLectures: boolean;
    hideDoneAssignments: boolean;
    hideResources: boolean;
    hideNotices: boolean;
    includeSmClass: boolean;
    hiddenItemCount: number;
    hiddenItems: HiddenItemPreview[];
    onCloseSettings: () => void;
    onHidePastLecturesChange: (checked: boolean) => void | Promise<void>;
    onHidePastAssignmentsChange: (checked: boolean) => void | Promise<void>;
    onHidePastForumsChange: (checked: boolean) => void | Promise<void>;
    onHideDoneLecturesChange: (checked: boolean) => void | Promise<void>;
    onHideDoneAssignmentsChange: (checked: boolean) => void | Promise<void>;
    onHideResourcesChange: (checked: boolean) => void | Promise<void>;
    onHideNoticesChange: (checked: boolean) => void | Promise<void>;
    onIncludeSmClassChange: (checked: boolean) => void | Promise<void>;
    onUnhideItem: (itemId: string) => void | Promise<void>;
    onResetHiddenItems: () => void | Promise<void>;
}

export function DashboardSettingsModal({
    visible,
    hidePastLectures,
    hidePastAssignments,
    hidePastForums,
    hideDoneLectures,
    hideDoneAssignments,
    hideResources,
    hideNotices,
    includeSmClass,
    hiddenItemCount,
    hiddenItems,
    onCloseSettings,
    onHidePastLecturesChange,
    onHidePastAssignmentsChange,
    onHidePastForumsChange,
    onHideDoneLecturesChange,
    onHideDoneAssignmentsChange,
    onHideResourcesChange,
    onHideNoticesChange,
    onIncludeSmClassChange,
    onUnhideItem,
    onResetHiddenItems,
}: DashboardSettingsModalProps) {
    const [hiddenSearch, setHiddenSearch] = useState('');
    const [filtersOpen, setFiltersOpen] = useState(true);
    const [hiddenItemsOpen, setHiddenItemsOpen] = useState(true);

    useEffect(() => {
        if (!visible) {
            setHiddenSearch('');
            setFiltersOpen(true);
            setHiddenItemsOpen(true);
        }
    }, [visible]);

    const filteredHiddenItems = useMemo(() => {
        return filterHiddenItems(hiddenItems, hiddenSearch);
    }, [hiddenItems, hiddenSearch]);

    const hiddenSummaryText = buildHiddenSummaryText(
        hiddenItemCount,
        filteredHiddenItems.length,
        hiddenSearch,
    );

    if (!visible || typeof document === 'undefined') return null;

    return (
        <div
            id="ecdash-settings-modal"
            className="fixed inset-0 z-[1000000] grid place-items-center p-3"
            aria-hidden="false"
        >
            <div
                id="ecdash-settings-backdrop"
                className="absolute inset-0 bg-zinc-950/62 backdrop-blur-[2px]"
                aria-hidden="true"
                onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                }}
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onCloseSettings();
                }}
            />

            <div
                className="ecdash-settings-dialog ecdash-scroll relative max-h-[min(86vh,760px)] w-[min(428px,calc(100vw-24px))] overflow-y-auto overflow-x-hidden rounded-[20px] border border-zinc-200 bg-white px-4 shadow-[0_28px_70px_rgba(15,23,42,0.22)]"
                role="dialog"
                aria-modal={visible ? 'true' : 'false'}
                aria-labelledby="ecdash-settings-title"
                onMouseDown={(event) => {
                    event.stopPropagation();
                }}
                onClick={(event) => {
                    event.stopPropagation();
                }}
            >
                <div className="ecdash-settings-head sticky top-0 z-10 -mx-4 -mt-4 mb-3 flex items-start justify-between border-b border-zinc-100 bg-white px-4 py-4">
                    <div>
                        <h3
                            id="ecdash-settings-title"
                            className="m-0 text-[18px] font-bold tracking-tight text-zinc-950 [background-image:none!important] [border-bottom:0!important] [box-shadow:none!important] [text-decoration:none!important]"
                        >
                            보기 설정
                        </h3>
                        <p className="mt-1 text-[12px] leading-5 text-zinc-600 [background-image:none!important] [border-bottom:0!important] [box-shadow:none!important] [text-decoration:none!important]">
                            자주 쓰는 숨김 조건을 정리하고, 숨긴 항목을 빠르게
                            복원할 수 있어요.
                        </p>
                    </div>
                    <button
                        id="ecdash-settings-close"
                        type="button"
                        className="ecdash-settings-close inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-[15px] text-zinc-700 shadow-[0_6px_14px_rgba(15,23,42,0.06)] transition hover:border-zinc-300 hover:bg-zinc-100"
                        aria-label="닫기"
                        onMouseDown={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                        }}
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            onCloseSettings();
                        }}
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-4">
                    <DashboardFiltersSection
                        open={filtersOpen}
                        hidePastLectures={hidePastLectures}
                        hidePastAssignments={hidePastAssignments}
                        hidePastForums={hidePastForums}
                        hideDoneLectures={hideDoneLectures}
                        hideDoneAssignments={hideDoneAssignments}
                        hideResources={hideResources}
                        hideNotices={hideNotices}
                        includeSmClass={includeSmClass}
                        onToggleOpen={() => {
                            setFiltersOpen((prev) => !prev);
                        }}
                        onHidePastLecturesChange={onHidePastLecturesChange}
                        onHidePastAssignmentsChange={
                            onHidePastAssignmentsChange
                        }
                        onHidePastForumsChange={onHidePastForumsChange}
                        onHideDoneLecturesChange={onHideDoneLecturesChange}
                        onHideDoneAssignmentsChange={
                            onHideDoneAssignmentsChange
                        }
                        onHideResourcesChange={onHideResourcesChange}
                        onHideNoticesChange={onHideNoticesChange}
                        onIncludeSmClassChange={onIncludeSmClassChange}
                    />

                    <DashboardHiddenItemsSection
                        open={hiddenItemsOpen}
                        hiddenItemCount={hiddenItemCount}
                        hiddenItems={hiddenItems}
                        hiddenSearch={hiddenSearch}
                        hiddenSummaryText={hiddenSummaryText}
                        filteredHiddenItems={filteredHiddenItems}
                        onToggleOpen={() => {
                            setHiddenItemsOpen((prev) => !prev);
                        }}
                        onHiddenSearchChange={setHiddenSearch}
                        onUnhideItem={onUnhideItem}
                        onResetHiddenItems={onResetHiddenItems}
                    />
                </div>
            </div>
        </div>
    );
}
