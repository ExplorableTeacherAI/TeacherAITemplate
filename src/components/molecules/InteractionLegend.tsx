import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// InteractionLegend — a compact "how to read this article" banner
// ─────────────────────────────────────────────────────────────────────────────

/**
 * InteractionLegend
 *
 * A small, collapsible legend placed at the top of every article that teaches
 * new readers how the interactive elements work. Shows a one-sentence intro
 * and 3–4 live mini-demos of each interaction type (drag a number, fill in a
 * blank, pick from a dropdown, click to cycle).
 *
 * The legend starts collapsed to a single line with a subtle "How to interact"
 * label. Clicking expands it to reveal the mini-demos.
 *
 * Uses localStorage to remember if the user has already seen it.
 */

interface LegendItem {
    label: string;
    description: string;
    demo: React.ReactNode;
}

export interface InteractionLegendProps {
    /** Override the default legend items */
    items?: LegendItem[];
    /** Custom title (default: "How to read this article") */
    title?: string;
}

// ── Mini-demo: Scrubble Number ──────────────────────────────────────────────
const ScrubbleDemo: React.FC = () => {
    const [value, setValue] = useState(5);
    const [isDragging, setIsDragging] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const dragStartX = useRef(0);
    const dragStartValue = useRef(0);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        dragStartX.current = e.clientX;
        dragStartValue.current = value;
    }, [value]);

    useEffect(() => {
        if (!isDragging) return;
        const onMove = (e: MouseEvent) => {
            const delta = (e.clientX - dragStartX.current) / 15;
            const newVal = Math.round(Math.max(1, Math.min(20, dragStartValue.current + delta)));
            setValue(newVal);
        };
        const onUp = () => setIsDragging(false);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [isDragging]);

    const progress = ((value - 1) / 19) * 100;

    return (
        <span
            className="inline-flex items-center relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isHovered && !isDragging && (
                <span
                    className="absolute -top-2.5 left-0 right-0 h-1 rounded-full overflow-hidden"
                    style={{ backgroundColor: 'rgba(59,130,246,0.15)' }}
                >
                    <span
                        className="block h-full rounded-full transition-all duration-200"
                        style={{ width: `${progress}%`, backgroundColor: '#3B82F6' }}
                    />
                </span>
            )}
            <span
                onMouseDown={handleMouseDown}
                className="select-none font-semibold cursor-ew-resize"
                style={{
                    color: '#3B82F6',
                    borderBottom: '2px solid #3B82F6',
                    paddingBottom: '1px',
                }}
            >
                {value}
            </span>
        </span>
    );
};

// ── Mini-demo: Cloze Input ─────────────────────────────────────────────────
const ClozeInputDemo: React.FC = () => {
    const [state, setState] = useState<'blank' | 'typing' | 'correct' | 'wrong'>('blank');
    const [typed, setTyped] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        if (state === 'blank') {
            setState('typing');
            setTyped('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (typed.trim().toLowerCase() === '25') {
                setState('correct');
            } else {
                setState('wrong');
            }
        }
    };

    const handleClear = () => {
        setState('blank');
        setTyped('');
    };

    useEffect(() => {
        if (state === 'typing' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [state]);

    if (state === 'correct') {
        return (
            <span className="font-semibold" style={{ color: '#8B5CF6', borderBottom: '2px solid #8B5CF6', paddingBottom: '1px' }}>
                25
            </span>
        );
    }

    if (state === 'wrong') {
        return (
            <span className="font-semibold inline-flex items-center" style={{ borderBottom: '2px solid #EF4444', paddingBottom: '1px' }}>
                <span style={{ color: '#8B5CF6' }}>{typed}</span>
                <button onClick={handleClear} className="ml-0.5 inline-flex" style={{ color: '#EF4444' }} aria-label="Clear">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </span>
        );
    }

    if (state === 'typing') {
        return (
            <input
                ref={inputRef}
                type="text"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                    if (typed.trim() === '') setState('blank');
                    else if (typed.trim().toLowerCase() === '25') setState('correct');
                    else setState('wrong');
                }}
                className="font-semibold outline-none"
                style={{
                    color: '#8B5CF6',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '2px solid #8B5CF6',
                    font: 'inherit',
                    fontSize: 'inherit',
                    lineHeight: 'inherit',
                    padding: 0,
                    paddingBottom: '1px',
                    minWidth: '2em',
                    width: '3em',
                }}
                placeholder="???"
            />
        );
    }

    return (
        <span
            onClick={handleClick}
            className="select-none font-semibold cursor-pointer"
            style={{
                color: '#8B5CF6',
                borderBottom: '2px dotted #8B5CF6',
                paddingBottom: '1px',
            }}
        >
            ???
        </span>
    );
};

