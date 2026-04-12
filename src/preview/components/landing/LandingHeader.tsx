import React from 'react';
import ehelperLogoUrl from '../../../public/eHelper_LOGO.png?inline';
import { landingNavLinks } from './landingShared';

export function LandingHeader() {
    return (
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(5,10,22,0.72)] backdrop-blur-xl">
            <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-8 py-4 md:px-14 xl:px-20">
                <a href="#top" className="flex items-center gap-3 text-white">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-white/10 bg-white/10 shadow-[0_14px_40px_rgba(2,8,23,0.28)]">
                        <img
                            src={ehelperLogoUrl}
                            alt="eHelper 로고"
                            className="h-7 w-7"
                        />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-200">
                            eHelper
                        </p>
                        <p className="text-[15px] font-semibold text-slate-100">
                            eCampus Workflow Landing
                        </p>
                    </div>
                </a>

                <nav className="hidden items-center gap-1 md:flex">
                    {landingNavLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="rounded-full border border-transparent px-5 py-2.5 text-[13px] font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                        >
                            {link.label}
                        </a>
                    ))}
                    <div className="ml-4 h-5 w-px bg-white/10" />
                    <a
                        href="#experience"
                        className="ml-4 inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#38bdf8_0%,#2563eb_100%)] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_20px_40px_rgba(37,99,235,0.3)] transition hover:shadow-[0_25px_50px_rgba(37,99,235,0.4)]"
                    >
                        시작하기
                    </a>
                </nav>
            </div>
        </header>
    );
}
