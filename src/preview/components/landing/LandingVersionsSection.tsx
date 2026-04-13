import React from 'react';
import { previewReleaseNotes } from '../../landingContent';
import { landingSectionShellClass } from './landingShared';

function getReleaseTone(label: string) {
    switch (label) {
        case 'Latest':
            return 'border-sky-300/20 bg-sky-400/12 text-sky-100';
        case 'UI':
            return 'border-violet-300/20 bg-violet-400/12 text-violet-100';
        case 'Infra':
            return 'border-amber-300/20 bg-amber-400/12 text-amber-100';
        case 'Launch':
            return 'border-emerald-300/20 bg-emerald-400/12 text-emerald-100';
        case 'Quiz':
            return 'border-rose-300/20 bg-rose-400/12 text-rose-100';
        default:
            return 'border-cyan-300/20 bg-cyan-400/12 text-cyan-100';
    }
}

export function LandingVersionsSection() {
    if (!previewReleaseNotes.length) {
        return null;
    }

    return (
        <section id="versions" className={landingSectionShellClass}>
            <div className="flex flex-col items-start gap-6">
                <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-sky-300">
                        Version Timeline
                    </p>
                    <h2 className="mt-4 mb-0 text-[36px] font-bold text-white md:text-[48px] lg:text-[52px]">
                        주기적인 업데이트로 더 좋은 경험을
                    </h2>
                    <p className="mt-5 text-[16px] leading-8 text-slate-300">
                        주기적인 업데이트로 eHelper는 점점 더 많은 정보를 더
                        직관적으로 보여주도록 진화하고 있습니다.<br></br> 아래
                        타임라인에서 최근 업데이트 내역을 확인해보세요.
                    </p>
                </div>

                <div className="w-full overflow-hidden rounded-[18px] border border-white/10 bg-slate-950/65">
                    <div className="hidden grid-cols-[112px_minmax(0,1fr)_84px] gap-4 border-b border-white/8 px-6 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500 md:grid">
                        <span>Version</span>
                        <span>Highlights</span>
                        <span className="text-right">Type</span>
                    </div>

                    <div>
                        {previewReleaseNotes.map((release, index) => {
                            const isLatest = index === 0;

                            return (
                                <article
                                    key={release.version}
                                    className={`grid gap-3 px-4 py-4 md:grid-cols-[112px_minmax(0,1fr)_84px] md:items-center md:gap-4 md:px-6 ${
                                        index < previewReleaseNotes.length - 1
                                            ? 'border-b border-white/8'
                                            : ''
                                    } ${
                                        isLatest
                                            ? 'bg-white/[0.03]'
                                            : 'bg-transparent'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 md:block">
                                        <p className="font-mono text-[13px] font-semibold text-white">
                                            v{release.version}
                                        </p>
                                        <p className="text-[11px] tracking-[0.12em] text-slate-500 md:mt-1">
                                            {release.date}
                                        </p>
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                            <h3 className="text-[15px] font-semibold tracking-[-0.03em] text-white">
                                                {release.title}
                                            </h3>
                                            {isLatest ? (
                                                <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-300">
                                                    Current
                                                </span>
                                            ) : null}
                                        </div>
                                        <p className="mt-1 text-[13px] leading-6 text-slate-300">
                                            {release.summary}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-start md:justify-end">
                                        <span
                                            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getReleaseTone(
                                                release.label,
                                            )}`}
                                        >
                                            {release.label}
                                        </span>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
