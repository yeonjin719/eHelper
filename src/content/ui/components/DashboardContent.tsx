import React from 'react';
import type { DashboardItem, DashboardRuntime } from '../types';
import { CourseGroupSection } from './CourseGroupSection';

interface DashboardContentProps {
    runtime: DashboardRuntime;
    hasItems: boolean;
    loading: boolean;
    loadingMessage: string;
    hiddenItemCount: number;
    filteredItems: DashboardItem[];
    groupEntries: Array<[string, DashboardItem[]]>;
    courseOpenMap: Record<string, boolean>;
    onToggleCourse: (courseName: string) => void;
    onHideItem: (itemId: string) => void;
}

function LoadingSpinner({ compact = false }: { compact?: boolean }) {
    const sizeClass = compact
        ? 'h-10 w-10 border-[4px]'
        : 'h-12 w-12 border-[5px]';

    return (
        <span
            className={`inline-flex ${sizeClass} animate-spin rounded-full border-solid border-sky-100 border-t-sky-600 border-r-sky-400`}
            aria-hidden="true"
        />
    );
}

function splitLoadingMessage(message: string) {
    const text = String(message || '').trim();
    if (!text) return [];

    return text
        .replace(/([.?!])\s+/g, '$1\n')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
}

function LoadingOverlay({ message }: { message: string }) {
    const lines = splitLoadingMessage(message);

    return (
        <div
            className="pointer-events-none sticky top-1/2 z-10 flex h-0 w-full -translate-y-1/2 items-start justify-center overflow-visible px-4"
            role="status"
            aria-live="polite"
        >
            <div className="shrink-0 flex min-w-[220px] max-w-[320px] flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-white/96 px-5 py-4 text-center">
                <LoadingSpinner />
                <div className="space-y-1 text-[12px] font-semibold text-zinc-900">
                    {lines.map((line, index) => (
                        <div key={`${line}-${index}`}>{line}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function DashboardContent({
    runtime,
    hasItems,
    loading,
    loadingMessage,
    hiddenItemCount,
    filteredItems,
    groupEntries,
    courseOpenMap,
    onToggleCourse,
    onHideItem,
}: DashboardContentProps) {
    const onDashboardPage =
        runtime.isDashboardPage?.() ?? runtime.isDashboardSMU?.();
    const now = Date.now();
    const dueSoonThreshold = now + 3 * 24 * 60 * 60 * 1000;
    const dueSoonCount = filteredItems.filter(
        (item) =>
            item.type !== 'NOTICE' &&
            typeof item.dueAt === 'number' &&
            item.dueAt >= now &&
            item.dueAt <= dueSoonThreshold,
    ).length;
    const overdueCount = filteredItems.filter(
        (item) =>
            item.type !== 'NOTICE' &&
            item.status === 'TODO' &&
            typeof item.dueAt === 'number' &&
            item.dueAt < now,
    ).length;
    const shouldShowLoadingOverlay = loading && hasItems;
    const loadingMessageLines = splitLoadingMessage(
        loadingMessage || '불러오는 중...',
    );

    if (!hasItems) {
        if (loading) {
            return (
                <div
                    className="flex min-h-[124px] items-center justify-center rounded-xl border border-zinc-200 bg-white/95 px-3 py-5 text-[12px] leading-5 text-zinc-600"
                    role="status"
                    aria-live="polite"
                >
                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-center">
                        <LoadingSpinner compact />
                        <div className="space-y-1 font-semibold text-zinc-900">
                            {loadingMessageLines.map((line, index) => (
                                <div key={`${line}-${index}`}>{line}</div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex h-[40px] items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-center text-[12px] leading-5 text-zinc-600 shadow-[0_4px_10px_rgba(15,23,42,0.05)]">
                {onDashboardPage
                    ? '데이터가 없어요. ↻ 새로고침'
                    : '대시보드에서 사용 가능해요.'}
            </div>
        );
    }

    const content = !filteredItems.length ? (
        <div className="flex h-[40px] items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-center text-[12px] leading-5 text-zinc-600 shadow-[0_4px_10px_rgba(15,23,42,0.05)]">
            조건에 맞는 항목이 없어요.
        </div>
    ) : (
        <div className="space-y-3">
            <section className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 shadow-[0_4px_10px_rgba(15,23,42,0.05)]">
                <div className="flex flex-wrap items-center gap-1.5 text-[12px]">
                    <span className="inline-flex rounded-full border border-zinc-300 bg-zinc-100 px-2 py-0.5 font-semibold text-zinc-700">
                        총 {filteredItems.length}
                    </span>
                    <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 font-semibold text-sky-700">
                        임박 {dueSoonCount}
                    </span>
                    <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 font-semibold text-rose-600">
                        지남 {overdueCount}
                    </span>
                </div>
            </section>

            {groupEntries.map(([courseName, items]) => (
                <CourseGroupSection
                    key={courseName}
                    courseName={courseName}
                    items={items}
                    isOpen={courseOpenMap[courseName] ?? true}
                    runtime={runtime}
                    onToggle={() => {
                        onToggleCourse(courseName);
                    }}
                    onHideItem={onHideItem}
                />
            ))}
        </div>
    );

    return (
        <div className="relative">
            {shouldShowLoadingOverlay && (
                <LoadingOverlay message={loadingMessage || '불러오는 중...'} />
            )}

            <div
                className={
                    shouldShowLoadingOverlay
                        ? 'pointer-events-none select-none blur-[4px] opacity-60 transition duration-150'
                        : ''
                }
                aria-hidden={shouldShowLoadingOverlay}
            >
                {content}
            </div>
        </div>
    );
}
