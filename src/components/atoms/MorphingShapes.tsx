import { useEffect, useRef } from "react";
import Two from "two.js";

export interface MorphingShapesProps {
    /** Width of the canvas */
    width?: number;
    /** Height of the canvas */
    height?: number;
    /** Shape preset */
    variant?: "circle-to-square" | "polygon-morph" | "flower" | "spiral" | "geometric";
    /** Primary color */
    color?: string;
    /** Animation speed (0.1 - 2.0) */
    speed?: number;
    /** Optional className for styling */
    className?: string;
}

/**
 * MorphingShapes - Dynamic shape morphing animations using Two.js
 * 
 * Creates mesmerizing shape transformations.
 * 
 * @example
 * ```tsx
 * <MorphingShapes
 *   variant="flower"
 *   color="#EC4899"
 *   width={400}
 *   height={400}
 * />
 * ```
 */
export const MorphingShapes = ({
    width = 400,
    height = 400,
    variant = "circle-to-square",
    color = "#EC4899",
    speed = 1.0,
    className = "",
}: MorphingShapesProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const twoRef = useRef<Two | null>(null);
    const setupCircleToSquare = (two: Two) => {
        const cx = width / 2;
        const cy = height / 2;
        const radius = Math.min(width, height) * 0.3;

        // Create circle with 4 points that will morph to square
        const circle = two.makeCircle(cx, cy, radius);
        circle.fill = color;
        circle.stroke = color;
        circle.linewidth = 2;
        circle.opacity = 0.8;

        // Store original positions
        const circlePoints: any[] = [];
        const squarePoints: any[] = [];

        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 - Math.PI / 4;
            circlePoints.push({
                x: cx + Math.cos(angle) * radius,
                y: cy + Math.sin(angle) * radius,
            });

            const sx = i === 0 || i === 3 ? cx + radius : cx - radius;
            const sy = i < 2 ? cy - radius : cy + radius;
            squarePoints.push({ x: sx, y: sy });
        }

        const shape = two.makePath();
        circlePoints.forEach((p) => {
            shape.vertices.push(new Two.Anchor(p.x, p.y));
        });
        shape.fill = color;
        shape.stroke = color;
        shape.linewidth = 3;
        shape.opacity = 0.7;
        shape.closed = true;

        two.bind("update", (frameCount: number) => {
            const time = frameCount * 0.02 * speed;
            const t = (Math.sin(time) + 1) / 2; // Oscillate between 0 and 1

            shape.vertices.forEach((vertex: any, i: number) => {
                vertex.x = circlePoints[i].x + (squarePoints[i].x - circlePoints[i].x) * t;
                vertex.y = circlePoints[i].y + (squarePoints[i].y - circlePoints[i].y) * t;
            });

            shape.rotation = time * 0.5;
        }).play();

        return () => {
            two.unbind("update");
        };
    };

    const setupPolygonMorph = (two: Two) => {
        const cx = width / 2;
        const cy = height / 2;
        const radius = Math.min(width, height) * 0.3;
        const shapes: any[] = [];

        // Create multiple polygons
        for (let p = 3; p <= 8; p++) {
            const points: any[] = [];
            for (let i = 0; i < p; i++) {
                const angle = (i / p) * Math.PI * 2 - Math.PI / 2;
                points.push(
                    new Two.Anchor(
                        cx + Math.cos(angle) * radius,
                        cy + Math.sin(angle) * radius
                    )
                );
            }

            const shape = two.makePath();
            points.forEach((p) => shape.vertices.push(p));
            shape.fill = "transparent";
            shape.stroke = color;
            shape.linewidth = 2;
            shape.opacity = 0;
            shape.closed = true;
            shapes.push(shape);
        }

        two.bind("update", (frameCount: number) => {
            const time = frameCount * 0.01 * speed;
            const cycle = Math.floor(time) % shapes.length;
            const t = time % 1;

            shapes.forEach((shape: any, i: number) => {
                if (i === cycle) {
                    shape.opacity = 1 - t;
                } else if (i === (cycle + 1) % shapes.length) {
                    shape.opacity = t;
                } else {
                    shape.opacity = 0;
                }
                shape.rotation = time * 0.3;
            });
        }).play();

        return () => {
            two.unbind("update");
        };
    };

    const setupFlower = (two: Two) => {
        const cx = width / 2;
        const cy = height / 2;
        const petals: any[] = [];
        const numPetals = 8;
        const petalRadius = Math.min(width, height) * 0.15;

        for (let i = 0; i < numPetals; i++) {
            const angle = (i / numPetals) * Math.PI * 2;
            const petal = two.makeEllipse(
                cx + Math.cos(angle) * petalRadius,
                cy + Math.sin(angle) * petalRadius,
                petalRadius * 0.5,
                petalRadius * 1.2
            );
            petal.fill = color;
            petal.stroke = "transparent";
            petal.opacity = 0.6;
            petal.rotation = angle;
            petals.push({ shape: petal, baseAngle: angle, index: i });
        }

        // Center circle
        const center = two.makeCircle(cx, cy, petalRadius * 0.4);
        center.fill = color;
        center.stroke = "transparent";

        two.bind("update", (frameCount: number) => {
            const time = frameCount * 0.02 * speed;

            petals.forEach(({ shape, baseAngle, index }) => {
                const offset = Math.sin(time + index * 0.5) * petalRadius * 0.3;
                shape.translation.x = cx + Math.cos(baseAngle) * (petalRadius + offset);
                shape.translation.y = cy + Math.sin(baseAngle) * (petalRadius + offset);
                shape.rotation = baseAngle + time;
            });

            center.scale = 1 + Math.sin(time * 2) * 0.2;
        }).play();

        return () => {
            two.unbind("update");
        };
    };

    const setupSpiral = (two: Two) => {
        const cx = width / 2;
        const cy = height / 2;
        const numPoints = 100;

        // Create the spiral path
        const spiral = two.makePath();
        spiral.automatic = false;

        for (let i = 0; i < numPoints; i++) {
            const t = i / numPoints;
            const angle = t * Math.PI * 6;
            const radius = t * Math.min(width, height) * 0.4;
            spiral.vertices.push(
                new Two.Anchor(
                    cx + Math.cos(angle) * radius,
                    cy + Math.sin(angle) * radius
                )
            );
        }

        spiral.stroke = color;
        spiral.linewidth = 3;
        spiral.fill = "transparent";
        spiral.cap = "round";
        spiral.noFill();

        // Add dots along the spiral
        const dots: any[] = [];
        for (let i = 0; i < 20; i++) {
            const dot = two.makeCircle(0, 0, 4);
            dot.fill = color;
            dot.noStroke();
            dots.push({ shape: dot, index: i });
        }

        two.bind("update", (frameCount: number) => {
            const time = frameCount * 0.02 * speed;

            spiral.rotation = time * 0.5;

            dots.forEach(({ shape, index }) => {
                const t = ((time * 0.5 + index / dots.length) % 1);
                const angle = t * Math.PI * 6;
                const radius = t * Math.min(width, height) * 0.4;
                shape.translation.x = cx + Math.cos(angle + time * 0.5) * radius;
                shape.translation.y = cy + Math.sin(angle + time * 0.5) * radius;
                shape.scale = 1 + Math.sin(time * 2 + index) * 0.5;
            });
        }).play();

        return () => {
            two.unbind("update");
        };
    };

    const setupGeometric = (two: Two) => {
        const cx = width / 2;
        const cy = height / 2;
        const shapes: any[] = [];
        const numLayers = 5;

        for (let layer = 0; layer < numLayers; layer++) {
            const sides = layer + 3;
            const radius = (layer + 1) * (Math.min(width, height) * 0.08);
            const points: any[] = [];

            for (let i = 0; i < sides; i++) {
                const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
                points.push(
                    new Two.Anchor(
                        cx + Math.cos(angle) * radius,
                        cy + Math.sin(angle) * radius
                    )
                );
            }

            const shape = two.makePath();
            points.forEach((p) => shape.vertices.push(p));
            shape.fill = "transparent";
            shape.stroke = color;
            shape.linewidth = 2;
            shape.opacity = 0.6 - layer * 0.1;
            shape.closed = true;
            shapes.push({ shape, layer });
        }

        two.bind("update", (frameCount: number) => {
            const time = frameCount * 0.01 * speed;

            shapes.forEach(({ shape, layer }) => {
                shape.rotation = time * (layer % 2 === 0 ? 1 : -1) * 0.5;
                shape.scale = 1 + Math.sin(time + layer) * 0.1;
            });
        }).play();

        return () => {
            two.unbind("update");
        };
    };

    const variants = {
        "circle-to-square": setupCircleToSquare,
        "polygon-morph": setupPolygonMorph,
        "flower": setupFlower,
        "spiral": setupSpiral,
        "geometric": setupGeometric,
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
            }
        };
    }, [width, height, variant, color, speed]);

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
