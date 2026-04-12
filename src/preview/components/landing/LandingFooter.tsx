import React from 'react';
import { REPORT_EMAIL } from '../../../content/ui/constants';
import { previewCurrentVersion } from '../../landingContent';
import {
    chromeWebStoreUrl,
    landingNavLinks,
    landingSectionShellClass,
    navigateToLandingHash,
} from './landingShared';

export function LandingFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-white/10 bg-[rgba(2,6,14,0.94)]">
            <div className={landingSectionShellClass}>
                <div className="py-8 md:py-10">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <div className="max-w-[420px]">
                            <p className="text-[15px] font-semibold text-slate-100">
                                eHelper
                            </p>
                            <p className="mt-2 text-[14px] leading-6 text-slate-400">
                                상명대학교 eCampus 안에서 과제, 공지, 퀴즈,
                                강의 흐름을 더 짧게 확인하도록 돕는 브라우저
                                확장입니다.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 text-[14px] text-slate-300 md:items-end">
                            <nav className="flex flex-wrap gap-x-5 gap-y-2">
                                {landingNavLinks.map((link) => (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            navigateToLandingHash(link.href);
                                        }}
                                        className="transition hover:text-white"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                                <a
                                    href={chromeWebStoreUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="transition hover:text-white"
                                >
                                    설치
                                </a>
                            </nav>
                            <p className="text-[13px] text-slate-500">
                                Version {previewCurrentVersion}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-4 text-[13px] text-slate-500 md:flex-row md:items-center md:justify-between">
                        <p>© {currentYear} Cotton. All rights reserved.</p>
                        <address className="flex flex-wrap items-center gap-x-2 gap-y-1 not-italic">
                            <span>문의</span>
                            <a
                                href={`mailto:${REPORT_EMAIL}`}
                                className="text-slate-300 transition hover:text-white"
                            >
                                {REPORT_EMAIL}
                            </a>
                        </address>
                    </div>
                </div>
            </div>
        </footer>
    );
}
