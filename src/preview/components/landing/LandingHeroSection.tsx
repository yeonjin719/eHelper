import React from 'react';
import { LuArrowRight, LuHistory, LuSparkles } from 'react-icons/lu';
import {
    previewCurrentVersion,
    previewReleaseNotes,
} from '../../landingContent';
import {
    landingSectionShellClass,
    type LandingHeroCard,
} from './landingShared';

interface LandingHeroSectionProps {
    canvasCards: LandingHeroCard[];
}

export function LandingHeroSection({ canvasCards }: LandingHeroSectionProps) {
    return (
        <section id="top" className={landingSectionShellClass}>
            <div className="rounded-[48px] border border-white/10 bg-[linear-gradient(135deg,rgba(10,24,47,0.9)_0%,rgba(12,36,74,0.85)_50%,rgba(5,10,22,0.95)_100%)] p-8 shadow-[0_40px_120px_rgba(37,99,235,0.15)] md:p-14 xl:p-16">
                <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_310px] xl:items-end">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-[12px] font-semibold tracking-[0.18em] text-sky-200">
                            <LuSparkles size={16} />
                            eCampus Extension Experience
                        </div>

                        <h1 className="mt-8 text-[36px] font-bold tracking-[-0.06em] text-white md:text-[54px] md:leading-[1.08] lg:text-[60px]">
                            오늘 해야 할 일은 더 먼저,
                            <br />
                            강의 조작은 더 짧게 끝냅니다.
                        </h1>

                        <p className="mt-7 max-w-[700px] text-[17px] leading-8 text-slate-200">
                            오늘 마감 과제, 아직 안 본 강의, 막 올라온 공지와
                            자료까지 흩어지지 않게 모읍니다. 중요한 항목은 먼저
                            보이고, VOD 배속과 다운로드 같은 자주 쓰는 조작은
                            플레이어 옆에서 바로 끝낼 수 있습니다.
                        </p>

                        <div className="mt-9 flex flex-wrap items-center gap-3">
                            <a
                                href="#experience"
                                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#38bdf8_0%,#2563eb_100%)] px-6 py-3.5 text-[14px] font-semibold text-white shadow-[0_25px_50px_rgba(37,99,235,0.35)] transition hover:shadow-[0_30px_60px_rgba(37,99,235,0.45)]"
                            >
                                체험 화면 보기
                                <LuArrowRight size={16} />
                            </a>
                            <a
                                href="#versions"
                                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-6 py-3.5 text-[14px] font-semibold text-slate-50 transition hover:bg-white/[0.12] hover:border-white/30"
                            >
                                최신 업데이트
                                <LuHistory size={16} />
                            </a>
                        </div>
                    </div>

                    <aside className="rounded-[32px] border border-sky-300/15 bg-[linear-gradient(135deg,rgba(12,36,74,0.9)_0%,rgba(9,18,34,0.95)_100%)] p-7 shadow-[0_30px_80px_rgba(30,120,200,0.15)]">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-sky-200">
                                    Latest Release
                                </p>
                                <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.04em] text-white">
                                    v{previewCurrentVersion}
                                </h2>
                            </div>
                            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[12px] font-semibold text-emerald-200">
                                안정화 포함
                            </div>
                        </div>

                        <p className="mt-5 text-[15px] leading-7 text-slate-300">
                            로그인 화면 개입 차단, 퀴즈 카드 추가, 미완료 필터,
                            VOD 1000배속 스킵까지 최근 변화가 이어졌습니다.
                        </p>

                        <div className="mt-6 space-y-3">
                            {previewReleaseNotes.slice(0, 3).map((release) => (
                                <div
                                    key={release.version}
                                    className="rounded-[22px] border border-white/8 bg-white/[0.04] px-4 py-3"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-[13px] font-semibold text-white">
                                            v{release.version}
                                        </span>
                                        <span className="text-[12px] text-slate-400">
                                            {release.label}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-[13px] leading-6 text-slate-300">
                                        {release.title}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </aside>
                </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
                {canvasCards.map((card) => (
                    <article
                        key={card.title}
                        className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] px-6 py-6 shadow-[0_18px_45px_rgba(2,8,23,0.24)]"
                    >
                        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-sky-200">
                            {card.title}
                        </p>
                        <strong className="mt-3 block text-[34px] font-semibold tracking-[-0.04em] text-white">
                            {card.value}
                        </strong>
                        <p className="mt-3 text-[14px] leading-6 text-slate-300">
                            {card.note}
                        </p>
                    </article>
                ))}
            </div>
        </section>
    );
}

export type { LandingHeroCard };
