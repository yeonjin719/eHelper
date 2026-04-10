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
    loadingMessage: _loadingMessage,
    showSettingsButton,
    onToggleCollapsed,
    onRefresh,
    onOpenSettings,
}: DashboardHeaderProps) {
    return (
        <header
            className={
                collapsed
                    ? 'flex h-full items-center justify-center bg-white text-zinc-900'
                    : 'border-b border-zinc-100 bg-white px-4 py-3 text-zinc-900'
            }
        >
            {collapsed ? (
                <button
                    id="ecdash-toggle"
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-[15px] font-semibold leading-none text-zinc-600 transition hover:border-zinc-300 hover:bg-white hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100"
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
                        </div>
                        <div className="flex h-fit w-fit items-center gap-1.5">
                            <button
                                id="ecdash-refresh"
                                type="button"
                                className={[
                                    'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-[15px] font-semibold leading-none text-zinc-600 transition hover:border-zinc-300 hover:bg-white hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100',
                                    isLoading
                                        ? 'cursor-wait border-zinc-300 bg-zinc-100 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-700'
                                        : '',
                                ].join(' ')}
                                title={isLoading ? '새로고침 중' : '새로고침'}
                                aria-label={
                                    isLoading ? '새로고침 중' : '새로고침'
                                }
                                aria-busy={isLoading}
                                disabled={isLoading}
                                onClick={onRefresh}
                            >
                                ↻
                            </button>

                            {showSettingsButton && (
                                <button
                                    id="ecdash-settings-open"
                                    type="button"
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-[15px] font-semibold leading-none text-zinc-600 transition hover:border-zinc-300 hover:bg-white hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100"
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
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-[15px] font-semibold leading-none text-zinc-600 transition hover:border-zinc-300 hover:bg-white hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100"
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
                </div>
            )}
        </header>
    );
}
