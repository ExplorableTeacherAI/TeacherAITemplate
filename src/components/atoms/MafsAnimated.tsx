import { useEffect } from "react";
import { Mafs, Coordinates, Plot, Circle, Point, useStopwatch } from "mafs";

/**
 * Animated Mafs visualization showing a point moving along a sine wave
 * Uses useStopwatch for animation timing
 */
export function MafsAnimated() {
    const { time, start } = useStopwatch();

    // Auto-start the animation on mount
    useEffect(() => {
        start();
    }, [start]);

    // Animated point moving along sine wave
    const x = (time % 10) - 5; // Loop from -5 to 5 over 10 seconds
    const y = Math.sin(x);

    // Rotating circle
    const angle = time * 0.5;
    const circleX = 2 * Math.cos(angle);
    const circleY = 2 * Math.sin(angle);

    return (
        <div className="w-full overflow-hidden rounded-xl">
            <Mafs height={400} viewBox={{ x: [-5, 5], y: [-3, 3] }}>
                <Coordinates.Cartesian />

                {/* Sine wave plot */}
                <Plot.OfX y={(x) => Math.sin(x)} color="#3b82f6" weight={2} />

                {/* Animated point on sine wave */}
                <Point x={x} y={y} color="#ef4444" />

                {/* Rotating point around origin */}
                <Circle center={[0, 0]} radius={2} strokeStyle="dashed" color="#9ca3af" fillOpacity={0} />
                <Point x={circleX} y={circleY} color="#22c55e" />

                {/* Trace line from origin to rotating point */}
                <Plot.Parametric
                    t={[0, 1]}
                    xy={(t) => [t * circleX, t * circleY]}
                    color="#22c55e"
                    weight={1}
                    opacity={0.5}
                />
            </Mafs>
        </div>
    );
}
