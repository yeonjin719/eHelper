import { UI_HIDDEN_ITEM_IDS_KEY } from '../constants';
import { UiStore } from '../store/UiStore';
import type { DashboardRuntime, UiState } from '../types';

export async function persistUiPreference(key: string, value: unknown) {
    try {
        await chrome.storage?.local?.set?.({
            [key]: value,
        });
    } catch {
        // ignore
    }
}

export async function updateBooleanPreference(
    store: UiStore,
    runtime: DashboardRuntime,
    options: {
        checked: boolean;
        storageKey: string;
        runtimeKey: string;
        stateKey: keyof UiState;
    },
) {
    const { checked, storageKey, runtimeKey, stateKey } = options;
    runtime[runtimeKey] = checked;
    store.setState({ [stateKey]: checked } as Partial<UiState>);
    await persistUiPreference(storageKey, checked);
}

export async function updateStoredHiddenItemIds(
    store: UiStore,
    runtime: DashboardRuntime,
    nextHiddenItemIds: string[],
) {
    runtime.__hiddenItemIds = nextHiddenItemIds;
    store.setState({ hiddenItemIds: nextHiddenItemIds });
    await persistUiPreference(UI_HIDDEN_ITEM_IDS_KEY, nextHiddenItemIds);
}
