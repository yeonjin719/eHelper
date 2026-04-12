import { LuArrowRight } from 'react-icons/lu';
import { landingSectionShellClass } from './landingShared';

const beforeFlow = [
    'eCampus 접속',
    '과목 접속',
    '과제 조회',
    '공지 조회',
    '토론글 조회',
    '퀴즈 조회',
    '이러닝 강의 조회',
] as const;

const afterFlow = ['eCampus 접속', 'eHelper로 한 눈에 확인'] as const;

export function LandingFeaturesSection() {
    return (
        <section id="features" className={landingSectionShellClass}>
            <div className="flex flex-col items-start gap-6">
                <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-sky-300">
                    Before / After
                </p>
                <h2 className="mt-4 mb-0 text-[36px] font-bold tracking-[-0.05em] text-white md:text-[48px] lg:text-[52px]">
                    접속하자마자 필요한 정보부터
                </h2>
                <p className="mt-5 text-[16px] leading-8 text-slate-300">
                    기존에는 eCampus에 들어간 뒤 과목마다 과제, 공지, 토론,
                    퀴즈, 강의를 다시 열어봐야 했습니다.<br></br> eHelper는 이
                    반복 조회를 대시보드 한 번으로 압축해 사용자가 체감하는
                    시간을 먼저 줄입니다.
                </p>
            </div>

            <div className="mt-8 flex flex-col">
                <article className="relative overflow-hidden rounded-[42px] border border-white/10 ">
                    <div className="relative">
                        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_84px_minmax(0,1fr)] xl:items-stretch">
                            <div className="rounded-[30px] bg-[linear-gradient(180deg,rgba(8,32,64,0.42)_0%,rgba(6,18,34,0.72)_100%)] p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-rose-200">
                                            Before
                                        </p>
                                        <h3 className="mt-3 max-w-[380px] text-[24px] font-bold text-white">
                                            과목마다 할 일과 공지, 토론을 일일이
                                            확인해야 했습니다.
                                        </h3>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-3">
                                    {beforeFlow.map((step, index) => (
                                        <div
                                            key={step}
                                            className="flex items-center gap-4 rounded-[22px] border border-white/8 bg-white/[0.04] px-4 py-1"
                                        >
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-[13px] font-semibold text-rose-100">
                                                {index + 1}
                                            </div>
                                            <p className="text-[15px] leading-6 text-slate-100">
                                                {step}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="hidden xl:flex xl:flex-col xl:items-center xl:justify-center">
                                <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-[30px] border border-white/10 ">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-sky-300/16 text-sky-100">
                                        <LuArrowRight size={24} />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-[30px] border border-sky-300/12 bg-[linear-gradient(180deg,rgba(8,32,64,0.42)_0%,rgba(6,18,34,0.72)_100%)] p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-sky-200">
                                            After
                                        </p>
                                        <h3 className="mt-3 max-w-[420px] text-[24px] font-bold text-white">
                                            eHelper는 접속 직후 필요한 정보부터
                                            바로 보여줍니다.
                                        </h3>
                                    </div>
                                </div>

                                <p className="mt-4 text-[15px] leading-7 text-slate-300">
                                    접속과 동시에 전체 과목의 할 일이 모이고,
                                    필요한 항목만 좁힌 뒤 바로 행동할 수
                                    있습니다.
                                </p>

                                <div className="mt-6 space-y-3">
                                    {afterFlow.map((step, index) => (
                                        <div
                                            key={step}
                                            className="flex items-center gap-4 rounded-[22px] border border-white/8 bg-white/[0.05] px-4 py-4"
                                        >
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sky-300/16 bg-sky-300/10 text-[13px] font-semibold text-sky-100">
                                                {index + 1}
                                            </div>
                                            <p className="text-[15px] leading-6 text-slate-100">
                                                {step}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            </div>
        </section>
    );
}
