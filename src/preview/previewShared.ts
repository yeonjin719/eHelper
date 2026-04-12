export const PREVIEW_GLOBAL_STYLE_SNAPSHOT_KEY =
    'ecdash-preview-global-style-snapshot';
export const PREVIEW_BROWSER_SCALE = 0.88;
export const PREVIEW_VOD_PANEL_OFFSET = 16;
export const VOD_SPEED_OPTIONS = [
    0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.5, 4,
];
export const VOD_TURBO_RATE = 1000;

export type PreviewPageId = 'dashboard' | 'vod';
export type PreviewVodPanelPosition = {
    top: number;
    left: number;
};

export function wait(ms: number) {
    return new Promise<void>((resolve) => {
        window.setTimeout(resolve, ms);
    });
}

export function closestVodSpeedOption(raw: number) {
    const value = Number(raw);
    if (!Number.isFinite(value)) return 1;
    if (value === VOD_TURBO_RATE) return VOD_TURBO_RATE;

    let best = VOD_SPEED_OPTIONS[0];
    let diff = Math.abs(value - best);

    for (const option of VOD_SPEED_OPTIONS) {
        const nextDiff = Math.abs(value - option);
        if (nextDiff < diff) {
            best = option;
            diff = nextDiff;
        }
    }

    return best;
}

export function nextVodSpeedOption(raw: number, direction: number) {
    const current =
        closestVodSpeedOption(raw) === VOD_TURBO_RATE
            ? VOD_SPEED_OPTIONS[VOD_SPEED_OPTIONS.length - 1]
            : closestVodSpeedOption(raw);
    const idx = VOD_SPEED_OPTIONS.findIndex(
        (option) => Math.abs(option - current) < 0.001,
    );
    const safeIdx = idx >= 0 ? idx : 1;
    const delta = direction > 0 ? 1 : -1;
    const nextIdx = Math.max(
        0,
        Math.min(VOD_SPEED_OPTIONS.length - 1, safeIdx + delta),
    );

    return VOD_SPEED_OPTIONS[nextIdx];
}

export function formatVodSpeedLabel(rate: number) {
    const current = closestVodSpeedOption(rate);
    if (current === VOD_TURBO_RATE) return '1000x';
    return Number.isInteger(current) ? `${current}x` : `${current.toFixed(2)}x`;
}

export function getVodTurboButtonLabel(rate: number) {
    return closestVodSpeedOption(rate) === VOD_TURBO_RATE
        ? '1배속'
        : '1000배속 스킵';
}

export function clampPreviewVodPanelPosition(
    position: PreviewVodPanelPosition,
    panel: HTMLDivElement | null,
): PreviewVodPanelPosition {
    const fallback = {
        top: PREVIEW_VOD_PANEL_OFFSET,
        left: PREVIEW_VOD_PANEL_OFFSET,
    };
    const rawTop = Number(position.top);
    const rawLeft = Number(position.left);
    const safe = {
        top: Number.isFinite(rawTop) ? rawTop : fallback.top,
        left: Number.isFinite(rawLeft) ? rawLeft : fallback.left,
    };
    const host =
        panel?.offsetParent instanceof HTMLElement
            ? panel.offsetParent
            : panel?.parentElement;

    if (!panel || !host) return safe;

    const maxLeft = Math.max(
        PREVIEW_VOD_PANEL_OFFSET,
        host.clientWidth - panel.offsetWidth - PREVIEW_VOD_PANEL_OFFSET,
    );
    const maxTop = Math.max(
        PREVIEW_VOD_PANEL_OFFSET,
        host.clientHeight - panel.offsetHeight - PREVIEW_VOD_PANEL_OFFSET,
    );

    return {
        top: Math.min(maxTop, Math.max(PREVIEW_VOD_PANEL_OFFSET, safe.top)),
        left: Math.min(maxLeft, Math.max(PREVIEW_VOD_PANEL_OFFSET, safe.left)),
    };
}
