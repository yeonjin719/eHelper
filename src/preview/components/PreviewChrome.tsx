import React from 'react';
import type { IconType } from 'react-icons';
import {
    LuBell,
    LuBookOpen,
    LuChevronDown,
    LuFolderOpen,
    LuMail,
    LuMap,
    LuMonitor,
    LuSquareUserRound,
    LuUserRound,
} from 'react-icons/lu';
import type { PreviewPageId } from '../previewShared';

function PreviewChipButton({
    active,
    label,
    onClick,
}: {
    active: boolean;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            className={[
                'rounded-full border px-3 py-1.5 text-[12px] font-semibold transition',
                active
                    ? 'border-sky-300 bg-sky-50 text-sky-800 shadow-[0_4px_14px_rgba(14,165,233,0.12)]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
            ].join(' ')}
            onClick={onClick}
        >
            {label}
        </button>
    );
}

interface SidebarSectionItem {
    label: string;
    icon: IconType;
    expanded?: boolean;
    children?: string[];
    activeChildLabel?: string;
}

function SiteTopBar() {
    return (
        <header className="flex h-[68px] fixed items-center justify-between bg-[rgb(42,58,115)] px-6 text-white right-0 left-0 z-50">
            <div className="flex items-center gap-4">
                <div className="flex h-[54px] w-[54px] items-center justify-center rounded-[4px] bg-white text-[#2e4688] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4)]">
                    <div className="text-center text-[11px] font-black leading-[1.05]">
                        <div>상명</div>
                        <div>e</div>
                    </div>
                </div>
                <div className="leading-tight">
                    <div className="text-[13px] font-semibold tracking-[0.01em]">
                        상명대학교
                    </div>
                    <div className="mt-1 text-[17px] font-semibold">
                        e-Campus
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-5 text-[14px] text-white/90">
                <span className="hidden md:inline">Cotton</span>
                <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white/95 text-[#2e4688] shadow-[0_4px_16px_rgba(17,24,39,0.2)]">
                    <img
                        src="/src/public/f2.png"
                        className="w-full rounded-full"
                    />
                </div>
                <LuMonitor
                    size={24}
                    className="hidden md:block"
                    color="#afb8c7"
                />
                <LuBell size={24} className="hidden md:block" color="#afb8c7" />
                <LuMail size={24} className="hidden md:block" color="#afb8c7" />
                <LuMap size={24} className="hidden md:block" color="#afb8c7" />
                <button
                    type="button"
                    className="flex h-10 w-fit px-3 items-center justify-center rounded-[6px] bg-[#31c4ef] text-white border-none"
                    aria-label="전체 메뉴"
                >
                    로그아웃
                </button>
            </div>
        </header>
    );
}

function PreviewSidebar({ page }: { page: PreviewPageId }) {
    const navItems: SidebarSectionItem[] = [
        {
            label: 'My Page',
            icon: LuUserRound,
            expanded: page === 'dashboard',
            children: [
                page === 'dashboard' ? 'Dashboard' : '강좌 전체보기',
                '파일 관리',
                '진행강좌 공지',
                '학습 스타일 진단',
                '개인정보 수정',
            ],
            activeChildLabel: page === 'dashboard' ? 'Dashboard' : undefined,
        },
        {
            label: '교과 과정',
            icon: LuFolderOpen,
            expanded: page === 'vod',
            children:
                page === 'vod'
                    ? ['온라인 강의', '출석 현황', '과제 제출']
                    : undefined,
            activeChildLabel: page === 'vod' ? '온라인 강의' : undefined,
        },
        { label: '비정규 강좌', icon: LuSquareUserRound },
        { label: 'SM-Class', icon: LuBookOpen },
        { label: '군복무 강좌', icon: LuUserRound },
        { label: '메시지', icon: LuMail },
        { label: '이용안내', icon: LuMap },
    ];

    return (
        <aside className="mt-[67px] flex min-h-[calc(100vh-208px)] w-full flex-col bg-[#37393e] text-white">
            <nav className="flex-1">
                {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isExpanded = Boolean(item.expanded);
                    return (
                        <div
                            key={item.label}
                            className={
                                index === 0
                                    ? ''
                                    : 'border-t border-black/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
                            }
                        >
                            <button
                                type="button"
                                aria-label={item.label}
                                className={[
                                    'flex w-full border-none items-center justify-center px-0 py-5 text-left lg:justify-start lg:gap-4 lg:px-5 lg:py-6',
                                    isExpanded
                                        ? 'bg-[#3b3d43]'
                                        : 'bg-[rgb(47,48,51)]',
                                ].join(' ')}
                            >
                                <Icon
                                    size={28}
                                    className={[
                                        'shrink-0',
                                        isExpanded
                                            ? 'text-white/85'
                                            : 'text-white/60',
                                    ].join(' ')}
                                />
                                <span
                                    className={[
                                        'hidden flex-1 text-[18px] font-medium lg:block',
                                        isExpanded
                                            ? 'text-white/90'
                                            : 'text-white/60',
                                    ].join(' ')}
                                >
                                    {item.label}
                                </span>
                                <LuChevronDown
                                    size={20}
                                    className={
                                        isExpanded
                                            ? 'hidden text-white/80 lg:block'
                                            : 'hidden text-white/35 lg:block'
                                    }
                                />
                            </button>

                            {isExpanded && item.children?.length ? (
                                <div className="hidden lg:block">
                                    {item.children.map((child) => {
                                        const activeChild =
                                            item.activeChildLabel === child;
                                        return (
                                            <div
                                                key={child}
                                                className={[
                                                    'px-8 py-2.5 text-[15px]',
                                                    activeChild
                                                        ? 'bg-[#2f4a8e] text-white'
                                                        : 'bg-[#37393e] text-white/65',
                                                ].join(' ')}
                                            >
                                                {child}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </nav>

            <div className="hidden border-t border-white/5 bg-[linear-gradient(135deg,#575a66_0%,#484b55_45%,#5b5e68_100%)] p-4 lg:block">
                <div className="rounded-[4px] bg-black/10 px-4 py-4 text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                    <p className="text-[14px] font-semibold">피어오름</p>
                    <p className="mt-1 text-[12px] text-white/55">
                        비교과프로그램
                    </p>
                </div>
            </div>
        </aside>
    );
}

export { PreviewChipButton, PreviewSidebar, SiteTopBar };