// ── Mini-demo: Cloze Choice ────────────────────────────────────────────────
const ClozeChoiceDemo: React.FC = () => {
    const [selected, setSelected] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleSelect = (option: string) => {
        setSelected(option);
        setIsCorrect(option === 'circle');
        setIsOpen(false);
    };

    const handleClear = () => {
        setSelected(null);
        setIsCorrect(false);
    };

    if (isCorrect && selected) {
        return (
            <span className="font-semibold" style={{ color: '#D81B60', borderBottom: '2px solid #D81B60', paddingBottom: '1px' }}>
                {selected}
            </span>
        );
    }

    if (selected && !isCorrect) {
        return (
            <span className="font-semibold inline-flex items-center" style={{ borderBottom: '2px solid #EF4444', paddingBottom: '1px' }}>
                <span style={{ color: '#D81B60' }}>{selected}</span>
                <button onClick={handleClear} className="ml-0.5 inline-flex" style={{ color: '#EF4444' }} aria-label="Clear">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </span>
        );
    }

    return (
        <span className="inline-block relative" ref={dropdownRef}>
            <span
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="select-none font-semibold cursor-pointer transition-all duration-150"
                style={{
                    color: '#D81B60',
                    borderBottom: '2px dotted #D81B60',
                    paddingBottom: '1px',
                    background: isHovered ? 'rgba(216, 27, 96, 0.1)' : 'transparent',
                    borderRadius: isHovered ? '3px 3px 0 0' : '0',
                }}
            >
                ??? &#x25BE;
            </span>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97 }}
                        transition={{ duration: 0.12 }}
                        className="absolute top-full left-0 mt-1 rounded-lg overflow-hidden z-50 min-w-[80px]"
                        style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                    >
                        {['square', 'circle', 'triangle'].map((opt) => (
                            <button
                                key={opt}
                                onClick={() => handleSelect(opt)}
                                className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors"
                                style={{ color: '#374151', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}
                            >
                                {opt}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
    );
};

// ── Mini-demo: Toggle ──────────────────────────────────────────────────────
const ToggleDemo: React.FC = () => {
    const options = ['meters', 'feet', 'inches'];
    const [index, setIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.span
            onClick={() => setIndex((i) => (i + 1) % options.length)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="font-medium cursor-pointer select-none"
            style={{
                color: '#D946EF',
                borderBottom: '2px dashed #D946EF',
                paddingBottom: '2px',
                background: isHovered ? 'rgba(217, 70, 239, 0.15)' : 'transparent',
                borderRadius: isHovered ? '3px 3px 0 0' : '0',
                transition: 'all 0.2s ease',
            }}
            whileTap={{ scale: 0.97 }}
            key={options[index]}
            initial={{ y: -4, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.15 }}
        >
            {options[index]}
        </motion.span>
    );
};

// ── Mini-demo: Trigger ─────────────────────────────────────────────────────
const TriggerDemo: React.FC = () => {
    const [fired, setFired] = useState(false);
    const color = '#10B981';

    return (
        <motion.span
            onClick={() => { setFired(true); setTimeout(() => setFired(false), 600); }}
            className="font-medium cursor-pointer select-none"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                color,
                textDecoration: 'none',
                backgroundImage: `repeating-linear-gradient(to right, ${color} 0px, ${color} 1.5px, transparent 1.5px, transparent 3.5px, ${color} 3.5px, ${color} 9px, transparent 9px, transparent 11px)`,
                backgroundPosition: '0 100%',
                backgroundSize: '11px 1.5px',
                backgroundRepeat: 'repeat-x',
                paddingBottom: '2.5px',
                transition: 'all 0.2s ease',
            }}
            whileTap={{ scale: 0.97 }}
            animate={fired ? { scale: [1, 1.08, 1] } : {}}
            transition={{ duration: 0.3 }}
        >
            reset to 1
        </motion.span>
    );
};

// ── Mini-demo: Tooltip ─────────────────────────────────────────────────────
const TooltipDemo: React.FC = () => {
    const [showTip, setShowTip] = useState(false);
    const spanRef = useRef<HTMLSpanElement>(null);
    const color = '#F59E0B';

    return (
        <span className="relative inline-block">
            <span
                ref={spanRef}
                onMouseEnter={() => setShowTip(true)}
                onMouseLeave={() => setShowTip(false)}
                className="font-medium cursor-help"
                style={{
                    color,
                    transition: 'all 0.2s ease',
                    ...(showTip ? { textShadow: `0 0 8px rgba(245, 158, 11, 0.3)`, background: 'rgba(245, 158, 11, 0.15)', borderRadius: '2px', padding: '0 2px', margin: '0 -2px' } : {}),
                }}
            >
                radius
            </span>
            <AnimatePresence>
                {showTip && (
                    <motion.span
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1.5 rounded-lg text-xs text-white whitespace-nowrap z-50"
                        style={{ background: color, boxShadow: `0 4px 12px rgba(245, 158, 11, 0.3)` }}
                    >
                        The distance from center to edge
                    </motion.span>
                )}
            </AnimatePresence>
        </span>
    );
};

// ── Mini-demo: Hyperlink ───────────────────────────────────────────────────
const HyperlinkDemo: React.FC = () => {
    const [isHovered, setIsHovered] = useState(false);
    const color = '#10B981';

    return (
        <span
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="font-medium cursor-pointer select-none"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                color,
                borderBottom: `2px solid ${color}`,
                paddingBottom: '1px',
                background: isHovered ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                borderRadius: isHovered ? '3px 3px 0 0' : '0',
                transition: 'all 0.2s ease',
            }}
        >
            Section 1
        </span>
    );
};

