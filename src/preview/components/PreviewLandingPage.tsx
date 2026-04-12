import React, { type ReactNode } from 'react';
import { LandingExperienceSection } from './landing/LandingExperienceSection';
import { LandingFeaturesSection } from './landing/LandingFeaturesSection';
import { LandingHeader } from './landing/LandingHeader';
import {
    LandingHeroSection,
    type LandingHeroCard,
} from './landing/LandingHeroSection';
import { LandingImprovementsSection } from './landing/LandingImprovementsSection';
import { LandingVersionsSection } from './landing/LandingVersionsSection';

interface PreviewLandingPageProps {
    canvasCards: LandingHeroCard[];
    children: ReactNode;
}

export function PreviewLandingPage({
    canvasCards,
    children,
}: PreviewLandingPageProps) {
    return (
        <div className="relative overflow-hidden text-slate-50 bg-[linear-gradient(135deg,#050a16_0%,#0a1630_50%,#051020_100%)]">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-[-15%] top-[-15%] h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.25)_0%,rgba(56,189,248,0)_70%)] blur-3xl" />
                <div className="absolute right-[-12%] top-[8%] h-[580px] w-[580px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.32)_0%,rgba(37,99,235,0)_70%)] blur-3xl" />
                <div className="absolute bottom-[-10%] left-[20%] h-[540px] w-[540px] rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.2)_0%,rgba(14,165,233,0)_70%)] blur-3xl" />
                <div className="absolute right-[15%] bottom-[-5%] h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,rgba(59,130,246,0)_70%)] blur-3xl" />
            </div>

            <div className="relative flex flex-col">
                <LandingHeader />
                <main className="flex flex-col gap-44 pb-32 pt-16 px-[30px] md:pt-24 md:px-[40px] lg:px-[60px]">
                    <LandingHeroSection canvasCards={canvasCards} />
                    <LandingFeaturesSection />
                    <LandingImprovementsSection />
                    <LandingVersionsSection />
                    <LandingExperienceSection>
                        {children}
                    </LandingExperienceSection>
                </main>
            </div>
        </div>
    );
}
