import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ChevronDown, Plus, Variable } from 'lucide-react';
import { useVariableStore } from '@/stores';
import { useShallow } from 'zustand/react/shallow';
import { BRAND_GREEN } from './editorColors';

interface VariableNamePickerProps {
    /** Current variable name value */
    value: string;
    /** Callback when value changes */
    onChange: (value: string) => void;
    /** Label text (default: "Variable Name") */
    label?: string;
    /** Whether the field is required (default: false) */
    required?: boolean;
    /** Helper text shown below the input */
    helperText?: string;
    /** Placeholder for custom input (default: "Enter variable name") */
    customPlaceholder?: string;
    /** Filter variables by type (e.g., only show number variables). If not set, shows all. */
    filterType?: 'number' | 'string' | 'boolean';
    /** Accent color for focus rings (default: BRAND_GREEN) */
    accentColor?: string;
}

/**
 * Reusable variable name picker with dropdown of existing variables
 * and an option to create a new custom variable name.
 *
 * Reads available variables from the global variable store (Zustand).
 */
export const VariableNamePicker: React.FC<VariableNamePickerProps> = ({
    value,
    onChange,
    label = 'Variable Name',
    required = false,
    helperText,
    customPlaceholder = 'Enter variable name',
    filterType,
    accentColor = BRAND_GREEN,
}) => {
    // Get all existing variables with their values for type filtering
    const allVariables = useVariableStore(useShallow((state) => state.variables));

    // Filter and sort variable names
    const sortedVarNames = useMemo(() => {
        let names = Object.keys(allVariables);

        if (filterType) {
            names = names.filter((name) => {
                const val = allVariables[name];
                switch (filterType) {
                    case 'number': return typeof val === 'number';
                    case 'string': return typeof val === 'string';
                    case 'boolean': return typeof val === 'boolean';
                    default: return true;
                }
            });
        }

        // Filter out auto-generated variable names (var_*, highlight_*)
        names = names.filter((name) => !name.startsWith('var_') && !name.startsWith('highlight_'));

        return names.sort();
    }, [allVariables, filterType]);

    // Track whether the user is in "custom" mode
    const [isCustom, setIsCustom] = useState(false);

    // Detect if the initial value isn't in the dropdown
    useEffect(() => {
        if (value && !sortedVarNames.includes(value) && !value.startsWith('var_') && !value.startsWith('highlight_')) {
            setIsCustom(true);
        }
    }, []);  // Only on mount

    const handleSelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value;
        if (selected === '__custom__') {
            setIsCustom(true);
            onChange('');
        } else {
            setIsCustom(false);
            onChange(selected);
        }
    }, [onChange]);

    const handleCustomChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow only valid JS identifiers (letters, digits, underscore, no spaces)
        const raw = e.target.value;
        const cleaned = raw.replace(/[^a-zA-Z0-9_]/g, '');
        onChange(cleaned);
    }, [onChange]);

    const handleBackToDropdown = useCallback(() => {
        setIsCustom(false);
        onChange('');
    }, [onChange]);

    return (
        <div>
            <label className="block text-sm font-medium mb-2">
                {label}{' '}
                {!required && <span className="text-muted-foreground">(optional)</span>}
                {required && <span className="text-destructive ml-0.5">*</span>}
            </label>

            {!isCustom ? (
                <>
                    <div className="relative">
                        <select
                            value={sortedVarNames.includes(value) ? value : ''}
                            onChange={handleSelect}
                            className="w-full px-3 py-2 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2 appearance-none cursor-pointer pr-8"
                            style={{ '--tw-ring-color': accentColor, fontFamily: 'monospace' } as React.CSSProperties}
                        >
                            <option value="">— Select a variable —</option>

                            {sortedVarNames.length > 0 && (
                                <>
                                    {sortedVarNames.map((name) => {
                                        const val = allVariables[name];
                                        const typeTag = typeof val === 'number' ? '(num)' :
                                            typeof val === 'boolean' ? '(bool)' :
                                                typeof val === 'string' ? '(str)' :
                                                    Array.isArray(val) ? '(arr)' : '(obj)';
                                        return (
                                            <option key={name} value={name}>
                                                {name} {typeTag}
                                            </option>
                                        );
                                    })}
                                </>
                            )}

                            <option value="__custom__">＋ Create new variable…</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
                    </div>

                    {sortedVarNames.length === 0 && (
                        <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                            <Variable className="w-3 h-3" />
                            No variables defined yet — select "Create new" to add one
                        </p>
                    )}
                </>
            ) : (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={value}
                            onChange={handleCustomChange}
                            className="flex-1 px-3 py-2 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2 font-mono"
                            style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                            placeholder={customPlaceholder}
                            autoFocus
                        />
                        {sortedVarNames.length > 0 && (
                            <button
                                type="button"
                                onClick={handleBackToDropdown}
                                className="px-2.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/30 border rounded-lg transition-colors whitespace-nowrap"
                                title="Back to dropdown"
                            >
                                ← Existing
                            </button>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Plus className="w-3 h-3" />
                        Creating a new variable — use camelCase (e.g., wedgeCount)
                    </p>
                </div>
            )}

            {helperText && !isCustom && (
                <p className="text-xs text-muted-foreground mt-1">
                    {helperText}
                </p>
            )}
        </div>
    );
};

export default VariableNamePicker;
