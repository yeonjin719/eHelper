import { useDashboardFloatingPosition } from '../hooks/useDashboardFloatingPosition';
import { DashboardFilterBar } from './dashboardShell/DashboardFilterBar';
import { DashboardFooter } from './dashboardShell/DashboardFooter';
import { DashboardHeader } from './dashboardShell/DashboardHeader';
import { DashboardSettingsModal } from './dashboardShell/DashboardSettingsModal';
import type { DashboardShellProps } from './dashboardShell/types';

export function DashboardShell({
    collapsed,
    sub: _sub,
    loading,
    loadingMessage,
    isDashboardPage,
    filter,
    typeFilter,
    allCourses,
    newCourseNames,
    courseFilter,
    courseFilterAllValue,
    settingsOpen,
    contactLink,
    errorLog,
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
    onToggleCollapsed,
    onFilterChange,
    onTypeFilterChange,
    onRefresh,
    onClearErrorLog,
    onOpenSettings,
    onSelectCourse,
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
    children,
}: DashboardShellProps) {
    const settingsVisible = settingsOpen && !collapsed && isDashboardPage;
    const { panelRef, position, dragging, handlePointerDown } =
        useDashboardFloatingPosition(collapsed);
    const isMoodleTokenMissing = /moodle_token_missing/.test(errorLog);
    const copyableErrorLog = isMoodleTokenMissing ? '' : errorLog;

    return (
        <div
            ref={panelRef}
            className="pointer-events-auto absolute z-[999999] [font-family:'Pretendard',sans-serif]"
            style={{
                top: position.top,
                left: position.left,
            }}
        >
            <section
                className={[
                    'overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.08)]',
                    collapsed
                        ? 'h-14 w-14'
                        : 'flex max-h-[calc(100vh-20px)] w-[min(468px,calc(100vw-16px))] flex-col md:w-[min(468px,calc(100vw-32px))]',
                ].join(' ')}
            >
                <DashboardHeader
                    collapsed={collapsed}
                    dragging={dragging}
                    isLoading={loading}
                    loadingMessage={loadingMessage}
                    showSettingsButton={isDashboardPage}
                    onDragHandlePointerDown={handlePointerDown}
                    onToggleCollapsed={onToggleCollapsed}
                    onRefresh={onRefresh}
                    onOpenSettings={onOpenSettings}
                />

                {!collapsed && (
                    <div className="flex min-h-0 flex-1 flex-col">
                        <DashboardFilterBar
                            filter={filter}
                            typeFilter={typeFilter}
                            allCourses={allCourses}
                            newCourseNames={newCourseNames}
                            courseFilter={courseFilter}
                            courseFilterAllValue={courseFilterAllValue}
                            hideResources={hideResources}
                            hideNotices={hideNotices}
                            onFilterChange={onFilterChange}
                            onTypeFilterChange={onTypeFilterChange}
                            onSelectCourse={onSelectCourse}
                        />

                        {errorLog && (
                            <div className="border-y border-red-100 bg-red-50 px-4 py-2 text-[12px] text-red-700">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="font-semibold">
                                        {isMoodleTokenMissing ? (
                                            <>
                                                설정에서 eCampus API 로그인을 해주세요.
                                                <br />
                                                처음 연결 후 새로고침하면 eCampus
                                                로그인이 풀릴 수 있어요.
                                                <br />
                                                다시 로그인하고 사용하면 됩니다.
                                            </>
                                        ) : (
                                            <>
                                                일부 수집에 실패했어요. <br /> 아래
                                                문의하기를 통해 오류 로그를 보내주시면
                                                <br />
                                                문제 해결에 큰 도움이 됩니다.
                                            </>
                                        )}
                                    </span>
                                    <div className="flex shrink-0 items-center gap-1">
                                        {copyableErrorLog && (
                                            <button
                                                type="button"
                                                className="rounded-md border border-red-200 bg-white px-2 py-1 font-semibold text-red-700 transition hover:bg-red-100"
                                                onClick={() => {
                                                    void navigator.clipboard?.writeText(
                                                        copyableErrorLog,
                                                    );
                                                }}
                                            >
                                                로그 복사
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            aria-label="오류 알림 닫기"
                                            className="h-7 w-7 rounded-md border border-red-200 bg-white font-semibold text-red-700 transition hover:bg-red-100"
                                            onClick={onClearErrorLog}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <main
                            id="ecdash-list"
                            className="ecdash-scroll min-h-0 max-h-[50vh] flex-1 overflow-y-auto bg-[#f9fafb] px-4 py-3"
                        >
                            {children}
                        </main>

                        <DashboardFooter
                            contactLink={contactLink}
                            errorLog={copyableErrorLog}
                        />
                    </div>
                )}
            </section>

            {!collapsed && (
                <DashboardSettingsModal
                    visible={settingsVisible}
                    hidePastLectures={hidePastLectures}
                    hidePastAssignments={hidePastAssignments}
                    hidePastForums={hidePastForums}
                    hideDoneLectures={hideDoneLectures}
                    hideDoneAssignments={hideDoneAssignments}
                    hideResources={hideResources}
                    hideNotices={hideNotices}
                    includeSmClass={includeSmClass}
                    hiddenItemCount={hiddenItemCount}
                    hiddenItems={hiddenItems}
                    onCloseSettings={onCloseSettings}
                    onHidePastLecturesChange={onHidePastLecturesChange}
                    onHidePastAssignmentsChange={onHidePastAssignmentsChange}
                    onHidePastForumsChange={onHidePastForumsChange}
                    onHideDoneLecturesChange={onHideDoneLecturesChange}
                    onHideDoneAssignmentsChange={onHideDoneAssignmentsChange}
                    onHideResourcesChange={onHideResourcesChange}
                    onHideNoticesChange={onHideNoticesChange}
                    onIncludeSmClassChange={onIncludeSmClassChange}
                    onUnhideItem={onUnhideItem}
                    onResetHiddenItems={onResetHiddenItems}
                />
            )}
        </div>
    );
}
