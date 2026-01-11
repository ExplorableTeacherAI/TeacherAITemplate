import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { WhisperProps } from './types';
import { ANNOTATION_COLORS } from './types';

/**
 * Whisper - Faded text that reveals on hover.
 * Category: Informational | Visual: Faded text → full opacity
 */
export const Whisper: React.FC<WhisperProps> = ({
    id,
    children,
    hiddenContent,
    initialOpacity = 0.25,
    color = ANNOTATION_COLORS.informational.primary,
    className,
}) => {
    const [isRevealed, setIsRevealed] = useState(false);

    return (
        <motion.span
            id={id}
            className={cn('annotation annotation-whisper', className)}
            style={{
                cursor: 'help',
                color: isRevealed ? color : 'inherit',
            }}
            animate={{ opacity: isRevealed ? 1 : initialOpacity }}
            onMouseEnter={() => setIsRevealed(true)}
            onMouseLeave={() => setIsRevealed(false)}
        >
            {isRevealed ? hiddenContent : children}
        </motion.span>
    );
};

export default Whisper;
