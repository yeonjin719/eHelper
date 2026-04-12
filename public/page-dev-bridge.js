(() => {
    if (window.__ECDASH_DEV__?.copyGlobalStyleSnapshot) {
        return;
    }

    const DEV_COMMAND_EVENT = 'ecdash:dev-command';

    function dispatchDevCommand(command, detail = {}) {
        window.dispatchEvent(
            new CustomEvent(DEV_COMMAND_EVENT, {
                detail: {
                    command,
                    ...detail,
                },
            }),
        );
    }

    function normalizeHref(href, baseUrl) {
        try {
            const normalized = new URL(href, baseUrl).toString();
            if (
                normalized.startsWith('chrome-extension://') ||
                normalized.startsWith('moz-extension://')
            ) {
                return '';
            }

            return normalized;
        } catch {
            return '';
        }
    }

    function normalizeMedia(value) {
        const text = String(value || '').trim();
        return text || undefined;
    }

    function createGlobalStyleSnapshot(doc = document) {
        const baseUrl = doc.location?.href || location.href;
        const externalStyles = Array.from(
            doc.querySelectorAll('link[rel~="stylesheet"][href]'),
        )
            .map((link) => ({
                href: normalizeHref(
                    link.href || link.getAttribute('href') || '',
                    baseUrl,
                ),
                media: normalizeMedia(link.media),
            }))
            .filter((entry) => entry.href)
            .filter(
                (entry, index, array) =>
                    array.findIndex(
                        (candidate) =>
                            candidate.href === entry.href &&
                            candidate.media === entry.media,
                    ) === index,
            );

        const inlineStyles = Array.from(doc.querySelectorAll('style'))
            .map((styleEl) => ({
                cssText: String(styleEl.textContent || '').trim(),
                media: normalizeMedia(styleEl.media),
            }))
            .filter((entry) => entry.cssText);

        return {
            version: 1,
            sourceUrl: baseUrl,
            capturedAt: new Date().toISOString(),
            htmlClassName: doc.documentElement.className || '',
            bodyClassName: doc.body?.className || '',
            htmlStyleText: doc.documentElement.getAttribute('style') || '',
            bodyStyleText: doc.body?.getAttribute('style') || '',
            externalStyles,
            inlineStyles,
        };
    }

    function serializeGlobalStyleSnapshot(snapshot) {
        return JSON.stringify(snapshot, null, 2);
    }

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

    devApi.openDevPanel = function openDevPanel() {
        dispatchDevCommand('open-panel');
    };

    devApi.closeDevPanel = function closeDevPanel() {
        dispatchDevCommand('close-panel');
    };

    devApi.toggleDevPanel = function toggleDevPanel() {
        dispatchDevCommand('toggle-panel');
    };

    devApi.useMockScenario = function useMockScenario(scenarioId = 'mixed') {
        dispatchDevCommand('use-mock-scenario', { scenarioId });
    };

    devApi.useRealData = function useRealData() {
        dispatchDevCommand('use-real-data');
    };

    devApi.refreshMockScenario = function refreshMockScenario() {
        dispatchDevCommand('refresh-mock-scenario');
    };

    devApi.refreshRealData = function refreshRealData() {
        dispatchDevCommand('refresh-real-data');
    };

    devApi.openSettings = function openSettings() {
        dispatchDevCommand('open-settings');
    };
})();
