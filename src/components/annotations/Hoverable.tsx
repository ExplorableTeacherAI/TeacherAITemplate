import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { HoverableProps } from './types';
import { ANNOTATION_COLORS } from './types';

/**
 * Hoverable - An inline annotation that reveals a tooltip on hover.
 * 
 * Category: Informational
 * Visual Style: Colored text with subtle glow, no underline
 * 
 * @example
 * ```tsx
 * <p>
 *   Every point on a{' '}
 *   <Hoverable tooltip="A shape where all points are equidistant from the center.">
 *     circle
 *   </Hoverable>{' '}
 *   has the same distance from its center.
 * </p>
 * ```
 */
export const Hoverable: React.FC<HoverableProps> = ({
    id,
    children,
    tooltip,
    position = 'auto',
    maxWidth = 400,
    color = ANNOTATION_COLORS.informational.primary,
    bgColor = ANNOTATION_COLORS.informational.bg,
    className,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom'>('bottom');
    const [tooltipCoords, setTooltipCoords] = useState({ top: 0, left: 0 });
    const termRef = useRef<HTMLSpanElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!termRef.current || !isHovered) return;

        const rect = termRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        const tooltipHeight = tooltipRef.current?.offsetHeight || 100;
        const gap = 8;

        // Determine position
        let finalPosition: 'top' | 'bottom' = 'bottom';
        if (position === 'auto') {
            if (spaceBelow < tooltipHeight + gap && spaceAbove > spaceBelow) {
                finalPosition = 'top';
            }
        } else {
            finalPosition = position;
        }

        setTooltipPosition(finalPosition);

        // Calculate tooltip coordinates
        const tooltipTop = finalPosition === 'bottom'
            ? rect.bottom + window.scrollY + gap
            : rect.top + window.scrollY - tooltipHeight - gap;

        // Center tooltip horizontally, but keep within viewport
        const tooltipWidth = Math.min(maxWidth, window.innerWidth - 32);
        let tooltipLeft = rect.left + (rect.width / 2) - (tooltipWidth / 2) + window.scrollX;
        tooltipLeft = Math.max(16, Math.min(tooltipLeft, window.innerWidth - tooltipWidth - 16));

        setTooltipCoords({
            top: tooltipTop,
            left: tooltipLeft,
        });
    }, [isHovered, position, maxWidth]);

    return (
        <>
            <span
                ref={termRef}
                id={id}
                className={cn(
                    'annotation annotation-hoverable',
                    className
                )}
                style={{
                    color: color,
                    textShadow: isHovered ? `0 0 8px ${ANNOTATION_COLORS.informational.glow}` : 'none',
                    background: isHovered ? bgColor : 'transparent',
                    borderRadius: '2px',
                    padding: isHovered ? '0 2px' : '0',
                    margin: isHovered ? '0 -2px' : '0',
                    cursor: 'help',
                    transition: 'all 0.2s ease',
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {children}
            </span>

            {/* Tooltip via Portal */}
            {typeof window !== 'undefined' && createPortal(
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            ref={tooltipRef}
                            initial={{ opacity: 0, y: tooltipPosition === 'bottom' ? -8 : 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: tooltipPosition === 'bottom' ? -8 : 8, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                            className="annotation-tooltip annotation-tooltip--informational"
                            style={{
                                position: 'fixed',
                                top: `${tooltipCoords.top}px`,
                                left: `${tooltipCoords.left}px`,
                                maxWidth: `${maxWidth}px`,
                                minWidth: '200px',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                background: color,
                                color: 'white',
                                fontSize: '0.9rem',
                                lineHeight: 1.6,
                                boxShadow: `0 4px 20px ${ANNOTATION_COLORS.informational.glow}`,
                                pointerEvents: 'none',
                                zIndex: 1000,
                            }}
                        >
                            {typeof tooltip === 'string' ? (
                                <p className="m-0">{tooltip}</p>
                            ) : (
                                tooltip
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
};

export default Hoverable;
