import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface InlineStepperProps {
    /** Controlled value (if provided, component is controlled) */
    value?: number;
    /** Initial value (for uncontrolled mode) */
    initialValue?: number;
    /** Minimum value (default: 0) */
    min?: number;
    /** Maximum value (default: 100) */
    max?: number;
    /** Step amount (default: 1) */
    step?: number;
    /** Optional color for the stepper (default: pink/magenta) */
    color?: string;
    /** Optional background color (supports RGBA for transparency) */
    bgColor?: string;
    /** Optional callback when value changes */
    onChange?: (value: number) => void;
    /** Format the displayed value (e.g., to show decimals) */
    formatValue?: (value: number) => string;
}

/**
 * InlineStepper Component
 * 
 * An interactive number stepper that can be embedded inline within paragraphs.
 * Users can click arrows, drag, or use keyboard to change the value.
 * 
 * Supports both controlled and uncontrolled modes:
 * - Controlled: Pass `value` and `onChange` props
 * - Uncontrolled: Pass `initialValue` prop
 * 
 * - Click left/right arrows to decrement/increment
 * - Click and drag on the number to change value
 * - Hover to see progress bar
 * - Use arrow keys when focused
 * 
 * @example Uncontrolled mode
 * ```tsx
 * <p>
 *   If we increase the number of wedges to{" "}
 *   <InlineStepper 
 *     initialValue={10}
 *     min={1}
 *     max={20}
 *     color="#D81B60"
 *   />{" "}
 *   this shape gets closer to a circle.
 * </p>
 * ```
 * 
 * @example Controlled mode
 * ```tsx
 * const [value, setValue] = useState(2);
 * <p>
 *   The amplitude is{" "}
 *   <InlineStepper 
 *     value={value}
 *     onChange={setValue}
 *     min={0.1}
 *     max={4}
 *     step={0.1}
 *     formatValue={(v) => v.toFixed(2)}
 *   />.
 * </p>
 * ```
 */
export const InlineStepper: React.FC<InlineStepperProps> = ({
    value: controlledValue,
    initialValue = 10,
    min = 0,
    max = 100,
    step = 1,
    color = "#D81B60", // Default pink/magenta
    bgColor = "rgba(216, 27, 96, 0.9)", // Semi-transparent pink
    onChange,
    formatValue,
}) => {
    const [internalValue, setInternalValue] = useState(controlledValue ?? initialValue);
    const [isDragging, setIsDragging] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const dragStartX = useRef(0);
    const dragStartValue = useRef(0);
    const containerRef = useRef<HTMLSpanElement>(null);

    // Determine if controlled mode
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    const updateValue = (newValue: number) => {
        const clampedValue = Math.max(min, Math.min(max, newValue));
        if (!isControlled) {
            setInternalValue(clampedValue);
        }
        onChange?.(clampedValue);
    };

    const increment = () => {
        updateValue(value + step);
    };

    const decrement = () => {
        updateValue(value - step);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragStartX.current = e.clientX;
        dragStartValue.current = value;
        e.preventDefault();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
            e.preventDefault();
            increment();
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
            e.preventDefault();
            decrement();
        }
    };

    // Handle dragging with useEffect
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;

            const deltaX = e.clientX - dragStartX.current;
            const sensitivity = 2; // pixels per step
            const deltaValue = Math.round(deltaX / sensitivity) * step;
            updateValue(dragStartValue.current + deltaValue);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    // Calculate progress percentage
    const progress = ((value - min) / (max - min)) * 100;

    return (
        <span
            ref={containerRef}
            className="inline-flex items-center relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Progress bar on hover */}
            {isHovered && (
                <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute -top-3 left-0 right-0 h-1.5 rounded-full overflow-hidden"
                    style={{
                        backgroundColor: `${color}20`,
                    }}
                >
                    <div
                        className="h-full rounded-full transition-all duration-200"
                        style={{
                            width: `${progress}%`,
                            backgroundColor: color,
                        }}
                    />
                </motion.div>
            )}

            {/* Stepper container */}
            <span
                className="inline-flex items-center rounded font-medium"
                style={{
                    backgroundColor: bgColor,
                }}
                tabIndex={0}
                onKeyDown={handleKeyDown}
            >
                {/* Decrement button */}
                <button
                    onClick={decrement}
                    disabled={value <= min}
                    className="inline-flex items-center justify-center px-0.5 transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                        color: 'white',
                    }}
                    aria-label="Decrease value"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Value display (draggable) */}
                <span
                    onMouseDown={handleMouseDown}
                    className="select-none cursor-ew-resize text-center"
                    style={{
                        color: 'white',
                        minWidth: '2ch',
                        display: 'inline-block',
                    }}
                >
                    {formatValue ? formatValue(value) : value}
                </span>

                {/* Increment button */}
                <button
                    onClick={increment}
                    disabled={value >= max}
                    className="inline-flex items-center justify-center px-0.5 transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                        color: 'white',
                    }}
                    aria-label="Increase value"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </span>
        </span>
    );
};

export default InlineStepper;
