import { DASHBOARD_SHELL_STYLES as styles } from './styles';

interface DashboardHeaderProps {
    collapsed: boolean;
    isLoading: boolean;
    loadingMessage: string;
    showSettingsButton: boolean;
    onToggleCollapsed: () => void | Promise<void>;
    onRefresh: () => void;
    onOpenSettings: () => void;
}

export function DashboardHeader({
    collapsed,
    isLoading,
    loadingMessage,
    showSettingsButton,
    onToggleCollapsed,
    onRefresh,
    onOpenSettings,
}: DashboardHeaderProps) {
    return (
        <header
            className={
                collapsed ? styles.headerCollapsed : styles.headerExpanded
            }
        >
            {collapsed ? (
                <button
                    id="ecdash-toggle"
                    type="button"
                    className={styles.iconButton}
                    title="펼치기"
                    aria-label="펼치기"
                    onClick={() => {
                        void onToggleCollapsed();
                    }}
                >
                    ▾
                </button>
            ) : (
                <div>
                    <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex items-center gap-2">
                            <h1 className="truncate m-0 text-[15px] font-bold tracking-tight text-zinc-900">
                                eHelper
                            </h1>
                            {isLoading && (
                                <span className={styles.loadingChip}>
                                    동기화 중
                                </span>
                            )}
                        </div>
                        <div className="flex h-fit w-fit items-center gap-1.5">
                            <button
                                id="ecdash-refresh"
                                type="button"
                                className={[
                                    styles.iconButton,
                                    isLoading ? styles.iconButtonBusy : '',
                                ].join(' ')}
                                title={isLoading ? '새로고침 중' : '새로고침'}
                                aria-label={
                                    isLoading ? '새로고침 중' : '새로고침'
                                }
                                aria-busy={isLoading}
                                disabled={isLoading}
                                onClick={onRefresh}
                            >
                                {isLoading ? (
                                    <span
                                        className="h-4 w-4 animate-spin rounded-full border-2 border-sky-200 border-t-sky-700"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    '↻'
                                )}
                            </button>

                            {showSettingsButton && (
                                <button
                                    id="ecdash-settings-open"
                                    type="button"
                                    className={styles.iconButton}
                                    title="설정"
                                    aria-label="설정"
                                    onClick={onOpenSettings}
                                >
                                    ⚙
                                </button>
                            )}
                            <button
                                id="ecdash-toggle"
                                type="button"
                                className={styles.iconButton}
                                title="접기"
                                aria-label="접기"
                                onClick={() => {
                                    void onToggleCollapsed();
                                }}
                            >
                                ▴
                            </button>
                        </div>
                    </div>

                    {isLoading && (
                        <div
                            className={styles.loadingStatus}
                            role="status"
                            aria-live="polite"
                        >
                            <span
                                className={styles.loadingStatusSpinner}
                                aria-hidden="true"
                            />
                            <div className="min-w-0">
                                <div className={styles.loadingStatusTitle}>
                                    새로고침 중
                                </div>
                                <div className={styles.loadingStatusText}>
                                    {loadingMessage ||
                                        '최신 항목을 다시 불러오는 중...'}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}
