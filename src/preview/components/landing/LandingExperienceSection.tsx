import React, { type ReactNode } from 'react';
import { LuMousePointerClick, LuWandSparkles } from 'react-icons/lu';
import { landingSectionShellClass } from './landingShared';

interface LandingExperienceSectionProps {
    children: ReactNode;
}

export function LandingExperienceSection({
    children,
}: LandingExperienceSectionProps) {
    return (
        <section id="experience" className={landingSectionShellClass}>
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-sky-300">
                        Try It Live
                    </p>
                    <h2 className="mt-4 text-[36px] font-bold tracking-[-0.05em] text-white md:text-[48px]">
                        대시보드와 VOD 흐름을 바로 눌러봅니다.
                    </h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-medium text-slate-200">
                    <LuMousePointerClick size={16} />
                    대시보드와 VOD 프리뷰를 즉시 전환 가능
                </div>
            </div>

            <div className="mb-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(10,20,38,0.88)_0%,rgba(12,36,74,0.82)_50%,rgba(6,11,21,0.96)_100%)] p-7 shadow-[0_30px_80px_rgba(37,99,235,0.1)]">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-sky-300">
                        Experience Guide
                    </p>
                    <p className="mt-4 text-[15px] leading-7 text-slate-200">
                        대시보드 페이지와 VOD 페이지를 전환하고, 시나리오도
                        바꿔가며 실제 사용 흐름을 직접 확인해볼 수 있습니다.
                    </p>
                </div>

                <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.03)_100%)] p-6 shadow-[0_24px_72px_rgba(2,8,23,0.26)]">
                    <div className="flex items-center gap-2 text-sky-200">
                        <LuWandSparkles size={18} />
                        <p className="text-[12px] font-semibold uppercase tracking-[0.2em]">
                            Included Views
                        </p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {[
                            '기본 시나리오',
                            '밀집 시나리오',
                            '비어있는 상태',
                            'VOD 배속 패널',
                        ].map((label) => (
                            <span
                                key={label}
                                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] font-medium text-slate-200"
                            >
                                {label}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {children}
        </section>
    );
}
