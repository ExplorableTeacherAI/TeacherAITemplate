import React, { useState, createContext, useContext } from 'react';
import { Equation } from './Equation';
import { cn } from '@/lib/utils';
import { useOptionalEditing } from '@/contexts/EditingContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { useEditableTextContext } from '@/components/editing/EditableText';

// Context for sharing hover state between equation and text
interface ColoredEquationContextValue {
    activeTerm: string | null;
    setActiveTerm: (term: string | null) => void;
    colorMap: Record<string, string>;
}

const ColoredEquationContext = createContext<ColoredEquationContextValue | null>(null);

// Hook to use the context
const useColoredEquation = () => {
    const context = useContext(ColoredEquationContext);
    if (!context) {
        throw new Error('useColoredEquation must be used within ColoredEquationProvider');
    }
    return context;
};

interface ColoredEquationProviderProps {
    colorMap: Record<string, string>;
    children: React.ReactNode;
    className?: string;
}

/**
 * ColoredEquationProvider - Container for colored equation explanations.
 * 
 * Wrap your content (paragraphs, equations) with this component to enable
 * bidirectional hover between equation terms and explanation text.
 * 
 * Example:
 * <ColoredEquationProvider colorMap={{ E: '#ff0000', m: '#0000ff', c: '#00ff00' }}>
 *   <p>
 *     The famous equation <ColoredEquation latex="\clr{E}{E} = \clr{m}{m}\clr{c}{c}^2" /> 
 *     shows that <HighlightedTerm name="E">energy</HighlightedTerm> equals <HighlightedTerm name="m">mass</HighlightedTerm> times 
 *     <HighlightedTerm name="c">the speed of light</HighlightedTerm> squared.
 *   </p>
 * </ColoredEquationProvider>
 */
export const ColoredEquationProvider: React.FC<ColoredEquationProviderProps> = ({
    colorMap,
    children,
    className = '',
}) => {
    const [activeTerm, setActiveTerm] = useState<string | null>(null);

    // Editing support: Check if any equation inside this provider has pending color edits
    const editingContext = useOptionalEditing();
    const { isEditor } = useAppMode();
    const pendingEdits = editingContext?.pendingEdits || [];
    const isEditing = editingContext?.isEditing && isEditor;

    // Derived color map from pending edits
    const effectiveColorMap = React.useMemo(() => {
        if (!isEditing || pendingEdits.length === 0) return colorMap;

        // Try to find an equation edit that has a color map
        // We look for the most recent one. 
        // Note: This is a heuristics-based approach since we don't strictly know if the equation belongs to this provider.
        // But typically, a section shares a color scheme.
        const colorEdit = [...pendingEdits].reverse().find(e =>
            e.type === 'equation' &&
            e.colorMap &&
            Object.keys(e.colorMap).length > 0
        );

        return (colorEdit as any)?.colorMap || colorMap;
    }, [isEditing, pendingEdits, colorMap]);

    return (
        <ColoredEquationContext.Provider value={{ activeTerm, setActiveTerm, colorMap: effectiveColorMap }}>
            <div className={cn("colored-equation-provider", className)}>
                {children}
            </div>
        </ColoredEquationContext.Provider>
    );
};

interface ColoredEquationProps {
    latex: string;
    className?: string;
}

/**
 * ColoredEquation - An equation with colored, interactive terms.
 * Inherits text size from parent. Must be used within ColoredEquationProvider.
 */
export const ColoredEquation: React.FC<ColoredEquationProps> = ({
    latex,
    className = '',
}) => {
    const { activeTerm, setActiveTerm, colorMap } = useColoredEquation();

    return (
        <span className={cn("inline-block align-baseline", className)}>
            <Equation
                latex={latex}
                colorMap={colorMap}
                activeTerm={activeTerm}
                onTermHover={setActiveTerm}
                className="inline [&_.katex]:text-[1em]"
            />
        </span>
    );
};

interface HighlightedTermProps {
    name: string;
    children: React.ReactNode;
    className?: string;
    sectionId?: string;
}

