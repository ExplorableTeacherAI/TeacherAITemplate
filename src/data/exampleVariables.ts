/**
 * Example Variables Configuration
 * ================================
 * 
 * This file contains example variables for the demo sections.
 * These are loaded when VITE_SHOW_EXAMPLES=true in .env
 * 
 * For your own variables, edit: src/data/variables.ts
 */

import { type VarValue } from '@/stores';
import { type VariableDefinition } from './variables';

/**
 * Example variables for demos
 */
export const exampleVariableDefinitions: Record<string, VariableDefinition> = {
    // ========================================
    // WAVE/TRIGONOMETRY VARIABLES
    // ========================================
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
    waveType: {
        defaultValue: 'sine',
        type: 'select',
        label: 'Wave Type',
        description: 'The type of wave function to use',
        options: ['sine', 'cosine', 'square', 'sawtooth'],
    },

    // ========================================
    // TEXT VARIABLES
    // ========================================
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
    selectedOption: {
        defaultValue: 'option1',
        type: 'select',
        label: 'Selected Option',
        description: 'Currently selected option from a dropdown',
        options: ['option1', 'option2', 'option3'],
    },

    // ========================================
    // GENERAL MATH VARIABLES
    // ========================================
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

    // ========================================
    // BOOLEAN VARIABLES
    // ========================================
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

    // ========================================
    // PHYSICS VARIABLES
    // ========================================
    mass: {
        defaultValue: 1,
        type: 'number',
        label: 'Mass',
        description: 'Mass of an object',
        unit: 'kg',
        min: 0.1,
        max: 100,
        step: 0.1,
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
    },

    // ========================================
    // ARRAY VARIABLES
    // ========================================
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

    // ========================================
    // OBJECT VARIABLES
    // ========================================
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
};

/**
 * Get all default values from example variables (for initialization)
 */
export const getExampleDefaultValues = (): Record<string, VarValue> => {
    const defaults: Record<string, VarValue> = {};
    for (const [name, def] of Object.entries(exampleVariableDefinitions)) {
        defaults[name] = def.defaultValue;
    }
    return defaults;
};
