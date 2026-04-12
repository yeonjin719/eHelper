import type { PointerEvent as ReactPointerEvent } from 'react';
import { CiSettings, CiRedo } from 'react-icons/ci';
import { IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io';
import ehelperLogoUrl from '../../../../public/eHelper_LOGO.png?inline';

interface DashboardHeaderProps {
    collapsed: boolean;
    dragging: boolean;
    isLoading: boolean;
    loadingMessage: string;
    showSettingsButton: boolean;
    onDragHandlePointerDown: (
        event: ReactPointerEvent<HTMLElement>,
    ) => void;
    onToggleCollapsed: () => void | Promise<void>;
    onRefresh: () => void;
    onOpenSettings: () => void;
}

export function DashboardHeader({
    collapsed,
    dragging,
    isLoading,
    loadingMessage: _loadingMessage,
    showSettingsButton,
    onDragHandlePointerDown,
    onToggleCollapsed,
    onRefresh,
    onOpenSettings,
}: DashboardHeaderProps) {
    return (
        <header
            className={[
                collapsed
                    ? 'flex h-full items-center justify-center bg-white text-zinc-900'
                    : 'border-b border-zinc-100 bg-white px-4 py-3 text-zinc-900',
                'select-none touch-none',
                dragging ? 'cursor-grabbing' : 'cursor-grab',
            ].join(' ')}
            onPointerDown={onDragHandlePointerDown}
        >
            {collapsed ? (
                <button
                    id="ecdash-toggle"
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border-none text-[15px] font-semibold leading-none text-zinc-600 transition hover:border-zinc-300 hover:bg-white hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100"
                    title="펼치기"
                    aria-label="펼치기"
                    onClick={() => {
                        void onToggleCollapsed();
                    }}
                >
                    <IoMdArrowDropdown />
                </button>
            ) : (
                <div>
                    <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex items-center gap-2">
                            <img
                                src={ehelperLogoUrl}
                                alt="eHelper Logo"
                                className="h-6 w-6"
                            />
                            <h1 className="truncate m-0 text-[15px] font-bold tracking-tight text-zinc-900">
                                eHelper
                            </h1>
                        </div>
                        <div className="flex h-fit w-fit items-center gap-1.5">
                            <button
                                id="ecdash-refresh"
                                type="button"
                                className={[
                                    'inline-flex h-9 w-9 items-center justify-center rounded-xl border-none bg-white text-[15px] font-semibold leading-none text-zinc-600 transition hover:border-zinc-300 hover:bg-white hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100',
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
                                <CiRedo />
                            </button>

                            {showSettingsButton && (
                                <button
                                    id="ecdash-settings-open"
                                    type="button"
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border-none bg-white text-[18px] font-semibold leading-none text-zinc-700 transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100"
                                    title="설정"
                                    aria-label="설정"
                                    onClick={onOpenSettings}
                                >
                                    <CiSettings size={18} />
                                </button>
                            )}
                            <button
                                id="ecdash-toggle"
                                type="button"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border-none bg-white font-semibold leading-none  transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100"
                                title="접기"
                                aria-label="접기"
                                onClick={() => {
                                    void onToggleCollapsed();
                                }}
                            >
                                <IoMdArrowDropup />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
