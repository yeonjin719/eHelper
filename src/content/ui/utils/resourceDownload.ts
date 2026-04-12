import type { DashboardRuntime } from '../types';
import { cleanText } from './text';

function decodeUriComponentSafe(value: string) {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

function decodeFilenameText(value: string) {
    let current = String(value || '');
    let prev = '';

    while (current !== prev && /%[0-9a-f]{2}/i.test(current)) {
        prev = current;
        current = decodeUriComponentSafe(current);
    }

    return cleanText(current);
}

export function sanitizeFilename(value: string) {
    return decodeFilenameText(value || 'resource')
        .replace(/[\\/:*?"<>|%]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function getFilenameExtension(name: string) {
    const match = String(name || '').match(/\.([a-z0-9]{2,10})$/i);
    return match?.[1] ? match[1].toLowerCase() : '';
}

function getExtensionFromUrl(url: string) {
    try {
        const pathname = new URL(url).pathname || '';
        const filename = decodeFilenameText(pathname.split('/').pop() || '');
        return getFilenameExtension(filename);
    } catch {
        return '';
    }
}

function ensureFilenameExtension(filename: string, url: string) {
    const safeBase = sanitizeFilename(filename || 'resource');
    if (!safeBase) return 'resource';
    if (getFilenameExtension(safeBase)) return safeBase;

    const ext = getExtensionFromUrl(url);
    return ext ? `${safeBase}.${ext}` : safeBase;
}

function extractFilenameFromContentDisposition(
    contentDisposition: string | null,
) {
    const raw = String(contentDisposition || '');
    if (!raw) return '';

    const utf8Match = raw.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
        return sanitizeFilename(decodeFilenameText(utf8Match[1]));
    }

    const basicMatch = raw.match(/filename\s*=\s*"?([^";]+)"?/i);
    if (basicMatch?.[1]) {
        return sanitizeFilename(decodeFilenameText(basicMatch[1]));
    }

    return '';
}

function triggerDownloadByAnchor(url: string, filename: string) {
    const a = document.createElement('a');
    a.href = url;
    a.rel = 'noopener';
    if (filename) {
        a.download = filename;
    }
    document.body.appendChild(a);
    a.click();
    a.remove();
}

function requestExtensionDownload(url: string, filename: string) {
    const chromeRuntime = (globalThis as any)?.chrome?.runtime;
    if (!chromeRuntime?.sendMessage) {
        return Promise.resolve(false);
    }

    return new Promise<boolean>((resolve) => {
        try {
            chromeRuntime.sendMessage(
                {
                    type: 'ecdash:download-resource',
                    payload: { url, filename },
                },
                (response: any) => {
                    const lastError = (globalThis as any)?.chrome?.runtime
                        ?.lastError;
                    if (lastError) {
                        resolve(false);
                        return;
                    }
                    resolve(Boolean(response?.ok));
                },
            );
        } catch {
            resolve(false);
        }
    });
}

export async function triggerResourceDownload(
    runtime: DashboardRuntime,
    url?: string,
    title?: string,
) {
    const normalizedUrl = runtime.normalizeUrl?.(url || '') || '';
    if (!normalizedUrl) return;

    const filename = ensureFilenameExtension(
        sanitizeFilename(title || 'resource'),
        normalizedUrl,
    );
    if (!normalizedUrl.startsWith('blob:')) {
        const requestedByExtension = await requestExtensionDownload(
            normalizedUrl,
            filename,
        );
        if (requestedByExtension) {
            return;
        }

        try {
            const response = await fetch(normalizedUrl, {
                credentials: 'include',
                cache: 'no-store',
            });

            if (response.ok) {
                const filenameFromHeader =
                    extractFilenameFromContentDisposition(
                        response.headers.get('content-disposition'),
                    );
                const finalFilename = ensureFilenameExtension(
                    filenameFromHeader || filename,
                    normalizedUrl,
                );
                const blob = await response.blob();
                if (blob && blob.size > 0) {
                    const blobUrl = URL.createObjectURL(blob);
                    triggerDownloadByAnchor(blobUrl, finalFilename);
                    setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
                    return;
                }
            }
        } catch {
            // 무시
        }
        return;
    }

    triggerDownloadByAnchor(normalizedUrl, filename);
}