/**
 * HighlightedTerm - Text that corresponds to an equation term.
 * Highlights when the matching equation term is hovered, and vice versa.
 * Must be used within ColoredEquationProvider.
 * Now supports inline editing when in edit mode.
 */
export const HighlightedTerm: React.FC<HighlightedTermProps> = ({
    name,
    children,
    className = '',
    sectionId = '',
}) => {
    const { activeTerm, setActiveTerm, colorMap } = useColoredEquation();
    const color = colorMap[name];
    const isActive = activeTerm === name;
    const hasActiveTerm = activeTerm !== null;

    // Editing state
    const [isContentEditable, setIsContentEditable] = React.useState(false);
    const [originalText, setOriginalText] = React.useState('');
    const spanRef = React.useRef<HTMLSpanElement>(null);

    // Get editing context - optional hook that doesn't throw if not in provider
    const { isEditor } = useAppMode();
    const editingContext = useOptionalEditing();
    const addTextEdit = editingContext?.addTextEdit;

    // Check if we are inside an editable text component that is currently being edited
    // Use try-catch or safe access since useEditableTextContext might not be wrapped
    let isParentEditable = false;
    try {
        const ctx = useEditableTextContext();
        isParentEditable = ctx.isParentEditable;
    } catch {
        // Not inside EditableText
    }

    const handleClick = (e: React.MouseEvent) => {
        // If parent is already editable, we don't want to trigger separate editing for this term
        // We just want to let the cursor be placed naturally
        if (isParentEditable) return;

        if (!isEditor || isContentEditable) return;

        e.stopPropagation();

        if (spanRef.current) {
            setOriginalText(spanRef.current.innerText);
            setIsContentEditable(true);

            setTimeout(() => {
                if (spanRef.current) {
                    spanRef.current.focus();
                    const range = document.createRange();
                    range.selectNodeContents(spanRef.current);
                    const selection = window.getSelection();
                    selection?.removeAllRanges();
                    selection?.addRange(range);
                }
            }, 0);
        }
    };

    const handleBlur = () => {
        if (!spanRef.current) return;

        const newText = spanRef.current.innerText;

        if (newText !== originalText && addTextEdit) {
            addTextEdit({
                sectionId,
                elementPath: `HighlightedTerm[${name}]`,
                originalText,
                newText,
            });
        }

        setIsContentEditable(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            spanRef.current?.blur();
        }
        if (e.key === 'Escape') {
            if (spanRef.current) {
                spanRef.current.innerText = originalText;
            }
            setIsContentEditable(false);
        }
    };

    return (
        <span
            ref={spanRef}
            className={cn(
                "cursor-pointer transition-all duration-150 rounded px-0.5 outline-none focus:outline-none",
                className
            )}
            style={{
                color: color,
                opacity: hasActiveTerm ? (isActive ? 1 : 0.35) : 1,
                backgroundColor: isActive ? `${color}20` : 'transparent',
            }}
            contentEditable={isContentEditable}
            suppressContentEditableWarning
            onMouseEnter={() => !isContentEditable && setActiveTerm(name)}
            onMouseLeave={() => !isContentEditable && setActiveTerm(null)}
            onClick={handleClick}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
        >
            {children}
        </span>
    );
};

interface TermRevealProps {
    terms: string | string[];
    children: React.ReactNode;
    className?: string;
    fadeStyle?: 'opacity' | 'blur';
}

/**
 * TermReveal - Content that reveals when specific term(s) are hovered.
 * Great for progressive disclosure of information.
 */
export const TermReveal: React.FC<TermRevealProps> = ({
    terms,
    children,
    className = '',
    fadeStyle = 'opacity',
}) => {
    const { activeTerm } = useColoredEquation();
    const termArray = Array.isArray(terms) ? terms : [terms];
    const isActive = activeTerm !== null && termArray.includes(activeTerm);

    const fadeStyles = fadeStyle === 'blur'
        ? { filter: isActive ? 'blur(0)' : 'blur(4px)', opacity: isActive ? 1 : 0.3 }
        : { opacity: isActive ? 1 : 0.3 };

    return (
        <span
            className={cn("transition-all duration-200", className)}
            style={fadeStyles}
        >
            {children}
        </span>
    );
};
