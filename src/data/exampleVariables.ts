/**
 * Example Variables Configuration
 * ================================
 *
 * CENTRAL PLACE TO DEFINE ALL SHARED VARIABLES (example/template)
 *
 * This file mirrors the structure of src/data/variables.ts.
 * It defines example variables for demos when VITE_SHOW_EXAMPLES=true.
 * AI agents should use this file as the template for how to define variables.
 *
 * USAGE:
 * 1. Define variables here with their default values and metadata
 * 2. Use them in any section with: const x = useVar('variableName', defaultValue)
 * 3. Update them with: setVar('variableName', newValue)
 *
 * For your own lesson, use the same structure in: src/data/variables.ts
 */

import { type VarValue } from '@/stores';
import { type VariableDefinition } from './variables';

/**
 * =====================================================
 * 🎯 DEFINE YOUR VARIABLES HERE (example variables)
 * =====================================================
 *
 * SUPPORTED TYPES:
 *
 * 1. NUMBER (slider):
 *    { defaultValue: 5, type: 'number', min: 0, max: 10, step: 1 }
 *
 * 2. TEXT (free text):
 *    { defaultValue: 'Hello', type: 'text', placeholder: 'Enter text...' }
 *
 * 3. SELECT (dropdown):
 *    { defaultValue: 'sine', type: 'select', options: ['sine', 'cosine', 'tangent'] }
 *
 * 4. BOOLEAN (toggle):
 *    { defaultValue: true, type: 'boolean' }
 *
 * 5. ARRAY (list of numbers):
 *    { defaultValue: [1, 2, 3], type: 'array' }
 *
 * 6. OBJECT (complex data):
 *    { defaultValue: { x: 5, y: 10 }, type: 'object', schema: '{ x: number, y: number }' }
 *
 * 7. SPOT COLOR (color-coded variable label):
 *    { defaultValue: 'radius', type: 'spotColor', color: '#3cc499' }
 */
