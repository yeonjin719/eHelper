import { SettingsSection } from './SettingsSection';
import { SettingsToggleOption } from './SettingsToggleOption';

interface DashboardFiltersSectionProps {
    open: boolean;
    hidePastLectures: boolean;
    hidePastAssignments: boolean;
    hidePastForums: boolean;
    hideDoneLectures: boolean;
    hideDoneAssignments: boolean;
    hideResources: boolean;
    hideNotices: boolean;
    includeSmClass: boolean;
    onToggleOpen: () => void;
    onHidePastLecturesChange: (checked: boolean) => void | Promise<void>;
    onHidePastAssignmentsChange: (checked: boolean) => void | Promise<void>;
    onHidePastForumsChange: (checked: boolean) => void | Promise<void>;
    onHideDoneLecturesChange: (checked: boolean) => void | Promise<void>;
    onHideDoneAssignmentsChange: (checked: boolean) => void | Promise<void>;
    onHideResourcesChange: (checked: boolean) => void | Promise<void>;
    onHideNoticesChange: (checked: boolean) => void | Promise<void>;
    onIncludeSmClassChange: (checked: boolean) => void | Promise<void>;
}

export function DashboardFiltersSection({
    open,
    hidePastLectures,
    hidePastAssignments,
    hidePastForums,
    hideDoneLectures,
    hideDoneAssignments,
    hideResources,
    hideNotices,
    includeSmClass,
    onToggleOpen,
    onHidePastLecturesChange,
    onHidePastAssignmentsChange,
    onHidePastForumsChange,
    onHideDoneLecturesChange,
    onHideDoneAssignmentsChange,
    onHideResourcesChange,
    onHideNoticesChange,
    onIncludeSmClassChange,
}: DashboardFiltersSectionProps) {
    return (
        <SettingsSection
            title="대시보드 필터"
            description="완료되었거나 지난 항목을 자동으로 감춰 목록을 더 짧게 유지합니다."
            open={open}
            onToggle={onToggleOpen}
        >
            <div className="space-y-3">
                <SettingsToggleOption
                    id="ecdash-setting-hide-past-lectures"
                    label="지난 강의 안보기"
                    description="마감 시각이 지난 강의를 기본 목록에서 숨깁니다."
                    checked={hidePastLectures}
                    onChange={onHidePastLecturesChange}
                />

                <SettingsToggleOption
                    id="ecdash-setting-hide-past-assignments"
                    label="지난 과제/퀴즈 안보기"
                    description="마감이 지난 과제와 퀴즈를 목록에서 제외합니다."
                    checked={hidePastAssignments}
                    onChange={onHidePastAssignmentsChange}
                />

                <SettingsToggleOption
                    id="ecdash-setting-hide-past-forums"
                    label="지난 토론 안보기"
                    description="기한이 지난 토론 활동을 기본 화면에서 숨깁니다."
                    checked={hidePastForums}
                    onChange={onHidePastForumsChange}
                />

                <SettingsToggleOption
                    id="ecdash-setting-hide-done-lectures"
                    label="시청 완료한 강의 안보기"
                    description="완료 처리된 강의를 남은 항목 중심으로 정리합니다."
                    checked={hideDoneLectures}
                    onChange={onHideDoneLecturesChange}
                />

                <SettingsToggleOption
                    id="ecdash-setting-hide-done-assignments"
                    label="제출 완료한 과제/퀴즈 안보기"
                    description="제출 완료 또는 응시 완료 상태인 항목을 숨깁니다."
                    checked={hideDoneAssignments}
                    onChange={onHideDoneAssignmentsChange}
                />

                <SettingsToggleOption
                    id="ecdash-setting-hide-resources"
                    label="자료 안보기"
                    description="자료 항목을 대시보드 목록과 타입 필터에서 숨깁니다."
                    checked={hideResources}
                    onChange={onHideResourcesChange}
                />

                <SettingsToggleOption
                    id="ecdash-setting-hide-notices"
                    label="공지 안보기"
                    description="공지 항목을 대시보드 목록과 타입 필터에서 숨깁니다."
                    checked={hideNotices}
                    onChange={onHideNoticesChange}
                />

                <SettingsToggleOption
                    id="ecdash-setting-include-sm-class"
                    label="SM-Class 포함하기"
                    description="기본적으로 제외되는 SM-Class 과목도 함께 표시합니다."
                    checked={includeSmClass}
                    onChange={onIncludeSmClassChange}
                />
            </div>
        </SettingsSection>
    );
}
