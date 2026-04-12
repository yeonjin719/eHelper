import { useEffect, useState } from 'react';
import { UiStore } from '../store/UiStore';

export function useDashboardSettingsLifecycle(store: UiStore) {
    const [locationHref, setLocationHref] = useState(() => location.href);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                store.setState({ settingsOpen: false });
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [store]);

    useEffect(() => {
        const closeSettings = () => {
            if (store.getState().settingsOpen) {
                store.setState({ settingsOpen: false });
            }
        };

        const onLocationChange = () => {
            setLocationHref(location.href);
            closeSettings();
        };

        const onVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                closeSettings();
            }
        };

        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function pushStatePatched(
            ...args: Parameters<History['pushState']>
        ) {
            const result = originalPushState.apply(this, args as any);
            onLocationChange();
            return result;
        };
        history.replaceState = function replaceStatePatched(
            ...args: Parameters<History['replaceState']>
        ) {
            const result = originalReplaceState.apply(this, args as any);
            onLocationChange();
            return result;
        };

        window.addEventListener('popstate', onLocationChange);
        window.addEventListener('hashchange', onLocationChange);
        window.addEventListener('pagehide', onLocationChange);
        window.addEventListener('blur', closeSettings);
        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            history.pushState = originalPushState;
            history.replaceState = originalReplaceState;
            window.removeEventListener('popstate', onLocationChange);
            window.removeEventListener('hashchange', onLocationChange);
            window.removeEventListener('pagehide', onLocationChange);
            window.removeEventListener('blur', closeSettings);
            document.removeEventListener(
                'visibilitychange',
                onVisibilityChange,
            );
        };
    }, [store]);

    return locationHref;
}
