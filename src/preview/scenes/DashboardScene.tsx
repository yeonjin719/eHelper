import React from 'react';
import {
    LuChevronDown,
    LuClock3,
    LuLockKeyhole,
    LuPlay,
    LuSettings,
    LuUserRound,
} from 'react-icons/lu';
import type { PreviewScenario } from '../mockDashboardData';

interface PreviewCourseRow {
    title: string;
    instructor: string;
    badge: {
        primary: string;
        secondary?: string;
        tone: 'smclass' | 'course' | 'course-e';
    };
}

export function DashboardScene({
    scenario,
    snapshotApplied,
}: {
    scenario: PreviewScenario;
    snapshotApplied: boolean;
}) {
    const instructorSamples = [
        '유민선',
        '김정국 / 이수현 / 전영신 / 송수원',
        '이수지',
        '신형만',
        '김철수',
        '박재현',
        '정혜원',
    ];
    const fallbackRows: PreviewCourseRow[] = [
        {
            title: '2026학년도 1학기 마약예방교육',
            instructor: '신형만',
            badge: { primary: 'SM-Class', tone: 'smclass' },
        },
        {
            title: '[서울] 캡스톤디자인1 (HAEA0020 (1)) [1학기]',
            instructor: '김철수',
            badge: { primary: '교과', secondary: '기타', tone: 'course' },
        },
        {
            title: '[서울] 휴먼커뮤니케이션 (HALF9358 (1)) [1학기]',
            instructor: '박재현',
            badge: {
                primary: '교과 e',
                secondary: '기타',
                tone: 'course-e',
            },
        },
    ];
    const courseRows = [
        ...scenario.courses.map((course, index) => ({
            title: course.courseName,
            instructor: instructorSamples[index] || '담당 교수',
            badge: course.isSmClass
                ? { primary: 'SM-Class', tone: 'smclass' as const }
                : index % 3 === 0
                  ? {
                        primary: '교과',
                        secondary: '기타',
                        tone: 'course' as const,
                    }
                  : { primary: 'SM-Class', tone: 'smclass' as const },
        })),
        ...fallbackRows,
    ].slice(0, 6);
    const notices = [
        {
            title: '[필독] 온라인 강의 출석확인 및 수강 안내',
            date: '2019년 6월 24일',
        },
        {
            title: 'e-Campus 원격수업 2차 본인인증 일정 안내',
            date: '2024년 8월 20일',
        },
    ];
    const schedules = courseRows.slice(0, 5).map((course) => ({
        title: course.title,
        date: '2026년 3월 23일 ~ 2026년 4월 17일',
    }));
    const badgeToneClasses = {
        smclass: {
            container: 'bg-[#99bf44] text-white',
            secondary: '',
        },
        course: {
            container: 'border border-[#48aebb] bg-white text-[#48aebb]',
            secondary: 'bg-[#48aebb] text-white',
        },
        'course-e': {
            container: 'border border-[#f07a58] bg-white text-[#f07a58]',
            secondary: 'bg-[#f07a58] text-white',
        },
    } as const;

    return (
        <div className="grid min-h-[calc(100vh-208px)] xl:grid-cols-[minmax(0,1fr)_420px]">
            <section className="bg-[#f3f3f5] px-8 py-7 xl:px-14">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-[30px] font-semibold tracking-[-0.03em] text-[#29438d]">
                            강좌 전체보기
                        </h2>
                        <LuChevronDown
                            size={18}
                            className="mt-1 text-slate-400"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        {snapshotApplied ? (
                            <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[12px] font-semibold text-emerald-700 xl:inline-flex">
                                스타일 스냅샷 적용됨
                            </span>
                        ) : null}
                        <button
                            type="button"
                            className="flex h-[46px] w-[46px] items-center justify-center border border-[#d7dbe2] bg-white text-[#9299a6] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                            aria-label="페이지 설정"
                        >
                            <LuSettings size={21} />
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden border border-zinc-400 bg-white shadow-[0_1px_0_rgba(255,255,255,0.9)]">
                    {courseRows.map((course, index) => {
                        const tone = badgeToneClasses[course.badge.tone];

                        return (
                            <article
                                key={`${course.title}-${index}`}
                                className={[
                                    'flex min-h-[70px] border-zinc-400 items-center gap-6 px-7 py-6',
                                ].join(' ')}
                            >
                                <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,#f7f7f8_0%,#eef0f3_100%)] text-[#d2d6dc] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                                    <LuUserRound size={34} />
                                </div>

                                <div className="w-[114px] shrink-0">
                                    {course.badge.secondary ? (
                                        <div
                                            className={[
                                                'overflow-hidden rounded-[2px] text-center text-[13px] font-semibold leading-none',
                                                tone.container,
                                            ].join(' ')}
                                        >
                                            <div
                                                className={
                                                    tone.secondary +
                                                    ' px-3 py-2'
                                                }
                                            >
                                                {course.badge.primary}
                                            </div>
                                            <div className="px-3 py-2">
                                                {course.badge.secondary}
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className={[
                                                'inline-flex min-h-[34px] items-center justify-center px-5 text-[13px] font-semibold',
                                                tone.container,
                                            ].join(' ')}
                                        >
                                            {course.badge.primary}
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <h3 className="truncate text-[16px] font-semibold tracking-[-0.02em] text-[#151515] xl:text-[16px]">
                                        {course.title}
                                    </h3>
                                    <p className="mt-2 text-[14px] text-[#84878d]">
                                        {course.instructor}
                                    </p>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>

            <aside className="border-l border-[#d6dbe3] bg-white">
                <section className="border-b border-[#dfe3e8] px-7 py-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-[#29438d]">
                            중요공지
                        </h3>
                        <span className="text-[24px] leading-none text-slate-300">
                            −
                        </span>
                    </div>

                    <div className="relative mt-8 space-y-8">
                        <div className="absolute bottom-0 left-[28px] top-0 w-px bg-[#eceff3]" />
                        {notices.map((notice) => (
                            <article
                                key={notice.title}
                                className="relative min-h-[70px] items-center w-full flex gap-4"
                            >
                                <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full border border-[#dde2e8] bg-zinc-100 text-[#9da4ae] shadow-[0_1px_0_rgba(255,255,255,0.8)]">
                                    <LuLockKeyhole size={22} />
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="line-clamp-2 pr-3 my-0 text-[16px] font-medium leading-7 text-[#4d4f55]">
                                        {notice.title}
                                    </h4>
                                    <div className="mt-1 flex items-center gap-2 text-[12px] text-[#8c919a]">
                                        <LuClock3 size={14} />
                                        <span>{notice.date}</span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="mt-7 h-[44px] w-full border border-[#d4d9df] bg-[#f1f2f4] text-[14px] font-medium text-[#6f7680]"
                    >
                        더보기
                    </button>
                </section>

                <section className="px-7 py-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-[#29438d]">
                            예정된 할일
                            <span className="ml-1 text-[14px] font-medium text-[#4f63a6]">
                                (4월10일 ~ 4월24일)
                            </span>
                        </h3>
                        <span className="text-[24px] leading-none text-slate-300">
                            −
                        </span>
                    </div>

                    <div className="mt-8 space-y-8">
                        {schedules.map((schedule) => (
                            <article
                                key={schedule.title}
                                className="relative min-h-[66px] items-center w-full flex gap-4"
                            >
                                <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full border border-zinc-400 bg-white text-[#a2a9b4]">
                                    <LuPlay size={21} />
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="line-clamp-1 pr-3 my-0 text-[16px] font-medium leading-7 text-[#4d4f55]">
                                        {schedule.title}
                                    </h4>
                                    <p className="mt-1 text-[12px] text-[#979ca4]">
                                        {schedule.date}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </aside>
        </div>
    );
}
