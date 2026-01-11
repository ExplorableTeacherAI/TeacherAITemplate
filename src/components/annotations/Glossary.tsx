import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GlossaryProps } from './types';
import { ANNOTATION_COLORS } from './types';

/**
 * Glossary - An inline annotation for glossary terms with definition cards.
 * 
 * Category: Informational
 * Visual Style: Dotted underline, shows rich definition card on hover
 * 
 * @example
 * ```tsx
 * <p>
 *   The{' '}
 *   <Glossary 
 *     term="radius" 
 *     definition="The distance from the center of a circle to any point on its circumference."
 *     pronunciation="/ˈreɪdiəs/"
 *     relatedTerms={['diameter', 'circumference']}
 *   />{' '}
 *   is half the diameter.
 * </p>
 * ```
 */
export const Glossary: React.FC<GlossaryProps> = ({
    id,
    term,
    definition,
    pronunciation,
    relatedTerms,
    color = ANNOTATION_COLORS.informational.primary,
    bgColor = ANNOTATION_COLORS.informational.bg,
    className,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [cardPosition, setCardPosition] = useState<'top' | 'bottom'>('bottom');
    const [cardCoords, setCardCoords] = useState({ top: 0, left: 0 });
    const termRef = useRef<HTMLSpanElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!termRef.current || !isHovered) return;

        const rect = termRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        const cardHeight = cardRef.current?.offsetHeight || 150;
        const gap = 10;

        // Determine position
        let finalPosition: 'top' | 'bottom' = 'bottom';
        if (spaceBelow < cardHeight + gap && spaceAbove > spaceBelow) {
            finalPosition = 'top';
        }
        setCardPosition(finalPosition);

        // Calculate card coordinates
        const cardTop = finalPosition === 'bottom'
            ? rect.bottom + window.scrollY + gap
            : rect.top + window.scrollY - cardHeight - gap;

        const cardWidth = 320;
        let cardLeft = rect.left + window.scrollX - (cardWidth / 2) + (rect.width / 2);
        cardLeft = Math.max(16, Math.min(cardLeft, window.innerWidth - cardWidth - 16));

        setCardCoords({
            top: cardTop,
            left: cardLeft,
        });
    }, [isHovered]);

    return (
        <>
            <span
                ref={termRef}
                id={id}
                className={cn(
                    'annotation annotation-glossary',
                    className
                )}
                style={{
                    color: color,
                    borderBottom: `2px dotted ${color}`,
                    paddingBottom: '1px',
                    cursor: 'help',
                    transition: 'all 0.2s ease',
                    background: isHovered ? bgColor : 'transparent',
                    borderRadius: isHovered ? '2px 2px 0 0' : '0',
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {term}
            </span>

            {/* Glossary Card via Portal */}
            {typeof window !== 'undefined' && createPortal(
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            ref={cardRef}
                            initial={{ opacity: 0, y: cardPosition === 'bottom' ? -10 : 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: cardPosition === 'bottom' ? -10 : 10, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                            style={{
                                position: 'fixed',
                                top: `${cardCoords.top}px`,
                                left: `${cardCoords.left}px`,
                                width: '320px',
                                padding: '0',
                                borderRadius: '12px',
                                background: 'white',
                                boxShadow: `0 8px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px ${bgColor}`,
                                pointerEvents: 'none',
                                zIndex: 1000,
                                overflow: 'hidden',
                            }}
                        >
                            {/* Header */}
                            <div
                                style={{
                                    background: `linear-gradient(135deg, ${color} 0%, #e67e22 100%)`,
                                    padding: '12px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                            >
                                <BookOpen size={18} color="white" />
                                <span style={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>
                                    {term}
                                </span>
                                {pronunciation && (
                                    <span style={{
                                        color: 'rgba(255,255,255,0.8)',
                                        fontSize: '0.85rem',
                                        fontStyle: 'italic',
                                    }}>
                                        {pronunciation}
                                    </span>
                                )}
                            </div>

                            {/* Definition */}
                            <div style={{ padding: '14px 16px' }}>
                                <p style={{
                                    margin: 0,
                                    fontSize: '0.9rem',
                                    lineHeight: 1.6,
                                    color: '#374151',
                                }}>
                                    {definition}
                                </p>

                                {/* Related Terms */}
                                {relatedTerms && relatedTerms.length > 0 && (
                                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Related:
                                        </span>
                                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                                            {relatedTerms.map((related) => (
                                                <span
                                                    key={related}
                                                    style={{
                                                        fontSize: '0.8rem',
                                                        padding: '2px 8px',
                                                        background: bgColor,
                                                        color: color,
                                                        borderRadius: '4px',
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {related}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
};

export default Glossary;
