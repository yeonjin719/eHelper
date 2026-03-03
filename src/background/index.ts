interface DownloadResourcePayload {
    url: string;
    filename?: string;
}

interface DownloadResourceRequest {
    type: string;
    payload?: DownloadResourcePayload;
}

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

    return current;
}

function cleanFilename(value: string | undefined) {
    return decodeFilenameText(String(value || ''))
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
    if (!filename) return '';
    if (getFilenameExtension(filename)) return filename;

    const ext = getExtensionFromUrl(url);
    return ext ? `${filename}.${ext}` : filename;
}

function isDownloadRequest(message: DownloadResourceRequest) {
    return message?.type === 'ecdash:download-resource';
}

const extensionApi = (globalThis as any)?.chrome;

extensionApi?.runtime?.onMessage?.addListener(
    (message: DownloadResourceRequest, _sender: unknown, sendResponse: any) => {
        if (!isDownloadRequest(message)) {
            return;
        }

        const payload = message?.payload;
        const url = String(payload?.url || '').trim();
        const filename = ensureFilenameExtension(
            cleanFilename(payload?.filename),
            url,
        );

        if (!url) {
            sendResponse({ ok: false, error: 'invalid_url' });
            return;
        }

        if (!extensionApi?.downloads?.download) {
            sendResponse({ ok: false, error: 'downloads_api_unavailable' });
            return;
        }

        void extensionApi.downloads
            .download({
                url,
                filename: filename || undefined,
                conflictAction: 'uniquify',
                saveAs: false,
            })
            .then((downloadId: unknown) => {
                sendResponse({ ok: typeof downloadId === 'number' });
            })
            .catch((error: unknown) => {
                sendResponse({
                    ok: false,
                    error:
                        error instanceof Error
                            ? error.message
                            : String(error || 'download_failed'),
                });
            });

        return true;
    },
);
