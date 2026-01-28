/**
 * Variable Store
 * --------------
 * Simple global state for sharing variables across sections.
 * 
 * Usage:
 * 
 * // In Section A (set a value):
 * const { setVariable } = useVariableStore();
 * setVariable('x', 5);
 * 
 * // In Section B (read the value - auto-updates):
 * const x = useVar('x', 0); // 0 is default value
 * 
 * // Variables are defined in: src/data/variables.ts
 * 
 * SUPPORTED TYPES:
 * - number: 5, 3.14, -10
 * - string: 'hello', 'sine'
 * - boolean: true, false
 * - number[]: [1, 2, 3]
 * - object: { x: 5, y: 10, label: 'point' }
 */

import { create } from 'zustand';

// Type for variable values - supports primitives, arrays, and objects
export type VarValue =
    | number
    | string
    | boolean
    | number[]
    | Record<string, unknown>;

interface VariableState {
    /** All shared variables */
    variables: Record<string, VarValue>;

    /** Whether the store has been initialized */
    initialized: boolean;

    /** Set a single variable */
    setVariable: (name: string, value: VarValue) => void;

    /** Set multiple variables at once */
    setVariables: (vars: Record<string, VarValue>) => void;

    /** Get a variable (with default) */
    getVariable: <T extends VarValue>(name: string, defaultValue: T) => T;

    /** Initialize with default values */
    initialize: (defaults: Record<string, VarValue>) => void;

    /** Reset all variables to defaults */
    reset: () => void;
}

// Store the initial defaults for reset functionality
let initialDefaults: Record<string, VarValue> = {};

/**
 * Main variable store
 */
export const useVariableStore = create<VariableState>((set, get) => ({
    variables: {},
    initialized: false,

    setVariable: (name, value) => {
        set((state) => ({
            variables: { ...state.variables, [name]: value },
        }));
    },

    setVariables: (vars) => {
        set((state) => ({
            variables: { ...state.variables, ...vars },
        }));
    },

    getVariable: <T extends VarValue>(name: string, defaultValue: T): T => {
        const value = get().variables[name];
        return (value as T) ?? defaultValue;
    },

    initialize: (defaults) => {
        if (!get().initialized) {
            initialDefaults = { ...defaults };
            set({
                variables: { ...defaults },
                initialized: true,
            });
        }
    },

    reset: () => {
        set({ variables: { ...initialDefaults } });
    },
}));

/**
 * Hook to read a variable (reactive - auto-updates when value changes)
 * 
 * @param name - Variable name
 * @param defaultValue - Default value if not set
 * @returns Current value
 * 
 * @example
 * const x = useVar('x', 0);
 * const amplitude = useVar('amplitude', 1);
 */
export const useVar = <T extends VarValue>(name: string, defaultValue: T): T => {
    return useVariableStore((state) => (state.variables[name] as T) ?? defaultValue);
};

/**
 * Hook to get the setter function only (no re-renders on value change)
 * 
 * @example
 * const setVar = useSetVar();
 * setVar('x', 10);
 */
export const useSetVar = () => {
    return useVariableStore((state) => state.setVariable);
};
