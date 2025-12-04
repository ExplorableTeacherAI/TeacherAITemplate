import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface InlineTextInputProps {
    /** The correct answer */
    correctAnswer: string;
    /** Optional placeholder text (default: "???") */
    placeholder?: string;
    /** Optional color for the input and text (default: blue) */
    color?: string;
    /** Optional background color (supports RGBA for transparency) */
    bgColor?: string;
    /** Optional case sensitive checking (default: false) */
    caseSensitive?: boolean;
    /** Optional callback when answer is validated */
    onChange?: (value: string, isCorrect: boolean) => void;
}

/**
 * InlineTextInput Component
 * 
 * An interactive text input that can be embedded inline within paragraphs.
 * Students type their answer and press Enter to validate.
 * 
 * - Shows a button with "???" initially
 * - Clicking opens an input field
 * - Press Enter to check the answer
 * - If incorrect: shows input with red X to clear
 * - If correct: shows as plain colored text (locked)
 * 
 * @example
 * ```tsx
 * <p>
 *   A quarter circle is{" "}
 *   <InlineTextInput 
 *     correctAnswer="90°"
 *     color="#3B82F6"
 *     bgColor="rgba(59, 130, 246, 0.35)"
 *   />{" "}
 *   angle.
 * </p>
 * ```
 */
export const InlineTextInput: React.FC<InlineTextInputProps> = ({
    correctAnswer,
    placeholder = "???",
    color = "#3B82F6", // Default blue
    bgColor = "rgba(59, 130, 246, 0.35)", // Balanced transparency
    caseSensitive = false,
    onChange,
}) => {
    const [inputValue, setInputValue] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when entering edit mode
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleClick = () => {
        if (!isCorrect && !isChecked) {
            setIsEditing(true);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);

        // Auto-check the answer as user types
        const userAnswer = caseSensitive ? value : value.toLowerCase();
        const correctAns = caseSensitive ? correctAnswer : correctAnswer.toLowerCase();

        if (userAnswer.trim() === correctAns.trim()) {
            setIsCorrect(true);
            setIsChecked(true);
            setIsEditing(false);
            onChange?.(value, true);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            checkAnswer();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            if (!isChecked) {
                setInputValue("");
            }
        }
    };

    const checkAnswer = () => {
        const userAnswer = caseSensitive ? inputValue : inputValue.toLowerCase();
        const correctAns = caseSensitive ? correctAnswer : correctAnswer.toLowerCase();

        const correct = userAnswer.trim() === correctAns.trim();
        setIsCorrect(correct);
        setIsChecked(true);
        setIsEditing(false);
        onChange?.(inputValue, correct);
    };

    const handleClear = () => {
        setInputValue("");
        setIsChecked(false);
        setIsCorrect(false);
        setIsEditing(false);
    };

    const handleBlur = () => {
        // Don't close if there's no value
        if (inputValue.trim() === "") {
            setIsEditing(false);
        }
    };

    // If correct, show as plain colored text
    if (isCorrect && inputValue) {
        return (
            <span
                className="font-medium px-0.5 rounded"
                style={{ color }}
            >
                {inputValue}
            </span>
        );
    }

    // If checked but incorrect, show with X button
    if (isChecked && !isCorrect && inputValue) {
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
                    {inputValue}
                </span>
                <button
                    onClick={handleClear}
                    className="inline-flex items-center justify-center px-0.5 transition-all hover:scale-110"
                    style={{
                        color: '#EF4444',
                    }}
                    aria-label="Clear input"
                >
                    <X className="w-3 h-3" />
                </button>
            </span>
        );
    }

    // Editing state: show input field
    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                className="px-1 rounded font-medium transition-all backdrop-blur-sm outline-none"
                style={{
                    backgroundColor: bgColor,
                    color: color,
                    minWidth: '60px',
                    width: `${Math.max(60, inputValue.length * 10)}px`,
                }}
                placeholder={placeholder}
            />
        );
    }

    // Initial state: show button with placeholder
    return (
        <button
            onClick={handleClick}
            className="px-1 rounded font-medium transition-all hover:opacity-80 backdrop-blur-sm"
            style={{
                backgroundColor: bgColor,
                color: color,
            }}
        >
            {placeholder}
        </button>
    );
};

export default InlineTextInput;
