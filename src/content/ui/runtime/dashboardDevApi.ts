import {
    createGlobalStyleSnapshot,
    serializeGlobalStyleSnapshot,
} from '../../../dev/globalStyleSnapshot';
import type { DashboardRuntime } from '../types';

declare global {
    interface Window {
        __ECDASH_DEV__?: Record<string, any>;
    }
}

export function attachDashboardDevApi(runtime: DashboardRuntime) {
    const devApi = (window.__ECDASH_DEV__ = window.__ECDASH_DEV__ || {});

    devApi.captureGlobalStyleSnapshot = function captureGlobalStyleSnapshot() {
        return createGlobalStyleSnapshot(document);
    };

    devApi.exportGlobalStyleSnapshot = function exportGlobalStyleSnapshot() {
        return serializeGlobalStyleSnapshot(createGlobalStyleSnapshot(document));
    };

    devApi.copyGlobalStyleSnapshot = async function copyGlobalStyleSnapshot() {
        const text = serializeGlobalStyleSnapshot(
            createGlobalStyleSnapshot(document),
        );

        try {
            await navigator.clipboard.writeText(text);
            return { ok: true, text };
        } catch {
            return { ok: false, text };
        }
    };

    runtime.__devApi = devApi;
}
