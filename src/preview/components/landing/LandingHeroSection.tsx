import React from 'react';
import { LuArrowRight, LuSparkles } from 'react-icons/lu';
import {
    chromeWebStoreUrl,
    landingSectionShellClass,
    navigateToLandingHash,
    type LandingHeroCard,
} from './landingShared';

export function LandingHeroSection() {
    return (
        <section className={landingSectionShellClass}>
            <div className="rounded-[48px] border border-white/10 md:p-14 xl:p-16">
                <div className="flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-[12px] font-semibold tracking-[0.18em] text-sky-200">
                        <LuSparkles size={16} />
                        eCampus Extension Experience
                    </div>

                    <h1 className="mt-8 text-[36px] font-bold text-white md:text-[54px] lg:text-[60px]">
                        복잡한 eCampus,
                        <br />한 눈에, 한 곳에서.
                    </h1>

                    <p className="mt-7 max-w-[700px] text-[17px] leading-8 text-slate-200">
                        오늘 마감 과제, 아직 안 본 강의, 막 올라온 공지와
                        자료까지 흩어지지 않게 모읍니다. 중요한 항목은 먼저
                        보이고, VOD 배속과 다운로드 같은 자주 쓰는 조작은
                        플레이어 옆에서 바로 끝낼 수 있습니다.
                    </p>

                    <div className="mt-9 flex flex-wrap items-center gap-3">
                        <a
                            href={chromeWebStoreUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#38bdf8_0%,#2563eb_100%)] px-6 py-3.5 text-[14px] font-semibold text-white shadow-[0_25px_50px_rgba(37,99,235,0.35)] transition hover:shadow-[0_30px_60px_rgba(37,99,235,0.45)]"
                        >
                            Chrome Web Store에서 설치
                            <LuArrowRight size={16} />
                        </a>
                        <a
                            href="#experience"
                            onClick={(event) => {
                                event.preventDefault();
                                navigateToLandingHash('#experience');
                            }}
                            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-6 py-3.5 text-[14px] font-semibold text-slate-50 transition hover:bg-white/[0.12] hover:border-white/30"
                        >
                            체험 화면 보기
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}

export type { LandingHeroCard };
