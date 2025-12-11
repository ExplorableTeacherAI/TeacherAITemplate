import { useState, useEffect, useRef } from "react";
import Two from "two.js";

export interface ParticleSystemProps {
    /** Width of the canvas */
    width?: number;
    /** Height of the canvas */
    height?: number;
    /** Particle system preset */
    variant?: "fireworks" | "galaxy" | "fluid" | "magnetic" | "trail";
    /** Primary color */
    color?: string;
    /** Secondary color */
    secondaryColor?: string;
    /** Number of particles */
    particleCount?: number;
    /** Animation speed (0.1 - 2.0) */
    speed?: number;
    /** Whether to enable mouse interaction */
    interactive?: boolean;
    /** Optional className for styling */
    className?: string;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
    life: number;
    maxLife: number;
    shape?: any;
}

/**
 * ParticleSystem - Interactive particle effects using Two.js
 * 
 * Creates dynamic particle animations with mouse interaction support.
 * 
 * @example
 * ```tsx
 * <ParticleSystem
 *   variant="galaxy"
 *   color="#3B82F6"
 *   secondaryColor="#8B5CF6"
 *   particleCount={100}
 *   interactive={true}
 * />
 * ```
 */
export const ParticleSystem = ({
    width = 600,
    height = 400,
    variant = "galaxy",
    color = "#3B82F6",
    secondaryColor = "#8B5CF6",
    particleCount = 100,
    speed = 1.0,
    interactive = true,
    className = "",
}: ParticleSystemProps) => {
    const [mousePos, setMousePos] = useState({ x: width / 2, y: height / 2 });
    const containerRef = useRef<HTMLDivElement>(null);
    const twoRef = useRef<Two | null>(null);

    const setupFireworks = (two: Two) => {
        const particles: Particle[] = [];

        const createExplosion = (x: number, y: number) => {
            const count = 30;
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2;
                const velocity = Math.random() * 3 + 2;

                const particle: Particle = {
                    x,
                    y,
                    vx: Math.cos(angle) * velocity,
                    vy: Math.sin(angle) * velocity,
                    radius: Math.random() * 3 + 1,
                    color: Math.random() > 0.5 ? color : secondaryColor,
                    life: 1,
                    maxLife: Math.random() * 60 + 40,
                };

                const circle = two.makeCircle(x, y, particle.radius);
                circle.fill = particle.color;
                circle.noStroke();
                particle.shape = circle;
                particles.push(particle);
            }
        };

        // Initial explosion
        createExplosion(width / 2, height / 2);

        let frameCount = 0;
        two.bind("update", () => {
            frameCount++;

            // Create new explosions periodically
            if (frameCount % 60 === 0) {
                createExplosion(
                    Math.random() * width,
                    Math.random() * height * 0.5 + height * 0.25
                );
            }

            // Update particles
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx * speed;
                p.y += p.vy * speed;
                p.vy += 0.1; // Gravity
                p.life++;

                if (p.shape) {
                    p.shape.translation.x = p.x;
                    p.shape.translation.y = p.y;
                    p.shape.opacity = 1 - p.life / p.maxLife;
                }

                // Remove dead particles
                if (p.life > p.maxLife) {
                    if (p.shape) {
                        two.remove(p.shape);
                    }
                    particles.splice(i, 1);
                }
            }
        }).play();

        return () => {
            two.unbind("update");
            particles.forEach((p) => {
                if (p.shape) two.remove(p.shape);
            });
        };
    };

    const setupGalaxy = (two: Two) => {
        const particles: Particle[] = [];
        const centerX = width / 2;
        const centerY = height / 2;

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * Math.min(width, height) * 0.4;

            const particle: Particle = {
                x: centerX + Math.cos(angle) * distance,
                y: centerY + Math.sin(angle) * distance,
                vx: 0,
                vy: 0,
                radius: Math.random() * 2 + 0.5,
                color: Math.random() > 0.5 ? color : secondaryColor,
                life: 0,
                maxLife: Infinity,
            };

            const circle = two.makeCircle(particle.x, particle.y, particle.radius);
            circle.fill = particle.color;
            circle.noStroke();
            circle.opacity = Math.random() * 0.5 + 0.3;
            particle.shape = circle;
            particles.push(particle);
        }

        two.bind("update", (frameCount: number) => {
            const time = frameCount * 0.01 * speed;

            particles.forEach((p, i) => {
                const dx = p.x - centerX;
                const dy = p.y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);

                // Spiral motion
                const newAngle = angle + (0.02 * speed) / (distance / 50);
                const newDistance = distance;

                p.x = centerX + Math.cos(newAngle) * newDistance;
                p.y = centerY + Math.sin(newAngle) * newDistance;

                if (p.shape) {
                    p.shape.translation.x = p.x;
                    p.shape.translation.y = p.y;
                    p.shape.opacity = 0.3 + Math.sin(time + i * 0.1) * 0.3;
                }
            });
        }).play();

        return () => {
            two.unbind("update");
            particles.forEach((p) => {
                if (p.shape) two.remove(p.shape);
            });
        };
    };

    const setupFluid = (two: Two) => {
        const particles: Particle[] = [];

        for (let i = 0; i < particleCount; i++) {
            const particle: Particle = {
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                radius: Math.random() * 4 + 2,
                color: Math.random() > 0.5 ? color : secondaryColor,
                life: 0,
                maxLife: Infinity,
            };

            const circle = two.makeCircle(particle.x, particle.y, particle.radius);
            circle.fill = particle.color;
            circle.noStroke();
            circle.opacity = 0.6;
            particle.shape = circle;
            particles.push(particle);
        }

        two.bind("update", () => {
            particles.forEach((p) => {
                // Apply fluid-like forces
                const dx = mousePos.x - p.x;
                const dy = mousePos.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100 && distance > 0) {
                    const force = (100 - distance) / 100;
                    p.vx += (dx / distance) * force * 0.5;
                    p.vy += (dy / distance) * force * 0.5;
                }

                // Update position
                p.x += p.vx * speed;
                p.y += p.vy * speed;

                // Apply friction
                p.vx *= 0.95;
                p.vy *= 0.95;

                // Bounce off edges
                if (p.x < 0 || p.x > width) p.vx *= -0.8;
                if (p.y < 0 || p.y > height) p.vy *= -0.8;

                p.x = Math.max(0, Math.min(width, p.x));
                p.y = Math.max(0, Math.min(height, p.y));

                if (p.shape) {
                    p.shape.translation.x = p.x;
                    p.shape.translation.y = p.y;
                }
            });
        }).play();

        return () => {
            two.unbind("update");
            particles.forEach((p) => {
                if (p.shape) two.remove(p.shape);
            });
        };
    };

    const setupMagnetic = (two: Two) => {
        const particles: Particle[] = [];

        for (let i = 0; i < particleCount; i++) {
            const particle: Particle = {
                x: Math.random() * width,
                y: Math.random() * height,
                vx: 0,
                vy: 0,
                radius: Math.random() * 3 + 1,
                color: Math.random() > 0.5 ? color : secondaryColor,
                life: 0,
                maxLife: Infinity,
            };

            const circle = two.makeCircle(particle.x, particle.y, particle.radius);
            circle.fill = particle.color;
            circle.noStroke();
            circle.opacity = 0.7;
            particle.shape = circle;
            particles.push(particle);
        }

        two.bind("update", () => {
            particles.forEach((p) => {
                const dx = mousePos.x - p.x;
                const dy = mousePos.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > 0) {
                    const force = Math.min(100 / (distance + 1), 5);
                    p.vx += (dx / distance) * force * 0.1;
                    p.vy += (dy / distance) * force * 0.1;
                }

                p.x += p.vx * speed;
                p.y += p.vy * speed;

                p.vx *= 0.9;
                p.vy *= 0.9;

                if (p.shape) {
                    p.shape.translation.x = p.x;
                    p.shape.translation.y = p.y;
                }
            });
        }).play();

        return () => {
            two.unbind("update");
            particles.forEach((p) => {
                if (p.shape) two.remove(p.shape);
            });
        };
    };

    const setupTrail = (two: Two) => {
        const trails: Particle[][] = [];
        const maxTrailLength = 20;

        two.bind("update", (frameCount: number) => {
            if (frameCount % 2 === 0) {
                // Add new particle at mouse position
                const trail: Particle[] = [];
                for (let i = 0; i < 5; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const distance = Math.random() * 10;

                    const particle: Particle = {
                        x: mousePos.x + Math.cos(angle) * distance,
                        y: mousePos.y + Math.sin(angle) * distance,
                        vx: (Math.random() - 0.5) * 2,
                        vy: (Math.random() - 0.5) * 2,
                        radius: Math.random() * 3 + 1,
                        color: Math.random() > 0.5 ? color : secondaryColor,
                        life: 0,
                        maxLife: maxTrailLength,
                    };

                    const circle = two.makeCircle(particle.x, particle.y, particle.radius);
                    circle.fill = particle.color;
                    circle.noStroke();
                    particle.shape = circle;
                    trail.push(particle);
                }
                trails.push(trail);
            }

            // Update trails
            for (let i = trails.length - 1; i >= 0; i--) {
                const trail = trails[i];
                let allDead = true;

                for (let j = trail.length - 1; j >= 0; j--) {
                    const p = trail[j];
                    p.life++;
                    p.x += p.vx * speed;
                    p.y += p.vy * speed;

                    if (p.shape) {
                        p.shape.translation.x = p.x;
                        p.shape.translation.y = p.y;
                        p.shape.opacity = 1 - p.life / p.maxLife;
                    }

                    if (p.life < p.maxLife) {
                        allDead = false;
                    } else if (p.shape) {
                        two.remove(p.shape);
                    }
                }

                if (allDead) {
                    trails.splice(i, 1);
                }
            }
        }).play();

        return () => {
            two.unbind("update");
            trails.forEach((trail) => {
                trail.forEach((p) => {
                    if (p.shape) two.remove(p.shape);
                });
            });
        };
    };

    const variants = {
        fireworks: setupFireworks,
        galaxy: setupGalaxy,
        fluid: setupFluid,
        magnetic: setupMagnetic,
        trail: setupTrail,
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
    }, [width, height, variant, color, secondaryColor, particleCount, speed, mousePos]);

    return (
        <div
            className={`relative ${className}`}
            onMouseMove={(e) => {
                if (interactive) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    // Map screen coordinates to canvas coordinates (0..width, 0..height)
                    const scaleX = width / rect.width;
                    const scaleY = height / rect.height;
                    setMousePos({
                        x: (e.clientX - rect.left) * scaleX,
                        y: (e.clientY - rect.top) * scaleY,
                    });
                }
            }}
        >
            <div
                ref={containerRef}
                style={{
                    width: '100%',
                    height: 'auto',
                    aspectRatio: `${width}/${height}`,
                    display: 'block',
                }}
            />
        </div>
    );
};
