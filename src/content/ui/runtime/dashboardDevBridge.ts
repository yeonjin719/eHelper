import type { DashboardRuntime } from '../types';

const DEV_BRIDGE_ID = 'ecdash-page-dev-bridge';

export function ensureDashboardDevBridge(runtime: DashboardRuntime) {
    if (document.getElementById(DEV_BRIDGE_ID)) {
        return;
    }

    const scriptEl = document.createElement('script');
    scriptEl.id = DEV_BRIDGE_ID;
    scriptEl.src = chrome.runtime.getURL('page-dev-bridge.js');
    scriptEl.async = false;
    scriptEl.dataset.ecdashDevBridge = 'true';
    scriptEl.addEventListener('load', () => {
        scriptEl.remove();
    });
    scriptEl.addEventListener('error', () => {
        runtime.__devBridgeLoadFailed = true;
        scriptEl.remove();
    });

    (document.head || document.documentElement).appendChild(scriptEl);
}
