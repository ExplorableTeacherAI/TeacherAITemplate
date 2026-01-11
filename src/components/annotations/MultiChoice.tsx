import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MultiChoiceProps } from './types';
import { ANNOTATION_COLORS } from './types';

/**
 * MultiChoice - Dropdown selection for quiz.
 * Category: Validatable | Visual: Highlighted placeholder with dropdown
 */
export const MultiChoice: React.FC<MultiChoiceProps> = ({
    id,
    correctAnswer,
    options,
    placeholder = '???',
    color = ANNOTATION_COLORS.validatable.primary,
    bgColor = ANNOTATION_COLORS.validatable.bg,
    onChange,
    className,
}) => {
    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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

    // Correct state
    if (isCorrect && selectedValue) {
        return (
            <span id={id} className={cn('font-medium', className)} style={{ color: ANNOTATION_COLORS.success.primary }}>
                {selectedValue}
            </span>
        );
    }

    // Incorrect state
    if (selectedValue && !isCorrect) {
        return (
            <span id={id} className={cn('inline-flex items-center rounded', className)} style={{ background: ANNOTATION_COLORS.error.bg }}>
                <span className="px-1" style={{ color }}>{selectedValue}</span>
                <button onClick={handleClear} className="px-0.5 hover:scale-110 transition-transform" style={{ color: ANNOTATION_COLORS.error.primary }}>
                    <X size={12} />
                </button>
            </span>
        );
    }

    // Dropdown state
    return (
        <span id={id} className="inline-block relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn('px-1 rounded font-medium hover:opacity-80', className)}
                style={{ background: bgColor, color }}
            >
                {placeholder}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.95 }}
                        transition={{ duration: 0.12 }}
                        className="absolute top-full left-0 mt-1 rounded-lg shadow-lg overflow-hidden z-50 min-w-[120px]"
                        style={{ background: color }}
                    >
                        {options.map((option, idx) => (
                            <button
                                key={option}
                                onClick={() => handleSelect(option)}
                                className="w-full text-left px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                                style={{ borderBottom: idx < options.length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none' }}
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

export default MultiChoice;
