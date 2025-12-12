import React, { useState, createContext, useContext } from 'react';
import { Equation } from './Equation';
import { cn } from '@/lib/utils';

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

    return (
        <ColoredEquationContext.Provider value={{ activeTerm, setActiveTerm, colorMap }}>
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
}

/**
 * HighlightedTerm - Text that corresponds to an equation term.
 * Highlights when the matching equation term is hovered, and vice versa.
 * Must be used within ColoredEquationProvider.
 */
export const HighlightedTerm: React.FC<HighlightedTermProps> = ({
    name,
    children,
    className = '',
}) => {
    const { activeTerm, setActiveTerm, colorMap } = useColoredEquation();
    const color = colorMap[name];
    const isActive = activeTerm === name;
    const hasActiveTerm = activeTerm !== null;

    return (
        <span
            className={cn(
                "cursor-pointer transition-opacity duration-150 rounded px-0.5",
                className
            )}
            style={{
                color: color,
                opacity: hasActiveTerm ? (isActive ? 1 : 0.35) : 1,
                backgroundColor: isActive ? `${color}20` : 'transparent',
            }}
            onMouseEnter={() => setActiveTerm(name)}
            onMouseLeave={() => setActiveTerm(null)}
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
