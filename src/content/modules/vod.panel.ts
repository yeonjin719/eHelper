// @ts-nocheck
import {
    buildVodPanelMarkup,
    getVodPanelToggleIconMarkup,
} from './vod.panel.template';

(() => {
    const E = window.__ECDASH__;
    if (!E) return;

    const VOD_SPEED_OPTIONS =
        Array.isArray(E.constants?.VOD_SPEED_OPTIONS) &&
        E.constants.VOD_SPEED_OPTIONS.length
            ? E.constants.VOD_SPEED_OPTIONS
            : [0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.5, 4];
    const VOD_SPEED_PANEL_ID = 'ecdash-vod-speed-panel';
    const VOD_SPEED_MENU_ID = 'ecdash-vod-speed-menu';
    const VOD_PANEL_BODY_ID = 'ecdash-vod-panel-body';
    const VOD_PANEL_TOGGLE_ID = 'ecdash-vod-panel-toggle';
    const VOD_TURBO_RATE = 1000;
    const VOD_PANEL_POSITION_KEY =
        E.constants?.VOD_PANEL_POSITION_KEY || 'ecdash:smu:vod:panelPosition';
    const VOD_PANEL_VIEWPORT_MARGIN = 8;

    function formatVodSpeedLabel(rate) {
        const current = E.closestVodSpeedOption(rate);
        return Number.isInteger(current) ? `${current}x` : `${current.toFixed(2)}x`;
    }

    function getVodPanelDefaultPosition() {
        const offset = window.innerWidth <= 1200 ? 10 : 14;
        return { left: offset, top: offset };
    }

    function getVodPanelCurrentPosition(panel) {
        if (!panel) return getVodPanelDefaultPosition();

        const rect = panel.getBoundingClientRect();
        const inlineLeft = Number.parseFloat(panel.style.left);
        const inlineTop = Number.parseFloat(panel.style.top);

        return {
            left: Number.isFinite(inlineLeft) ? inlineLeft : rect.left,
            top: Number.isFinite(inlineTop) ? inlineTop : rect.top,
        };
    }

    function clampVodPanelPosition(panel, position) {
        const fallback = getVodPanelDefaultPosition();
        const rect = panel?.getBoundingClientRect?.() || { width: 0, height: 0 };
        const width = Math.max(Number(rect.width) || 0, panel?.offsetWidth || 0, 124);
        const height = Math.max(
            Number(rect.height) || 0,
            panel?.offsetHeight || 0,
            40,
        );
        const minLeft = VOD_PANEL_VIEWPORT_MARGIN;
        const minTop = VOD_PANEL_VIEWPORT_MARGIN;
        const maxLeft = Math.max(
            minLeft,
            window.innerWidth - width - VOD_PANEL_VIEWPORT_MARGIN,
        );
        const maxTop = Math.max(
            minTop,
            window.innerHeight - height - VOD_PANEL_VIEWPORT_MARGIN,
        );
        const rawLeft = Number(position?.left);
        const rawTop = Number(position?.top);

        return {
            left: Math.min(
                maxLeft,
                Math.max(
                    minLeft,
                    Number.isFinite(rawLeft) ? rawLeft : fallback.left,
                ),
            ),
            top: Math.min(
                maxTop,
                Math.max(minTop, Number.isFinite(rawTop) ? rawTop : fallback.top),
            ),
        };
    }

    function applyVodPanelPosition(panel, position) {
        if (!panel) return getVodPanelDefaultPosition();

        const next = clampVodPanelPosition(panel, position);
        panel.style.left = `${Math.round(next.left)}px`;
        panel.style.top = `${Math.round(next.top)}px`;
        return next;
    }

    async function persistVodPanelPosition(position) {
        try {
            await E.setSync({
                [VOD_PANEL_POSITION_KEY]: {
                    left: Math.round(position.left),
                    top: Math.round(position.top),
                },
            });
        } catch (_) {
            // 무시
        }
    }

    async function restoreVodPanelPosition(panel) {
        let storedPosition;
        try {
            const stored = await E.getSync([VOD_PANEL_POSITION_KEY]);
            storedPosition = stored?.[VOD_PANEL_POSITION_KEY];
        } catch (_) {
            // 무시
        }

        return applyVodPanelPosition(
            panel,
            storedPosition || getVodPanelDefaultPosition(),
        );
    }

    function bindVodPanelDrag(panel, closeMenu) {
        if (!panel || panel.dataset.ecdashDragBound === '1') return;

        const handle = panel.querySelector('.ecdash-vod-panel-head');
        if (!handle) return;

        panel.dataset.ecdashDragBound = '1';

        let dragState = null;

        const finishDrag = (event) => {
            if (!dragState) return;
            if (
                typeof event?.pointerId === 'number' &&
                event.pointerId !== dragState.pointerId
            ) {
                return;
            }

            const lastState = dragState;
            dragState = null;
            panel.classList.remove('is-dragging');
            document.body.style.userSelect = lastState.userSelect;

            try {
                handle.releasePointerCapture?.(lastState.pointerId);
            } catch (_) {
                // 무시
            }

            if (lastState.moved) {
                const position = applyVodPanelPosition(
                    panel,
                    getVodPanelCurrentPosition(panel),
                );
                void persistVodPanelPosition(position);
            }
        };

        const handlePointerMove = (event) => {
            if (!dragState || event.pointerId !== dragState.pointerId) return;

            dragState.moved = true;
            applyVodPanelPosition(panel, {
                left: dragState.startLeft + (event.clientX - dragState.startX),
                top: dragState.startTop + (event.clientY - dragState.startY),
            });
        };

        handle.addEventListener('pointerdown', (event) => {
            if (event.button !== 0) return;

            const target = event.target instanceof Element ? event.target : null;
            if (target?.closest('button, a, input, select, textarea')) return;

            const start = getVodPanelCurrentPosition(panel);
            closeMenu();
            dragState = {
                pointerId: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                startLeft: start.left,
                startTop: start.top,
                moved: false,
                userSelect: document.body.style.userSelect,
            };

            panel.classList.add('is-dragging');
            document.body.style.userSelect = 'none';

            try {
                handle.setPointerCapture?.(event.pointerId);
            } catch (_) {
                // 무시
            }

            event.preventDefault();
        });

        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', finishDrag);
        document.addEventListener('pointercancel', finishDrag);
        window.addEventListener('resize', () => {
            applyVodPanelPosition(panel, getVodPanelCurrentPosition(panel));
        });
    }

    function getVodTurboButtonLabel(isActive) {
        return isActive ? '1배속' : '1000배속 스킵';
    }

    function updateVodTurboButtonState(panel, rate) {
        const turboButton = panel?.querySelector('#ecdash-vod-speed-max');
        if (!turboButton) return;
        const isActive = E.closestVodSpeedOption(rate) === VOD_TURBO_RATE;
        const buttonLabel = getVodTurboButtonLabel(isActive);
        turboButton.classList.toggle('is-active', isActive);
        turboButton.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        turboButton.setAttribute('aria-label', buttonLabel);
        turboButton.setAttribute('title', buttonLabel);
        turboButton.textContent = buttonLabel;
    }

    E.updateVodSpeedPanelRate = function updateVodSpeedPanelRate(rate) {
        const panel = document.getElementById(VOD_SPEED_PANEL_ID);
        if (!panel) return;

        const current = E.closestVodSpeedOption(rate);
        const label = panel.querySelector('#ecdash-vod-speed-current');
        if (!label) return;
        const speedLabel = formatVodSpeedLabel(current);
        label.textContent = speedLabel;
        label.setAttribute('aria-label', `현재 배속 ${speedLabel}`);
        updateVodTurboButtonState(panel, current);
    };

    E.updateVodSpeedMenuSelection = function updateVodSpeedMenuSelection(rate) {
        const panel = document.getElementById(VOD_SPEED_PANEL_ID);
        if (!panel) return;

        const current = E.closestVodSpeedOption(rate);
        panel.querySelectorAll('.ecdash-vod-speed-option').forEach((btn) => {
            const value = Number(btn.dataset.rate);
            const active = Math.abs(value - current) < 0.001;
            btn.classList.toggle('is-active', active);
            btn.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        updateVodTurboButtonState(panel, current);
    };

    E.setVodSpeedMenuOpen = function setVodSpeedMenuOpen(panel, isOpen) {
        if (!panel) return;

        const menu = panel.querySelector(`#${VOD_SPEED_MENU_ID}`);
        const trigger = panel.querySelector('#ecdash-vod-speed-current');
        if (!menu || !trigger) return;

        const open = Boolean(isOpen);
        panel.classList.toggle('is-menu-open', open);
        menu.hidden = !open;
        trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    E.setVodSpeedPanelCollapsed = function setVodSpeedPanelCollapsed(
        panel,
        isCollapsed,
    ) {
        if (!panel) return;

        const body = panel.querySelector(`#${VOD_PANEL_BODY_ID}`);
        const toggle = panel.querySelector(`#${VOD_PANEL_TOGGLE_ID}`);
        if (!body || !toggle) return;

        const collapsed = Boolean(isCollapsed);
        panel.classList.toggle('is-collapsed', collapsed);
        body.hidden = collapsed;
        toggle.innerHTML = getVodPanelToggleIconMarkup(collapsed);
        toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        toggle.setAttribute('aria-label', collapsed ? '패널 펼치기' : '패널 접기');
        toggle.title = collapsed ? '펼치기' : '접기';
    };

    E.ensureVodSpeedPanel = function ensureVodSpeedPanel() {
        let panel = document.getElementById(VOD_SPEED_PANEL_ID);
        if (panel) return panel;

        panel = document.createElement('div');
        panel.id = VOD_SPEED_PANEL_ID;
        panel.innerHTML = buildVodPanelMarkup(
            VOD_SPEED_MENU_ID,
            VOD_PANEL_BODY_ID,
            VOD_PANEL_TOGGLE_ID,
        );

        const menu = panel.querySelector(`#${VOD_SPEED_MENU_ID}`);
        if (menu) {
            VOD_SPEED_OPTIONS.forEach((option) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'ecdash-vod-speed-option';
                btn.dataset.rate = String(option);
                btn.setAttribute('role', 'option');
                btn.setAttribute('aria-selected', 'false');
                btn.textContent = formatVodSpeedLabel(option);
                menu.appendChild(btn);
            });
        }
        E.setVodSpeedPanelCollapsed(panel, false);

        document.body.appendChild(panel);
        return panel;
    };

    // 패널 이벤트 연결 + 재생/다운로드 상태 동기화.
    E.initVodPlaybackRateControls = async function initVodPlaybackRateControls(
        initialRate,
    ) {
        const panel = E.ensureVodSpeedPanel();
        let targetRate = E.closestVodSpeedOption(initialRate);
        const syncPanelPosition = () => {
            window.requestAnimationFrame(() => {
                applyVodPanelPosition(panel, getVodPanelCurrentPosition(panel));
            });
        };
        const closeMenu = () => {
            E.setVodSpeedMenuOpen(panel, false);
            syncPanelPosition();
        };

        await restoreVodPanelPosition(panel);
        bindVodPanelDrag(panel, closeMenu);

        const persistRate = async (rate) => {
            try {
                await E.setSync({ [E.constants.VOD_PLAYBACK_RATE_KEY]: rate });
            } catch (_) {
                // 무시
            }
        };

        const applyAndPersist = async (nextRate, persist = true) => {
            const { rate } =
                typeof E.applyVodPlaybackMode === 'function'
                    ? E.applyVodPlaybackMode(nextRate)
                    : E.applyVodPlaybackRate(nextRate);
            targetRate = E.closestVodSpeedOption(rate);
            E.updateVodSpeedPanelRate(targetRate);
            E.updateVodSpeedMenuSelection(targetRate);
            if (persist) await persistRate(targetRate);
        };

        panel
            .querySelector(`#${VOD_PANEL_TOGGLE_ID}`)
            ?.addEventListener('click', () => {
                const nextCollapsed = !panel.classList.contains('is-collapsed');
                if (nextCollapsed) {
                    closeMenu();
                }
                E.setVodSpeedPanelCollapsed(panel, nextCollapsed);
                syncPanelPosition();
            });

        panel
            .querySelector('#ecdash-vod-speed-down')
            ?.addEventListener('click', () => {
                closeMenu();
                void applyAndPersist(
                    E.nextVodSpeedOption(targetRate, -1),
                    true,
                );
            });

        panel
            .querySelector('#ecdash-vod-speed-up')
            ?.addEventListener('click', () => {
                closeMenu();
                void applyAndPersist(E.nextVodSpeedOption(targetRate, 1), true);
            });

        panel
            .querySelector('#ecdash-vod-speed-max')
            ?.addEventListener('click', () => {
                closeMenu();
                const nextRate =
                    E.closestVodSpeedOption(targetRate) === VOD_TURBO_RATE
                        ? 1
                        : VOD_TURBO_RATE;
                void applyAndPersist(nextRate, true);
            });

        panel
            .querySelector('#ecdash-vod-speed-current')
            ?.addEventListener('click', () => {
                const isOpen = panel.classList.contains('is-menu-open');
                E.setVodSpeedMenuOpen(panel, !isOpen);
                if (!isOpen) {
                    E.updateVodSpeedMenuSelection(targetRate);
                }
                syncPanelPosition();
            });

        panel
            .querySelector(`#${VOD_SPEED_MENU_ID}`)
            ?.addEventListener('click', (event) => {
                const optionBtn = event.target.closest('button[data-rate]');
                if (!optionBtn) return;

                const nextRate = Number(optionBtn.dataset.rate);
                closeMenu();
                void applyAndPersist(nextRate, true);
            });

        panel
            .querySelector('#ecdash-vod-download')
            ?.addEventListener('click', async () => {
                const button = panel.querySelector('#ecdash-vod-download');
                if (!button || button.dataset.downloading === '1') return;

                const url = button.dataset.url || E.getCurrentVodDownloadUrl();
                if (!url) {
                    E.updateVodDownloadButtonState(panel);
                    return;
                }

                const filename = E.getVodDownloadFilename(url);
                button.dataset.downloading = '1';
                E.updateVodDownloadButtonState(panel);

                try {
                    await E.triggerVodDownload(url, filename);
                } finally {
                    delete button.dataset.downloading;
                    E.updateVodDownloadButtonState(panel);
                }
            });

        document.addEventListener('click', (event) => {
            if (panel.contains(event.target)) return;
            closeMenu();
        });

        document.addEventListener('keydown', (event) => {
            const tagName = String(event.target?.tagName || '').toLowerCase();
            const isTyping =
                tagName === 'input' ||
                tagName === 'textarea' ||
                tagName === 'select' ||
                Boolean(event.target?.isContentEditable);
            if (event.key === 'Escape') {
                closeMenu();
                return;
            }
            if (isTyping || !event.altKey) return;

            if (event.key === ',' || event.key === '<') {
                event.preventDefault();
                closeMenu();
                void applyAndPersist(
                    E.nextVodSpeedOption(targetRate, -1),
                    true,
                );
            } else if (event.key === '.' || event.key === '>') {
                event.preventDefault();
                closeMenu();
                void applyAndPersist(E.nextVodSpeedOption(targetRate, 1), true);
            } else if (event.key === '/') {
                event.preventDefault();
                closeMenu();
                void applyAndPersist(1, true);
            }
        });

        const bindVideoListeners = () => {
            const videos = [
                ...document.querySelectorAll('#vod_player video, video'),
            ];
            for (const video of videos) {
                if (video.dataset.ecdashSpeedBound === '1') continue;
                video.dataset.ecdashSpeedBound = '1';

                const sync = () => {
                    const applied =
                        typeof E.applyVodPlaybackMode === 'function'
                            ? E.applyVodPlaybackMode(targetRate)
                            : E.applyVodPlaybackRate(targetRate);
                    if (applied.applied) {
                        E.updateVodSpeedPanelRate(applied.rate);
                        E.updateVodSpeedMenuSelection(applied.rate);
                    }
                    E.updateVodDownloadButtonState(panel);
                };

                video.addEventListener('loadedmetadata', sync);
                video.addEventListener('play', sync);
            }
        };

        const vodRoot = document.getElementById('vod_player');
        if (vodRoot) {
            const speedObserver = new MutationObserver(() => {
                bindVideoListeners();
                const applied =
                    typeof E.applyVodPlaybackMode === 'function'
                        ? E.applyVodPlaybackMode(targetRate)
                        : E.applyVodPlaybackRate(targetRate);
                if (applied.applied) {
                    E.updateVodSpeedPanelRate(applied.rate);
                    E.updateVodSpeedMenuSelection(applied.rate);
                }
                E.updateVodDownloadButtonState(panel);
            });

            speedObserver.observe(vodRoot, {
                childList: true,
                subtree: true,
                attributes: true,
            });
        }

        bindVideoListeners();
        const first =
            typeof E.applyVodPlaybackMode === 'function'
                ? E.applyVodPlaybackMode(targetRate)
                : E.applyVodPlaybackRate(targetRate);
        if (!first.applied) {
            // 플레이어 초기화 지연 대비: 짧은 시간 동안 재시도
            let retries = 0;
            const timer = setInterval(() => {
                retries += 1;
                const next =
                    typeof E.applyVodPlaybackMode === 'function'
                        ? E.applyVodPlaybackMode(targetRate)
                        : E.applyVodPlaybackRate(targetRate);
                if (next.applied || retries >= 12) {
                    clearInterval(timer);
                }
                E.updateVodSpeedPanelRate(next.rate);
                E.updateVodSpeedMenuSelection(next.rate);
                E.updateVodDownloadButtonState(panel);
            }, 1200);
        } else {
            E.updateVodSpeedPanelRate(first.rate);
            E.updateVodSpeedMenuSelection(first.rate);
        }

        E.updateVodDownloadButtonState(panel);
    };
})();
