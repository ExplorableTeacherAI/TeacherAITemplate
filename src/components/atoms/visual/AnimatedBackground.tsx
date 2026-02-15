import { useEffect, useRef } from "react";
import Two from "two.js";

export interface AnimatedBackgroundProps {
    /** Width of the background */
    width?: number;
    /** Height of the background */
    height?: number;
    /** Animation preset */
    variant?: "waves" | "particles" | "grid" | "aurora" | "constellation";
    /** Primary color */
    color?: string;
    /** Secondary color */
    secondaryColor?: string;
    /** Animation speed (0.1 - 2.0) */
    speed?: number;
    /** Optional className for styling */
    className?: string;
}

/**
 * AnimatedBackground - Stunning animated background effects using Two.js
 * 
 * Provides various preset animation styles for backgrounds.
 * 
 * @example
 * ```tsx
 * <AnimatedBackground
 *   variant="waves"
 *   color="#4F46E5"
 *   secondaryColor="#7C3AED"
 *   width={800}
 *   height={400}
 * />
 * ```
 */
export const AnimatedBackground = ({
    width = 800,
    height = 400,
    variant = "waves",
    color = "#4F46E5",
    secondaryColor = "#7C3AED",
    speed = 1.0,
    className = "",
}: AnimatedBackgroundProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const twoRef = useRef<Two | null>(null);
    const setupWaves = (two: Two) => {
        const curves: any[] = [];
        const numWaves = 3;

        for (let i = 0; i < numWaves; i++) {
            const segments = 50;

            // Create path
            const curve = two.makePath();
            curve.automatic = false;

            // Add vertices
            for (let j = 0; j <= segments; j++) {
                const x = (width / segments) * j;
                const y = height / 2 + Math.sin((j / segments) * Math.PI * 2 + i) * 50;
                curve.vertices.push(new Two.Anchor(x, y));
            }

            curve.stroke = i % 2 === 0 ? color : secondaryColor;
            curve.linewidth = 3;
            curve.fill = "transparent";
            curve.opacity = 0.3 + (i * 0.2);
            curve.noFill();
            curves.push({ curve, offset: i * 0.5 });
        }

        two.bind("update", (frameCount: number) => {
            curves.forEach(({ curve, offset }) => {
                curve.vertices.forEach((vertex: any, i: number) => {
                    const time = (frameCount + offset * 100) * 0.01 * speed;
                    vertex.y = height / 2 + Math.sin((i / 50) * Math.PI * 2 + time) * 50;
                });
            });
        }).play();

        return () => {
            two.unbind("update");
        };
    };

    const setupParticles = (two: Two) => {
        const particles: any[] = [];
        const numParticles = 50;

        for (let i = 0; i < numParticles; i++) {
            const circle = two.makeCircle(
                Math.random() * width,
                Math.random() * height,
                Math.random() * 3 + 1
            );
            circle.fill = Math.random() > 0.5 ? color : secondaryColor;
            circle.noStroke();
            circle.opacity = Math.random() * 0.5 + 0.3;

            particles.push({
                shape: circle,
                vx: (Math.random() - 0.5) * 2 * speed,
                vy: (Math.random() - 0.5) * 2 * speed,
            });
        }

        two.bind("update", () => {
            particles.forEach((particle) => {
                particle.shape.translation.x += particle.vx;
                particle.shape.translation.y += particle.vy;

                // Wrap around edges
                if (particle.shape.translation.x > width) particle.shape.translation.x = 0;
                if (particle.shape.translation.x < 0) particle.shape.translation.x = width;
                if (particle.shape.translation.y > height) particle.shape.translation.y = 0;
                if (particle.shape.translation.y < 0) particle.shape.translation.y = height;
            });
        }).play();

        return () => {
            two.unbind("update");
        };
    };

    const setupGrid = (two: Two) => {
        const lines: any[] = [];
        const spacing = 40;
        const rows = Math.ceil(height / spacing);
        const cols = Math.ceil(width / spacing);

        // Create grid lines
        for (let i = 0; i <= rows; i++) {
            const line = two.makeLine(0, i * spacing, width, i * spacing);
            line.stroke = color;
            line.linewidth = 1;
            line.opacity = 0.2;
            lines.push({ line, axis: "horizontal", index: i });
        }

        for (let i = 0; i <= cols; i++) {
            const line = two.makeLine(i * spacing, 0, i * spacing, height);
            line.stroke = secondaryColor;
            line.linewidth = 1;
            line.opacity = 0.2;
            lines.push({ line, axis: "vertical", index: i });
        }

        two.bind("update", (frameCount: number) => {
            const time = frameCount * 0.02 * speed;
            lines.forEach(({ line, index }) => {
                const offset = Math.sin(time + index * 0.5) * 0.3;
                line.opacity = 0.1 + Math.abs(offset);
            });
        }).play();

        return () => {
            two.unbind("update");
        };
    };

    const setupAurora = (two: Two) => {
        const bands: any[] = [];
        const numBands = 5;

        for (let i = 0; i < numBands; i++) {
            const segments = 40;

            // Create path
            const curve = two.makePath();
            curve.automatic = false;

            // Add vertices
            for (let j = 0; j <= segments; j++) {
                const x = (width / segments) * j;
                const y = height * 0.3 + i * 30;
                curve.vertices.push(new Two.Anchor(x, y));
            }

            curve.stroke = i % 2 === 0 ? color : secondaryColor;
            curve.linewidth = 20;
            curve.fill = "transparent";
            curve.opacity = 0.15;
            curve.cap = "round";
            curve.noFill();
            bands.push({ curve, offset: i });
        }

        two.bind("update", (frameCount: number) => {
            bands.forEach(({ curve, offset }) => {
                curve.vertices.forEach((vertex: any, i: number) => {
                    const time = (frameCount + offset * 50) * 0.01 * speed;
                    const wave1 = Math.sin((i / 40) * Math.PI * 2 + time) * 30;
                    const wave2 = Math.sin((i / 40) * Math.PI * 4 + time * 1.5) * 15;
                    vertex.y = height * 0.3 + offset * 30 + wave1 + wave2;
                });
            });
        }).play();

        return () => {
            two.unbind("update");
        };
    };

    const setupConstellation = (two: Two) => {
        const stars: any[] = [];
        const lines: any[] = [];
        const numStars = 30;

        // Create stars
        for (let i = 0; i < numStars; i++) {
            const star = two.makeCircle(
                Math.random() * width,
                Math.random() * height,
                2
            );
            star.fill = color;
            star.noStroke();
            stars.push({
                shape: star,
                x: star.translation.x,
                y: star.translation.y,
            });
        }

        // Connect nearby stars
        for (let i = 0; i < stars.length; i++) {
            for (let j = i + 1; j < stars.length; j++) {
                const dx = stars[i].x - stars[j].x;
                const dy = stars[i].y - stars[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    const line = two.makeLine(
                        stars[i].x,
                        stars[i].y,
                        stars[j].x,
                        stars[j].y
                    );
                    line.stroke = secondaryColor;
                    line.linewidth = 1;
                    line.opacity = 0.2 * (1 - distance / 150);
                    lines.push({ line, stars: [stars[i], stars[j]] });
                }
            }
        }

        two.bind("update", (frameCount: number) => {
            const time = frameCount * 0.01 * speed;
            stars.forEach((star, i) => {
                const pulse = Math.sin(time + i) * 0.3 + 0.7;
                star.shape.opacity = pulse;
            });
        }).play();

        return () => {
            two.unbind("update");
        };
    };

    const variants = {
        waves: setupWaves,
        particles: setupParticles,
        grid: setupGrid,
        aurora: setupAurora,
        constellation: setupConstellation,
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
    }, [width, height, variant, color, secondaryColor, speed]);

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
