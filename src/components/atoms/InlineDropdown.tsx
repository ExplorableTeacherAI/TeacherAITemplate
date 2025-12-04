import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface InlineDropdownProps {
    /** The correct answer */
    correctAnswer: string;
    /** Array of options to choose from */
    options: string[];
    /** Optional placeholder text (default: "???") */
    placeholder?: string;
    /** Optional color for the button and dropdown (default: blue) */
    color?: string;
    /** Optional background color (supports RGBA for transparency) */
    bgColor?: string;
    /** Optional callback when selection changes */
    onChange?: (value: string, isCorrect: boolean) => void;
}

/**
 * InlineDropdown Component
 * 
 * An interactive dropdown that can be embedded inline within paragraphs.
 * Students select from options, and the component validates their choice.
 * 
 * - Shows a button with "???" initially
 * - Opens a dropdown menu when clicked
 * - If incorrect: shows selection with red X to clear
 * - If correct: shows as plain colored text (locked)
 * 
 * @example
 * ```tsx
 * <p>
 *   The definition of a sphere is similar to a{" "}
 *   <InlineDropdown 
 *     correctAnswer="circle"
 *     options={["cube", "circle", "radius"]}
 *     color="#3B82F6"
 *     bgColor="rgba(59, 130, 246, 0.15)"
 *   />{" "}
 *   – except in three dimensions!
 * </p>
 * ```
 */
export const InlineDropdown: React.FC<InlineDropdownProps> = ({
    correctAnswer,
    options,
    placeholder = "???",
    color = "#3B82F6", // Default blue
    bgColor = "rgba(59, 130, 246, 0.35)", // Balanced transparency
    onChange,
}) => {
    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (option: string) => {
        const correct = option === correctAnswer;
        setSelectedValue(option);
        setIsCorrect(correct);
        setIsOpen(false);
        onChange?.(option, correct);
    };

    const handleClear = () => {
        setSelectedValue(null);
        setIsCorrect(false);
    };

    // If correct, show as plain colored text
    if (isCorrect && selectedValue) {
        return (
            <span
                className="font-medium px-0.5 rounded"
                style={{ color }}
            >
                {selectedValue}
            </span>
        );
    }

    // If incorrect, show with X button
    if (selectedValue && !isCorrect) {
        return (
            <span
                className="inline-flex items-center rounded font-medium"
                style={{
                    backgroundColor: bgColor,
                }}
            >
                <span
                    className="px-1"
                    style={{
                        color: color,
                    }}
                >
                    {selectedValue}
                </span>
                <button
                    onClick={handleClear}
                    className="inline-flex items-center justify-center px-0.5 transition-all hover:scale-110"
                    style={{
                        color: '#EF4444',
                    }}
                    aria-label="Clear selection"
                >
                    <X className="w-3 h-3" />
                </button>
            </span>
        );
    }

    // Initial state: show dropdown button
    return (
        <span className="inline-block relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-1 rounded font-medium transition-all hover:opacity-80 backdrop-blur-sm"
                style={{
                    backgroundColor: bgColor,
                    color: color,
                }}
            >
                {placeholder}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                        className="absolute top-full left-0 mt-1 rounded-lg shadow-lg overflow-hidden z-50 min-w-[140px] backdrop-blur-sm"
                        style={{
                            backgroundColor: bgColor.replace(/[\d.]+\)/, '0.75)'), // Medium opacity for dropdown menu
                        }}
                    >
                        {options.map((option, index) => (
                            <button
                                key={option}
                                onClick={() => handleSelect(option)}
                                className="w-full text-left px-2 py-1 transition-all text-sm font-medium"
                                style={{
                                    color: 'white', // White text for better contrast
                                    borderBottom: index !== options.length - 1 ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                {option}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
    );
};

export default InlineDropdown;
