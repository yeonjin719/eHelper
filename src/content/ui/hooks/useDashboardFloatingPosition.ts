import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type PointerEvent as ReactPointerEvent,
} from 'react';
import { UI_PANEL_POSITION_KEY } from '../constants';
import { persistUiPreference } from '../utils/dashboardPersistence';

interface DashboardPanelPosition {
    left: number;
    top: number;
}

interface StoredDashboardPanelPosition extends Partial<DashboardPanelPosition> {
    width?: number;
}

interface DashboardPanelDragState {
    pointerId: number;
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
    moved: boolean;
    userSelect: string;
    handleEl: HTMLElement;
}

const DASHBOARD_PANEL_DEFAULT_TOP = 16;
const DASHBOARD_PANEL_DEFAULT_WIDTH = 468;
const DASHBOARD_PANEL_MIN_SIZE = 56;
const DASHBOARD_PANEL_VIEWPORT_MARGIN = 8;

function isFiniteNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
}

function isSamePosition(
    a: DashboardPanelPosition,
    b: DashboardPanelPosition,
) {
    return Math.round(a.left) === Math.round(b.left) &&
        Math.round(a.top) === Math.round(b.top);
}

function getDashboardRightOffset(viewportWidth: number) {
    return viewportWidth < 768 ? 8 : 16;
}

function getDashboardViewport(panel: HTMLElement | null) {
    if (typeof window === 'undefined') {
        return {
            width: DASHBOARD_PANEL_DEFAULT_WIDTH,
            height: DASHBOARD_PANEL_MIN_SIZE,
        };
    }

    const parent =
        panel?.offsetParent instanceof HTMLElement
            ? panel.offsetParent
            : panel?.parentElement;
    const rect = parent?.getBoundingClientRect();

    return {
        width: Math.max(
            Number(rect?.width) || 0,
            parent?.clientWidth || 0,
            window.innerWidth,
            DASHBOARD_PANEL_DEFAULT_WIDTH,
        ),
        height: Math.max(
            Number(rect?.height) || 0,
            parent?.clientHeight || 0,
            window.innerHeight,
            DASHBOARD_PANEL_MIN_SIZE,
        ),
    };
}

function getDashboardPanelBounds(panel: HTMLElement | null) {
    const rect = panel?.getBoundingClientRect();

    return {
        width: Math.max(
            Number(rect?.width) || 0,
            panel?.offsetWidth || 0,
            DASHBOARD_PANEL_MIN_SIZE,
        ),
        height: Math.max(
            Number(rect?.height) || 0,
            panel?.offsetHeight || 0,
            DASHBOARD_PANEL_MIN_SIZE,
        ),
    };
}

function getDashboardDefaultPosition(
    panel: HTMLElement | null,
): DashboardPanelPosition {
    const viewport = getDashboardViewport(panel);
    const { width } = getDashboardPanelBounds(panel);
    const rightOffset = getDashboardRightOffset(viewport.width);

    return {
        left: Math.max(
            DASHBOARD_PANEL_VIEWPORT_MARGIN,
            viewport.width - width - rightOffset,
        ),
        top: DASHBOARD_PANEL_DEFAULT_TOP,
    };
}

function clampDashboardPanelPosition(
    panel: HTMLElement | null,
    position?: Partial<DashboardPanelPosition> | null,
): DashboardPanelPosition {
    const fallback = getDashboardDefaultPosition(panel);
    const viewport = getDashboardViewport(panel);
    const { width, height } = getDashboardPanelBounds(panel);
    const maxLeft = Math.max(
        DASHBOARD_PANEL_VIEWPORT_MARGIN,
        viewport.width - width - DASHBOARD_PANEL_VIEWPORT_MARGIN,
    );
    const maxTop = Math.max(
        DASHBOARD_PANEL_VIEWPORT_MARGIN,
        viewport.height - height - DASHBOARD_PANEL_VIEWPORT_MARGIN,
    );
    const rawLeft = Number(position?.left);
    const rawTop = Number(position?.top);

    return {
        left: Math.min(
            maxLeft,
            Math.max(
                DASHBOARD_PANEL_VIEWPORT_MARGIN,
                isFiniteNumber(rawLeft) ? rawLeft : fallback.left,
            ),
        ),
        top: Math.min(
            maxTop,
            Math.max(
                DASHBOARD_PANEL_VIEWPORT_MARGIN,
                isFiniteNumber(rawTop) ? rawTop : fallback.top,
            ),
        ),
    };
}

