import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { LinkedProps } from './types';
import { ANNOTATION_COLORS } from './types';

// Context for bidirectional highlighting
interface LinkedContextValue {
    activeId: string | null;
    setActiveId: (id: string | null) => void;
}

const LinkedContext = createContext<LinkedContextValue | null>(null);

export const useLinkedContext = () => useContext(LinkedContext);

/**
 * LinkedProvider - Provides context for bidirectional highlighting.
 */
export const LinkedProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeId, setActiveId] = useState<string | null>(null);
    return (
        <LinkedContext.Provider value={{ activeId, setActiveId }}>
            {children}
        </LinkedContext.Provider>
    );
};

/**
 * Linked - Bidirectional highlighting between text and visuals.
 * Category: Connective | Visual: Dotted underline, color highlight
 */
export const Linked: React.FC<LinkedProps> = ({
    id,
    linkId,
    children,
    color = ANNOTATION_COLORS.connective.primary,
    bgColor = ANNOTATION_COLORS.connective.bg,
    isActive: propIsActive,
    onHoverStart,
    onHoverEnd,
    onClick,
    dimOthers = true,
    className,
}) => {
    const ctx = useLinkedContext();

    const isActive = propIsActive ?? (ctx?.activeId === linkId);
    const hasActiveOther = ctx?.activeId && ctx.activeId !== linkId;

    const handleMouseEnter = useCallback(() => {
        ctx?.setActiveId(linkId);
        onHoverStart?.(linkId);
    }, [ctx, linkId, onHoverStart]);

    const handleMouseLeave = useCallback(() => {
        ctx?.setActiveId(null);
        onHoverEnd?.(linkId);
    }, [ctx, linkId, onHoverEnd]);

    const handleClick = useCallback(() => {
        onClick?.(linkId);
    }, [onClick, linkId]);

    return (
        <span
            id={id}
            className={cn('annotation annotation-linked', className)}
            style={{
                color,
                borderBottom: `2px dotted ${color}`,
                paddingBottom: '1px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: isActive ? bgColor : 'transparent',
                borderRadius: isActive ? '3px 3px 0 0' : '0',
                textShadow: isActive ? `0 0 8px ${ANNOTATION_COLORS.connective.glow}` : 'none',
                opacity: dimOthers && hasActiveOther ? 0.4 : 1,
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {children}
        </span>
    );
};

/**
 * Hook to get current active link ID.
 */
export const useActiveLink = () => useLinkedContext()?.activeId ?? null;

/**
 * Hook to set active link ID programmatically.
 */
export const useSetActiveLink = () => useLinkedContext()?.setActiveId ?? (() => { });

export default Linked;