export const exampleVariableDefinitions: Record<string, VariableDefinition> = {
    // ========================================
    // ADD YOUR VARIABLES HERE (examples below)
    // ========================================

    // ─────────────────────────────────────────
    // NUMBER - Use with sliders / InlineScrubbleNumber
    // ─────────────────────────────────────────
    amplitude: {
        defaultValue: 1,
        type: 'number',
        label: 'Amplitude',
        description: 'The maximum displacement of the wave from its equilibrium position',
        min: 0.1,
        max: 5,
        step: 0.1,
    },
    frequency: {
        defaultValue: 1,
        type: 'number',
        label: 'Frequency',
        description: 'The number of complete cycles per second',
        unit: 'Hz',
        min: 0.1,
        max: 10,
        step: 0.1,
    },
    phase: {
        defaultValue: 0,
        type: 'number',
        label: 'Phase',
        description: 'The horizontal shift of the wave',
        unit: '°',
        min: 0,
        max: 360,
        step: 5,
    },
    wavelength: {
        defaultValue: 1,
        type: 'number',
        label: 'Wavelength',
        description: 'The distance between successive crests of the wave',
        unit: 'm',
        min: 0.1,
        max: 10,
        step: 0.1,
    },

    // ─────────────────────────────────────────
    // SPOT COLOR - Cartesian 2D Unit Circle Explorer
    // ─────────────────────────────────────────
    ucRadius: {
        defaultValue: 'radius',
        type: 'spotColor',
        label: 'Radius Vector',
        description: 'Color for the radius vector in the unit circle explorer',
        color: '#ef4444',
    },
    ucCosine: {
        defaultValue: 'cosine',
        type: 'spotColor',
        label: 'Cosine Projection',
        description: 'Color for the cosine (horizontal) projection in the unit circle explorer',
        color: '#3b82f6',
    },
    ucSine: {
        defaultValue: 'sine',
        type: 'spotColor',
        label: 'Sine Projection',
        description: 'Color for the sine (vertical) projection in the unit circle explorer',
        color: '#22c55e',
    },
    fpSin: {
        defaultValue: 'sin',
        type: 'spotColor',
        label: 'sin(x)',
        description: 'Color for sin(x) in the function plots demo',
        color: '#3b82f6',
    },
    fpCos: {
        defaultValue: 'cos',
        type: 'spotColor',
        label: 'cos(x)',
        description: 'Color for cos(x) in the function plots demo',
        color: '#f59e0b',
    },
    fpNegSin: {
        defaultValue: 'negSin',
        type: 'spotColor',
        label: '−sin(x)',
        description: 'Color for −sin(x) in the function plots demo',
        color: '#ef4444',
    },
    pcLissajous: {
        defaultValue: 'lissajous',
        type: 'spotColor',
        label: 'Lissajous',
        description: 'Color for the Lissajous curve in the parametric curves demo',
        color: '#8b5cf6',
    },
    pcEpitrochoid: {
        defaultValue: 'epitrochoid',
        type: 'spotColor',
        label: 'Epitrochoid',
        description: 'Color for the epitrochoid curve in the parametric curves demo',
        color: '#f97316',
    },

    // ─────────────────────────────────────────
    // NUMBER - Mafs Interactive Demo
    // ─────────────────────────────────────────
    mafsAmplitude: {
        defaultValue: 2,
        type: 'number',
        label: 'Mafs Amplitude',
        description: 'Wave amplitude in the Mafs interactive demo',
        min: 0.1,
        max: 4,
        step: 0.1,
        color: '#ef4444',
    },

    mafsFrequency: {
        defaultValue: 1,
        type: 'number',
        label: 'Mafs Frequency',
        description: 'Wave frequency in the Mafs interactive demo',
        min: 0.1,
        max: 2,
        step: 0.1,
        color: '#3b82f6',
    },

    // ─────────────────────────────────────────
    // NUMBER - Cartesian 2D Sine Wave Explorer
    // ─────────────────────────────────────────
    sineAmplitude: {
        defaultValue: 1.5,
        type: 'number',
        label: 'Sine Amplitude',
        description: 'Vertical stretch of the sine wave (A) in the Cartesian 2D explorer',
        min: 0.1,
        max: 3,
        step: 0.1,
        color: '#ef4444',
    },

    sineOmega: {
        defaultValue: 1,
        type: 'number',
        label: 'Angular Frequency',
        description: 'Number of oscillations per unit (ω) in the Cartesian 2D explorer',
        min: 0.2,
        max: 4,
        step: 0.1,
        color: '#3b82f6',
    },

    sinePhase: {
        defaultValue: 0,
        type: 'number',
        label: 'Phase Shift',
        description: 'Horizontal shift of the sine wave (φ) in the Cartesian 2D explorer',
        min: -3.14159,
        max: 3.14159,
        step: 0.05,
        color: '#a855f7',
    },

    // ─────────────────────────────────────────
    // NUMBER - Trigger demo variable
    // ─────────────────────────────────────────
    animationSpeed: {
        defaultValue: 1,
        type: 'number',
        label: 'Animation Speed',
        description: 'Speed multiplier for animations',
        min: 0,
        max: 5,
        step: 0.5,
    },

    // ─────────────────────────────────────────
    // NUMBER - Visuals linked to scrubble numbers / triggers
    // ─────────────────────────────────────────
    cubeSize: {
        defaultValue: 1.5,
        type: 'number',
        label: 'Cube Size',
        description: 'Side length of the 3D cube',
        min: 0.3,
        max: 3,
        step: 0.1,
        color: '#4F46E5',
    },
    cubeSpeed: {
        defaultValue: 1,
        type: 'number',
        label: 'Cube Speed',
        description: 'Rotation speed of the 3D cube',
        min: 0,
        max: 5,
        step: 0.25,
        color: '#EC4899',
    },

    // ─────────────────────────────────────────
    // SELECT - Dropdown with options
    // ─────────────────────────────────────────
    waveType: {
        defaultValue: 'sine',
        type: 'select',
        label: 'Wave Type',
        description: 'The type of wave function to use',
        options: ['sine', 'cosine', 'square', 'sawtooth'],
    },

    // ─────────────────────────────────────────
    // TEXT - Free text input
    // ─────────────────────────────────────────
    title: {
        defaultValue: 'Interactive Lesson',
        type: 'text',
        label: 'Title',
        description: 'The title displayed in the header',
        placeholder: 'Enter a title...',
    },
    userInput: {
        defaultValue: '',
        type: 'text',
        label: 'User Input',
        description: 'Free-form text input from the user',
        placeholder: 'Type something...',
    },
    equationLabel: {
        defaultValue: 'y = sin(x)',
        type: 'text',
        label: 'Equation Label',
        description: 'Label for the current equation being displayed',
    },

    // ─────────────────────────────────────────
    // TEXT (cloze) - Fill-in-the-blank with correct answer
    // ─────────────────────────────────────────
    quarterCircleAngle: {
        defaultValue: '',
        type: 'text',
        label: 'Quarter Circle Angle',
        description: 'Student answer for the quarter circle angle question',
        placeholder: '???',
        correctAnswer: '90',
        color: '#3B82F6',
    },
    waveUnit: {
        defaultValue: '',
        type: 'text',
        label: 'Wave Unit',
        description: 'Student answer for the unit of frequency',
        placeholder: '???',
        correctAnswer: 'Hertz',
        color: '#5E35B1',
        caseSensitive: false,
    },

    // ─────────────────────────────────────────
    // SELECT (cloze choice) - Dropdown with correct answer validation
    // ─────────────────────────────────────────
    shapeAnswer: {
        defaultValue: '',
        type: 'select',
        label: 'Shape Answer',
        description: 'Student answer for the 2D shape question',
        placeholder: '???',
        correctAnswer: 'circle',
        options: ['cube', 'circle', 'square', 'triangle'],
        color: '#D81B60',
    },
    waveTypeAnswer: {
        defaultValue: '',
        type: 'select',
        label: 'Wave Type Answer',
        description: 'Student answer for the wave type question',
        placeholder: '???',
        correctAnswer: 'transverse',
        options: ['transverse', 'longitudinal', 'surface'],
        color: '#00897B',
    },

    // ─────────────────────────────────────────
    // SELECT (toggle) - Click to cycle through options
    // ─────────────────────────────────────────
    currentShape: {
        defaultValue: 'triangle',
        type: 'select',
        label: 'Current Shape',
        description: 'The currently selected polygon shape',
        options: ['triangle', 'square', 'pentagon', 'hexagon'],
        color: '#D946EF',
    },
    measurementType: {
        defaultValue: 'radius',
        type: 'select',
        label: 'Measurement Type',
        description: 'The type of circle measurement being discussed',
        options: ['radius', 'diameter', 'circumference'],
        color: '#00897B',
    },

    // ─────────────────────────────────────────
    // SELECT - Dropdown with options
    // ─────────────────────────────────────────
    selectedOption: {
        defaultValue: 'option1',
        type: 'select',
        label: 'Selected Option',
        description: 'Currently selected option from a dropdown',
        options: ['option1', 'option2', 'option3'],
    },

    // ─────────────────────────────────────────
    // NUMBER (continued) - coordinates, time, geometry, physics
    // ─────────────────────────────────────────
    x: {
        defaultValue: 0,
        type: 'number',
        label: 'x',
        description: 'General purpose x coordinate or value',
        min: -10,
        max: 10,
        step: 0.1,
    },
    y: {
        defaultValue: 0,
        type: 'number',
        label: 'y',
        description: 'General purpose y coordinate or value',
        min: -10,
        max: 10,
        step: 0.1,
    },
    t: {
        defaultValue: 0,
        type: 'number',
        label: 'Time (t)',
        description: 'Time parameter for animations',
        unit: 's',
        min: 0,
        max: 10,
        step: 0.01,
    },

    // ─────────────────────────────────────────
    // BOOLEAN - Toggle switch
    // ─────────────────────────────────────────
    showGrid: {
        defaultValue: true,
        type: 'boolean',
        label: 'Show Grid',
        description: 'Whether to display the grid lines',
    },
    isAnimating: {
        defaultValue: false,
        type: 'boolean',
        label: 'Animating',
        description: 'Whether an animation is currently running',
    },

    // ─────────────────────────────────────────
    // NUMBER (continued) - radius, temperature, count, angle
    // ─────────────────────────────────────────
    radius: {
        defaultValue: 5,
        type: 'number',
        label: 'Radius',
        description: 'Radius of a circle or sphere',
        unit: 'm',
        min: 1,
        max: 20,
        step: 0.5,
        color: '#3cc499',
    },
    temperature: {
        defaultValue: 25,
        type: 'number',
        label: 'Temperature',
        description: 'Temperature value',
        unit: '°C',
        min: 0,
        max: 100,
        step: 1,
    },
    count: {
        defaultValue: 10,
        type: 'number',
        label: 'Count',
        description: 'Number of items',
        min: 1,
        max: 50,
        step: 1,
    },
    angle: {
        defaultValue: 45,
        type: 'number',
        label: 'Angle',
        description: 'Angle in degrees',
        unit: '°',
        min: 10,
        max: 80,
        step: 5,
    },

    // ─────────────────────────────────────────
    // NUMBER (continued) - physics
    // ─────────────────────────────────────────
    mass: {
        defaultValue: 1,
        type: 'number',
        label: 'Mass',
        description: 'Mass of an object',
        unit: 'kg',
        min: 0.1,
        max: 100,
        step: 0.1,
        color: '#a855f7',
    },
    velocity: {
        defaultValue: 0,
        type: 'number',
        label: 'Velocity',
        description: 'Speed in a given direction',
        unit: 'm/s',
        min: -50,
        max: 50,
        step: 0.5,
        color: '#f97316',
    },
    acceleration: {
        defaultValue: 9.8,
        type: 'number',
        label: 'Acceleration',
        description: 'Rate of change of velocity',
        unit: 'm/s²',
        min: -20,
        max: 20,
        step: 0.1,
        color: '#06b6d4',
    },

    // ─────────────────────────────────────────
    // ARRAY - List of numbers
    // ─────────────────────────────────────────
    dataPoints: {
        defaultValue: [0, 1, 4, 9, 16, 25],
        type: 'array',
        label: 'Data Points',
        description: 'Array of Y values for plotting (x is index)',
    },
    coefficients: {
        defaultValue: [1, 0, 0],
        type: 'array',
        label: 'Polynomial Coefficients',
        description: 'Coefficients [a, b, c] for ax² + bx + c',
    },

    // ─────────────────────────────────────────
    // OBJECT - Complex structured data
    // ─────────────────────────────────────────
    point: {
        defaultValue: { x: 0, y: 0 },
        type: 'object',
        label: 'Point',
        description: 'A 2D point coordinate',
        schema: '{ x: number, y: number }',
    },
    graphSettings: {
        defaultValue: {
            xMin: -10,
            xMax: 10,
            yMin: -10,
            yMax: 10,
            showAxes: true,
        },
        type: 'object',
        label: 'Graph Settings',
        description: 'Configuration for graph viewport and display',
        schema: '{ xMin: number, xMax: number, yMin: number, yMax: number, showAxes: boolean }',
    },
    currentAnnotation: {
        defaultValue: {
            id: '',
            text: '',
            position: { x: 0, y: 0 },
            color: '#3b82f6',
        },
        type: 'object',
        label: 'Current Annotation',
        description: 'The currently selected/editing annotation',
        schema: '{ id: string, text: string, position: { x: number, y: number }, color: string }',
    },

    // ─────────────────────────────────────────
    // LINKED HIGHLIGHT — hover-to-highlight coordination variables
    // ─────────────────────────────────────────
    activeHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Active Highlight',
        description: 'Currently hovered highlight ID — read by visuals to highlight matching parts',
        color: '#3b82f6',
    },

    c2dHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Cartesian 2D Highlight',
        description: 'Active highlight for the Cartesian 2D sine wave explorer (amplitude | frequency | phase)',
        color: '#3b82f6',
    },

    // ─────────────────────────────────────────
    // LINKED HIGHLIGHT — Cartesian 3D demo
    // ─────────────────────────────────────────
    c3dHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Cartesian 3D Highlight',
        description: 'Active highlight for the Cartesian 3D vector demo',
        color: '#3b82f6',
    },

    // ─────────────────────────────────────────
    // NUMBER — Cartesian 3D Surface demo
    // ─────────────────────────────────────────
    surfaceFreqX: {
        defaultValue: 1,
        type: 'number',
        label: 'X Frequency',
        description: 'Spatial frequency in the X direction for the 3D surface',
        min: 0.2,
        max: 3,
        step: 0.1,
        color: '#EF4444',
    },
    surfaceFreqY: {
        defaultValue: 1,
        type: 'number',
        label: 'Y Frequency',
        description: 'Spatial frequency in the Y direction for the 3D surface',
        min: 0.2,
        max: 3,
        step: 0.1,
        color: '#3B82F6',
    },
    surfaceScale: {
        defaultValue: 1,
        type: 'number',
        label: 'Surface Scale',
        description: 'Vertical scale of the 3D surface',
        min: 0.2,
        max: 3,
        step: 0.1,
        color: '#22C55E',
    },
    helixTurns: {
        defaultValue: 3,
        type: 'number',
        label: 'Helix Turns',
        description: 'Number of turns in the 3D helix',
        min: 1,
        max: 8,
        step: 0.5,
        color: '#8B5CF6',
    },
    helixRadius: {
        defaultValue: 2,
        type: 'number',
        label: 'Helix Radius',
        description: 'Radius of the 3D helix',
        min: 0.5,
        max: 4,
        step: 0.1,
        color: '#F59E0B',
    },

    // ─────────────────────────────────────────
    // SPOT COLOR — Cartesian 3D demos
    // ─────────────────────────────────────────
    c3dVecA: {
        defaultValue: 'vecA',
        type: 'spotColor',
        label: 'Vector A',
        description: 'Color for vector A in 3D vector demo',
        color: '#EF4444',
    },
    c3dVecB: {
        defaultValue: 'vecB',
        type: 'spotColor',
        label: 'Vector B',
        description: 'Color for vector B in 3D vector demo',
        color: '#3B82F6',
    },
    c3dVecCross: {
        defaultValue: 'vecCross',
        type: 'spotColor',
        label: 'Cross Product',
        description: 'Color for cross product vector in 3D vector demo',
        color: '#22C55E',
    },
    c3dHelix: {
        defaultValue: 'helix',
        type: 'spotColor',
        label: 'Helix',
        description: 'Color for the helix parametric curve',
        color: '#8B5CF6',
    },
    c3dSurface: {
        defaultValue: 'surface',
        type: 'spotColor',
        label: 'Surface',
        description: 'Color for the 3D surface plot',
        color: '#F59E0B',
    },

    mafsHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Mafs Highlight',
        description: 'Active highlight for the Mafs interactive demo (amplitude | frequency)',
        color: '#3b82f6',
    },

    // ─────────────────────────────────────────
    // FORMULA BLOCK CLOZE / CHOICE / HIGHLIGHT DEMO VARIABLES
    // ─────────────────────────────────────────
    formulaDenom: {
        defaultValue: '',
        type: 'text',
        label: 'Formula Denominator',
        description: 'Cloze input answer for the Leibniz formula denominator',
        placeholder: '???',
        color: '#3B82F6',
    },
    formulaNumerator: {
        defaultValue: '',
        type: 'text',
        label: 'Formula Numerator',
        description: 'Cloze input answer for a fraction numerator',
        placeholder: '???',
        color: '#EF4444',
    },
    formulaOperator: {
        defaultValue: '',
        type: 'select',
        label: 'Formula Operator',
        description: 'Choice input for selecting the correct operator',
        options: ['+', '-', '×', '÷'],
        placeholder: '?',
        color: '#8B5CF6',
    },
    formulaShapeChoice: {
        defaultValue: '',
        type: 'select',
        label: 'Formula Shape',
        description: 'Choice input for selecting the correct geometric shape',
        options: ['r', 'r^2', 'r^3', 'd^2'],
        placeholder: '???',
        color: '#D81B60',
    },
    formulaHighlightGroup: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Formula Highlight Group',
        description: 'Active highlight for the formula highlight demo',
        color: '#3b82f6',
    },
};

