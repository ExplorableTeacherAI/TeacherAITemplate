import React, { useRef, useState, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { Stage, Layer, Line, Text, Transformer } from 'react-konva';
import Konva from 'konva';
import { Button } from '@/components/atoms/ui/button';
import { X, Send, Undo, Trash2, Palette, Type, Pencil } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/atoms/ui/popover';

interface AnnotationOverlayProps {
    /** The element to annotate (block element) */
    targetElement: HTMLElement;
    /** Callback when annotation is complete and sent */
    onSend: (imageDataUrl: string) => void;
    /** Callback when annotation is cancelled */
    onCancel: () => void;
    /** Block ID for context */
    blockId?: string;
}

interface DrawLine {
    id: string;
    points: number[];
    color: string;
    strokeWidth: number;
}

interface TextBox {
    id: string;
    x: number;
    y: number;
    text: string;
    color: string;
    fontSize: number;
}

const COLORS = [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#ffffff', // white
    '#000000', // black
];

const LINE_WIDTHS = [2, 4, 6, 8];
const FONT_SIZES = [14, 18, 24, 32];

type AnnotationMode = 'draw' | 'text';

/**
 * AnnotationOverlay component using Konva for robust canvas interactions.
 * Supports drawing, text boxes with selection, dragging, and resizing.
 */
export const AnnotationOverlay: React.FC<AnnotationOverlayProps> = ({
    targetElement,
    onSend,
    onCancel,
}) => {
    const stageRef = useRef<Konva.Stage>(null);
    const transformerRef = useRef<Konva.Transformer>(null);
    const textRefs = useRef<Map<string, Konva.Text>>(new Map());
    const textInputRef = useRef<HTMLTextAreaElement>(null);

    // Bounds state
    const [bounds, setBounds] = useState({ top: 0, left: 0, width: 0, height: 0 });

    // Drawing state
    const [mode, setMode] = useState<AnnotationMode>('draw');
    const [selectedColor, setSelectedColor] = useState('#ef4444');
    const [lineWidth, setLineWidth] = useState(4);
    const [fontSize, setFontSize] = useState(18);

    // Lines (freehand drawing)
    const [lines, setLines] = useState<DrawLine[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);

    // Text boxes
    const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState('');

    // Sending state
    const [isSending, setIsSending] = useState(false);

    // Track bounds with requestAnimationFrame
    useEffect(() => {
        let animationFrameId: number;

        const updateBounds = () => {
            const rect = targetElement.getBoundingClientRect();
            setBounds(prevBounds => {
                if (
                    prevBounds.top !== rect.top ||
                    prevBounds.left !== rect.left ||
                    prevBounds.width !== rect.width ||
                    prevBounds.height !== rect.height
                ) {
                    return {
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height,
                    };
                }
                return prevBounds;
            });
            animationFrameId = requestAnimationFrame(updateBounds);
        };

        animationFrameId = requestAnimationFrame(updateBounds);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [targetElement]);

    // Update transformer when selection changes
    useEffect(() => {
        const transformer = transformerRef.current;
        if (!transformer) return;

        if (selectedId && !editingId) {
            const textNode = textRefs.current.get(selectedId);
            if (textNode) {
                transformer.nodes([textNode]);
                transformer.getLayer()?.batchDraw();
            }
        } else {
            transformer.nodes([]);
            transformer.getLayer()?.batchDraw();
        }
    }, [selectedId, editingId]);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const clickX = e.clientX;
            const clickY = e.clientY;

            const isInsideAnnotation =
                clickX >= bounds.left &&
                clickX <= bounds.left + bounds.width &&
                clickY >= bounds.top - 60 &&
                clickY <= bounds.top + bounds.height;

            const isToolbarClick = target.closest('[data-annotation-toolbar]') !== null;
            const isPopoverClick = target.closest('[data-radix-popper-content-wrapper]') !== null;

            if (!isInsideAnnotation && !isToolbarClick && !isPopoverClick) {
                onCancel();
            }
        };

        const timeoutId = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [bounds, onCancel]);

    // Handle keyboard events
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (editingId) {
                if (e.key === 'Escape') {
                    finishEditing();
                }
                return;
            }

            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
                e.preventDefault();
                setTextBoxes(prev => prev.filter(t => t.id !== selectedId));
                setSelectedId(null);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, editingId]);

    const finishEditing = useCallback(() => {
        if (editingId) {
            setTextBoxes(prev =>
                prev.map(t =>
                    t.id === editingId ? { ...t, text: editingText } : t
                )
            );
        }
        setEditingId(null);
        setEditingText('');
    }, [editingId, editingText]);

    // Stage event handlers
    const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
        const clickedOnEmpty = e.target === e.target.getStage();

        if (mode === 'draw') {
            setSelectedId(null);
            setIsDrawing(true);
            const pos = e.target.getStage()?.getPointerPosition();
            if (pos) {
                const newLine: DrawLine = {
                    id: `line-${Date.now()}`,
                    points: [pos.x, pos.y],
                    color: selectedColor,
                    strokeWidth: lineWidth,
                };
                setLines(prev => [...prev, newLine]);
            }
        } else if (mode === 'text') {
            if (clickedOnEmpty) {
                // Finish any editing
                if (editingId) {
                    finishEditing();
                }

                // Deselect
                setSelectedId(null);

                // Create new text box at click position
                const pos = e.target.getStage()?.getPointerPosition();
                if (pos) {
                    const newTextBox: TextBox = {
                        id: `text-${Date.now()}`,
                        x: pos.x,
                        y: pos.y,
                        text: '',
                        color: selectedColor,
                        fontSize: fontSize,
                    };
                    setTextBoxes(prev => [...prev, newTextBox]);
                    setEditingId(newTextBox.id);
                    setEditingText('');

                    setTimeout(() => textInputRef.current?.focus(), 50);
                }
            }
        }
    };

    const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!isDrawing || mode !== 'draw') return;

        const pos = e.target.getStage()?.getPointerPosition();
        if (!pos) return;

        setLines(prev => {
            const newLines = [...prev];
            const lastLine = newLines[newLines.length - 1];
            if (lastLine) {
                lastLine.points = [...lastLine.points, pos.x, pos.y];
            }
            return newLines;
        });
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
    };

    const handleTextClick = (textBox: TextBox) => {
        if (editingId && editingId !== textBox.id) {
            finishEditing();
        }
        setSelectedId(textBox.id);
    };

    const handleTextDblClick = (textBox: TextBox) => {
        setEditingId(textBox.id);
        setEditingText(textBox.text);
        setTimeout(() => textInputRef.current?.focus(), 50);
    };

    const handleTextDragEnd = (e: Konva.KonvaEventObject<DragEvent>, id: string) => {
        setTextBoxes(prev =>
            prev.map(t =>
                t.id === id ? { ...t, x: e.target.x(), y: e.target.y() } : t
            )
        );
    };

    const handleTextTransformEnd = (e: Konva.KonvaEventObject<Event>, id: string) => {
        const node = e.target as Konva.Text;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        // Calculate new font size based on scale
        const textBox = textBoxes.find(t => t.id === id);
        if (textBox) {
            const newFontSize = Math.max(10, Math.round(textBox.fontSize * Math.max(scaleX, scaleY)));

            setTextBoxes(prev =>
                prev.map(t =>
                    t.id === id ? {
                        ...t,
                        x: node.x(),
                        y: node.y(),
                        fontSize: newFontSize
                    } : t
                )
            );

            // Reset scale to 1
            node.scaleX(1);
            node.scaleY(1);
        }
    };

    const handleUndo = useCallback(() => {
        if (lines.length > 0) {
            setLines(prev => prev.slice(0, -1));
        } else if (textBoxes.length > 0) {
            setTextBoxes(prev => prev.slice(0, -1));
        }
    }, [lines.length, textBoxes.length]);

    const handleClear = useCallback(() => {
        setLines([]);
        setTextBoxes([]);
        setSelectedId(null);
        setEditingId(null);
    }, []);

    const handleSend = useCallback(async () => {
        if (!stageRef.current) return;

        setIsSending(true);

        try {
            // Deselect to hide transformer
            setSelectedId(null);
            setEditingId(null);

            // Wait for re-render
            await new Promise(resolve => setTimeout(resolve, 100));

            // Capture the target element
            const elementCanvas = await html2canvas(targetElement, {
                useCORS: true,
                logging: false,
                backgroundColor: null,
            });

            // Get the annotation layer as image
            const konvaCanvas = stageRef.current.toCanvas({
                pixelRatio: elementCanvas.width / bounds.width,
            });

            // Create combined canvas
            const combinedCanvas = document.createElement('canvas');
            combinedCanvas.width = elementCanvas.width;
            combinedCanvas.height = elementCanvas.height;
            const ctx = combinedCanvas.getContext('2d');

            if (ctx) {
                // Draw element first
                ctx.drawImage(elementCanvas, 0, 0);
                // Draw annotations on top
                ctx.drawImage(konvaCanvas, 0, 0);
            }

            const dataUrl = combinedCanvas.toDataURL('image/png');
            onSend(dataUrl);
        } catch (error) {
            console.error('Error capturing annotation:', error);
            setIsSending(false);
        }
    }, [targetElement, bounds.width, onSend]);

    const editingTextBox = textBoxes.find(t => t.id === editingId);

    return (
        <>
            {/* Annotation container */}
            <div
                className="fixed z-[9999]"
                style={{
                    top: bounds.top,
                    left: bounds.left,
                    width: bounds.width,
                    height: bounds.height,
                }}
            >
                {/* Highlight border */}
                <div
                    className="absolute inset-0 ring-4 rounded-lg pointer-events-none"
                    style={{ '--tw-ring-color': '#D4EDE5' } as React.CSSProperties}
                />

                {/* Konva Stage */}
                <Stage
                    ref={stageRef}
                    width={bounds.width}
                    height={bounds.height}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onTouchStart={handleMouseDown as any}
                    onTouchMove={handleMouseMove as any}
                    onTouchEnd={handleMouseUp}
                    style={{ cursor: mode === 'draw' ? 'crosshair' : 'default' }}
                >
                    <Layer>
                        {/* Draw all lines */}
                        {lines.map(line => (
                            <Line
                                key={line.id}
                                points={line.points}
                                stroke={line.color}
                                strokeWidth={line.strokeWidth}
                                lineCap="round"
                                lineJoin="round"
                                tension={0.5}
                                globalCompositeOperation="source-over"
                            />
                        ))}

                        {/* Draw all text boxes */}
                        {textBoxes.map(textBox => {
                            return (
                                <Text
                                    key={textBox.id}
                                    ref={(node) => {
                                        if (node) {
                                            textRefs.current.set(textBox.id, node);
                                        } else {
                                            textRefs.current.delete(textBox.id);
                                        }
                                    }}
                                    id={textBox.id}
                                    x={textBox.x}
                                    y={textBox.y}
                                    text={textBox.id === editingId ? '' : textBox.text || 'Click to type...'}
                                    fontSize={textBox.fontSize}
                                    fill={textBox.id === editingId ? 'transparent' : textBox.color}
                                    draggable={mode === 'text'}
                                    onClick={() => handleTextClick(textBox)}
                                    onTap={() => handleTextClick(textBox)}
                                    onDblClick={() => handleTextDblClick(textBox)}
                                    onDblTap={() => handleTextDblClick(textBox)}
                                    onDragEnd={e => handleTextDragEnd(e, textBox.id)}
                                    onTransformEnd={e => handleTextTransformEnd(e, textBox.id)}
                                    opacity={textBox.text || textBox.id === editingId ? 1 : 0.5}
                                />
                            );
                        })}

                        {/* Transformer for resize */}
                        <Transformer
                            ref={transformerRef}
                            rotateEnabled={false}
                            borderEnabled={false}
                            enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                            anchorSize={10}
                            anchorCornerRadius={2}
                            anchorFill="#0D7377"
                            anchorStroke="#0D7377"
                            keepRatio={true}
                        />
                    </Layer>
                </Stage>

                {/* Text editing input */}
                {editingId && editingTextBox && (
                    <textarea
                        ref={textInputRef}
                        value={editingText}
                        onChange={e => setEditingText(e.target.value)}
                        onBlur={finishEditing}
                        placeholder="Type text..."
                        className="absolute bg-transparent border-2 border-[#0D7377] rounded p-1 resize-none focus:outline-none"
                        style={{
                            left: editingTextBox.x,
                            top: editingTextBox.y,
                            color: editingTextBox.color,
                            fontSize: editingTextBox.fontSize,
                            minWidth: 100,
                            minHeight: editingTextBox.fontSize + 10,
                        }}
                        autoFocus
                    />
                )}

                {/* Toolbar */}
                <div className="absolute -top-14 left-0 right-0 flex items-center justify-center gap-2" data-annotation-toolbar>
                    <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border p-2">
                        {/* Mode toggle */}
                        <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
                            <Button
                                variant={mode === 'draw' ? 'default' : 'ghost'}
                                size="icon"
                                className={`h-7 w-7 ${mode === 'draw' ? 'bg-[#D4EDE5] text-[#0D7377] hover:bg-[#C0E5DA]' : 'hover:bg-[#D4EDE5] hover:text-[#0D7377]'}`}
                                onClick={() => { setMode('draw'); setSelectedId(null); }}
                                title="Draw mode"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={mode === 'text' ? 'default' : 'ghost'}
                                size="icon"
                                className={`h-7 w-7 ${mode === 'text' ? 'bg-[#D4EDE5] text-[#0D7377] hover:bg-[#C0E5DA]' : 'hover:bg-[#D4EDE5] hover:text-[#0D7377]'}`}
                                onClick={() => setMode('text')}
                                title="Text mode"
                            >
                                <Type className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="w-px h-6 bg-border" />

                        {/* Color picker */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 relative hover:bg-[#D4EDE5] hover:text-[#0D7377] hover:border-[#D4EDE5]"
                                    title="Color"
                                >
                                    <Palette className="h-4 w-4" />
                                    <div
                                        className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border border-background"
                                        style={{ backgroundColor: selectedColor }}
                                    />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2" data-annotation-toolbar>
                                <div className="grid grid-cols-5 gap-1">
                                    {COLORS.map(color => (
                                        <button
                                            key={color}
                                            className={`w-6 h-6 rounded-md border-2 ${selectedColor === color ? 'border-primary' : 'border-transparent'}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setSelectedColor(color)}
                                        />
                                    ))}
                                </div>
                                {mode === 'draw' && (
                                    <>
                                        <div className="mt-2 pt-2 border-t">
                                            <div className="text-xs text-muted-foreground mb-1">Brush Size</div>
                                            <div className="flex gap-1">
                                                {LINE_WIDTHS.map(w => (
                                                    <button
                                                        key={w}
                                                        className={`flex items-center justify-center w-8 h-8 rounded-md ${lineWidth === w ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                                                        onClick={() => setLineWidth(w)}
                                                    >
                                                        <div
                                                            className="rounded-full bg-current"
                                                            style={{ width: w * 2, height: w * 2 }}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                                {mode === 'text' && (
                                    <div className="mt-2 pt-2 border-t">
                                        <div className="text-xs text-muted-foreground mb-1">Font Size</div>
                                        <div className="flex gap-1">
                                            {FONT_SIZES.map(size => (
                                                <button
                                                    key={size}
                                                    className={`flex items-center justify-center w-8 h-8 rounded-md text-xs ${fontSize === size ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                                                    onClick={() => setFontSize(size)}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>

                        <div className="w-px h-6 bg-border" />

                        {/* Undo */}
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 hover:bg-[#D4EDE5] hover:text-[#0D7377] hover:border-[#D4EDE5]"
                            onClick={handleUndo}
                            disabled={lines.length === 0 && textBoxes.length === 0}
                        >
                            <Undo className="h-4 w-4" />
                        </Button>

                        {/* Clear */}
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 hover:bg-[#D4EDE5] hover:text-[#0D7377] hover:border-[#D4EDE5]"
                            onClick={handleClear}
                            disabled={lines.length === 0 && textBoxes.length === 0}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>

                        <div className="w-px h-6 bg-border" />

                        {/* Cancel */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onCancel}
                            className="h-8 hover:bg-[#D4EDE5] hover:text-[#0D7377] hover:border-[#D4EDE5]"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                        </Button>

                        {/* Send */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSend}
                            disabled={isSending}
                            className="h-8 hover:bg-[#D4EDE5] hover:text-[#0D7377] hover:border-[#D4EDE5]"
                        >
                            <Send className="h-4 w-4 mr-1" />
                            {isSending ? 'Sending...' : 'Send to Chat'}
                        </Button>
                    </div>
                </div>

                {/* Instructions hint */}
                {lines.length === 0 && textBoxes.length === 0 && !editingId && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
                        <div className="bg-background/90 backdrop-blur-sm rounded-md px-3 py-1.5 text-sm text-muted-foreground shadow-sm">
                            {mode === 'draw'
                                ? 'Draw on the section to annotate, then send to chat'
                                : 'Click to add text. Drag to move. Double-click to edit.'}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default AnnotationOverlay;
