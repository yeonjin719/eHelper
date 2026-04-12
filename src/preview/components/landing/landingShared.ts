export interface LandingHeroCard {
    title: string;
    value: string;
    note: string;
}

export const landingSectionShellClass = 'mx-auto max-w-[1000px]';

export const chromeWebStoreUrl =
    'https://chromewebstore.google.com/detail/ehelper/cfdbiojeleeahgmofkjpkapoffjejhof?authuser=0&hl=ko';

const landingScrollGapPx = 24;

export function scrollToLandingHash(
    hash: string,
    behavior: ScrollBehavior = 'smooth',
) {
    if (typeof window === 'undefined') return;
    if (!hash.startsWith('#')) return;

    const targetId = hash.slice(1);
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    const headerEl = document.querySelector('header');
    const headerHeight =
        headerEl instanceof HTMLElement ? headerEl.offsetHeight : 0;
    const targetTop = window.scrollY + targetEl.getBoundingClientRect().top;
    const top =
        hash === '#top'
            ? 0
            : Math.max(targetTop - headerHeight - landingScrollGapPx, 0);

    window.scrollTo({ top, behavior });
}

export function navigateToLandingHash(hash: string) {
    if (typeof window === 'undefined') return;

    if (window.location.hash !== hash) {
        window.history.pushState(null, '', hash);
    } else {
        window.history.replaceState(null, '', hash);
    }

    scrollToLandingHash(hash, 'smooth');
}

export const landingNavLinks = [
    { href: '#features', label: '기능' },
    { href: '#versions', label: '업데이트' },
    { href: '#experience', label: '체험' },
];
