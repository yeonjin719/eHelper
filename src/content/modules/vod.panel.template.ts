export function buildVodPanelMarkup(
    menuId: string,
    panelBodyId: string,
    panelToggleId: string,
) {
    return `
        <div class="ecdash-vod-panel-head">
            <span class="ecdash-vod-speed-title">재생 컨트롤</span>
            <button
                type="button"
                id="${panelToggleId}"
                class="ecdash-vod-panel-toggle"
                aria-label="패널 접기"
                aria-controls="${panelBodyId}"
                aria-expanded="true"
                title="접기"
            >◁</button>
        </div>
        <div id="${panelBodyId}" class="ecdash-vod-panel-body">
            <div class="ecdash-vod-speed-actions">
                <button type="button" id="ecdash-vod-speed-down" aria-label="배속 느리게"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h14"/></svg></button>
                <button
                    type="button"
                    id="ecdash-vod-speed-current"
                    class="ecdash-vod-speed-current"
                    aria-label="현재 배속"
                    aria-haspopup="listbox"
                    aria-expanded="false"
                >1.00x</button>
                <button type="button" id="ecdash-vod-speed-up" aria-label="배속 빠르게"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14"/></svg></button>
                <button
                    type="button"
                    id="ecdash-vod-download"
                    class="ecdash-vod-download"
                    aria-label="강의 다운로드"
                ><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3v11m0 0l-4-4m4 4l4-4M5 21h14"/></svg></button>
            </div>
            <button
                type="button"
                id="ecdash-vod-speed-max"
                class="ecdash-vod-turbo-button"
                aria-label="1000배속 스킵 모드"
                title="1000배속 스킵 모드"
            >1000배속 스킵</button>
            <div id="${menuId}" class="ecdash-vod-speed-menu" role="listbox" hidden></div>
            <div class="ecdash-vod-speed-hint">Alt+, 느리게 · Alt+. 빠르게 · Alt+/ 기본속도</div>
        </div>
    `;
}
