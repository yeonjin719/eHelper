export interface LandingHeroCard {
    title: string;
    value: string;
    note: string;
}

export const landingSectionShellClass =
    'mx-auto max-w-[1000px] px-8 md:px-14 xl:px-20';

export const landingNavLinks = [
    { href: '#features', label: '기능' },
    { href: '#improvements', label: '개선점' },
    { href: '#versions', label: '업데이트' },
    { href: '#experience', label: '체험' },
];
