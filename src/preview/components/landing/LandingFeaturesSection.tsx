import React from 'react';
import {
    LuBadgeCheck,
    LuFilter,
    LuLayoutDashboard,
    LuPlay,
} from 'react-icons/lu';
import { previewFeatureHighlights } from '../../landingContent';
import { landingSectionShellClass } from './landingShared';

const featureIcons = [LuLayoutDashboard, LuFilter, LuBadgeCheck, LuPlay];

export function LandingFeaturesSection() {
    const spotlightFeature = previewFeatureHighlights[0];
    const quickFeature = previewFeatureHighlights[1];
    const utilityFeatures = previewFeatureHighlights.slice(2);
    const SpotlightIcon = featureIcons[0];
    const QuickIcon = featureIcons[1];

    return (
        <section id="features" className={landingSectionShellClass}>
            <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-sky-300">
                        What eHelper Does
                    </p>
                    <h2 className="mt-4 text-[36px] font-bold tracking-[-0.05em] text-white md:text-[48px] lg:text-[52px]">
                        놓치기 쉬운 학습 항목을 먼저 모읍니다.
                    </h2>
                </div>
                <p className="max-w-[520px] text-[15px] leading-7 text-slate-300">
                    수업마다 페이지를 다시 열지 않아도 지금 확인할 것과 나중에
                    봐도 되는 것을 빠르게 가를 수 있습니다.
                </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <article className="rounded-[42px] border border-white/10 bg-[linear-gradient(135deg,rgba(8,20,39,0.96)_0%,rgba(12,36,74,0.9)_50%,rgba(5,11,21,0.98)_100%)] p-8 shadow-[0_40px_100px_rgba(37,99,235,0.12)] md:p-12">
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-sky-200">
                                <SpotlightIcon size={16} />
                                {spotlightFeature.eyebrow}
                            </div>

                            <h3 className="mt-6 max-w-[520px] text-[32px] font-bold tracking-[-0.05em] text-white md:text-[42px]">
                                {spotlightFeature.title}
                            </h3>
                            <p className="mt-6 max-w-[560px] text-[16px] leading-8 text-slate-200">
                                {spotlightFeature.description}
                            </p>

                            <div className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.06] px-6 py-6 text-[15px] leading-7 text-slate-100 font-medium">
                                {spotlightFeature.benefit}
                            </div>

                            <div className="mt-6 flex flex-wrap gap-2">
                                {spotlightFeature.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] font-medium text-slate-200"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-sky-300/12 bg-sky-400/[0.06] p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-sky-300/20 bg-sky-400/10 text-sky-100">
                                <QuickIcon size={22} />
                            </div>
                            <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.18em] text-sky-200">
                                {quickFeature.eyebrow}
                            </p>
                            <h4 className="mt-3 text-[24px] font-semibold tracking-[-0.03em] text-white">
                                {quickFeature.title}
                            </h4>
                            <p className="mt-4 text-[15px] leading-7 text-slate-300">
                                {quickFeature.description}
                            </p>
                            <p className="mt-5 rounded-[22px] border border-white/8 bg-white/[0.05] px-4 py-4 text-[14px] leading-6 text-slate-100">
                                {quickFeature.benefit}
                            </p>
                        </div>
                    </div>
                </article>

                <div className="grid gap-6">
                    {utilityFeatures.map((feature, index) => {
                        const Icon = featureIcons[index + 2];
                        return (
                            <article
                                key={feature.title}
                                className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,20,38,0.88)_0%,rgba(8,13,24,0.96)_100%)] p-7 shadow-[0_24px_72px_rgba(2,8,23,0.3)]"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-sky-200">
                                            {feature.eyebrow}
                                        </p>
                                        <h3 className="mt-3 text-[24px] font-semibold tracking-[-0.04em] text-white">
                                            {feature.title}
                                        </h3>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-sky-300/20 bg-sky-400/10 text-sky-100">
                                        <Icon size={22} />
                                    </div>
                                </div>

                                <p className="mt-4 text-[15px] leading-7 text-slate-300">
                                    {feature.description}
                                </p>
                                <p className="mt-5 text-[14px] leading-6 text-slate-100">
                                    {feature.benefit}
                                </p>

                                <div className="mt-5 flex flex-wrap gap-2">
                                    {feature.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] font-medium text-slate-200"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
