/**
 * Stores - Central Export
 * =======================
 *
 * Global state management for cross-section communication.
 * Values and display colors live in a single unified store.
 *
 * IMPORTANT:
 * - Variables are defined in src/data/variables.ts
 * - Variables are initialized automatically when sections load
 *
 * Quick Start:
 * ------------
 *
 * // Reading a variable (reactive):
 * import { useVar } from '@/stores';
 * const x = useVar('x', 0);
 *
 * // Setting a variable:
 * import { useSetVar } from '@/stores';
 * const setVar = useSetVar();
 * setVar('x', 10);
 *
 * // Reading a variable's color (reactive):
 * import { useVarColor } from '@/stores';
 * const color = useVarColor('radius', '#D81B60');
 *
 * // Setting a variable's color:
 * import { useVariableStore } from '@/stores';
 * const setColor = useVariableStore(s => s.setColor);
 * setColor('radius', '#3cc499');
 */

export {
    useVariableStore,
    useVar,
    useSetVar,
    useVarColor,
    initializeVariableColors,
    type VarValue,
} from './variableStore';

