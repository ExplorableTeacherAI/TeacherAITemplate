import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FillBlankProps } from './types';
import { ANNOTATION_COLORS } from './types';

/**
 * FillBlank - Text input for quiz/validation.
 * Category: Validatable | Visual: Highlighted placeholder
 */
export const FillBlank: React.FC<FillBlankProps> = ({
    id,
    correctAnswer,
    placeholder = '???',
    caseSensitive = false,
    color = ANNOTATION_COLORS.validatable.primary,
    bgColor = ANNOTATION_COLORS.validatable.bg,
    onChange,
    className,
}) => {
    const [inputValue, setInputValue] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) inputRef.current.focus();
    }, [isEditing]);

    const checkAnswer = (val: string) => {
        const user = caseSensitive ? val : val.toLowerCase();
        const correct = caseSensitive ? correctAnswer : correctAnswer.toLowerCase();
        return user.trim() === correct.trim();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        if (checkAnswer(val)) {
            setIsCorrect(true);
            setIsChecked(true);
            setIsEditing(false);
            onChange?.(val, true);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            const correct = checkAnswer(inputValue);
            setIsCorrect(correct);
            setIsChecked(true);
            setIsEditing(false);
            onChange?.(inputValue, correct);
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            if (!isChecked) setInputValue('');
        }
    };

    const handleClear = () => {
        setInputValue('');
        setIsChecked(false);
        setIsCorrect(false);
        setIsEditing(false);
    };

    // Correct state 
    if (isCorrect && inputValue) {
        return (
            <span id={id} className={cn('font-medium', className)} style={{ color: ANNOTATION_COLORS.success.primary }}>
                {inputValue}
            </span>
        );
    }

    // Incorrect state
    if (isChecked && !isCorrect && inputValue) {
        return (
            <span
                id={id}
                className={cn('inline-flex items-center rounded', className)}
                style={{ background: ANNOTATION_COLORS.error.bg }}
            >
                <span className="px-1" style={{ color }}>{inputValue}</span>
                <button onClick={handleClear} className="px-0.5 hover:scale-110 transition-transform" style={{ color: ANNOTATION_COLORS.error.primary }}>
                    <X size={12} />
                </button>
            </span>
        );
    }

    // Editing state
    if (isEditing) {
        return (
            <input
                ref={inputRef}
                id={id}
                type="text"
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={() => inputValue.trim() === '' && setIsEditing(false)}
                className={cn('px-1 rounded font-medium outline-none', className)}
                style={{ background: bgColor, color, minWidth: '50px', width: `${Math.max(50, inputValue.length * 9)}px` }}
                placeholder={placeholder}
            />
        );
    }

    // Initial placeholder state
    return (
        <button
            id={id}
            onClick={() => setIsEditing(true)}
            className={cn('px-1 rounded font-medium hover:opacity-80', className)}
            style={{ background: bgColor, color }}
        >
            {placeholder}
        </button>
    );
};

export default FillBlank;