// ── Mini-demo: Linked Highlight ────────────────────────────────────────────
const LinkedHighlightDemo: React.FC = () => {
    const [active, setActive] = useState<'a' | 'b' | null>(null);
    const color = '#3b82f6';
    const activeBg = `${color}22`;

    const makeStyle = (id: 'a' | 'b'): React.CSSProperties => ({
        fontWeight: 500,
        color,
        textDecoration: 'underline',
        textDecorationStyle: 'dotted',
        textDecorationColor: color,
        padding: '1px 4px',
        borderRadius: '4px',
        backgroundColor: active === id ? activeBg : 'transparent',
        opacity: active && active !== id ? 0.4 : 1,
        transition: 'all 0.2s ease',
        cursor: 'default',
    });

    return (
        <>
            <span
                style={makeStyle('a')}
                onMouseEnter={() => setActive('a')}
                onMouseLeave={() => setActive(null)}
            >
                base
            </span>
            {' and '}
            <span
                style={makeStyle('b')}
                onMouseEnter={() => setActive('b')}
                onMouseLeave={() => setActive(null)}
            >
                height
            </span>
        </>
    );
};

// ── Default legend items ───────────────────────────────────────────────────
const defaultItems: LegendItem[] = [
    {
        label: 'Drag a number',
        description: 'Drag left or right to change the value.',
        demo: (
            <span className="text-sm text-gray-700 dark:text-gray-300">
                A square with side <ScrubbleDemo /> has a larger area.
            </span>
        ),
    },
    {
        label: 'Fill in the blank',
        description: 'Click the blank, type your answer, press Enter.',
        demo: (
            <span className="text-sm text-gray-700 dark:text-gray-300">
                A square with side 5 has area <ClozeInputDemo />.
            </span>
        ),
    },
    {
        label: 'Pick from choices',
        description: 'Click the dropdown and select an answer.',
        demo: (
            <span className="text-sm text-gray-700 dark:text-gray-300">
                A shape equidistant from the center is a <ClozeChoiceDemo />.
            </span>
        ),
    },
    {
        label: 'Click to cycle',
        description: 'Click to switch between options.',
        demo: (
            <span className="text-sm text-gray-700 dark:text-gray-300">
                The height is measured in <ToggleDemo />.
            </span>
        ),
    },
    {
        label: 'Click to trigger',
        description: 'Click to set a value instantly.',
        demo: (
            <span className="text-sm text-gray-700 dark:text-gray-300">
                You can <TriggerDemo /> the amplitude at any time.
            </span>
        ),
    },
    {
        label: 'Hover for definition',
        description: 'Hover to see a tooltip explanation.',
        demo: (
            <span className="text-sm text-gray-700 dark:text-gray-300">
                The <TooltipDemo /> of the circle determines its size.
            </span>
        ),
    },
    {
        label: 'Click to navigate',
        description: 'Click to jump to a section or open a link.',
        demo: (
            <span className="text-sm text-gray-700 dark:text-gray-300">
                Go back to <HyperlinkDemo /> for more details.
            </span>
        ),
    },
    {
        label: 'Linked highlight',
        description: 'Hover one to highlight its related pair.',
        demo: (
            <span className="text-sm text-gray-700 dark:text-gray-300">
                Multiply the <LinkedHighlightDemo /> to find the area.
            </span>
        ),
    },
];

// ── Main component ─────────────────────────────────────────────────────────
export const InteractionLegend: React.FC<InteractionLegendProps> = ({
    items = defaultItems,
    title = 'How to interact with this article',
}) => {
    const STORAGE_KEY = 'mathvibe-legend-seen';
    const [isOpen, setIsOpen] = useState(() => {
        try {
            return localStorage.getItem(STORAGE_KEY) !== 'true';
        } catch {
            return true;
        }
    });

    const handleToggle = () => {
        setIsOpen((prev) => {
            const next = !prev;
            if (!next) {
                try { localStorage.setItem(STORAGE_KEY, 'true'); } catch { /* noop */ }
            }
            return next;
        });
    };

    return (
        <div className="w-full max-w-3xl mx-auto mb-0 relative">
            <button
                onClick={handleToggle}
                className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-1 ml-auto"
            >
                <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="w-4 h-4" />
                </motion.span>
                <span className="font-medium">{title}</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute right-0 top-full mt-1 z-50 w-full max-w-xl rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl"
                    >
                        <div className="p-4 space-y-3">
                            {items.map((item, i) => (
                                <div key={i} className="flex flex-col gap-1.5 border border-gray-150 dark:border-gray-700 rounded-lg p-3">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 shrink-0">
                                            {item.label}
                                        </span>
                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                            {item.description}
                                        </span>
                                    </div>
                                    <div className="pl-0 leading-relaxed">
                                        {item.demo}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InteractionLegend;
