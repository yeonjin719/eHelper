const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

type GtagCommand = 'config' | 'event' | 'js';

type Gtag = (
    command: GtagCommand,
    target: string | Date,
    params?: Record<string, unknown>,
) => void;

declare global {
    interface Window {
        dataLayer?: unknown[];
        gtag?: Gtag;
    }
}

function isGoogleAnalyticsEnabled() {
    return typeof GA_MEASUREMENT_ID === 'string' && GA_MEASUREMENT_ID.length > 0;
}

function ensureGtagScript() {
    if (!isGoogleAnalyticsEnabled() || window.gtag) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args) {
        window.dataLayer?.push(args);
    };

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
        send_page_view: false,
    });
}

export function initializeGoogleAnalytics() {
    ensureGtagScript();
}

export function trackPreviewPageView(page: string) {
    if (!isGoogleAnalyticsEnabled()) return;

    ensureGtagScript();

    window.gtag?.('event', 'page_view', {
        page_location: window.location.href,
        page_path: `/${page}`,
        page_title: `eHelper - ${page}`,
    });
}
