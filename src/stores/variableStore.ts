/**
 * Variable Store
 * --------------
 * Unified global state for sharing variables and their display colors
 * across sections.
 *
 * Values:
 *   const x = useVar('x', 0);              // read (reactive)
 *   const setVar = useSetVar();             // write
 *   setVar('x', 10);
 *
 * Colors:
 *   const color = useVarColor('radius', '#D81B60');   // read (reactive)
 *   const setColor = useVariableStore(s => s.setColor);
 *   setColor('radius', '#3cc499');                    // write
 *
 * Initialization (in blocks.tsx / exampleBlocks.tsx):
 *   useVariableStore.getState().initialize(getDefaultValues());
 *   initializeVariableColors(variableDefinitions);
 *
 * Variables are defined in: src/data/variables.ts
 *
 * SUPPORTED VALUE TYPES:
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

    /** varName → hex display color */
    colors: Record<string, string>;

    /** Whether the store has been initialized */
    initialized: boolean;

    /** Set a single variable value */
    setVariable: (name: string, value: VarValue) => void;

    /** Set multiple variable values at once */
    setVariables: (vars: Record<string, VarValue>) => void;

    /** Get a variable value (with default) */
    getVariable: <T extends VarValue>(name: string, defaultValue: T) => T;

    /** Set / update a single variable's display color */
    setColor: (varName: string, color: string) => void;

    /** Initialize with default values */
    initialize: (defaults: Record<string, VarValue>) => void;

    /** Initialize colors from a color map (merges into existing) */
    initializeColors: (colorMap: Record<string, string>) => void;

    /** Reset all variable values to defaults */
    reset: () => void;
}

// Store the initial defaults for reset functionality
let initialDefaults: Record<string, VarValue> = {};

/**
 * Main variable store (values + colors)
 */
export const useVariableStore = create<VariableState>((set, get) => ({
    variables: {},
    colors: {},
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

    setColor: (varName, color) => {
        set((state) => {
            if (state.colors[varName] === color) return state; // no-op
            return { colors: { ...state.colors, [varName]: color } };
        });
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

    initializeColors: (colorMap) => {
        set((state) => ({
            colors: { ...state.colors, ...colorMap },
        }));
    },

    reset: () => {
        set({ variables: { ...initialDefaults } });
    },
}));

/**
 * Hook to read a variable value (reactive - auto-updates when value changes)
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

/**
 * Reactive hook to read a variable's display color.
 * Returns the store color if set, otherwise the provided default.
 *
 * @example
 * const color = useVarColor('radius', '#D81B60');
 */
export const useVarColor = (varName: string | undefined, defaultColor: string): string => {
    return useVariableStore((state) =>
        varName ? (state.colors[varName] ?? defaultColor) : defaultColor
    );
};

/**
 * Extract colors from variable definitions and initialize the store.
 * Call once at app startup alongside useVariableStore.getState().initialize().
 *
 * @example
 * initializeVariableColors(variableDefinitions);
 */
export const initializeVariableColors = (
    definitions: Record<string, { color?: string }>
): void => {
    const colorMap: Record<string, string> = {};
    for (const [name, def] of Object.entries(definitions)) {
        if (def.color) {
            colorMap[name] = def.color;
        }
    }
    useVariableStore.getState().initializeColors(colorMap);
};
