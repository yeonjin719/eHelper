import React from 'react';
import { LuShieldCheck } from 'react-icons/lu';
import { previewFixHighlights } from '../../landingContent';
import { landingSectionShellClass } from './landingShared';

export function LandingImprovementsSection() {
    return (
        <section id="improvements" className={landingSectionShellClass}>
            <div className="rounded-[42px] border border-white/10 bg-[linear-gradient(135deg,rgba(9,16,30,0.92)_0%,rgba(12,36,74,0.85)_50%,rgba(6,11,21,0.96)_100%)] p-8 shadow-[0_40px_100px_rgba(37,99,235,0.1)] md:p-12">
                <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-sky-300">
                            Fixes And Benefits
                        </p>
                        <h2 className="mt-4 text-[36px] font-bold tracking-[-0.05em] text-white md:text-[48px]">
                            자주 막히던 흐름을 계속 다듬고 있습니다.
                        </h2>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-[13px] font-medium text-emerald-100">
                        <LuShieldCheck size={16} />
                        실제 사용감 기준으로 정리
                    </div>
                </div>

                <div className="space-y-4">
                    {previewFixHighlights.map((item, index) => (
                        <article
                            key={item.title}
                            className="grid gap-5 rounded-[30px] border border-white/10 bg-white/[0.04] p-6 hover:bg-white/[0.06] transition xl:grid-cols-[210px_minmax(0,1.1fr)_minmax(0,0.9fr)] xl:p-7"
                        >
                            <div>
                                <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-sky-200">
                                    0{index + 1}
                                </p>
                                <h3 className="mt-3 text-[26px] font-bold tracking-[-0.03em] text-white">
                                    {item.title}
                                </h3>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-[22px] border border-rose-300/12 bg-rose-300/[0.05] p-4">
                                    <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-rose-200">
                                        문제
                                    </p>
                                    <p className="mt-2 text-[14px] leading-6 text-slate-200">
                                        {item.issue}
                                    </p>
                                </div>

                                <div className="rounded-[22px] border border-sky-300/12 bg-sky-300/[0.05] p-4">
                                    <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-sky-200">
                                        수정
                                    </p>
                                    <p className="mt-2 text-[14px] leading-6 text-slate-200">
                                        {item.fix}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-[24px] border border-emerald-300/12 bg-emerald-300/[0.06] p-5">
                                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                                    유저가 좋아지는 점
                                </p>
                                <p className="mt-3 text-[15px] leading-7 text-slate-100">
                                    {item.benefit}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