async function readStoredDashboardPanelPosition() {
    try {
        const stored = await chrome.storage?.local?.get?.([UI_PANEL_POSITION_KEY]);
        const position = stored?.[UI_PANEL_POSITION_KEY];

        if (!position || typeof position !== 'object') return null;
        return position as StoredDashboardPanelPosition;
    } catch {
        return null;
    }
}

function alignDashboardPanelPositionToRightEdge(
    panel: HTMLElement | null,
    position?: StoredDashboardPanelPosition | null,
) {
    if (!position) return position;

    const storedWidth = Number(position.width);
    const rawLeft = Number(position.left);
    const currentWidth = getDashboardPanelBounds(panel).width;

    if (
        !isFiniteNumber(storedWidth) ||
        !isFiniteNumber(rawLeft) ||
        Math.round(storedWidth) === Math.round(currentWidth)
    ) {
        return position;
    }

    return {
        ...position,
        left: rawLeft + storedWidth - currentWidth,
    };
}

async function persistDashboardPanelPosition(
    panel: HTMLElement | null,
    position: DashboardPanelPosition,
) {
    const { width } = getDashboardPanelBounds(panel);

    await persistUiPreference(UI_PANEL_POSITION_KEY, {
        left: Math.round(position.left),
        top: Math.round(position.top),
        width: Math.round(width),
    });
}

