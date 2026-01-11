import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ToggleProps } from './types';
import { ANNOTATION_COLORS } from './types';

/**
 * Toggle - Cycles through options on click.
 * Category: Mutable | Visual: Dashed underline
 */
export const Toggle: React.FC<ToggleProps> = ({
    id,
    options,
    value: controlledIndex,
    initialValue = 0,
    color = ANNOTATION_COLORS.mutable.primary,
    bgColor = ANNOTATION_COLORS.mutable.bg,
    onChange,
    className,
}) => {
    const [internalIndex, setInternalIndex] = useState(controlledIndex ?? initialValue);
    const [isHovered, setIsHovered] = useState(false);

    const isControlled = controlledIndex !== undefined;
    const currentIndex = isControlled ? controlledIndex : internalIndex;
    const currentValue = options[currentIndex] || options[0];

    const cycle = () => {
        const nextIndex = (currentIndex + 1) % options.length;
        if (!isControlled) setInternalIndex(nextIndex);
        onChange?.(options[nextIndex], nextIndex);
    };

    return (
        <span
            id={id}
            className={cn('annotation annotation-toggle', className)}
            style={{
                color,
                borderBottom: `2px dashed ${color}`,
                paddingBottom: '2px',
                cursor: 'pointer',
                userSelect: 'none',
                background: isHovered ? bgColor : 'transparent',
                borderRadius: isHovered ? '3px 3px 0 0' : '0',
                transition: 'all 0.2s ease',
            }}
            onClick={cycle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            tabIndex={0}
            role="button"
        >
            <AnimatePresence mode="wait">
                <motion.span
                    key={currentIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    style={{ fontWeight: 500 }}
                >
                    {currentValue}
                </motion.span>
            </AnimatePresence>
            <motion.span
                animate={{ opacity: isHovered ? 0.6 : 0, rotate: isHovered ? 180 : 0 }}
                style={{ marginLeft: '3px', fontSize: '0.8em' }}
            >
                ⟳
            </motion.span>
        </span>
    );
};

export default Toggle;
