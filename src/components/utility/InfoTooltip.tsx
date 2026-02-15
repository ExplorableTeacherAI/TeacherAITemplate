import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface InfoTooltipProps {
    /** The term or text to be highlighted */
    term: string;
    /** The detailed explanation to show in the tooltip */
    description: string;
    /** Optional custom color for the underline/highlight (default: vibrant orange) */
    highlightColor?: string;
    /** Optional custom background color for the tooltip (default: gradient orange) */
    tooltipBgColor?: string;
    /** Optional position preference: 'top' | 'bottom' | 'auto' (default: 'auto') */
    position?: 'top' | 'bottom' | 'auto';
    /** Optional maximum width for the tooltip (default: 400px) */
    maxWidth?: number;
}

/**
 * InfoTooltip Component
 * 
 * An interactive atom component that displays a vibrant popup with additional
 * information when hovering over highlighted terms within text content.
 * 
 * Perfect for creating explorable explanations where students can learn more
 * about specific terms or concepts by hovering over them.
 * 
 * @example
 * ```tsx
 * <p>
 *   Every point on a <InfoTooltip 
 *     term="circle" 
 *     description="A circle is a geometric shape where all points are equidistant from a center point."
 *   /> has the same distance from its center.
 * </p>
 * ```
 * 
 * @example
 * ```tsx
 * <InfoTooltip 
 *   term="compass"
 *   description="A compass is a drawing tool used for creating circles or arcs. It consists of two arms – the needle on one end is placed in the center, while pencil on the other end traces out the curve."
 *   highlightColor="#F97316"
 *   tooltipBgColor="linear-gradient(135deg, #FB923C 0%, #F97316 100%)"
 * />
 * ```
 */
export const InfoTooltip: React.FC<InfoTooltipProps> = ({
    term,
    description,
    highlightColor = '#faa061ff', // Orange accent
    tooltipBgColor = 'rgba(253, 187, 134, 0.95)', // Balanced transparency
    position = 'auto',
    maxWidth = 400,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom'>('bottom');
    const [tooltipCoords, setTooltipCoords] = useState({ top: 0, left: 0 });
    const termRef = useRef<HTMLSpanElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (termRef.current && isHovered) {
            const rect = termRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - rect.bottom;
            const spaceAbove = rect.top;

            // Use actual tooltip height if available, otherwise estimate
            const tooltipHeight = tooltipRef.current?.offsetHeight || 120;
            const gap = 8; // Gap between term and tooltip

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

            setTooltipCoords({
                top: tooltipTop,
                left: rect.left + window.scrollX,
            });
        }
    }, [isHovered, position]);

    return (
        <>
            <span
                ref={termRef}
                className="relative inline-block"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Highlighted Term */}
                <span
                    className="cursor-help font-medium transition-all duration-200"
                    style={{
                        borderBottom: `2px solid ${highlightColor}`,
                        paddingBottom: '2px',
                        color: isHovered ? highlightColor : 'inherit',
                    }}
                >
                    {term}
                </span>
            </span>

            {/* Tooltip Popup - Rendered via Portal */}
            {createPortal(
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, y: tooltipPosition === 'bottom' ? -10 : 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: tooltipPosition === 'bottom' ? -10 : 10, scale: 0.95 }}
                            transition={{
                                duration: 0.2,
                                ease: [0.4, 0, 0.2, 1],
                            }}
                            className="fixed z-50 pointer-events-none"
                            style={{
                                top: `${tooltipCoords.top}px`,
                                left: `${tooltipCoords.left}px`,
                                maxWidth: `${maxWidth}px`,
                                minWidth: '280px',
                            }}
                        >
                            {/* Tooltip Content */}
                            <div
                                ref={tooltipRef}
                                className="rounded-xl px-5 py-4 shadow-lg backdrop-blur-sm border border-white/20"
                                style={{
                                    background: tooltipBgColor,
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                }}
                            >
                                <p className="text-sm leading-relaxed font-normal text-white">
                                    {description}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
};

export default InfoTooltip;
