import React from 'react';
import type { PreviewScenario } from '../mockDashboardData';
import { PreviewVodPanel } from '../components/PreviewVodPanel';

export function VodScene({ scenario }: { scenario: PreviewScenario }) {
    return (
        <div className="flex min-h-[calc(100vh-140px)] flex-col ">
            <header className="border-b border-slate-200 bg-white/92 px-6 py-5 backdrop-blur">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-[12px] font-semibold tracking-[0.14em] text-slate-500">
                            강의실 / 온라인 강의 / VOD PLAYER
                        </p>
                        <h2 className="mt-2 text-[28px] font-bold tracking-tight text-slate-950">
                            정보조직론 6주차 온라인 강의
                        </h2>
                        <p className="mt-2 max-w-[760px] text-[14px] leading-6 text-slate-600">
                            재생 컨트롤을 원하는 위치로 옮길 수 있고,
                            0.75배속부터 1000배속까지 다양한 배속으로 시청할 수
                            있습니다. <br />
                            또한, 다운로드 버튼도 제공됩니다.
                        </p>
                    </div>

                    <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[12px] font-semibold text-amber-700">
                        1000배속 버튼 포함
                    </div>
                </div>
            </header>

            <div className="flex flex-1 justify-center items-center gap-6 px-3 py-2">
                <section className="relative rounded-[32px] border border-slate-900/10 bg-[#0f172a] p-4 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
                    <PreviewVodPanel />

                    <div className="aspect-video rounded-[26px] bg-[radial-gradient(circle_at_top,#274873_0%,#12243e_48%,#07111f_100%)] px-6 py-6 text-white">
                        <div className="flex h-full flex-col justify-between">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200">
                                        VOD Player
                                    </p>
                                    <h3 className="mt-2 text-[24px] font-semibold tracking-tight">
                                        KDC 분류 원리와 실제 사례
                                    </h3>
                                </div>
                                <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[12px] font-semibold text-slate-100">
                                    출석 진행중 62%
                                </span>
                            </div>

                            <div className="flex items-center justify-center">
                                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/15 bg-white/10 shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
                                    <div className="ml-1 h-0 w-0 border-y-[14px] border-l-[24px] border-y-transparent border-l-white" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="h-1.5 rounded-full bg-white/10">
                                    <div className="h-full w-[38%] rounded-full bg-sky-400" />
                                </div>
                                <div className="flex items-center justify-between text-[13px] text-slate-200">
                                    <span>18:42</span>
                                    <span>48:50</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[13px] text-slate-300">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5">
                                배속 메뉴
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5">
                                1000배속 토글
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5">
                                다운로드 버튼
                            </span>
                        </div>
                        <span className="text-slate-400">
                            프리뷰에서도 메뉴와 토글 상태를 바로 확인할 수
                            있습니다.
                        </span>
                    </div>
                </section>
            </div>
        </div>
    );
}
