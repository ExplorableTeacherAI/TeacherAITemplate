import { useState } from 'react';
import { Play, RotateCcw, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { TriggerProps } from './types';
import { ANNOTATION_COLORS } from './types';

/**
 * Trigger - Click to trigger an action/animation.
 * Category: Connective | Visual: Solid underline with icon
 */
export const Trigger: React.FC<TriggerProps> = ({
    id,
    children,
    action,
    icon = 'play',
    triggered: controlledTriggered,
    color = ANNOTATION_COLORS.connective.primary,
    bgColor = ANNOTATION_COLORS.connective.bg,
    className,
}) => {
    const [internalTriggered, setInternalTriggered] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const isControlled = controlledTriggered !== undefined;
    const triggered = isControlled ? controlledTriggered : internalTriggered;

    const handleClick = () => {
        action();
        if (!isControlled) setInternalTriggered(true);
    };

    const IconComponent = icon === 'play' ? Play : icon === 'refresh' ? RotateCcw : icon === 'toggle' ? Zap : null;

    return (
        <motion.span
            id={id}
            className={cn('annotation annotation-trigger', className)}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color,
                borderBottom: `2px solid ${color}`,
                paddingBottom: '1px',
                cursor: 'pointer',
                background: isHovered ? bgColor : 'transparent',
                borderRadius: isHovered ? '3px 3px 0 0' : '0',
                transition: 'all 0.2s ease',
                opacity: triggered ? 0.6 : 1,
            }}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileTap={{ scale: 0.97 }}
            role="button"
            tabIndex={0}
        >
            {children}
            {IconComponent && (
                <motion.span
                    animate={{ opacity: isHovered ? 0.8 : 0.5, scale: triggered ? 1.1 : 1 }}
                    style={{ display: 'inline-flex' }}
                >
                    <IconComponent size={14} />
                </motion.span>
            )}
        </motion.span>
    );
};

export default Trigger;
