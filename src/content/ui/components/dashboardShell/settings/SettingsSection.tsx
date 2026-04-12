import type { ReactNode } from 'react';
import { IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io';

interface SettingsSectionProps {
    title: string;
    description: string;
    badgeText?: string;
    open: boolean;
    onToggle: () => void;
    children?: ReactNode;
}

export function SettingsSection({
    title,
    description,
    badgeText,
    open,
    onToggle,
    children,
}: SettingsSectionProps) {
    return (
        <section className="rounded-[24px] border border-zinc-200/45 bg-white px-5 py-5 shadow-[0_6px_18px_rgba(15,23,42,0.035)]">
            <div className={open ? 'mb-4' : ''}>
                <button
                    type="button"
                    className="flex w-full items-start justify-between gap-3 rounded-2xl border border-transparent bg-transparent px-1 py-1 text-left transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100 [background-image:none!important] [border-bottom:0!important] [box-shadow:none!important] [text-decoration:none!important]"
                    aria-expanded={open}
                    onClick={onToggle}
                >
                    <div className="min-w-0">
                        <div className="text-[13px] font-semibold tracking-tight text-zinc-950 [background-image:none!important] [border-bottom:0!important] [box-shadow:none!important] [text-decoration:none!important]">
                            {title}
                        </div>
                        <p className="mt-1 text-[11px] leading-5 text-zinc-600 [background-image:none!important] [border-bottom:0!important] [box-shadow:none!important] [text-decoration:none!important]">
                            {description}
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        {badgeText ? (
                            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-semibold text-zinc-600">
                                {badgeText}
                            </span>
                        ) : null}
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-[13px] font-semibold text-zinc-600 transition">
                            {open ? <IoMdArrowDropup /> : <IoMdArrowDropdown />}
                        </span>
                    </div>
                </button>
            </div>

            {open ? children : null}
        </section>
    );
}
