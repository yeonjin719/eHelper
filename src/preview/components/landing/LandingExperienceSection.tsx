import React, { type ReactNode } from 'react';
import {
    LuLayoutDashboard,
    LuMousePointerClick,
    LuPlay,
    LuWandSparkles,
} from 'react-icons/lu';
import { landingSectionShellClass } from './landingShared';

interface LandingExperienceSectionProps {
    children: ReactNode;
}

const experienceGuideItems = [
    {
        icon: LuLayoutDashboard,
        title: '드래그해서 패널 위치 조정',
        description:
            '과목 대시보드와 VOD 화면에서 패널을 잡고 원하는 위치로 옮겨보세요.',
    },
    {
        icon: LuWandSparkles,
        title: '상황별 시나리오',
        description:
            '대시보드에서는 시나리오를 바꿔 마감 임박, 누락, 혼합 상태에서 카드가 어떻게 보이는지 확인할 수 있습니다.',
    },
    {
        icon: LuPlay,
        title: 'VOD 보조 패널',
        description:
            'VOD 화면에서는 배속 메뉴, 1000배속 스킵 버튼, 보조 패널 동작을 직접 살펴볼 수 있습니다.',
    },
] as const;

export function LandingExperienceSection({
    children,
}: LandingExperienceSectionProps) {
    return (
        <section id="experience" className={landingSectionShellClass}>
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-sky-300">
                        Try It Live
                    </p>
                    <h2 className="m-0 text-[36px] font-bold tracking-[-0.05em] text-white md:text-[48px]">
                        체험하기
                    </h2>
                </div>
            </div>

            <div className="mb-12 rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.84)_0%,rgba(8,15,28,0.96)_100%)] p-6 shadow-[0_24px_80px_rgba(2,8,23,0.22)] md:p-7">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-[620px]">
                        <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-sky-200">
                            Preview Guide
                        </p>
                        <h3 className="mt-3 text-[24px] font-semibold tracking-[-0.04em] text-white md:text-[28px]">
                            아래 브라우저에서 바로 확인할 수 있는 기능입니다.
                        </h3>
                        <p className="mt-3 text-[15px] leading-7 text-slate-300">
                            브라우저 상단의 페이지 버튼과 시나리오 칩을 눌러
                            실제 사용 흐름을 빠르게 훑어볼 수 있습니다.
                        </p>
                    </div>

                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-300/16 bg-sky-400/[0.08] px-4 py-2 text-[12px] font-medium text-sky-100">
                        <LuMousePointerClick size={15} />
                        직접 눌러보면서 확인
                    </div>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                    {experienceGuideItems.map(
                        ({ description, icon: Icon, title }) => (
                            <article
                                key={title}
                                className="rounded-[22px] border border-white/10 bg-white/[0.04] p-5"
                            >
                                <div className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-sky-300/16 bg-sky-400/[0.08] text-sky-100">
                                    <Icon size={20} />
                                </div>
                                <h4 className="mt-4 text-[18px] font-semibold tracking-[-0.03em] text-white">
                                    {title}
                                </h4>
                                <p className="mt-2 text-[14px] leading-6 text-slate-300">
                                    {description}
                                </p>
                            </article>
                        ),
                    )}
                </div>
            </div>
            {children}
        </section>
    );
}