/**
 * Get all variable names (for AI agents to discover)
 */
export const getExampleVariableNames = (): string[] => {
    return Object.keys(exampleVariableDefinitions);
};

/**
 * Get a variable's default value
 */
export const getExampleDefaultValue = (name: string): VarValue => {
    return exampleVariableDefinitions[name]?.defaultValue ?? 0;
};

/**
 * Get a variable's metadata
 */
export const getExampleVariableInfo = (name: string): VariableDefinition | undefined => {
    return exampleVariableDefinitions[name];
};

/**
 * Get all default values as a record (for initialization)
 */
export const getExampleDefaultValues = (): Record<string, VarValue> => {
    const defaults: Record<string, VarValue> = {};
    for (const [name, def] of Object.entries(exampleVariableDefinitions)) {
        defaults[name] = def.defaultValue;
    }
    return defaults;
};

/**
 * Get number props for InlineScrubbleNumber from a variable definition.
 * Use with getExampleVariableInfo(name) in exampleBlocks.tsx.
 * Same structure as variables.ts: numberPropsFromDefinition(getExampleVariableInfo(name)).
 */
export function numberPropsFromDefinition(def: VariableDefinition | undefined): {
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    color?: string;
} {
    if (!def || def.type !== 'number') return {};
    return {
        defaultValue: def.defaultValue as number,
        min: def.min,
        max: def.max,
        step: def.step,
        ...(def.color ? { color: def.color } : {}),
    };
}

