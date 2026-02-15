import { useEffect, useRef } from "react";
import Two from "two.js";

export interface AnimatedGraphProps {
    /** Width of the canvas */
    width?: number;
    /** Height of the canvas */
    height?: number;
    /** Graph type */
    variant?: "sine-wave" | "parametric" | "pendulum" | "fourier" | "lissajous";
    /** Primary color */
    color?: string;
    /** Secondary color */
    secondaryColor?: string;
    /** Animation speed (0.1 - 2.0) */
    speed?: number;
    /** Show axes */
    showAxes?: boolean;
    /** Show grid */
    showGrid?: boolean;
    /** Optional className for styling */
    className?: string;
}

/**
 * AnimatedGraph - Animated mathematical visualizations using Two.js
 * 
 * Creates beautiful animated graphs for mathematical concepts.
 * 
 * @example
 * ```tsx
 * <AnimatedGraph
 *   variant="fourier"
 *   color="#10B981"
 *   showAxes={true}
 *   showGrid={true}
 * />
 * ```
 */
export const AnimatedGraph = ({
    width = 600,
    height = 400,
    variant = "sine-wave",
    color = "#10B981",
    secondaryColor = "#3B82F6",
    speed = 1.0,
    showAxes = true,
    showGrid = false,
    className = "",
}: AnimatedGraphProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const twoRef = useRef<Two | null>(null);
    const drawAxes = (two: Two) => {
        const centerX = width / 2;
        const centerY = height / 2;

        // X-axis
        const xAxis = two.makeLine(0, centerY, width, centerY);
        xAxis.stroke = "#888";
        xAxis.linewidth = 1;
        xAxis.opacity = 0.5;

        // Y-axis
        const yAxis = two.makeLine(centerX, 0, centerX, height);
        yAxis.stroke = "#888";
        yAxis.linewidth = 1;
        yAxis.opacity = 0.5;

        // X-axis arrow
        const arrowSize = 8;
        two.makeLine(width, centerY, width - arrowSize, centerY - arrowSize / 2);
        two.makeLine(width, centerY, width - arrowSize, centerY + arrowSize / 2);

        // Y-axis arrow
        two.makeLine(centerX, 0, centerX - arrowSize / 2, arrowSize);
        two.makeLine(centerX, 0, centerX + arrowSize / 2, arrowSize);
    };

    const drawGrid = (two: Two) => {
        const spacing = 40;
        const centerX = width / 2;
        const centerY = height / 2;

        for (let x = centerX % spacing; x < width; x += spacing) {
            const line = two.makeLine(x, 0, x, height);
            line.stroke = "#888";
            line.linewidth = 1;
            line.opacity = 0.1;
        }

        for (let y = centerY % spacing; y < height; y += spacing) {
            const line = two.makeLine(0, y, width, y);
            line.stroke = "#888";
            line.linewidth = 1;
            line.opacity = 0.1;
        }
    };

    const setupSineWave = (two: Two) => {
        if (showGrid) drawGrid(two);
        if (showAxes) drawAxes(two);

        const centerY = height / 2;
        const amplitude = height * 0.3;
        const numPoints = 200;

        //Create path for sine wave
        const path = two.makePath();
        path.stroke = color;
        path.linewidth = 3;
        path.fill = "transparent";
        path.cap = "round";

        // Initialize vertices
        for (let i = 0; i < numPoints; i++) {
            const x = (i / numPoints) * width;
            path.vertices.push(new Two.Anchor(x, centerY));
        }

        // Moving dot
        const dot = two.makeCircle(0, centerY, 6);
        dot.fill = secondaryColor;
        dot.noStroke();

        two.bind("update", (frameCount: number) => {
            const time = frameCount * 0.02 * speed;

            path.vertices.forEach((vertex: any, i: number) => {
                const x = (i / numPoints) * width;
                const t = (x / width) * Math.PI * 4 - time;
                vertex.y = centerY + Math.sin(t) * amplitude;
            });

            const dotX = ((time * 50) % width);
            const dotT = (dotX / width) * Math.PI * 4 - time;
            dot.translation.x = dotX;
            dot.translation.y = centerY + Math.sin(dotT) * amplitude;
        }).play();

        return () => {
            two.unbind("update");
        };
    };

    const setupParametric = (two: Two) => {
        if (showGrid) drawGrid(two);
        if (showAxes) drawAxes(two);

        const centerX = width / 2;
        const centerY = height / 2;
        const scale = Math.min(width, height) * 0.35;
        const numPoints = 300;

        const path = two.makePath();
        path.stroke = color;
        path.linewidth = 3;
        path.fill = "transparent";
        path.cap = "round";

        for (let i = 0; i < numPoints; i++) {
            path.vertices.push(new Two.Anchor(centerX, centerY));
        }

        const dot = two.makeCircle(centerX, centerY, 6);
        dot.fill = secondaryColor;
        dot.noStroke();

        two.bind("update", (frameCount: number) => {
            const time = frameCount * 0.02 * speed;

            path.vertices.forEach((vertex: any, i: number) => {
                const t = (i / numPoints) * Math.PI * 2 + time;
                // Rose curve: r = cos(k*θ)
                const k = 5;
                const r = Math.cos(k * t) * scale;
                vertex.x = centerX + r * Math.cos(t);
                vertex.y = centerY + r * Math.sin(t);
            });

            const dotT = time;
            const dotR = Math.cos(5 * dotT) * scale;
            dot.translation.x = centerX + dotR * Math.cos(dotT);
            dot.translation.y = centerY + dotR * Math.sin(dotT);
        }).play();

        return () => {
            two.unbind("update");
        };
    };

    const setupPendulum = (two: Two) => {
        if (showAxes) drawAxes(two);

        const pivotX = width / 2;
        const pivotY = height * 0.2;
        const length = height * 0.5;

        // Pivot point
        const pivot = two.makeCircle(pivotX, pivotY, 5);
        pivot.fill = "#888";
        pivot.noStroke();

        // String
        const string = two.makeLine(pivotX, pivotY, pivotX, pivotY + length);
        string.stroke = "#888";
        string.linewidth = 2;

        // Bob
        const bob = two.makeCircle(pivotX, pivotY + length, 15);
        bob.fill = color;
        bob.stroke = secondaryColor;
        bob.linewidth = 2;

        // Trail
        const trailPoints: any[] = [];
        const maxTrailLength = 100;

        two.bind("update", (frameCount: number) => {
            const time = frameCount * 0.02 * speed;
            const angle = Math.sin(time) * (Math.PI / 4); // 45 degree max swing

            const bobX = pivotX + Math.sin(angle) * length;
            const bobY = pivotY + Math.cos(angle) * length;

            string.vertices[1].x = bobX;
            string.vertices[1].y = bobY;

            bob.translation.x = bobX;
            bob.translation.y = bobY;

            // Add to trail
            if (frameCount % 2 === 0) {
                const trailDot = two.makeCircle(bobX, bobY, 2);
                trailDot.fill = secondaryColor;
                trailDot.noStroke();
                trailDot.opacity = 0.5;
                trailPoints.push(trailDot);

                if (trailPoints.length > maxTrailLength) {
                    const removed = trailPoints.shift();
                    two.remove(removed);
                }
            }

            // Fade trail
            trailPoints.forEach((dot, i) => {
                dot.opacity = (i / trailPoints.length) * 0.5;
            });
        }).play();

        return () => {
            two.unbind("update");
            trailPoints.forEach((dot) => two.remove(dot));
        };
    };

    const setupFourier = (two: Two) => {
        if (showGrid) drawGrid(two);
        if (showAxes) drawAxes(two);

        const centerX = width * 0.3;
        const centerY = height / 2;
        const numCircles = 5;
        const circles: any[] = [];

        // Create epicycles
        for (let i = 0; i < numCircles; i++) {
            const radius = (50 / (2 * i + 1));
            const circle = two.makeCircle(0, 0, radius);
            circle.fill = "transparent";
            circle.stroke = color;
            circle.linewidth = 1;
            circle.opacity = 0.3;

            const line = two.makeLine(0, 0, radius, 0);
            line.stroke = secondaryColor;
            line.linewidth = 2;

            circles.push({ circle, line, radius, frequency: 2 * i + 1 });
        }

        // Wave path
        const wavePath = two.makePath();
        wavePath.stroke = color;
        wavePath.linewidth = 3;
        wavePath.fill = "transparent";

        const maxPoints = 200;
        for (let i = 0; i < maxPoints; i++) {
            wavePath.vertices.push(new Two.Anchor(centerX + 200, centerY));
        }

        const pathPoints: { x: number; y: number }[] = [];

        two.bind("update", (frameCount: number) => {
            const time = frameCount * 0.02 * speed;
            let x = centerX;
            let y = centerY;

            circles.forEach(({ circle, line, radius, frequency }) => {
                const angle = time * frequency;
                const prevX = x;
                const prevY = y;

                x += radius * Math.cos(angle);
                y += radius * Math.sin(angle);

                circle.translation.x = prevX;
                circle.translation.y = prevY;

                line.vertices[0].x = prevX;
                line.vertices[0].y = prevY;
                line.vertices[1].x = x;
                line.vertices[1].y = y;
            });

            // Add point to wave
            pathPoints.push({ x, y });
            if (pathPoints.length > maxPoints) {
                pathPoints.shift();
            }

            // Update wave
            wavePath.vertices.forEach((vertex: any, i: number) => {
                if (pathPoints[i]) {
                    vertex.x = centerX + 200 + i * 2;
                    vertex.y = pathPoints[i].y;
                }
            });
        }).play();

        return () => {
            two.unbind("update");
        };
    };

    const setupLissajous = (two: Two) => {
        if (showGrid) drawGrid(two);
        if (showAxes) drawAxes(two);

        const centerX = width / 2;
        const centerY = height / 2;
        const scale = Math.min(width, height) * 0.35;
        const numPoints = 500;

        const path = two.makePath();
        path.stroke = color;
        path.linewidth = 3;
        path.fill = "transparent";
        path.cap = "round";

        for (let i = 0; i < numPoints; i++) {
            path.vertices.push(new Two.Anchor(centerX, centerY));
        }

        const dot = two.makeCircle(centerX, centerY, 6);
        dot.fill = secondaryColor;
        dot.noStroke();

        two.bind("update", (frameCount: number) => {
            const time = frameCount * 0.02 * speed;
            const a = 3; // x frequency
            const b = 2; // y frequency

            path.vertices.forEach((vertex: any, i: number) => {
                const t = (i / numPoints) * Math.PI * 2 + time * 0.5;
                vertex.x = centerX + Math.sin(a * t) * scale;
                vertex.y = centerY + Math.sin(b * t) * scale;
            });

            const dotT = time * 0.5;
            dot.translation.x = centerX + Math.sin(a * dotT) * scale;
            dot.translation.y = centerY + Math.sin(b * dotT) * scale;
        }).play();

        return () => {
            two.unbind("update");
        };
    };

    const variants = {
        "sine-wave": setupSineWave,
        "parametric": setupParametric,
        "pendulum": setupPendulum,
        "fourier": setupFourier,
        "lissajous": setupLissajous,
    };

    useEffect(() => {
        if (!containerRef.current) return;

        const two = new Two({
            width,
            height,
            autostart: true,
        }).appendTo(containerRef.current);

        twoRef.current = two;

        // Set proper SVG viewBox to prevent clipping
        const svgElement = containerRef.current.querySelector('svg');
        if (svgElement) {
            svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
            svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            svgElement.style.width = '100%';
            svgElement.style.height = '100%';
        }

        const cleanup = variants[variant](two);

        return () => {
            if (typeof cleanup === "function") {
                cleanup();
            }
            if (twoRef.current) {
                twoRef.current.pause();
                twoRef.current.clear();
                if (containerRef.current) {
                    containerRef.current.innerHTML = "";
                }
            }
        };
    }, [width, height, variant, color, secondaryColor, speed, showAxes, showGrid]);

    return (
        <div
            ref={containerRef}
            className={className}
            style={{
                width: '100%',
                height: 'auto',
                aspectRatio: `${width}/${height}`,
                display: 'block',
            }}
        />
    );
};
