/**
 * Shared color constants for all editor modals.
 *
 * Instead of defining color palettes and accent colors inside each modal,
 * import them from this file to keep everything consistent and easy to update.
 */

// ─── Brand / Accent Colors ──────────────────────────────────────────────────

/** Primary brand green used for "Apply Changes" buttons and active tab indicators. */
export const BRAND_GREEN = '#3cc499';

/** Secondary accent (violet) used for inline formula editor. */
export const ACCENT_VIOLET = '#8B5CF6';

// ─── Color Picker Presets ────────────────────────────────────────────────────

/**
 * Standard 10-color palette used by most modals for the text / foreground
 * color picker (e.g., Tooltip, Toggle, Trigger, Hyperlink, ClozeChoice, ClozeInput).
 */
export const COLOR_PRESETS_STANDARD = [
    '#D81B60', // Pink / Red
    '#E53935', // Red
    '#F57C00', // Orange
    '#FDD835', // Yellow
    '#43A047', // Green
    '#00897B', // Teal
    '#1E88E5', // Blue
    '#3B82F6', // Light Blue
    '#5E35B1', // Purple
    '#546E7A', // Blue Grey
];

/**
 * Extended 16-color palette used by SpotColor and LinkedHighlight editors
 * that offer a wider range of choices.
 */
export const COLOR_PRESETS_EXTENDED = [
    '#D81B60', // Pink / Red
    '#E53935', // Red
    '#ef4444', // Light Red
    '#F57C00', // Orange
    '#f97316', // Orange (lighter)
    '#FDD835', // Yellow
    '#43A047', // Green
    '#3cc499', // Brand Green
    '#00897B', // Teal
    '#06b6d4', // Cyan
    '#1E88E5', // Blue
    '#3b82f6', // Light Blue
    '#5E35B1', // Purple
    '#a855f7', // Violet
    '#6D4C41', // Brown
    '#546E7A', // Blue Grey
];

/**
 * Color presets used by the equation-editor color-map (named term → color).
 * Each entry has a human-readable name and a hex value.
 */
export const COLOR_PRESETS_NAMED = [
    { name: 'Red', value: '#ef4444' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#3cc499' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Indigo', value: '#6366f1' },
];

// ─── Background Color Utilities ─────────────────────────────────────────────

/** Default background opacity used when deriving bg from a hex color. */
export const DEFAULT_BG_OPACITY = 0.15;

/** Higher opacity used by Cloze-style editors. */
export const CLOZE_BG_OPACITY = 0.35;

/** Helper: Convert a hex color to an `rgba(…, alpha)` string. */
export function hexToRgba(hex: string, alpha: number): string {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Parse an `rgba(r, g, b, a)` string back into `{ hex, alpha }`.
 * Returns null if the string is not valid rgba.
 */
export function parseRgba(rgba: string): { hex: string; alpha: number } | null {
    const m = rgba.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
    if (!m) return null;
    const r = parseInt(m[1], 10);
    const g = parseInt(m[2], 10);
    const b = parseInt(m[3], 10);
    const a = m[4] !== undefined ? parseFloat(m[4]) : 1;
    const hex = '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
    return { hex, alpha: a };
}

