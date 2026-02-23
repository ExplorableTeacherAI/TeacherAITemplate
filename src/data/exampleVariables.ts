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
    // NUMBER/BOOLEAN - Simulation Demo (Math-only Examples)
    // ─────────────────────────────────────────
    waveAmplitude1: {
        defaultValue: 1,
        type: 'number',
        label: 'Wave 1 Amplitude',
        description: 'Amplitude of the first wave',
        min: 0,
        max: 2,
        step: 0.1,
        color: '#3b82f6',
    },
    waveFrequency1: {
        defaultValue: 1,
        type: 'number',
        label: 'Wave 1 Frequency',
        description: 'Frequency of the first wave',
        unit: 'Hz',
        min: 0.5,
        max: 5,
        step: 0.1,
        color: '#3b82f6',
    },
    waveAmplitude2: {
        defaultValue: 1,
        type: 'number',
        label: 'Wave 2 Amplitude',
        description: 'Amplitude of the second wave',
        min: 0,
        max: 2,
        step: 0.1,
        color: '#ef4444',
    },
    waveFrequency2: {
        defaultValue: 1.5,
        type: 'number',
        label: 'Wave 2 Frequency',
        description: 'Frequency of the second wave',
        unit: 'Hz',
        min: 0.5,
        max: 5,
        step: 0.1,
        color: '#ef4444',
    },
    waveShowSum: {
        defaultValue: true,
        type: 'boolean',
        label: 'Show Superposition',
        description: 'Show the sum of both waves',
    },
    waveRunning: {
        defaultValue: false,
        type: 'boolean',
        label: 'Wave Running',
        description: 'Whether the wave superposition animation is running',
    },

    trigAmplitude: {
        defaultValue: 1,
        type: 'number',
        label: 'Amplitude A',
        description: 'Amplitude in y = A sin(ωx + φ)',
        min: 0.2,
        max: 3,
        step: 0.1,
        color: '#8b5cf6',
    },
    trigFrequency: {
        defaultValue: 1,
        type: 'number',
        label: 'Frequency ω',
        description: 'Angular frequency scaling in y = A sin(ωx + φ)',
        min: 0.5,
        max: 4,
        step: 0.1,
        color: '#06b6d4',
    },
    trigPhase: {
        defaultValue: 0,
        type: 'number',
        label: 'Phase φ',
        description: 'Horizontal phase shift in degrees',
        unit: '°',
        min: -180,
        max: 180,
        step: 5,
        color: '#f97316',
    },
    trigShowReference: {
        defaultValue: true,
        type: 'boolean',
        label: 'Show Reference',
        description: 'Toggle the reference sin(x) curve',
    },
    trigRunning: {
        defaultValue: false,
        type: 'boolean',
        label: 'Trig Running',
        description: 'Whether the trigonometric transformation animation is running',
    },

    lissA: {
        defaultValue: 3,
        type: 'number',
        label: 'x Frequency a',
        description: 'Frequency multiplier for x(t) = sin(at + δ)',
        min: 1,
        max: 8,
        step: 1,
        color: '#f59e0b',
    },
    lissB: {
        defaultValue: 2,
        type: 'number',
        label: 'y Frequency b',
        description: 'Frequency multiplier for y(t) = sin(bt)',
        min: 1,
        max: 8,
        step: 1,
        color: '#3b82f6',
    },
    lissDelta: {
        defaultValue: 90,
        type: 'number',
        label: 'Phase Offset δ',
        description: 'Phase offset between x and y components',
        unit: '°',
        min: 0,
        max: 180,
        step: 5,
        color: '#ef4444',
    },
    lissRunning: {
        defaultValue: false,
        type: 'boolean',
        label: 'Lissajous Running',
        description: 'Whether the Lissajous curve animation is running',
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
    swReference: {
        defaultValue: 'reference',
        type: 'spotColor',
        label: 'sin(x) reference',
        description: 'Color for the reference sin(x) curve in the sine wave explorer',
        color: '#94a3b8',
    },
    swAmplitude: {
        defaultValue: 'amplitude',
        type: 'spotColor',
        label: 'A·sin(x)',
        description: 'Color for the amplitude-only curve in the sine wave explorer',
        color: '#ef4444',
    },
    swFrequency: {
        defaultValue: 'frequency',
        type: 'spotColor',
        label: 'sin(ωx)',
        description: 'Color for the frequency-only curve in the sine wave explorer',
        color: '#3b82f6',
    },
    swFullWave: {
        defaultValue: 'fullWave',
        type: 'spotColor',
        label: 'A·sin(ωx + φ)',
        description: 'Color for the full wave curve in the sine wave explorer',
        color: '#22c55e',
    },
    scGroupA: {
        defaultValue: 'groupA',
        type: 'spotColor',
        label: 'Group A',
        description: 'Color for group A data points in the scatter plot demo',
        color: '#6366f1',
    },
    scGroupB: {
        defaultValue: 'groupB',
        type: 'spotColor',
        label: 'Group B',
        description: 'Color for group B data points in the scatter plot demo',
        color: '#f97316',
    },
    scTrend: {
        defaultValue: 'trend',
        type: 'spotColor',
        label: 'Trend Line',
        description: 'Color for the trend line in the scatter plot demo',
        color: '#94a3b8',
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

    // ─────────────────────────────────────────
    // NUMBER — Cartesian 3D Torus demo
    // ─────────────────────────────────────────
    torusMajorR: {
        defaultValue: 2,
        type: 'number',
        label: 'Major Radius',
        description: 'Distance from the centre of the tube to the centre of the torus',
        min: 0.5,
        max: 4,
        step: 0.1,
        color: '#EC4899',
    },
    torusMinorR: {
        defaultValue: 0.7,
        type: 'number',
        label: 'Minor Radius',
        description: 'Radius of the tube itself',
        min: 0.1,
        max: 2,
        step: 0.05,
        color: '#14B8A6',
    },

    // ─────────────────────────────────────────
    // NUMBER — Cartesian 3D Lissajous demo
    // ─────────────────────────────────────────
    lissFreqA: {
        defaultValue: 2,
        type: 'number',
        label: 'Freq A (x)',
        description: 'Frequency ratio in the X direction for the 3D Lissajous curve',
        min: 1,
        max: 7,
        step: 1,
        color: '#EF4444',
    },
    lissFreqB: {
        defaultValue: 3,
        type: 'number',
        label: 'Freq B (y)',
        description: 'Frequency ratio in the Y direction for the 3D Lissajous curve',
        min: 1,
        max: 7,
        step: 1,
        color: '#3B82F6',
    },
    lissFreqC: {
        defaultValue: 5,
        type: 'number',
        label: 'Freq C (z)',
        description: 'Frequency ratio in the Z direction for the 3D Lissajous curve',
        min: 1,
        max: 7,
        step: 1,
        color: '#22C55E',
    },

    // ─────────────────────────────────────────
    // SPOT COLOR — Cartesian 3D extra demos
    // ─────────────────────────────────────────
    c3dTorus: {
        defaultValue: 'torus',
        type: 'spotColor',
        label: 'Torus',
        description: 'Color for the 3D torus surface',
        color: '#8B5CF6',
    },
    c3dLissajous: {
        defaultValue: 'lissajous',
        type: 'spotColor',
        label: 'Lissajous',
        description: 'Color for the 3D Lissajous curve',
        color: '#F59E0B',
    },
    c3dDragPoint: {
        defaultValue: 'dragPoint',
        type: 'spotColor',
        label: 'Drag Point',
        description: 'Color for the draggable point handle',
        color: '#F59E0B',
    },
    c3dProjection: {
        defaultValue: 'projection',
        type: 'spotColor',
        label: 'Projection',
        description: 'Color for axis projections',
        color: '#94A3B8',
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

    // ── Node-Link Diagram Demo ────────────────────────────────────────────
    nlCharge: {
        defaultValue: -300,
        type: 'number',
        label: 'Charge Strength',
        description: 'Force charge strength — negative values repel nodes',
        unit: '',
        min: -800,
        max: -50,
        step: 10,
        color: '#6366F1',
    },
    nlDistance: {
        defaultValue: 100,
        type: 'number',
        label: 'Link Distance',
        description: 'Preferred link distance in pixels',
        unit: 'px',
        min: 30,
        max: 250,
        step: 5,
        color: '#EC4899',
    },
    nlHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Node-Link Highlight',
        description: 'Active highlight ID for the node-link diagram',
        color: '#6366F1',
    },

    // ── Math Tree Scaffold Demo ──────────────────────────────────────────
    mtFactorStep: {
        defaultValue: 1,
        type: 'number',
        label: 'Factor Tree Step',
        description: 'Current scaffolding step for the prime factorization tree',
        min: 1,
        max: 4,
        step: 1,
        color: '#3B82F6',
    },
    mtProbStep: {
        defaultValue: 1,
        type: 'number',
        label: 'Probability Tree Step',
        description: 'Current scaffolding step for the probability tree',
        min: 1,
        max: 3,
        step: 1,
        color: '#8B5CF6',
    },
    mtTreeGap: {
        defaultValue: 64,
        type: 'number',
        label: 'Tree Horizontal Gap',
        description: 'Horizontal spacing between sibling branches in the tree visualization',
        unit: 'px',
        min: 36,
        max: 120,
        step: 2,
        color: '#EC4899',
    },
    mtScaffoldPanel: {
        defaultValue: 'show',
        type: 'select',
        label: 'Scaffold Panel Visibility',
        description: 'Show or hide the text scaffold panel under the tree',
        options: ['show', 'hide'],
        color: '#14B8A6',
    },
    mtFactorTarget: {
        defaultValue: '84',
        type: 'select',
        label: 'Factor Tree Target',
        description: 'Choose which target number to factorize in the tree',
        options: ['84', '60'],
        color: '#6366F1',
    },

    // ── Geometric Diagram Demo ───────────────────────────────────────────
    gdRadius: {
        defaultValue: 90,
        type: 'number',
        label: 'Geometry Radius',
        description: 'Radius used by the geometric diagram component',
        min: 40,
        max: 150,
        step: 2,
        color: '#EC4899',
    },
    gdAngle: {
        defaultValue: 55,
        type: 'number',
        label: 'Geometry Angle',
        description: 'Central angle (degrees) used by the geometric diagram component',
        unit: '°',
        min: 5,
        max: 355,
        step: 1,
        color: '#14B8A6',
    },
    gdSides: {
        defaultValue: 6,
        type: 'number',
        label: 'Polygon Sides',
        description: 'Number of sides when diagram variant is polygon',
        min: 3,
        max: 12,
        step: 1,
        color: '#6366F1',
    },
    gdVariant: {
        defaultValue: 'circle',
        type: 'select',
        label: 'Geometry Variant',
        description: 'Current geometric diagram type',
        options: ['circle', 'triangle', 'polygon'],
        color: '#8B5CF6',
    },
    gdHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Geometry Highlight',
        description: 'Active highlight in the geometric diagram demo',
        color: '#8B5CF6',
    },

    // ── Venn Diagram Demo ────────────────────────────────────────────────
    vennLeftOnly: {
        defaultValue: 54,
        type: 'number',
        label: 'Car Only',
        description: 'Count in the Car-only region of the Venn diagram',
        min: 0,
        max: 200,
        step: 1,
        color: '#3B82F6',
    },
    vennOverlap: {
        defaultValue: 46,
        type: 'number',
        label: 'Both Sets',
        description: 'Count in the overlapping region of the Venn diagram',
        min: 0,
        max: 200,
        step: 1,
        color: '#8B5CF6',
    },
    vennRightOnly: {
        defaultValue: 83,
        type: 'number',
        label: 'Airplane Only',
        description: 'Count in the Airplane-only region of the Venn diagram',
        min: 0,
        max: 200,
        step: 1,
        color: '#EC4899',
    },
    vennNeither: {
        defaultValue: 17,
        type: 'number',
        label: 'Neither Set',
        description: 'Count outside both sets in the Venn diagram',
        min: 0,
        max: 200,
        step: 1,
        color: '#475569',
    },
    vennHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Venn Highlight',
        description: 'Active highlight for Venn diagram regions',
        color: '#8B5CF6',
    },

    // ── Number Line Demo ─────────────────────────────────────────────────
    nlMin: {
        defaultValue: -10,
        type: 'number',
        label: 'Number Line Min',
        description: 'Minimum bound for the number line',
        min: -30,
        max: 0,
        step: 1,
        color: '#6366F1',
    },
    nlMax: {
        defaultValue: 10,
        type: 'number',
        label: 'Number Line Max',
        description: 'Maximum bound for the number line',
        min: 1,
        max: 30,
        step: 1,
        color: '#14B8A6',
    },
    nlStep: {
        defaultValue: 1,
        type: 'number',
        label: 'Number Line Step',
        description: 'Step spacing between ticks on the number line',
        min: 1,
        max: 10,
        step: 1,
        color: '#F59E0B',
    },
    nlPoint: {
        defaultValue: 2,
        type: 'number',
        label: 'Number Line Point',
        description: 'Current highlighted point value on the number line',
        min: -30,
        max: 30,
        step: 1,
        color: '#EC4899',
    },

    // ─────────────────────────────────────────
    // LINKED HIGHLIGHT — Circle Anatomy demo (Cartesian2D hover)
    // ─────────────────────────────────────────
    circleHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Circle Anatomy Highlight',
        description: 'Active highlight ID for the circle anatomy demo (radius | diameter | center | circumference | area)',
        color: '#3b82f6',
    },

    // ─────────────────────────────────────────
    // NUMBER — Circle radius (scrubble)
    // ─────────────────────────────────────────
    circleRadius: {
        defaultValue: 2,
        type: 'number',
        label: 'Circle Radius',
        description: 'Radius of the circle in the anatomy demo',
        unit: '',
        min: 0.5,
        max: 4,
        step: 0.1,
        color: '#ef4444',
    },

    // ─────────────────────────────────────────
    // SYMMETRY DRAWING DEMO — Line of Symmetry
    // ─────────────────────────────────────────
    symLineType: {
        defaultValue: 'y-axis',
        type: 'select',
        label: 'Symmetry Line Type',
        description: 'Which line of symmetry to reflect across',
        options: ['y-axis', 'x-axis', 'y = x', 'y = -x', 'custom'],
        color: '#D946EF',
    },
    symSlope: {
        defaultValue: 1,
        type: 'number',
        label: 'Line Slope',
        description: 'Slope (m) for the custom line of symmetry y = mx + b',
        unit: '',
        min: -5,
        max: 5,
        step: 0.1,
        color: '#64748b',
    },
    symIntercept: {
        defaultValue: 0,
        type: 'number',
        label: 'Line Intercept',
        description: 'Y-intercept (b) for the custom line of symmetry y = mx + b',
        unit: '',
        min: -4,
        max: 4,
        step: 0.1,
        color: '#64748b',
    },
    symOrigColor: {
        defaultValue: 'original',
        type: 'spotColor',
        label: 'Original Triangle',
        description: 'Color label for the original triangle',
        color: '#3b82f6',
    },
    symReflColor: {
        defaultValue: 'reflected',
        type: 'spotColor',
        label: 'Reflected Triangle',
        description: 'Color label for the reflected triangle',
        color: '#ef4444',
    },
    symConnColor: {
        defaultValue: 'connection',
        type: 'spotColor',
        label: 'Connection Lines',
        description: 'Color label for the perpendicular connection lines',
        color: '#a855f7',
    },
    symLineColor: {
        defaultValue: 'line',
        type: 'spotColor',
        label: 'Line of Symmetry',
        description: 'Color label for the line of symmetry itself',
        color: '#64748b',
    },

    // ─────────────────────────────────────────
    // SYMMETRY DRAWING DEMO — Function Symmetry
    // ─────────────────────────────────────────
    symFnType: {
        defaultValue: 'x²',
        type: 'select',
        label: 'Function Type',
        description: 'Which function to analyze for even/odd symmetry',
        options: ['x²', 'x³', '|x|', 'sin(x)', 'cos(x)'],
        color: '#D946EF',
    },
    symProbeX: {
        defaultValue: 2,
        type: 'number',
        label: 'Probe X',
        description: 'X position of the symmetry probe point',
        unit: '',
        min: 0.5,
        max: 4,
        step: 0.1,
        color: '#8b5cf6',
    },
    symEvenColor: {
        defaultValue: 'even',
        type: 'spotColor',
        label: 'Even Symmetry',
        description: 'Color label for even function symmetry',
        color: '#22c55e',
    },
    symOddColor: {
        defaultValue: 'odd',
        type: 'spotColor',
        label: 'Odd Symmetry',
        description: 'Color label for odd function symmetry',
        color: '#f59e0b',
    },
    symFnOrigColor: {
        defaultValue: 'f(x)',
        type: 'spotColor',
        label: 'f(x) Curve',
        description: 'Color label for the original function curve',
        color: '#3b82f6',
    },
    symFnMirrorColor: {
        defaultValue: 'f(-x)',
        type: 'spotColor',
        label: 'f(-x) Curve',
        description: 'Color label for the mirrored function curve',
        color: '#ef4444',
    },

    // ─────────────────────────────────────────
    // LINE DRAWING DEMO — Cartesian 2D
    // ─────────────────────────────────────────
    ldSnapToGrid: {
        defaultValue: 'on',
        type: 'select',
        label: 'Snap to Grid',
        description: 'Whether placed points snap to integer grid positions',
        options: ['on', 'off'],
        color: '#10B981',
    },
    ldDrawMode: {
        defaultValue: 'lines',
        type: 'select',
        label: 'Draw Mode',
        description: 'Drawing mode: open polyline or closed polygon',
        options: ['lines', 'polygon'],
        color: '#8B5CF6',
    },
    ldLineColor: {
        defaultValue: 'segments',
        type: 'spotColor',
        label: 'Line Segments',
        description: 'Color label for drawn line segments',
        color: '#3b82f6',
    },
    ldPointColor: {
        defaultValue: 'vertices',
        type: 'spotColor',
        label: 'Vertices',
        description: 'Color label for placed vertex points',
        color: '#ef4444',
    },
    ldMidpointColor: {
        defaultValue: 'midpoints',
        type: 'spotColor',
        label: 'Midpoints',
        description: 'Color label for segment midpoints',
        color: '#f59e0b',
    },
    ldClosingColor: {
        defaultValue: 'closing edge',
        type: 'spotColor',
        label: 'Closing Edge',
        description: 'Color label for the polygon closing edge',
        color: '#a855f7',
    },

    // ─────────────────────────────────────────
    // LAYOUT DEMO
    // ─────────────────────────────────────────
    slideIndex: {
        defaultValue: 0,
        type: 'number',
        label: 'Slide Index',
        description: 'Active slide index in the SlideLayout demo',
        min: 0,
        max: 3,
        step: 1,
    },
    layoutDemoStep: {
        defaultValue: 0,
        type: 'number',
        label: 'Layout Demo Step',
        description: 'Active scroll step index in the ScrollytellingLayout demo',
        min: 0,
        max: 3,
        step: 1,
    },

    // ─────────────────────────────────────────
    // STEP LAYOUT DEMO
    // ─────────────────────────────────────────
    stepLayoutProgress: {
        defaultValue: 0,
        type: 'number',
        label: 'Step Progress',
        description: '0-based index of the currently revealed step in the StepLayout demo',
        min: 0,
        max: 4,
        step: 1,
    },
    stepPeriodAnswer: {
        defaultValue: '',
        type: 'text',
        label: 'Period Answer',
        description: 'Student answer for the period/frequency challenge in the StepLayout demo',
        placeholder: '???',
        correctAnswer: '0.5',
        color: '#3B82F6',
    },

    // ─────────────────────────────────────────
    // MATRIX VISUALIZATION DEMO
    // ─────────────────────────────────────────
    matrixScale: {
        defaultValue: 1,
        type: 'number',
        label: 'Matrix Scale',
        description: 'Scalar multiplier applied to the matrix entries',
        min: -3,
        max: 3,
        step: 0.5,
        color: '#4F46E5',
    },
    matrixRows: {
        defaultValue: 3,
        type: 'number',
        label: 'Matrix Rows',
        description: 'Number of rows in the generated matrix',
        min: 1,
        max: 6,
        step: 1,
        color: '#06B6D4',
    },
    matrixCols: {
        defaultValue: 3,
        type: 'number',
        label: 'Matrix Columns',
        description: 'Number of columns in the generated matrix',
        min: 1,
        max: 6,
        step: 1,
        color: '#10B981',
    },
    matrixColorScheme: {
        defaultValue: 'heatmap',
        type: 'select',
        label: 'Color Scheme',
        description: 'How matrix cells are colored',
        options: ['none', 'heatmap', 'diverging', 'categorical'],
        color: '#D946EF',
    },
    matrixShowIndices: {
        defaultValue: true,
        type: 'boolean',
        label: 'Show Indices',
        description: 'Whether to display row and column indices',
    },
    matrixHighlightRow: {
        defaultValue: -1,
        type: 'number',
        label: 'Highlight Row',
        description: 'Row index to highlight (-1 for none)',
        min: -1,
        max: 5,
        step: 1,
        color: '#FBBF24',
    },
    matrixHighlightCol: {
        defaultValue: -1,
        type: 'number',
        label: 'Highlight Column',
        description: 'Column index to highlight (-1 for none)',
        min: -1,
        max: 5,
        step: 1,
        color: '#FBBF24',
    },
    matrixDeterminantAnswer: {
        defaultValue: '',
        type: 'text',
        label: 'Determinant Answer',
        description: 'Student answer for the determinant question',
        placeholder: '???',
        correctAnswer: '-2',
        color: '#3B82F6',
    },

    // ─────────────────────────────────────────
    // TABLE COMPONENT DEMO
    // ─────────────────────────────────────────
    tableAccentColor: {
        defaultValue: 'tableAccent',
        type: 'spotColor',
        label: 'Table Accent',
        description: 'Accent colour for the interactive table demo',
        color: '#6366f1',
    },
    tableRadius: {
        defaultValue: 5,
        type: 'number',
        label: 'Table Radius',
        description: 'Radius value displayed inside a table cell',
        unit: 'cm',
        min: 1,
        max: 20,
        step: 0.5,
        color: '#ef4444',
    },
    tableHeight: {
        defaultValue: 10,
        type: 'number',
        label: 'Table Height',
        description: 'Height value displayed inside a table cell',
        unit: 'cm',
        min: 1,
        max: 30,
        step: 1,
        color: '#3b82f6',
    },
    tableSpeed: {
        defaultValue: 3,
        type: 'number',
        label: 'Table Speed',
        description: 'Speed value displayed inside a table cell',
        unit: 'm/s',
        min: 0,
        max: 10,
        step: 0.5,
        color: '#22c55e',
    },
    tableUnitAnswer: {
        defaultValue: '',
        type: 'text',
        label: 'Table Unit Answer',
        description: 'Student answer for the area unit cloze input inside a table cell',
        placeholder: '???',
        correctAnswer: 'cm²',
        color: '#8b5cf6',
    },
    tableHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Table Highlight',
        description: 'Active highlight for table row coordination',
        color: '#6366f1',
    },
    tableMeasurement: {
        defaultValue: 'length',
        type: 'select',
        label: 'Table Measurement',
        description: 'Current measurement type shown in the table',
        options: ['length', 'area', 'volume'],
        color: '#f59e0b',
    },

    // ─────────────────────────────────────────
    // DATA VISUALIZATION DEMO
    // ─────────────────────────────────────────
    dvChartType: {
        defaultValue: 'bar',
        type: 'select',
        label: 'Chart Type',
        description: 'Active chart type for the data visualization demo',
        options: ['bar', 'line', 'area', 'pie', 'donut', 'scatter'],
        color: '#6366F1',
    },
    dvScaleFactor: {
        defaultValue: 1,
        type: 'number',
        label: 'Scale Factor',
        description: 'Multiplier applied to all data values to explore scaling',
        min: 0.1,
        max: 3,
        step: 0.1,
        color: '#F59E0B',
    },
    dvCategoryA: {
        defaultValue: 42,
        type: 'number',
        label: 'Physics',
        description: 'Data value for the Physics category',
        min: 0,
        max: 100,
        step: 1,
        color: '#6366F1',
    },
    dvCategoryB: {
        defaultValue: 28,
        type: 'number',
        label: 'Chemistry',
        description: 'Data value for the Chemistry category',
        min: 0,
        max: 100,
        step: 1,
        color: '#F43F5E',
    },
    dvCategoryC: {
        defaultValue: 65,
        type: 'number',
        label: 'Biology',
        description: 'Data value for the Biology category',
        min: 0,
        max: 100,
        step: 1,
        color: '#22C55E',
    },
    dvCategoryD: {
        defaultValue: 53,
        type: 'number',
        label: 'Math',
        description: 'Data value for the Math category',
        min: 0,
        max: 100,
        step: 1,
        color: '#F59E0B',
    },
    dvCategoryE: {
        defaultValue: 37,
        type: 'number',
        label: 'English',
        description: 'Data value for the English category',
        min: 0,
        max: 100,
        step: 1,
        color: '#3B82F6',
    },
    dvShowValues: {
        defaultValue: false,
        type: 'boolean',
        label: 'Show Values',
        description: 'Whether to show data value labels on the chart',
    },
    dvAnimate: {
        defaultValue: true,
        type: 'boolean',
        label: 'Animate',
        description: 'Whether to animate the chart on mount',
    },
    dvCurve: {
        defaultValue: 'smooth',
        type: 'select',
        label: 'Curve Type',
        description: 'Curve interpolation for line and area charts',
        options: ['linear', 'smooth', 'step'],
        color: '#8B5CF6',
    },

    // ─────────────────────────────────────────
    // DESMOS DEMO VARIABLES
    // ─────────────────────────────────────────
    desmosEquation: {
        defaultValue: 'y = a_1 \\sin(a_2 x)',
        type: 'text',
        label: 'Desmos Equation',
        description: 'Equation for the reactive Desmos graph',
    },
    desmosAmp: {
        defaultValue: 1.5,
        type: 'number',
        label: 'Desmos Amplitude',
        description: 'Amplitude parameter for the Desmos graph',
        min: 0.1,
        max: 5,
        step: 0.1,
        color: '#ef4444',
    },
    desmosFreq: {
        defaultValue: 2,
        type: 'number',
        label: 'Desmos Frequency',
        description: 'Frequency parameter for the Desmos graph',
        min: 0.1,
        max: 5,
        step: 0.1,
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