/**
 * Get cloze choice props for InlineClozeChoice from a variable definition.
 * Same structure as variables.ts: choicePropsFromDefinition(getExampleVariableInfo(name)).
 */
export function choicePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Get toggle props for InlineToggle from a variable definition.
 * Same structure as variables.ts: togglePropsFromDefinition(getExampleVariableInfo(name)).
 */
export function togglePropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Get cloze input props for InlineClozeInput from a variable definition.
 * Same structure as variables.ts: clozePropsFromDefinition(getExampleVariableInfo(name)).
 */
export function clozePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
    caseSensitive?: boolean;
} {
    if (!def || def.type !== 'text') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
        ...(def.caseSensitive !== undefined ? { caseSensitive: def.caseSensitive } : {}),
    };
}

/**
 * Get spot-color props for InlineSpotColor from a variable definition.
 * Extracts the `color` field.
 *
 * @example
 * <InlineSpotColor
 *     varName="radius"
 *     {...spotColorPropsFromDefinition(getExampleVariableInfo('radius'))}
 * >
 *     radius
 * </InlineSpotColor>
 */
export function spotColorPropsFromDefinition(def: VariableDefinition | undefined): {
    color: string;
} {
    return {
        color: def?.color ?? '#8B5CF6',
    };
}

/**
 * Get linked-highlight props for InlineLinkedHighlight from a variable definition.
 * Extracts the `color` and `bgColor` fields.
 */
export function linkedHighlightPropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    return {
        ...(def?.color ? { color: def.color } : {}),
        ...(def?.bgColor ? { bgColor: def.bgColor } : {}),
    };
}
