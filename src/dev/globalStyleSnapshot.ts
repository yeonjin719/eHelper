export interface ExternalStyleSnapshot {
    href: string;
    media?: string;
}

export interface InlineStyleSnapshot {
    cssText: string;
    media?: string;
}

export interface GlobalStyleSnapshot {
    version: 1;
    sourceUrl: string;
    capturedAt: string;
    htmlClassName: string;
    bodyClassName: string;
    htmlStyleText: string;
    bodyStyleText: string;
    externalStyles: ExternalStyleSnapshot[];
    inlineStyles: InlineStyleSnapshot[];
}

function normalizeHref(href: string, baseUrl: string) {
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

function normalizeMedia(value: string | null | undefined) {
    const text = String(value || '').trim();
    return text || undefined;
}

export function createGlobalStyleSnapshot(doc: Document = document) {
    const baseUrl = doc.location?.href || location.href;
    const externalStyles = Array.from(
        doc.querySelectorAll<HTMLLinkElement>('link[rel~="stylesheet"][href]'),
    )
        .map((link) => ({
            href: normalizeHref(link.href || link.getAttribute('href') || '', baseUrl),
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

    const inlineStyles = Array.from(doc.querySelectorAll<HTMLStyleElement>('style'))
        .map((styleEl) => ({
            cssText: String(styleEl.textContent || '').trim(),
            media: normalizeMedia(styleEl.media),
        }))
        .filter((entry) => entry.cssText);

    return {
        version: 1 as const,
        sourceUrl: baseUrl,
        capturedAt: new Date().toISOString(),
        htmlClassName: doc.documentElement.className || '',
        bodyClassName: doc.body?.className || '',
        htmlStyleText: doc.documentElement.getAttribute('style') || '',
        bodyStyleText: doc.body?.getAttribute('style') || '',
        externalStyles,
        inlineStyles,
    } satisfies GlobalStyleSnapshot;
}

export function serializeGlobalStyleSnapshot(snapshot: GlobalStyleSnapshot) {
    return JSON.stringify(snapshot, null, 2);
}

export function parseGlobalStyleSnapshot(value: string) {
    try {
        const parsed = JSON.parse(String(value || '')) as Partial<GlobalStyleSnapshot>;
        if (!parsed || parsed.version !== 1) return null;
        if (!Array.isArray(parsed.externalStyles) || !Array.isArray(parsed.inlineStyles)) {
            return null;
        }

        return {
            version: 1 as const,
            sourceUrl: String(parsed.sourceUrl || ''),
            capturedAt: String(parsed.capturedAt || ''),
            htmlClassName: String(parsed.htmlClassName || ''),
            bodyClassName: String(parsed.bodyClassName || ''),
            htmlStyleText: String(parsed.htmlStyleText || ''),
            bodyStyleText: String(parsed.bodyStyleText || ''),
            externalStyles: parsed.externalStyles
                .map((entry) => ({
                    href: String(entry?.href || '').trim(),
                    media: normalizeMedia(entry?.media),
                }))
                .filter((entry) => entry.href),
            inlineStyles: parsed.inlineStyles
                .map((entry) => ({
                    cssText: String(entry?.cssText || '').trim(),
                    media: normalizeMedia(entry?.media),
                }))
                .filter((entry) => entry.cssText),
        } satisfies GlobalStyleSnapshot;
    } catch {
        return null;
    }
}
