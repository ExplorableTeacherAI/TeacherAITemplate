import React, { useMemo } from 'react';
import { hexToRgba, parseRgba, BRAND_GREEN } from './editorColors';

interface BgColorPickerProps {
    /** The current rgba background color value. */
    bgColor: string;
    /** Called when the user changes the background color rgba value. */
    onChange: (rgba: string) => void;
    /** Hex color presets to show as swatches. */
    presets: string[];
    /** Default opacity when deriving bg from a hex swatch (0–1). */
    defaultOpacity?: number;
    /** Optional label override. Defaults to "Background Color". */
    label?: string;
}

/**
 * Shared background-color picker matching the foreground-color picker design:
 *   • Color preset swatches (solid hex colors)
 *   • Native color picker + hex text input
 *   • Opacity slider (0–100 %)
 *
 * The final value is always an `rgba(…)` string stored via `onChange`.
 */
export const BgColorPicker: React.FC<BgColorPickerProps> = ({
    bgColor,
    onChange,
    presets,
    defaultOpacity = 0.15,
    label = 'Background Color',
}) => {
    // Decompose current bgColor into hex + alpha for the controls
    const parsed = useMemo(() => parseRgba(bgColor), [bgColor]);
    const baseHex = parsed?.hex ?? '#3B82F6';
    const alpha = parsed?.alpha ?? defaultOpacity;

    /** Update only the base hex, keeping current alpha. */
    const setBaseHex = (hex: string) => {
        onChange(hexToRgba(hex, alpha));
    };

    /** Update only the alpha, keeping current base hex. */
    const setAlpha = (a: number) => {
        onChange(hexToRgba(baseHex, a));
    };

    // Check if a swatch matches the current base hex
    const isSelected = (preset: string) =>
        preset.toLowerCase() === baseHex.toLowerCase();

    return (
        <div>
            <label className="block text-sm font-medium mb-2">{label}</label>

            {/* Swatch grid */}
            <div className="flex flex-wrap gap-2 mb-2">
                {presets.map((preset) => (
                    <button
                        key={preset}
                        type="button"
                        onClick={() => setBaseHex(preset)}
                        className="w-7 h-7 rounded-full border-2 transition-all duration-150 hover:scale-110"
                        style={{
                            backgroundColor: hexToRgba(preset, alpha),
                            borderColor: isSelected(preset) ? preset : 'transparent',
                            boxShadow: isSelected(preset) ? `0 0 0 2px ${preset}40` : 'none',
                        }}
                        title={preset}
                    />
                ))}
            </div>

            {/* Color picker + hex input */}
            <div className="flex items-center gap-2 mb-2">
                <input
                    type="color"
                    value={baseHex}
                    onChange={(e) => setBaseHex(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                />
                <input
                    type="text"
                    value={baseHex}
                    onChange={(e) => {
                        const v = e.target.value;
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setBaseHex(v);
                    }}
                    className="flex-1 px-3 py-1.5 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2 font-mono"
                    style={{ '--tw-ring-color': BRAND_GREEN } as React.CSSProperties}
                    placeholder="#3B82F6"
                    maxLength={7}
                />
            </div>

            {/* Opacity slider */}
            <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-14 shrink-0">
                    Opacity
                </span>
                <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(alpha * 100)}
                    onChange={(e) => setAlpha(Number(e.target.value) / 100)}
                    className="flex-1 h-1.5 rounded-full appearance-none bg-muted cursor-pointer accent-current"
                    style={{ color: baseHex }}
                />
                <span className="text-xs font-mono text-muted-foreground w-10 text-right">
                    {Math.round(alpha * 100)}%
                </span>
            </div>

            {/* Preview swatch of the final rgba value */}
            <div className="mt-2 flex items-center gap-2">
                <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: bgColor }}
                />
                <span className="text-xs font-mono text-muted-foreground truncate">
                    {bgColor}
                </span>
            </div>
        </div>
    );
};

export default BgColorPicker;
