import { useEffect } from 'react';
import type { GlobalStyleSnapshot } from '../dev/globalStyleSnapshot';

const SNAPSHOT_ATTR = 'data-ecdash-preview-snapshot';

function applyInlineStyle(target: HTMLElement, styleText: string) {
    if (styleText) {
        target.setAttribute('style', styleText);
        return;
    }

    target.removeAttribute('style');
}

function scheduleDashboardHostSync() {
    const syncHostEnvironment = window.__ECDASH__?.__syncShadowHostEnvironment;
    if (typeof syncHostEnvironment !== 'function') {
        return;
    }

    syncHostEnvironment();
    window.requestAnimationFrame(() => {
        syncHostEnvironment();
    });
    window.setTimeout(() => {
        syncHostEnvironment();
    }, 60);
}

export function usePreviewGlobalStyleSnapshot(
    snapshot: GlobalStyleSnapshot | null,
) {
    useEffect(() => {
        const cleanupNodes = Array.from(
            document.head.querySelectorAll(`[${SNAPSHOT_ATTR}]`),
        );
        cleanupNodes.forEach((node) => node.remove());

        const previousHtmlClassName = document.documentElement.className;
        const previousBodyClassName = document.body.className;
        const previousHtmlStyleText =
            document.documentElement.getAttribute('style') || '';
        const previousBodyStyleText = document.body.getAttribute('style') || '';

        if (!snapshot) {
            scheduleDashboardHostSync();
            return () => {
                document.documentElement.className = previousHtmlClassName;
                document.body.className = previousBodyClassName;
                applyInlineStyle(document.documentElement, previousHtmlStyleText);
                applyInlineStyle(document.body, previousBodyStyleText);
                scheduleDashboardHostSync();
            };
        }

        document.documentElement.className = snapshot.htmlClassName || '';
        document.body.className = snapshot.bodyClassName || '';
        applyInlineStyle(document.documentElement, snapshot.htmlStyleText || '');
        applyInlineStyle(document.body, snapshot.bodyStyleText || '');

        snapshot.externalStyles.forEach((styleEntry) => {
            const linkEl = document.createElement('link');
            linkEl.rel = 'stylesheet';
            linkEl.href = styleEntry.href;
            if (styleEntry.media) {
                linkEl.media = styleEntry.media;
            }
            linkEl.addEventListener('load', scheduleDashboardHostSync);
            linkEl.addEventListener('error', scheduleDashboardHostSync);
            linkEl.setAttribute(SNAPSHOT_ATTR, 'external');
            document.head.appendChild(linkEl);
        });

        snapshot.inlineStyles.forEach((styleEntry) => {
            const styleEl = document.createElement('style');
            if (styleEntry.media) {
                styleEl.media = styleEntry.media;
            }
            styleEl.setAttribute(SNAPSHOT_ATTR, 'inline');
            styleEl.textContent = styleEntry.cssText;
            document.head.appendChild(styleEl);
        });
        scheduleDashboardHostSync();

        return () => {
            document.documentElement.className = previousHtmlClassName;
            document.body.className = previousBodyClassName;
            applyInlineStyle(document.documentElement, previousHtmlStyleText);
            applyInlineStyle(document.body, previousBodyStyleText);
            Array.from(document.head.querySelectorAll(`[${SNAPSHOT_ATTR}]`)).forEach(
                (node) => node.remove(),
            );
            scheduleDashboardHostSync();
        };
    }, [snapshot]);
}
