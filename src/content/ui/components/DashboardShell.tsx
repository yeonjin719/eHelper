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

                        <main
                            id="ecdash-list"
                            className="ecdash-scroll min-h-0 max-h-[50vh] flex-1 overflow-y-auto bg-[#f9fafb] px-4 py-3"
                        >
                            {children}
                        </main>

                        <DashboardFooter contactLink={contactLink} />
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
