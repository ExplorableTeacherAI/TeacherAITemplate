import { useEffect, useState, useRef } from "react";
import { Mafs, Coordinates, Plot, Point, Line, useMovablePoint, Circle } from "mafs";
import { useVar, useSetVar } from "@/stores/variableStore";

export interface MafsInteractiveProps {
    /** Controlled amplitude value (0-4) */
    amplitude?: number;
    /** Controlled frequency value (0.1-2) */
    frequency?: number;
    /** Callback when amplitude changes (from dragging the point) */
    onAmplitudeChange?: (value: number) => void;
    /** Callback when frequency changes (from dragging the point) */
    onFrequencyChange?: (value: number) => void;
    /**
     * Variable name in the global store that holds the currently active
     * highlight ID.  Used with `InlineLinkedHighlight` components.
     */
    highlightVarName?: string;
}

/**
 * Interactive Mafs visualization with draggable points
 * Supports both controlled and uncontrolled modes:
 * - Controlled: Pass amplitude/frequency props and onChange callbacks
 * - Uncontrolled: Component manages its own state
 * Also supports bidirectional highlighting with InlineLinkedHighlight via highlightVarName
 */
export function MafsInteractive({
    amplitude: controlledAmplitude,
    frequency: controlledFrequency,
    onAmplitudeChange,
    onFrequencyChange,
    highlightVarName,
}: MafsInteractiveProps = {}) {
    // Read the active highlight ID from the global variable store
    const highlightActiveId = useVar(highlightVarName ?? '', '') as string;
    const setVar = useSetVar();

    // Internal state for uncontrolled mode
    const [internalAmplitude, setInternalAmplitude] = useState(2);
    const [internalFrequency, setInternalFrequency] = useState(1);

    // Refs to track last known values and prevent feedback loops
    const lastExternalAmp = useRef(controlledAmplitude);
    const lastExternalFreq = useRef(controlledFrequency);
    const lastPointAmp = useRef(2);
    const lastPointFreq = useRef(1);

    // Determine if we're in controlled mode
    const isControlled = controlledAmplitude !== undefined || controlledFrequency !== undefined;

    // Use controlled values if provided, otherwise use internal state
    const amp = controlledAmplitude ?? internalAmplitude;
    const freq = controlledFrequency ?? internalFrequency;

    // Movable point for amplitude
    const amplitudePoint = useMovablePoint([0, amp], {
        constrain: "vertical",
        color: "#ef4444",
    });

    // Movable point for frequency  
    const frequencyPoint = useMovablePoint([freq * 2, 0], {
        constrain: "horizontal",
        color: "#3b82f6",
    });

    // Calculate values from point positions
    const pointAmp = Math.abs(amplitudePoint.point[1]);
    const pointFreq = Math.max(0.1, Math.abs(frequencyPoint.point[0]) / 2);

    // Sync from external control to points (when slider changes)
    useEffect(() => {
        if (controlledAmplitude !== undefined &&
            Math.abs(controlledAmplitude - lastExternalAmp.current!) > 0.001) {
            // External value changed, update the point
            amplitudePoint.setPoint([0, controlledAmplitude]);
            lastExternalAmp.current = controlledAmplitude;
            lastPointAmp.current = controlledAmplitude;
        }
    }, [controlledAmplitude]);

    useEffect(() => {
        if (controlledFrequency !== undefined &&
            Math.abs(controlledFrequency - lastExternalFreq.current!) > 0.001) {
            // External value changed, update the point
            frequencyPoint.setPoint([controlledFrequency * 2, 0]);
            lastExternalFreq.current = controlledFrequency;
            lastPointFreq.current = controlledFrequency;
        }
    }, [controlledFrequency]);

    // Sync from points to external control (when point is dragged)
    useEffect(() => {
        if (Math.abs(pointAmp - lastPointAmp.current) > 0.001) {
            lastPointAmp.current = pointAmp;
            if (onAmplitudeChange) {
                onAmplitudeChange(pointAmp);
            } else {
                setInternalAmplitude(pointAmp);
            }
        }
    }, [pointAmp]);

    useEffect(() => {
        if (Math.abs(pointFreq - lastPointFreq.current) > 0.001) {
            lastPointFreq.current = pointFreq;
            if (onFrequencyChange) {
                onFrequencyChange(pointFreq);
            } else {
                setInternalFrequency(pointFreq);
            }
        }
    }, [pointFreq]);

    // Check if elements are highlighted via the variable store
    const isAmplitudeHighlighted = highlightActiveId === "amplitude";
    const isFrequencyHighlighted = highlightActiveId === "frequency";
    const hasActiveHighlight = Boolean(highlightActiveId);

    // Handle hover events for the amplitude control area
    const handleAmplitudeAreaEnter = () => {
        if (highlightVarName) setVar(highlightVarName, "amplitude");
    };

    // Handle hover events for the frequency control area
    const handleFrequencyAreaEnter = () => {
        if (highlightVarName) setVar(highlightVarName, "frequency");
    };

    const handleAreaLeave = () => {
        if (highlightVarName) setVar(highlightVarName, '');
    };

    return (
        <div className="w-full overflow-hidden rounded-xl relative">
            <Mafs height={400} viewBox={{ x: [-5, 5], y: [-4, 4] }}>
                <Coordinates.Cartesian />

                {/* Dynamic sine wave based on control points */}
                <Plot.OfX
                    y={(x) => amp * Math.sin(freq * x)}
                    color="#22c55e"
                    weight={3}
                />

                {/* Reference lines for amplitude - highlighted when amplitude is active */}
                <Line.Segment
                    point1={[0, -amp]}
                    point2={[0, amp]}
                    color="#ef4444"
                    opacity={isAmplitudeHighlighted ? 0.8 : (hasActiveHighlight ? 0.2 : 0.3)}
                    style="dashed"
                    weight={isAmplitudeHighlighted ? 3 : 1}
                />

                {/* Amplitude markers */}
                <Point
                    x={0}
                    y={amp}
                    color="#ef4444"
                    opacity={isAmplitudeHighlighted ? 1 : (hasActiveHighlight ? 0.3 : 0.5)}
                />
                <Point
                    x={0}
                    y={-amp}
                    color="#ef4444"
                    opacity={isAmplitudeHighlighted ? 1 : (hasActiveHighlight ? 0.3 : 0.5)}
                />

                {/* Highlight ring around amplitude control when highlighted */}
                {isAmplitudeHighlighted && (
                    <Circle
                        center={amplitudePoint.point}
                        radius={0.5}
                        color="#ef4444"
                        fillOpacity={0.2}
                        strokeStyle="dashed"
                    />
                )}

                {/* Control point for amplitude (drag up/down) */}
                {amplitudePoint.element}

                {/* Highlight ring around frequency control when highlighted */}
                {isFrequencyHighlighted && (
                    <Circle
                        center={frequencyPoint.point}
                        radius={0.5}
                        color="#3b82f6"
                        fillOpacity={0.2}
                        strokeStyle="dashed"
                    />
                )}

                {/* Control point for frequency (drag left/right) */}
                {frequencyPoint.element}
            </Mafs>

            {/* Invisible overlay areas for hover detection */}
            {/* Amplitude hover area - left side */}
            <div
                className="absolute top-0 left-0 h-full transition-all duration-200"
                style={{
                    width: '25%',
                    background: isAmplitudeHighlighted ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                    pointerEvents: 'auto',
                }}
                onMouseEnter={handleAmplitudeAreaEnter}
                onMouseLeave={handleAreaLeave}
            />

            {/* Frequency hover area - right side */}
            <div
                className="absolute top-0 right-0 h-full transition-all duration-200"
                style={{
                    width: '25%',
                    background: isFrequencyHighlighted ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                    pointerEvents: 'auto',
                }}
                onMouseEnter={handleFrequencyAreaEnter}
                onMouseLeave={handleAreaLeave}
            />
        </div>
    );
}
