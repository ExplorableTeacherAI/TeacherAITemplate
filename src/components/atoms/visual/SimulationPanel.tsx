/**
 * SimulationPanel
 * ===============
 * A reusable simulation container with built-in controls (sliders, buttons,
 * toggles, selects) that bind to the global variable store.
 *
 * Works exactly like every other atom: define your variables in
 * `src/data/variables.ts`, then reference them via `controls` prop.
 *
 * @example
 * ```tsx
 * <SimulationPanel
 *     title="Projectile Motion"
 *     controls={[
 *         { varName: 'velocity', type: 'slider', label: 'Velocity', min: 0, max: 50, step: 1, unit: 'm/s' },
 *         { varName: 'angle', type: 'slider', label: 'Angle', min: 0, max: 90, step: 1, unit: '°' },
 *         { varName: 'showTrail', type: 'toggle', label: 'Show Trail' },
 *         { varName: 'velocity', type: 'button', label: 'Reset', value: 20 },
 *     ]}
 *     controlsPosition="right"
 * >
 *     <MySimulationCanvas />
 * </SimulationPanel>
 * ```
 */

import { type ReactNode, type CSSProperties, useCallback, useMemo, useId } from "react";
import { useVar, useSetVar } from "@/stores/variableStore";
import { Slider } from "@/components/atoms/ui/slider";
import { Label } from "@/components/atoms/ui/label";
import { Button } from "@/components/atoms/ui/button";
import { Switch } from "@/components/atoms/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/atoms/ui/select";
import {
    RotateCcw,
    Play,
    Pause,
    Zap,
    RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Control Definitions ───────────────────────────────────────────────

export interface SliderControl {
    type: "slider";
    varName: string;
    label: string;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    /** Optional color accent for the slider track */
    color?: string;
    /** Custom value formatter, e.g. (v) => v.toFixed(2) */
    formatValue?: (v: number) => string;
}

export interface ToggleControl {
    type: "toggle";
    varName: string;
    label: string;
    color?: string;
}

export interface ButtonControl {
    type: "button";
    varName: string;
    label: string;
    /** Value to set when clicked */
    value: number | string | boolean;
    /** Visual variant */
    variant?: "default" | "outline" | "secondary" | "destructive" | "ghost";
    /** Icon */
    icon?: "reset" | "play" | "pause" | "zap" | "refresh" | "none";
    color?: string;
}

export interface SelectControl {
    type: "select";
    varName: string;
    label: string;
    options: { label: string; value: string }[];
    color?: string;
}

export interface ButtonGroupControl {
    type: "button-group";
    label: string;
    buttons: ButtonControl[];
}

export type SimulationControl =
    | SliderControl
    | ToggleControl
    | ButtonControl
    | SelectControl
    | ButtonGroupControl;

// ─── Panel Props ────────────────────────────────────────────────────────

export interface SimulationPanelProps {
    /** Panel title shown above the controls */
    title?: string;
    /** Optional description / subtitle */
    description?: string;
    /** The visualization / canvas rendered in the main area */
    children: ReactNode;
    /** Array of controls bound to global variables */
    controls: SimulationControl[];
    /**
     * Where to render the control panel relative to the canvas.
     * `"bottom"` places controls below; `"right"` places them beside.
     * @default "bottom"
     */
    controlsPosition?: "bottom" | "right" | "left" | "top";
    /** Extra className on the outer wrapper */
    className?: string;
    /** Height for the simulation canvas area */
    height?: number | string;
    /** Accent color applied to the panel header bar */
    accentColor?: string;
    /** Width of side control panel when controlsPosition is left/right */
    controlsWidth?: "sm" | "md" | "lg";
    /** Show a reset-all button that sets every control var to its first value */
    showResetAll?: boolean;
    /** Custom reset handler (overrides default) */
    onResetAll?: () => void;
}

// ─── Icon helper ────────────────────────────────────────────────────────

function ControlIcon({ icon }: { icon?: string }) {
    switch (icon) {
        case "reset":
            return <RotateCcw className="h-4 w-4" />;
        case "play":
            return <Play className="h-4 w-4" />;
        case "pause":
            return <Pause className="h-4 w-4" />;
        case "zap":
            return <Zap className="h-4 w-4" />;
        case "refresh":
            return <RefreshCw className="h-4 w-4" />;
        default:
            return null;
    }
}

// ─── Individual Control Renderers ───────────────────────────────────────

function SliderControlRenderer({ ctrl }: { ctrl: SliderControl }) {
    const value = useVar(ctrl.varName, ctrl.min) as number;
    const setVar = useSetVar();
    const id = useId();

    const displayValue = useMemo(() => {
        if (ctrl.formatValue) return ctrl.formatValue(value);
        // Auto-format based on step
        const decimals = ctrl.step && ctrl.step < 1
            ? Math.max(0, -Math.floor(Math.log10(ctrl.step)))
            : 0;
        return value.toFixed(decimals);
    }, [value, ctrl.formatValue, ctrl.step]);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label htmlFor={id} className="text-sm font-medium">{ctrl.label}</Label>
                <span className="text-xs font-mono text-muted-foreground tabular-nums">
                    {displayValue}{ctrl.unit ? ` ${ctrl.unit}` : ""}
                </span>
            </div>
            <Slider
                id={id}
                min={ctrl.min}
                max={ctrl.max}
                step={ctrl.step ?? 1}
                value={[value]}
                onValueChange={([v]) => setVar(ctrl.varName, v)}
                className={cn(
                    "w-full",
                    ctrl.color && "[&_[role=slider]]:border-current [&_.bg-primary]:bg-current",
                )}
                style={ctrl.color ? ({ color: ctrl.color } as CSSProperties) : undefined}
            />
        </div>
    );
}

