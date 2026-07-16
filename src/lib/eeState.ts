/**
 * EE State Bridge
 * ---------------
 * Exposes the lesson's domain model (the global variable store) on
 * `window.__eeState` so the verification harness and research tooling can
 * read the model, subscribe to changes, and drive interactions
 * programmatically. Installed once at startup from `main.tsx`.
 *
 * The variable store IS the model: every concept-bearing quantity (inputs the
 * student manipulates and derived values they observe) lives there as a named
 * variable, so asserting on model state = asserting on store state.
 */

import { useVariableStore, type VarValue } from '@/stores';

export interface EEStateBridge {
    /** Snapshot of all model variables. */
    getState: () => Record<string, VarValue>;
    /** Read one variable. */
    get: (name: string) => VarValue | undefined;
    /**
     * Write one variable — the harness escape hatch for driving the model
     * when a pointer gesture cannot be automated reliably.
     */
    setVar: (name: string, value: VarValue) => void;
    /** Write several variables at once (assertion setup states). */
    setVars: (vars: Record<string, VarValue>) => void;
    /** Subscribe to variable changes; returns an unsubscribe function. */
    subscribe: (
        listener: (vars: Record<string, VarValue>) => void
    ) => () => void;
    /** varName → display hex color (for color-correspondence checks). */
    getColors: () => Record<string, string>;
    /** Reset all variables to their defaults. */
    reset: () => void;
}

declare global {
    interface Window {
        __eeState?: EEStateBridge;
    }
}

export function installEEStateBridge(): void {
    if (typeof window === 'undefined' || window.__eeState) return;

    window.__eeState = {
        getState: () => ({ ...useVariableStore.getState().variables }),
        get: (name) => useVariableStore.getState().variables[name],
        setVar: (name, value) =>
            useVariableStore.getState().setVariable(name, value),
        setVars: (vars) => useVariableStore.getState().setVariables(vars),
        subscribe: (listener) =>
            useVariableStore.subscribe((state) => listener(state.variables)),
        getColors: () => ({ ...useVariableStore.getState().colors }),
        reset: () => useVariableStore.getState().reset(),
    };
}
