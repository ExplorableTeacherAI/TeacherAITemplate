import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useVarColor } from '@/stores';

/* ──────────────────────────────────────────────
 *  Types
 * ────────────────────────────────────────────── */

export type ImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

export interface ImageDisplayProps {
    /** Unique identifier for this component instance */
    id?: string;
    /** Image source URL or data URI */
    src: string;
    /** Alt text for accessibility */
    alt: string;
    /** Optional variable name used to key the accent colour in the store */
    varName?: string;
    /** Accent colour for border / caption background (default: '#6366f1' indigo) */
    color?: string;
    /** Fixed width in px or CSS string (default: '100%') */
    width?: number | string;
    /** Fixed height in px or CSS string (default: 'auto') */
    height?: number | string;
    /** Maximum width — prevents the image from exceeding this value */
    maxWidth?: number | string;
    /** Maximum height — prevents the image from exceeding this value */
    maxHeight?: number | string;
    /** How the image should fit its container (default: 'cover') */
    objectFit?: ImageFit;
    /** Whether to show a coloured border around the image (default: false) */
    bordered?: boolean;
    /** Border radius in px or CSS string (default: '0.75rem') */
    borderRadius?: number | string;
    /** Caption displayed below the image */
    caption?: string;
    /** Whether clicking the image opens a lightbox zoom overlay (default: true) */
    zoomable?: boolean;
    /** Optional className override */
    className?: string;
}

/* ──────────────────────────────────────────────
 *  Component
 * ────────────────────────────────────────────── */

/**
 * ImageDisplay Component
 *
 * A styled, block-level image renderer designed for embedding inside lessons.
 * Supports captions, accent-colour borders, object-fit modes, and an optional
 * click-to-zoom lightbox overlay.
 *
 * The component reads its accent colour from the global variable store
 * (via `varName`) so colours can be kept in sync across the lesson.
 *
 * @example
 * ```tsx
 * <ImageDisplay
 *     src="/images/diagram.png"
 *     alt="Cross-section of a cell"
 *     caption="Figure 1 — Animal cell cross-section"
 *     objectFit="contain"
 *     maxWidth={600}
 *     bordered
 *     color="#6366f1"
 * />
 * ```
 */
export const ImageDisplay: React.FC<ImageDisplayProps> = ({
    id,
    src,
    alt,
    varName,
    color = '#6366f1',
    width = '100%',
    height = 'auto',
    maxWidth,
    maxHeight,
    objectFit = 'cover',
    bordered = false,
    borderRadius = '0.75rem',
    caption,
    zoomable = true,
    className,
}) => {
    const accentColor = useVarColor(varName, color);
    const [zoomed, setZoomed] = useState(false);

    const handleOpen = useCallback(() => {
        if (zoomable) setZoomed(true);
    }, [zoomable]);

    const handleClose = useCallback(() => setZoomed(false), []);

    const borderStyle = useMemo(
        () => (bordered ? `2px solid ${accentColor}40` : undefined),
        [bordered, accentColor],
    );

    const resolveSize = (v: number | string | undefined) => {
        if (v === undefined) return undefined;
        return typeof v === 'number' ? `${v}px` : v;
    };

    return (
        <>
            {/* ── Main image card ─────────────────── */}
            <div
                id={id}
                className={cn(
                    'relative overflow-hidden inline-flex flex-col',
                    zoomable && 'cursor-zoom-in',
                    className,
                )}
                style={{
                    width: resolveSize(width),
                    maxWidth: resolveSize(maxWidth),
                    borderRadius: resolveSize(borderRadius),
                    border: borderStyle,
                }}
                onClick={handleOpen}
                role={zoomable ? 'button' : undefined}
                tabIndex={zoomable ? 0 : undefined}
                onKeyDown={(e) => {
                    if (zoomable && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleOpen();
                    }
                }}
            >
                <img
                    src={src}
                    alt={alt}
                    draggable={false}
                    className="w-full select-none"
                    style={{
                        height: resolveSize(height),
                        maxHeight: resolveSize(maxHeight),
                        objectFit,
                        borderRadius: caption
                            ? `calc(${resolveSize(borderRadius)} - 2px) calc(${resolveSize(borderRadius)} - 2px) 0 0`
                            : undefined,
                    }}
                />

                {/* ── Caption ───────────────────────── */}
                {caption && (
                    <div
                        className="px-4 py-2 text-xs text-muted-foreground text-center"
                        style={{ backgroundColor: `${accentColor}08` }}
                    >
                        {caption}
                    </div>
                )}
            </div>

            {/* ── Lightbox overlay ────────────────── */}
            {zoomed && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 cursor-zoom-out backdrop-blur-sm"
                    onClick={handleClose}
                    role="dialog"
                    aria-modal
                    aria-label={`Zoomed view of ${alt}`}
                >
                    <img
                        src={src}
                        alt={alt}
                        draggable={false}
                        className="max-w-[90vw] max-h-[90vh] rounded-lg object-contain select-none shadow-2xl"
                        style={{ animation: 'imageZoomIn 0.25s ease-out' }}
                    />

                    {/* Close hint */}
                    <span className="absolute top-6 right-6 text-white/60 text-sm font-medium select-none pointer-events-none">
                        Click anywhere to close
                    </span>
                </div>
            )}

            {/* Inline keyframes for the zoom animation */}
            {zoomed && (
                <style>{`
                    @keyframes imageZoomIn {
                        from { opacity: 0; transform: scale(0.85); }
                        to   { opacity: 1; transform: scale(1); }
                    }
                `}</style>
            )}
        </>
    );
};

export default ImageDisplay;