function ToggleControlRenderer({ ctrl }: { ctrl: ToggleControl }) {
    const value = useVar(ctrl.varName, false) as boolean;
    const setVar = useSetVar();
    const id = useId();

    return (
        <div className="flex items-center justify-between">
            <Label htmlFor={id} className="text-sm font-medium">{ctrl.label}</Label>
            <Switch
                id={id}
                checked={value}
                onCheckedChange={(v) => setVar(ctrl.varName, v)}
            />
        </div>
    );
}

function ButtonControlRenderer({ ctrl }: { ctrl: ButtonControl }) {
    const setVar = useSetVar();

    return (
        <Button
            variant={ctrl.variant ?? "outline"}
            size="sm"
            onClick={() => setVar(ctrl.varName, ctrl.value)}
            className="gap-1.5"
        >
            <ControlIcon icon={ctrl.icon} />
            {ctrl.label}
        </Button>
    );
}

function SelectControlRenderer({ ctrl }: { ctrl: SelectControl }) {
    const value = useVar(ctrl.varName, ctrl.options[0]?.value ?? "") as string;
    const setVar = useSetVar();
    const id = useId();

    return (
        <div className="space-y-2">
            <Label htmlFor={id} className="text-sm font-medium">{ctrl.label}</Label>
            <Select value={value} onValueChange={(v) => setVar(ctrl.varName, v)}>
                <SelectTrigger id={id} className="w-full h-9">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {ctrl.options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

function ButtonGroupControlRenderer({ ctrl }: { ctrl: ButtonGroupControl }) {
    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium">{ctrl.label}</Label>
            <div className="flex flex-wrap gap-2">
                {ctrl.buttons.map((btn, i) => (
                    <ButtonControlRenderer key={i} ctrl={btn} />
                ))}
            </div>
        </div>
    );
}

// ─── Control Dispatcher ─────────────────────────────────────────────────

function ControlRenderer({ control }: { control: SimulationControl }) {
    switch (control.type) {
        case "slider":
            return <SliderControlRenderer ctrl={control} />;
        case "toggle":
            return <ToggleControlRenderer ctrl={control} />;
        case "button":
            return <ButtonControlRenderer ctrl={control} />;
        case "select":
            return <SelectControlRenderer ctrl={control} />;
        case "button-group":
            return <ButtonGroupControlRenderer ctrl={control} />;
    }
}

// ─── Main Component ─────────────────────────────────────────────────────

export function SimulationPanel({
    title,
    description,
    children,
    controls,
    controlsPosition = "bottom",
    className,
    height = 400,
    accentColor = "#6366f1",
    controlsWidth = "md",
    showResetAll = false,
    onResetAll,
}: SimulationPanelProps) {
    const setVar = useSetVar();

    const handleResetAll = useCallback(() => {
        if (onResetAll) {
            onResetAll();
            return;
        }
        // Reset every control variable to its default value
        for (const ctrl of controls) {
            if (ctrl.type === "slider") {
                setVar(ctrl.varName, ctrl.min);
            } else if (ctrl.type === "toggle") {
                setVar(ctrl.varName, false);
            } else if (ctrl.type === "select") {
                setVar(ctrl.varName, ctrl.options[0]?.value ?? "");
            } else if (ctrl.type === "button-group") {
                // skip – button-groups are actions, not state holders
            }
        }
    }, [controls, onResetAll, setVar]);

    const isHorizontal = controlsPosition === "right" || controlsPosition === "left";
    const controlsWidthClass = controlsWidth === "sm"
        ? "w-56"
        : controlsWidth === "lg"
            ? "w-80"
            : "w-72";

    // ── Controls panel ──────────────────────────────────────

    const controlsPanel = (
        <div
            className={cn(
                "flex flex-col gap-4 p-4 bg-card/80 backdrop-blur-sm rounded-xl",
                isHorizontal ? `${controlsWidthClass} shrink-0` : "w-full",
            )}
        >
            {/* Header */}
            {(title || description) && (
                <div className="space-y-1">
                    {title && (
                        <div className="flex items-center gap-2">
                            <div
                                className="w-1 h-5 rounded-full"
                                style={{ backgroundColor: accentColor }}
                            />
                            <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
                        </div>
                    )}
                    {description && (
                        <p className="text-xs text-muted-foreground pl-3">{description}</p>
                    )}
                </div>
            )}

            {/* Controls */}
            <div className="flex flex-col gap-4">
                {controls.map((ctrl, i) => (
                    <ControlRenderer key={i} control={ctrl} />
                ))}
            </div>

            {/* Reset all */}
            {showResetAll && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetAll}
                    className="gap-1.5 self-start mt-1"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset All
                </Button>
            )}
        </div>
    );

    // ── Canvas area ─────────────────────────────────────────

    const canvasArea = (
        <div
            className="flex-1 min-w-0 rounded-xl overflow-hidden bg-card"
            style={{ height: typeof height === "number" ? `${height}px` : height }}
        >
            {children}
        </div>
    );

    // ── Layout ──────────────────────────────────────────────

    if (isHorizontal) {
        return (
            <div
                className={cn(
                    "flex gap-4",
                    controlsPosition === "left" ? "flex-row" : "flex-row",
                    className,
                )}
            >
                {controlsPosition === "left" ? (
                    <>
                        {controlsPanel}
                        {canvasArea}
                    </>
                ) : (
                    <>
                        {canvasArea}
                        {controlsPanel}
                    </>
                )}
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col gap-4", className)}>
            {controlsPosition === "top" ? (
                <>
                    {controlsPanel}
                    {canvasArea}
                </>
            ) : (
                <>
                    {canvasArea}
                    {controlsPanel}
                </>
            )}
        </div>
    );
}
