import contentStylesText from '../../styles/content.css?inline';
import type { DashboardRuntime } from '../types';

export interface DashboardShadowMount {
    hostEl: HTMLElement;
    shadowRoot: ShadowRoot;
    mountEl: HTMLElement;
    portalEl: HTMLElement;
}

interface DashboardShadowSyncContext {
    hostEl: HTMLElement;
    shadowRoot: ShadowRoot;
    mountEl: HTMLElement;
    portalEl: HTMLElement;
}

const dashboardShadowReset = `
:host {
    all: initial;
    color-scheme: light;
    font-family: 'Pretendard', sans-serif;
    line-height: 1.5;
    text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

:host, :host *, :host *::before, :host *::after {
    box-sizing: border-box;
}

#ecdash-root {
    font-family: 'Pretendard', sans-serif;
    font-size: 16px;
    color: #18181b;
    line-height: 1.5;
    letter-spacing: normal;
    text-transform: none;
    word-spacing: normal;
    text-indent: 0;
    text-shadow: none;
}

#ecdash-root, #ecdash-root * {
    font-family: inherit;
    letter-spacing: inherit;
    text-transform: inherit;
    word-spacing: inherit;
    text-indent: inherit;
    text-shadow: inherit;
}

#ecdash-root :where(
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    p,
    span,
    div,
    button,
    input,
    select,
    textarea,
    label,
    a
) {
    font-style: normal;
    font-variant: normal;
    text-decoration: none;
}
`;

function ensureShadowStyle(shadowRoot: ShadowRoot) {
    const existingResetStyle = shadowRoot.querySelector(
        'style[data-ecdash-shadow-reset="true"]',
    );
    if (!existingResetStyle) {
        const resetStyleEl = document.createElement('style');
        resetStyleEl.dataset.ecdashShadowReset = 'true';
        resetStyleEl.textContent = dashboardShadowReset;
        shadowRoot.appendChild(resetStyleEl);
    }

    const existingStyle = shadowRoot.querySelector(
        'style[data-ecdash-shadow-style="true"]',
    );
    if (existingStyle) return;

    const styleEl = document.createElement('style');
    styleEl.dataset.ecdashShadowStyle = 'true';
    styleEl.textContent = contentStylesText;
    shadowRoot.appendChild(styleEl);
}

function ensureShadowChild(
    shadowRoot: ShadowRoot,
    id: string,
    attributes?: Record<string, string>,
) {
    let el = shadowRoot.getElementById(id) as HTMLElement | null;
    if (el) return el;

    el = document.createElement('div');
    el.id = id;

    for (const [key, value] of Object.entries(attributes || {})) {
        el.setAttribute(key, value);
    }

    shadowRoot.appendChild(el);
    return el;
}

function syncHostEnvironment(hostEl: HTMLElement) {
    hostEl.style.position = 'fixed';
    hostEl.style.top = '0';
    hostEl.style.left = '0';
    hostEl.style.right = '0';
    hostEl.style.bottom = '0';
    hostEl.style.width = '100vw';
    hostEl.style.height = '100vh';
    hostEl.style.zIndex = '2147483647';
    hostEl.style.isolation = 'isolate';
    hostEl.style.overflow = 'visible';
    hostEl.style.pointerEvents = 'none';
    hostEl.style.fontSize = '16px';
    hostEl.style.lineHeight = '1.5';
    hostEl.style.colorScheme = 'light';
}

export function ensureDashboardShadowMount(
    runtime: DashboardRuntime,
    parent: HTMLElement = document.documentElement,
) {
    const rootId = String(runtime.constants?.ROOT_ID || 'ecdash-root');
    const hostId = `${rootId}-host`;
    const portalId = `${rootId}-portal`;

    let hostEl = document.getElementById(hostId) as HTMLElement | null;
    if (!hostEl) {
        hostEl = document.createElement('div');
        hostEl.id = hostId;
        hostEl.setAttribute('data-ecdash-host', 'true');
        parent.appendChild(hostEl);
    } else if (hostEl.parentElement !== parent) {
        parent.appendChild(hostEl);
    }

    const shadowRoot = hostEl.shadowRoot || hostEl.attachShadow({ mode: 'open' });
    ensureShadowStyle(shadowRoot);

    const mountEl = ensureShadowChild(shadowRoot, rootId);
    const portalEl = ensureShadowChild(shadowRoot, portalId, {
        'data-ecdash-portal': 'true',
    });
    mountEl.style.position = 'relative';
    mountEl.style.width = '100%';
    mountEl.style.height = '100%';
    mountEl.style.pointerEvents = 'none';
    mountEl.style.overflow = 'visible';
    portalEl.style.position = 'relative';
    portalEl.style.width = '100%';
    portalEl.style.height = '100%';
    portalEl.style.pointerEvents = 'none';
    portalEl.style.overflow = 'visible';

    runtime.__shadowHost = hostEl;
    runtime.__shadowRoot = shadowRoot;
    runtime.__portalRoot = portalEl;
    runtime.__syncShadowHostEnvironment = () => {
        const customSync = runtime.__syncShadowHostEnvironmentCustom;
        if (typeof customSync === 'function') {
            customSync({
                hostEl,
                shadowRoot,
                mountEl,
                portalEl,
            } satisfies DashboardShadowSyncContext);
            return;
        }

        syncHostEnvironment(hostEl);
    };

    runtime.__syncShadowHostEnvironment();

    return {
        hostEl,
        shadowRoot,
        mountEl,
        portalEl,
    } satisfies DashboardShadowMount;
}
