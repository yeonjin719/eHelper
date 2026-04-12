import React from 'react';
import { LuBadgeCheck } from 'react-icons/lu';
import { previewReleaseNotes } from '../../landingContent';
import { landingSectionShellClass } from './landingShared';

export function LandingVersionsSection() {
    const [latestRelease, ...archivedReleases] = previewReleaseNotes;

    if (!latestRelease) {
        return null;
    }

    return (
        <section id="versions" className={landingSectionShellClass}>
            <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-sky-300">
                        Version Timeline
                    </p>
                    <h2 className="mt-4 text-[36px] font-bold tracking-[-0.05em] text-white md:text-[48px]">
                        업데이트마다 더 빠르고 덜 헷갈리게 만들었습니다.
                    </h2>
                </div>
                <p className="max-w-[520px] text-[15px] leading-7 text-slate-300">
                    새 기능만 추가한 것이 아니라 로그인 흐름, 카드 정확도,
                    VOD 조작 방식까지 계속 정리하고 있습니다.
                </p>
            </div>

            <article className="rounded-[42px] border border-white/10 bg-[linear-gradient(135deg,rgba(9,23,46,0.96)_0%,rgba(16,58,102,0.88)_50%,rgba(7,14,26,0.98)_100%)] p-8 shadow-[0_40px_100px_rgba(37,99,235,0.12)] md:p-12">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_350px]">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-full border border-sky-300/18 bg-sky-400/10 px-3 py-1.5 text-[13px] font-semibold text-sky-100">
                                v{latestRelease.version}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] font-medium text-slate-300">
                                {latestRelease.label}
                            </span>
                            <span className="text-[13px] text-slate-400">
                                {latestRelease.date}
                            </span>
                        </div>

                        <h3 className="mt-5 text-[32px] font-semibold tracking-[-0.04em] text-white">
                            {latestRelease.title}
                        </h3>
                        <p className="mt-4 max-w-[640px] text-[16px] leading-8 text-slate-300">
                            {latestRelease.summary}
                        </p>

                        <div className="mt-7 grid gap-3">
                            {latestRelease.changes.map((change) => (
                                <div
                                    key={change}
                                    className="flex items-start gap-3 rounded-[20px] border border-white/8 bg-white/[0.04] px-4 py-3"
                                >
                                    <LuBadgeCheck
                                        size={16}
                                        className="mt-1 shrink-0 text-sky-200"
                                    />
                                    <p className="text-[14px] leading-6 text-slate-200">
                                        {change}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-emerald-300/12 bg-emerald-300/[0.06] p-6">
                        <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
                            유저 입장에서 좋아진 점
                        </p>
                        <p className="mt-4 text-[16px] leading-8 text-slate-100">
                            {latestRelease.benefit}
                        </p>
                    </div>
                </div>
            </article>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
                {archivedReleases.map((release) => (
                    <article
                        key={release.version}
                        className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,20,38,0.9)_0%,rgba(6,11,21,0.98)_100%)] p-6 shadow-[0_24px_72px_rgba(2,8,23,0.3)]"
                    >
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-full border border-sky-300/18 bg-sky-400/10 px-3 py-1.5 text-[13px] font-semibold text-sky-100">
                                v{release.version}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] font-medium text-slate-300">
                                {release.label}
                            </span>
                            <span className="text-[13px] text-slate-400">
                                {release.date}
                            </span>
                        </div>

                        <h3 className="mt-4 text-[24px] font-semibold tracking-[-0.04em] text-white">
                            {release.title}
                        </h3>
                        <p className="mt-3 text-[15px] leading-7 text-slate-300">
                            {release.summary}
                        </p>

                        <div className="mt-5 flex flex-wrap gap-2">
                            {release.changes.slice(0, 2).map((change) => (
                                <span
                                    key={change}
                                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] font-medium text-slate-200"
                                >
                                    {change}
                                </span>
                            ))}
                        </div>

                        <p className="mt-5 text-[14px] leading-6 text-slate-100">
                            {release.benefit}
                        </p>
                    </article>
                ))}
            </div>
        </section>
    );
}
