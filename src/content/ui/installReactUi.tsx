import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { DashboardApp } from './components/DashboardApp';
import { attachDashboardDevApi } from './runtime/dashboardDevApi';
import { ensureDashboardDevBridge } from './runtime/dashboardDevBridge';
import { attachDashboardDevTools } from './runtime/dashboardDevTools';
import { attachDashboardRuntimeApi } from './runtime/dashboardRuntimeApi';
import { ensureDashboardShadowMount } from './runtime/dashboardShadowMount';
import {
    applyInitialStateFromStorage,
    createUiStore,
    initializeRuntimeState,
} from './runtime/dashboardRuntimeSetup';

(() => {
    // React UI 설치 진입점: 런타임 초기화 후 루트 마운트와 공개 API를 연결한다.
    const runtime = (window.__ECDASH__ = window.__ECDASH__ || {});
    if (runtime.isBlockedPage?.()) return;

    initializeRuntimeState(runtime);
    attachDashboardDevApi(runtime);
    ensureDashboardDevBridge(runtime);
    const store = createUiStore(runtime);

    let mountedRoot: Root | null = null;
    let rootEl: HTMLElement | null = null;

    // 대시보드 루트를 지연 생성해 초기 로드 비용을 줄인다.
    function mountReactRoot() {
        if (rootEl && mountedRoot) return rootEl;

        if (!rootEl) {
            const shadowMount = ensureDashboardShadowMount(runtime);
            rootEl = shadowMount.mountEl;
        }
        if (!mountedRoot) {
            mountedRoot = createRoot(rootEl);
            mountedRoot.render(
                <DashboardApp store={store} runtime={runtime} />,
            );
            void applyInitialStateFromStorage(runtime, store);
        }

        return rootEl;
    }

    attachDashboardRuntimeApi({
        runtime,
        store,
        mountReactRoot,
    });

    attachDashboardDevTools({
        runtime,
        store,
        mountReactRoot,
    });
})();