export function useDashboardFloatingPosition(collapsed: boolean) {
    const panelRef = useRef<HTMLDivElement | null>(null);
    const dragStateRef = useRef<DashboardPanelDragState | null>(null);
    const positionRef = useRef<DashboardPanelPosition>(
        getDashboardDefaultPosition(null),
    );
    const widthRef = useRef(getDashboardPanelBounds(null).width);
    const collapsedRef = useRef(collapsed);
    const [position, setPosition] = useState<DashboardPanelPosition>(
        positionRef.current,
    );
    const [dragging, setDragging] = useState(false);

    useEffect(() => {
        positionRef.current = position;
    }, [position]);

    useEffect(() => {
        let cancelled = false;

        void (async () => {
            const storedPosition = await readStoredDashboardPanelPosition();
            if (cancelled) return;

            const normalizedStoredPosition = alignDashboardPanelPositionToRightEdge(
                panelRef.current,
                storedPosition,
            );
            const nextPosition = clampDashboardPanelPosition(
                panelRef.current,
                normalizedStoredPosition || positionRef.current,
            );
            positionRef.current = nextPosition;
            setPosition((prev) =>
                isSamePosition(prev, nextPosition) ? prev : nextPosition,
            );
            widthRef.current = getDashboardPanelBounds(panelRef.current).width;
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    useLayoutEffect(() => {
        const panel = panelRef.current;
        const nextWidth = getDashboardPanelBounds(panel).width;

        if (collapsedRef.current !== collapsed) {
            const nextPosition = clampDashboardPanelPosition(panel, {
                left:
                    positionRef.current.left +
                    widthRef.current -
                    nextWidth,
                top: positionRef.current.top,
            });

            positionRef.current = nextPosition;
            setPosition((prev) =>
                isSamePosition(prev, nextPosition) ? prev : nextPosition,
            );
            void persistDashboardPanelPosition(panel, nextPosition);
        }

        widthRef.current = nextWidth;
        collapsedRef.current = collapsed;
    }, [collapsed]);

    useEffect(() => {
        const syncPosition = () => {
            const nextPosition = clampDashboardPanelPosition(
                panelRef.current,
                positionRef.current,
            );
            positionRef.current = nextPosition;
            widthRef.current = getDashboardPanelBounds(panelRef.current).width;
            setPosition((prev) =>
                isSamePosition(prev, nextPosition) ? prev : nextPosition,
            );
        };

        syncPosition();

        const resizeObserver =
            typeof ResizeObserver === 'function'
                ? new ResizeObserver(() => {
                      syncPosition();
                  })
                : null;

        if (panelRef.current) {
            resizeObserver?.observe(panelRef.current);
            const parent =
                panelRef.current.offsetParent instanceof HTMLElement
                    ? panelRef.current.offsetParent
                    : panelRef.current.parentElement;
            if (parent) {
                resizeObserver?.observe(parent);
            }
        }

        window.addEventListener('resize', syncPosition);

        return () => {
            resizeObserver?.disconnect();
            window.removeEventListener('resize', syncPosition);

            if (!dragStateRef.current) return;

            document.body.style.userSelect = dragStateRef.current.userSelect;
            dragStateRef.current = null;
            setDragging(false);
        };
    }, []);

    useEffect(() => {
        const finishDrag = (event?: PointerEvent) => {
            const dragState = dragStateRef.current;
            if (!dragState) return;

            if (
                typeof event?.pointerId === 'number' &&
                event.pointerId !== dragState.pointerId
            ) {
                return;
            }

            dragStateRef.current = null;
            setDragging(false);
            document.body.style.userSelect = dragState.userSelect;

            try {
                dragState.handleEl.releasePointerCapture?.(dragState.pointerId);
            } catch {
                // ignore
            }

            if (!dragState.moved) return;

            const nextPosition = clampDashboardPanelPosition(
                panelRef.current,
                positionRef.current,
            );
            positionRef.current = nextPosition;
            setPosition((prev) =>
                isSamePosition(prev, nextPosition) ? prev : nextPosition,
            );
            widthRef.current = getDashboardPanelBounds(panelRef.current).width;
            void persistDashboardPanelPosition(panelRef.current, nextPosition);
        };

        const handlePointerMove = (event: PointerEvent) => {
            const dragState = dragStateRef.current;
            if (!dragState || event.pointerId !== dragState.pointerId) return;

            const deltaX = event.clientX - dragState.startX;
            const deltaY = event.clientY - dragState.startY;

            if (
                !dragState.moved &&
                Math.abs(deltaX) + Math.abs(deltaY) < 2
            ) {
                return;
            }

            dragState.moved = true;

            const nextPosition = clampDashboardPanelPosition(panelRef.current, {
                left: dragState.startLeft + deltaX,
                top: dragState.startTop + deltaY,
            });

            positionRef.current = nextPosition;
            setPosition((prev) =>
                isSamePosition(prev, nextPosition) ? prev : nextPosition,
            );
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', finishDrag);
        window.addEventListener('pointercancel', finishDrag);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', finishDrag);
            window.removeEventListener('pointercancel', finishDrag);
        };
    }, []);

    const handlePointerDown = (
        event: ReactPointerEvent<HTMLElement>,
    ) => {
        if (event.button !== 0) return;

        const panel = panelRef.current;
        if (!panel) return;

        const target = event.target instanceof Element ? event.target : null;
        if (target?.closest('button, a, input, select, textarea')) return;

        const nextPosition = clampDashboardPanelPosition(
            panel,
            positionRef.current,
        );
        positionRef.current = nextPosition;
        setPosition((prev) =>
            isSamePosition(prev, nextPosition) ? prev : nextPosition,
        );

        dragStateRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            startLeft: nextPosition.left,
            startTop: nextPosition.top,
            moved: false,
            userSelect: document.body.style.userSelect,
            handleEl: event.currentTarget,
        };
        setDragging(true);
        document.body.style.userSelect = 'none';

        try {
            event.currentTarget.setPointerCapture?.(event.pointerId);
        } catch {
            // ignore
        }

        event.preventDefault();
    };

    return {
        panelRef,
        position,
        dragging,
        handlePointerDown,
    };
}
