import { useEffect, useMemo, useState } from 'react';
import type { HiddenItemPreview } from './types';

interface DashboardSettingsModalProps {
    visible: boolean;
    hidePastLectures: boolean;
    hidePastAssignments: boolean;
    hidePastForums: boolean;
    hideDoneLectures: boolean;
    hideDoneAssignments: boolean;
    includeSmClass: boolean;
    hiddenItemCount: number;
    hiddenItems: HiddenItemPreview[];
    onCloseSettings: () => void;
    onHidePastLecturesChange: (checked: boolean) => void | Promise<void>;
    onHidePastAssignmentsChange: (checked: boolean) => void | Promise<void>;
    onHidePastForumsChange: (checked: boolean) => void | Promise<void>;
    onHideDoneLecturesChange: (checked: boolean) => void | Promise<void>;
    onHideDoneAssignmentsChange: (checked: boolean) => void | Promise<void>;
    onIncludeSmClassChange: (checked: boolean) => void | Promise<void>;
    onUnhideItem: (itemId: string) => void | Promise<void>;
    onResetHiddenItems: () => void | Promise<void>;
}

interface SettingsCheckboxItemProps {
    id: string;
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void | Promise<void>;
}

function SettingsCheckboxItem({
    id,
    label,
    description,
    checked,
    onChange,
}: SettingsCheckboxItemProps) {
    return (
        <label className="ecdash-settings-option flex items-start justify-between gap-5 rounded-[20px] border border-zinc-200/45 bg-zinc-50/35 px-5 py-[18px] text-zinc-800 transition hover:border-zinc-200/70 hover:bg-white focus-within:border-sky-200 focus-within:bg-white [background-image:none!important] [border-bottom:0!important] [box-shadow:none!important] [text-decoration:none!important]">
            <div className="min-w-0 space-y-1.5">
                <span className="block text-[13px] font-medium leading-6 text-zinc-900 [background-image:none!important] [border-bottom:0!important] [box-shadow:none!important] [text-decoration:none!important]">
                    {label}
                </span>
                {description ? (
                    <span className="block text-[12px] font-medium leading-6 text-zinc-600 [background-image:none!important] [border-bottom:0!important] [box-shadow:none!important] [text-decoration:none!important]">
                        {description}
                    </span>
                ) : null}
            </div>
            <span
                className={[
                    'relative mt-1 inline-flex h-7 w-12 shrink-0 items-center overflow-hidden rounded-full border transition focus-within:outline-none focus-within:ring-2 focus-within:ring-sky-100',
                    checked
                        ? 'border-sky-300 bg-sky-500 shadow-[inset_0_1px_2px_rgba(2,132,199,0.18)]'
                        : 'border-zinc-200 bg-white shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)]',
                ].join(' ')}
                aria-hidden="true"
            >
                <input
                    id={id}
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={(event) => {
                        void onChange(Boolean(event.target.checked));
                    }}
                />
                <span
                    className={[
                        'pointer-events-none absolute top-[3px] inline-flex h-5 w-5 rounded-full bg-white shadow-[0_2px_8px_rgba(15,23,42,0.18)] transition-[left] duration-200',
                        checked ? 'left-[23px]' : 'left-[3px]',
                    ].join(' ')}
                />
            </span>
        </label>
    );
}

