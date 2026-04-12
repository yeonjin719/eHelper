import type { HiddenItemPreview } from '../types';
import { HiddenItemRow } from './HiddenItemRow';
import { SettingsSection } from './SettingsSection';

interface DashboardHiddenItemsSectionProps {
    open: boolean;
    hiddenItemCount: number;
    hiddenItems: HiddenItemPreview[];
    hiddenSearch: string;
    hiddenSummaryText: string;
    filteredHiddenItems: HiddenItemPreview[];
    onToggleOpen: () => void;
    onHiddenSearchChange: (value: string) => void;
    onUnhideItem: (itemId: string) => void | Promise<void>;
    onResetHiddenItems: () => void | Promise<void>;
}

export function DashboardHiddenItemsSection({
    open,
    hiddenItemCount,
    hiddenItems,
    hiddenSearch,
    hiddenSummaryText,
    filteredHiddenItems,
    onToggleOpen,
    onHiddenSearchChange,
    onUnhideItem,
    onResetHiddenItems,
}: DashboardHiddenItemsSectionProps) {
    return (
        <SettingsSection
            title="숨김 항목"
            description="제목이나 과목명으로 찾아서 개별 복원하거나, 전체 복원할 수 있어요."
            badgeText={`${hiddenItemCount}개`}
            open={open}
            onToggle={onToggleOpen}
        >
            {hiddenItems.length > 0 ? (
                <>
                    <div className="mt-3 flex items-center gap-2">
                        <input
                            type="search"
                            value={hiddenSearch}
                            className="h-10 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 text-[12px] font-medium text-zinc-700 outline-none transition placeholder:text-zinc-400 focus-visible:border-sky-400 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-sky-100"
                            placeholder="제목, 과목명, 상태로 찾기"
                            aria-label="숨김 항목 검색"
                            onChange={(event) => {
                                onHiddenSearchChange(event.target.value || '');
                            }}
                        />
                        <button
                            id="ecdash-setting-reset-hidden-items"
                            type="button"
                            className="inline-flex h-10 shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-3 text-[12px] font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100"
                            onClick={() => {
                                void onResetHiddenItems();
                            }}
                        >
                            전체 복원
                        </button>
                    </div>

                    <div className="mt-3 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/80 px-3 py-2 text-[11px] font-medium text-zinc-600">
                        {hiddenSummaryText}
                    </div>

                    {filteredHiddenItems.length > 0 ? (
                        filteredHiddenItems.map((item) => (
                            <HiddenItemRow
                                key={item.id}
                                item={item}
                                onUnhideItem={onUnhideItem}
                            />
                        ))
                    ) : (
                        <p className="m-0 mt-3 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-3 py-6 text-center text-[12px] leading-6 text-zinc-500 [background-image:none!important] [box-shadow:none!important] [text-decoration:none!important]">
                            검색 결과가 없어요. 다른 제목이나 과목명으로 다시
                            찾아보세요.
                        </p>
                    )}
                </>
            ) : (
                <p className="m-0 mt-3 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-3 py-6 text-center text-[12px] leading-6 text-zinc-500 [background-image:none!important] [box-shadow:none!important] [text-decoration:none!important]">
                    숨김된 항목이 없어요.
                </p>
            )}
        </SettingsSection>
    );
}
