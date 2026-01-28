/**
 * Stores - Central Export
 * =======================
 * 
 * Global state management for cross-section communication.
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
 * // Or using the full store:
 * import { useVariableStore } from '@/stores';
 * const { setVariable, getVariable } = useVariableStore();
 */

export {
    useVariableStore,
    useVar,
    useSetVar,
    type VarValue
} from './variableStore';
