import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { StepperProps } from './types';
import { ANNOTATION_COLORS } from './types';

/**
 * Stepper - An inline annotation for changing numeric values.
 * 
 * Category: Mutable
 * Visual Style: Clean inline number, arrows appear on hover
 * Interaction: Hover to reveal controls, click arrows, drag value, or use keyboard
 * 
 * Designed to blend naturally with reading flow - only reveals controls on interaction.
 * 
 * @example
 * ```tsx
 * <p>
 *   If we increase the number of sides to{' '}
 *   <Stepper 
 *     initialValue={6} 
 *     min={3} 
 *     max={20}
 *     onChange={(v) => setPolygonSides(v)}
 *   />{' '}
 *   the shape becomes more circular.
 * </p>
 * ```
 */
export const Stepper: React.FC<StepperProps> = ({
  id,
  value: controlledValue,
  initialValue = 10,
  min = 0,
  max = 100,
  step = 1,
  color = ANNOTATION_COLORS.mutable.primary,
  bgColor = ANNOTATION_COLORS.mutable.bg,
  formatValue,
  onChange,
  className,
}) => {
  const [internalValue, setInternalValue] = useState(controlledValue ?? initialValue);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dragStartX = useRef(0);
  const dragStartValue = useRef(0);
  const containerRef = useRef<HTMLSpanElement>(null);

  // Controlled vs uncontrolled
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const updateValue = (newValue: number) => {
    const clampedValue = Math.max(min, Math.min(max, newValue));
    if (!isControlled) {
      setInternalValue(clampedValue);
    }
    onChange?.(clampedValue);
  };

  const increment = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateValue(value + step);
  };
  
  const decrement = (e: React.MouseEvent) => {
    e.stopPropagation();
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
      updateValue(value + step);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      updateValue(value - step);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartX.current;
      const sensitivity = 3; // pixels per step
      const deltaValue = Math.round(deltaX / sensitivity) * step;
      updateValue(dragStartValue.current + deltaValue);
    };

    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, step]);

  const progress = ((value - min) / (max - min)) * 100;
  const displayValue = formatValue ? formatValue(value) : value.toString();

  return (
    <span
      ref={containerRef}
      id={id}
      className={cn('annotation annotation-stepper', className)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        position: 'relative',
        userSelect: 'none',
        cursor: 'ew-resize',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Progress bar - shows on hover above the number */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              bottom: '-4px',
              left: '0',
              right: '0',
              height: '2px',
              background: `${color}30`,
              borderRadius: '1px',
              overflow: 'hidden',
              transformOrigin: 'center',
            }}
          >
            <motion.div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: color,
                borderRadius: '1px',
              }}
              layout
              transition={{ duration: 0.1 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left arrow - appears on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.button
            initial={{ opacity: 0, x: 4, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 4, scale: 0.8 }}
            transition={{ duration: 0.12 }}
            onClick={decrement}
            disabled={value <= min}
            aria-label="Decrease value"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0',
              marginRight: '2px',
              color: color,
              background: 'transparent',
              border: 'none',
              cursor: value <= min ? 'not-allowed' : 'pointer',
              opacity: value <= min ? 0.3 : 1,
            }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft size={14} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Value display - always visible, styled inline */}
      <motion.span
        onMouseDown={handleMouseDown}
        animate={{
          background: isHovered || isDragging ? bgColor : 'transparent',
          paddingLeft: isHovered ? '4px' : '0px',
          paddingRight: isHovered ? '4px' : '0px',
        }}
        transition={{ duration: 0.15 }}
        style={{
          color: color,
          fontWeight: 600,
          fontSize: 'inherit',
          minWidth: '1.5ch',
          textAlign: 'center',
          cursor: 'ew-resize',
          borderRadius: '3px',
          borderBottom: `2px solid ${color}`,
        }}
      >
        {displayValue}
      </motion.span>

      {/* Right arrow - appears on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.button
            initial={{ opacity: 0, x: -4, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -4, scale: 0.8 }}
            transition={{ duration: 0.12 }}
            onClick={increment}
            disabled={value >= max}
            aria-label="Increase value"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0',
              marginLeft: '2px',
              color: color,
              background: 'transparent',
              border: 'none',
              cursor: value >= max ? 'not-allowed' : 'pointer',
              opacity: value >= max ? 0.3 : 1,
            }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight size={14} />
          </motion.button>
        )}
      </AnimatePresence>
    </span>
  );
};

export default Stepper;
