const PREVIEW_STORAGE_KEY = 'ecdash-preview-chrome-storage';

function readStorage() {
    try {
        const raw = window.localStorage.getItem(PREVIEW_STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function writeStorage(nextValue: Record<string, unknown>) {
    try {
        window.localStorage.setItem(
            PREVIEW_STORAGE_KEY,
            JSON.stringify(nextValue),
        );
    } catch {
        // ignore
    }
}

function normalizeGetResult(keys?: string | string[] | Record<string, unknown>) {
    const storage = readStorage();

    if (typeof keys === 'string') {
        return { [keys]: storage[keys] };
    }

    if (Array.isArray(keys)) {
        return keys.reduce<Record<string, unknown>>((acc, key) => {
            acc[key] = storage[key];
            return acc;
        }, {});
    }

    if (keys && typeof keys === 'object') {
        return Object.entries(keys).reduce<Record<string, unknown>>(
            (acc, [key, fallbackValue]) => {
                acc[key] = key in storage ? storage[key] : fallbackValue;
                return acc;
            },
            {},
        );
    }

    return storage;
}

export function installPreviewChromeMock() {
    const existingChrome = (globalThis as any).chrome || {};

    (globalThis as any).chrome = {
        ...existingChrome,
        storage: {
            ...existingChrome.storage,
            local: {
                ...existingChrome.storage?.local,
                async get(
                    keys?: string | string[] | Record<string, unknown>,
                ) {
                    return normalizeGetResult(keys);
                },
                async set(items: Record<string, unknown>) {
                    const current = readStorage();
                    writeStorage({
                        ...current,
                        ...items,
                    });
                },
            },
        },
        runtime: {
            ...existingChrome.runtime,
            sendMessage(_: unknown, callback?: (response: unknown) => void) {
                callback?.({ ok: false });
            },
        },
    };
}
