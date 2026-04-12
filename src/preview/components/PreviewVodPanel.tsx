import React, { useEffect, useRef, useState } from 'react';
import { IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io';
import {
    PREVIEW_VOD_PANEL_OFFSET,
    VOD_SPEED_OPTIONS,
    VOD_TURBO_RATE,
    clampPreviewVodPanelPosition,
    closestVodSpeedOption,
    formatVodSpeedLabel,
    getVodTurboButtonLabel,
    nextVodSpeedOption,
    type PreviewVodPanelPosition,
} from '../previewShared';

export function PreviewVodPanel() {
    const [rate, setRate] = useState<number>(1);
    const [menuOpen, setMenuOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [position, setPosition] = useState<PreviewVodPanelPosition>({
        top: PREVIEW_VOD_PANEL_OFFSET,
        left: PREVIEW_VOD_PANEL_OFFSET,
    });
    const panelRef = useRef<HTMLDivElement | null>(null);
    const dragStateRef = useRef<{
        pointerId: number;
        startX: number;
        startY: number;
        startLeft: number;
        startTop: number;
        userSelect: string;
    } | null>(null);
    const currentRate = closestVodSpeedOption(rate);
    const turboButtonLabel = getVodTurboButtonLabel(currentRate);

    useEffect(() => {
        const syncPosition = () => {
            setPosition((current) => {
                const next = clampPreviewVodPanelPosition(
                    current,
                    panelRef.current,
                );
                if (next.top === current.top && next.left === current.left) {
                    return current;
                }
                return next;
            });
        };

        syncPosition();
    }, [collapsed, menuOpen]);

    useEffect(() => {
        const handlePointerMove = (event: PointerEvent) => {
            const dragState = dragStateRef.current;
            if (!dragState || event.pointerId !== dragState.pointerId) return;

            setPosition(() =>
                clampPreviewVodPanelPosition(
                    {
                        top: dragState.startTop + (event.clientY - dragState.startY),
                        left: dragState.startLeft + (event.clientX - dragState.startX),
                    },
                    panelRef.current,
                ),
            );
        };

        const finishDrag = (event: PointerEvent) => {
            const dragState = dragStateRef.current;
            if (!dragState || event.pointerId !== dragState.pointerId) return;

            dragStateRef.current = null;
            setDragging(false);
            document.body.style.userSelect = dragState.userSelect;
        };

        const handleResize = () => {
            setPosition((current) =>
                clampPreviewVodPanelPosition(current, panelRef.current),
            );
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', finishDrag);
        window.addEventListener('pointercancel', finishDrag);
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', finishDrag);
            window.removeEventListener('pointercancel', finishDrag);
            window.removeEventListener('resize', handleResize);
            if (dragStateRef.current) {
                document.body.style.userSelect = dragStateRef.current.userSelect;
                dragStateRef.current = null;
            }
        };
    }, []);

    const handlePanelDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0) return;

        const target = event.target as HTMLElement | null;
        if (target?.closest('button')) return;

        dragStateRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            startLeft: position.left,
            startTop: position.top,
            userSelect: document.body.style.userSelect,
        };
        setMenuOpen(false);
        setDragging(true);
        document.body.style.userSelect = 'none';

        try {
            event.currentTarget.setPointerCapture(event.pointerId);
        } catch (_) {
            // 무시
        }

        event.preventDefault();
    };

    return (
        <div
            ref={panelRef}
            id="ecdash-vod-speed-panel"
            className={[
                collapsed ? 'is-collapsed' : '',
                dragging ? 'is-dragging' : '',
            ]
                .filter(Boolean)
                .join(' ')}
            style={{
                position: 'absolute',
                top: position.top,
                left: position.left,
                zIndex: 30,
            }}
        >
            <div
                className="ecdash-vod-panel-head"
                title="드래그하여 위치 이동"
                onPointerDown={handlePanelDragStart}
            >
                <span className="ecdash-vod-speed-title">재생 컨트롤</span>
                <button
                    type="button"
                    className="ecdash-vod-panel-toggle"
                    aria-label={collapsed ? '패널 펼치기' : '패널 접기'}
                    onClick={() => {
                        setCollapsed((prev) => !prev);
                        setMenuOpen(false);
                    }}
                >
                    {collapsed ? (
                        <IoMdArrowDropdown aria-hidden="true" focusable="false" />
                    ) : (
                        <IoMdArrowDropup aria-hidden="true" focusable="false" />
                    )}
                </button>
            </div>

            {!collapsed ? (
                <div>
                    <div className="ecdash-vod-speed-actions">
                        <button
                            type="button"
                            aria-label="배속 느리게"
                            onClick={() => {
                                setMenuOpen(false);
                                setRate((prev) => nextVodSpeedOption(prev, -1));
                            }}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                                focusable="false"
                            >
                                <path d="M5 12h14" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            className="ecdash-vod-speed-current"
                            aria-label={`현재 배속 ${formatVodSpeedLabel(currentRate)}`}
                            aria-haspopup="listbox"
                            aria-expanded={menuOpen ? 'true' : 'false'}
                            onClick={() => {
                                setMenuOpen((prev) => !prev);
                            }}
                        >
                            {formatVodSpeedLabel(currentRate)}
                        </button>
                        <button
                            type="button"
                            aria-label="배속 빠르게"
                            onClick={() => {
                                setMenuOpen(false);
                                setRate((prev) => nextVodSpeedOption(prev, 1));
                            }}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                                focusable="false"
                            >
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            className="ecdash-vod-download"
                            aria-label="강의 다운로드"
                            title="현재 재생 강의 파일 다운로드"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                                focusable="false"
                            >
                                <path d="M12 3v11m0 0l-4-4m4 4l4-4M5 21h14" />
                            </svg>
                        </button>
                    </div>

                    <button
                        type="button"
                        className={[
                            'ecdash-vod-turbo-button',
                            currentRate === VOD_TURBO_RATE ? 'is-active' : '',
                        ].join(' ')}
                        aria-label={turboButtonLabel}
                        title={turboButtonLabel}
                        onClick={() => {
                            setMenuOpen(false);
                            setRate((prev) =>
                                closestVodSpeedOption(prev) === VOD_TURBO_RATE
                                    ? 1
                                    : VOD_TURBO_RATE,
                            );
                        }}
                    >
                        {turboButtonLabel}
                    </button>

                    <div
                        id="ecdash-vod-speed-menu"
                        className="ecdash-vod-speed-menu"
                        role="listbox"
                        hidden={!menuOpen}
                    >
                        {VOD_SPEED_OPTIONS.map((option) => {
                            const active =
                                Math.abs(option - currentRate) < 0.001;
                            return (
                                <button
                                    key={option}
                                    type="button"
                                    className={[
                                        'ecdash-vod-speed-option',
                                        active ? 'is-active' : '',
                                    ].join(' ')}
                                    role="option"
                                    aria-selected={active ? 'true' : 'false'}
                                    onClick={() => {
                                        setRate(option);
                                        setMenuOpen(false);
                                    }}
                                >
                                    {formatVodSpeedLabel(option)}
                                </button>
                            );
                        })}
                    </div>

                    <div className="ecdash-vod-speed-hint">
                        Alt+, 느리게 · Alt+. 빠르게 · Alt+/ 기본속도
                    </div>
                </div>
            ) : null}
        </div>
    );
}