function normalizeSearchText(value: string) {
    return String(value || '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

function getHiddenStatusTagClass(statusLabel: string) {
    if (/완료/.test(statusLabel)) {
        return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    }

    if (/미상|사라짐/.test(statusLabel)) {
        return 'border-zinc-200 bg-zinc-100 text-zinc-600';
    }

    return 'border-amber-200 bg-amber-50 text-amber-700';
}

export function DashboardSettingsModal({
    visible,
    hidePastLectures,
    hidePastAssignments,
    hidePastForums,
    hideDoneLectures,
    hideDoneAssignments,
    includeSmClass,
    hiddenItemCount,
    hiddenItems,
    onCloseSettings,
    onHidePastLecturesChange,
    onHidePastAssignmentsChange,
    onHidePastForumsChange,
    onHideDoneLecturesChange,
    onHideDoneAssignmentsChange,
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
        const query = normalizeSearchText(hiddenSearch);
        const sorted = [...hiddenItems].sort((a, b) => {
            const byCourse = a.courseName.localeCompare(b.courseName);
            if (byCourse !== 0) return byCourse;
            return a.title.localeCompare(b.title);
        });

        if (!query) return sorted;

        return sorted.filter((item) =>
            normalizeSearchText(
                [
                    item.title,
                    item.courseName,
                    item.typeLabel,
                    item.statusLabel,
                    item.dueLabel,
                ].join(' '),
            ).includes(query),
        );
    }, [hiddenItems, hiddenSearch]);

    const hiddenSummaryText = hiddenSearch.trim()
        ? `${hiddenItemCount}개 중 ${filteredHiddenItems.length}개 표시`
        : `${hiddenItemCount}개 숨김됨`;

    return (
        <div
            id="ecdash-settings-modal"
            className="fixed inset-0 z-[1000000] grid place-items-center p-3"
            aria-hidden={visible ? 'false' : 'true'}
            hidden={!visible}
        >
            <div
                id="ecdash-settings-backdrop"
                className="absolute inset-0 bg-zinc-950/62 backdrop-blur-[2px]"
                aria-hidden="true"
                onClick={onCloseSettings}
            />

            <div
                className="ecdash-settings-dialog ecdash-scroll relative max-h-[min(86vh,760px)] w-[min(428px,calc(100vw-24px))] overflow-y-auto overflow-x-hidden rounded-[20px] border border-zinc-200 bg-white p-4 shadow-[0_28px_70px_rgba(15,23,42,0.22)]"
                role="dialog"
                aria-modal={visible ? 'true' : 'false'}
                aria-labelledby="ecdash-settings-title"
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
                        onClick={onCloseSettings}
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-4">
                    <section className="rounded-[24px] border border-zinc-200/45 bg-white px-5 py-5 shadow-[0_6px_18px_rgba(15,23,42,0.035)]">
                        <div className="mb-4">
                            <button
                                type="button"
                                className="flex w-full items-start justify-between gap-3 rounded-2xl border border-transparent bg-transparent px-1 py-1 text-left transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100 [background-image:none!important] [border-bottom:0!important] [box-shadow:none!important] [text-decoration:none!important]"
                                aria-expanded={filtersOpen}
                                onClick={() => {
                                    setFiltersOpen((prev) => !prev);
                                }}
                            >
                                <div className="min-w-0">
                                    <div className="text-[13px] font-semibold tracking-tight text-zinc-950 [background-image:none!important] [border-bottom:0!important] [box-shadow:none!important] [text-decoration:none!important]">
                                        대시보드 필터
                                    </div>
                                    <p className="mt-1 text-[11px] leading-5 text-zinc-600 [background-image:none!important] [border-bottom:0!important] [box-shadow:none!important] [text-decoration:none!important]">
                                        완료되었거나 지난 항목을 자동으로 감춰
                                        목록을 더 짧게 유지합니다.
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-[13px] font-semibold text-zinc-600 transition">
                                        {filtersOpen ? '▾' : '▸'}
                                    </span>
                                </div>
                            </button>
                        </div>

                        {filtersOpen ? (
                            <div className="space-y-3">
                                <SettingsCheckboxItem
                                    id="ecdash-setting-hide-past-lectures"
                                    label="지난 강의 안보기"
                                    description="마감 시각이 지난 강의를 기본 목록에서 숨깁니다."
                                    checked={hidePastLectures}
                                    onChange={onHidePastLecturesChange}
                                />

                                <SettingsCheckboxItem
                                    id="ecdash-setting-hide-past-assignments"
                                    label="지난 과제/퀴즈 안보기"
                                    description="마감이 지난 과제와 퀴즈를 목록에서 제외합니다."
                                    checked={hidePastAssignments}
                                    onChange={onHidePastAssignmentsChange}
                                />

                                <SettingsCheckboxItem
                                    id="ecdash-setting-hide-past-forums"
                                    label="지난 토론 안보기"
                                    description="기한이 지난 토론 활동을 기본 화면에서 숨깁니다."
                                    checked={hidePastForums}
                                    onChange={onHidePastForumsChange}
                                />

                                <SettingsCheckboxItem
                                    id="ecdash-setting-hide-done-lectures"
                                    label="시청 완료한 강의 안보기"
                                    description="완료 처리된 강의를 남은 항목 중심으로 정리합니다."
                                    checked={hideDoneLectures}
                                    onChange={onHideDoneLecturesChange}
                                />

                                <SettingsCheckboxItem
                                    id="ecdash-setting-hide-done-assignments"
                                    label="제출 완료한 과제/퀴즈 안보기"
                                    description="제출 완료 또는 응시 완료 상태인 항목을 숨깁니다."
                                    checked={hideDoneAssignments}
                                    onChange={onHideDoneAssignmentsChange}
                                />

                                <SettingsCheckboxItem
                                    id="ecdash-setting-include-sm-class"
                                    label="SM-Class 포함하기"
                                    description="기본적으로 제외되는 SM-Class 과목도 함께 표시합니다."
                                    checked={includeSmClass}
                                    onChange={onIncludeSmClassChange}
                                />
                            </div>
                        ) : null}
                    </section>

                    <section className="rounded-[24px] border border-zinc-200/45 bg-white px-5 py-5 shadow-[0_6px_18px_rgba(15,23,42,0.035)]">
                        <div className="flex items-start justify-between gap-3">
                            <button
                                type="button"
                                className="flex w-full items-start justify-between gap-3 rounded-2xl border border-transparent bg-transparent px-1 py-1 text-left transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100 [background-image:none!important] [border-bottom:0!important] [box-shadow:none!important] [text-decoration:none!important]"
                                aria-expanded={hiddenItemsOpen}
                                onClick={() => {
                                    setHiddenItemsOpen((prev) => !prev);
                                }}
                            >
                                <div className="min-w-0">
                                    <div className="text-[13px] font-semibold tracking-tight text-zinc-950 [background-image:none!important] [border-bottom:0!important] [box-shadow:none!important] [text-decoration:none!important]">
                                        숨김 항목
                                    </div>
                                    <p className="mt-1 text-[11px] leading-5 text-zinc-600 [background-image:none!important] [border-bottom:0!important] [box-shadow:none!important] [text-decoration:none!important]">
                                        제목이나 과목명으로 찾아서 개별
                                        복원하거나, 전체 복원할 수 있어요.
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-semibold text-zinc-600">
                                        {hiddenItemCount}개
                                    </span>
                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-[13px] font-semibold text-zinc-600 transition">
                                        {hiddenItemsOpen ? '▾' : '▸'}
                                    </span>
                                </div>
                            </button>
                        </div>

                        {hiddenItemsOpen && hiddenItems.length > 0 ? (
                            <>
                                <div className="mt-3 flex items-center gap-2">
                                    <input
                                        type="search"
                                        value={hiddenSearch}
                                        className="h-10 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 text-[12px] font-medium text-zinc-700 outline-none transition placeholder:text-zinc-400 focus-visible:border-sky-400 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-sky-100"
                                        placeholder="제목, 과목명, 상태로 찾기"
                                        aria-label="숨김 항목 검색"
                                        onChange={(event) => {
                                            setHiddenSearch(
                                                event.target.value || '',
                                            );
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
                                    <ul className="ecdash-scroll mt-3 m-0 max-h-[320px] space-y-2 overflow-y-auto pr-1">
                                        {filteredHiddenItems.map((item) => (
                                            <li
                                                key={item.id}
                                                className="rounded-2xl border border-zinc-200 bg-[linear-gradient(180deg,#ffffff_0%,#fafafa_100%)] px-3 py-3 shadow-[0_4px_12px_rgba(15,23,42,0.04)]"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="m-0 break-words text-[13px] font-semibold leading-5 text-zinc-950 [background-image:none!important] [border-bottom:0!important] [box-shadow:none!important] [text-decoration:none!important]">
                                                            {item.title}
                                                        </p>
                                                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                                            <span className="inline-flex max-w-full rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
                                                                {
                                                                    item.courseName
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                                                            <span className="inline-flex rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold leading-none text-zinc-700">
                                                                {item.typeLabel}
                                                            </span>
                                                            <span
                                                                className={[
                                                                    'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none',
                                                                    getHiddenStatusTagClass(
                                                                        item.statusLabel,
                                                                    ),
                                                                ].join(' ')}
                                                            >
                                                                {
                                                                    item.statusLabel
                                                                }
                                                            </span>
                                                            {item.dueLabel ? (
                                                                <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold leading-none text-amber-700">
                                                                    {
                                                                        item.dueLabel
                                                                    }
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="shrink-0 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[11px] font-semibold text-zinc-700 shadow-[0_4px_10px_rgba(15,23,42,0.05)] transition hover:border-zinc-300 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100"
                                                        onClick={() => {
                                                            void onUnhideItem(
                                                                item.id,
                                                            );
                                                        }}
                                                    >
                                                        복원
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="m-0 mt-3 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-3 py-6 text-center text-[12px] leading-6 text-zinc-500 [background-image:none!important] [box-shadow:none!important] [text-decoration:none!important]">
                                        검색 결과가 없어요. 다른 제목이나
                                        과목명으로 다시 찾아보세요.
                                    </p>
                                )}
                            </>
                        ) : hiddenItemsOpen ? (
                            <p className="m-0 mt-3 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-3 py-6 text-center text-[12px] leading-6 text-zinc-500 [background-image:none!important] [box-shadow:none!important] [text-decoration:none!important]">
                                숨김된 항목이 없어요.
                            </p>
                        ) : null}
                    </section>
                </div>
            </div>
        </div>
    );
}
