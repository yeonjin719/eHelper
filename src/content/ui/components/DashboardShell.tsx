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
    onIncludeSmClassChange,
    onUnhideItem,
    onResetHiddenItems,
    children,
}: DashboardShellProps) {
    const settingsVisible = settingsOpen && !collapsed && isDashboardPage;

    return (
        <div className="fixed right-2 top-4 z-[999999] [font-family:'Pretendard',sans-serif] md:right-4">
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
                    isLoading={loading}
                    loadingMessage={loadingMessage}
                    showSettingsButton={isDashboardPage}
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
                    includeSmClass={includeSmClass}
                    hiddenItemCount={hiddenItemCount}
                    hiddenItems={hiddenItems}
                    onCloseSettings={onCloseSettings}
                    onHidePastLecturesChange={onHidePastLecturesChange}
                    onHidePastAssignmentsChange={onHidePastAssignmentsChange}
                    onHidePastForumsChange={onHidePastForumsChange}
                    onHideDoneLecturesChange={onHideDoneLecturesChange}
                    onHideDoneAssignmentsChange={onHideDoneAssignmentsChange}
                    onIncludeSmClassChange={onIncludeSmClassChange}
                    onUnhideItem={onUnhideItem}
                    onResetHiddenItems={onResetHiddenItems}
                />
            )}
        </div>
    );
}
