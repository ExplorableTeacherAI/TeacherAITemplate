import React, { useRef, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useVarColor } from '@/stores';

/* ──────────────────────────────────────────────
 *  Types
 * ────────────────────────────────────────────── */

export type VideoFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

export interface VideoDisplayProps {
    /** Unique identifier for this component instance */
    id?: string;
    /**
     * Video source URL.
     * Supports:
     *  - Direct file URLs (.mp4, .webm, etc.)
     *  - YouTube URLs (youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...)
     */
    src: string;
    /** Accessible label describing the video content */
    alt?: string;
    /** Optional variable name used to key the accent colour in the store */
    varName?: string;
    /** Accent colour for border / caption background (default: '#6366f1' indigo) */
    color?: string;
    /** Fixed width in px or CSS string (default: '100%') */
    width?: number | string;
    /** Fixed height in px or CSS string (default: 'auto') */
    height?: number | string;
    /** Maximum width — prevents the video from exceeding this value */
    maxWidth?: number | string;
    /** Maximum height — prevents the video from exceeding this value */
    maxHeight?: number | string;
    /** How the video should fit its container (default: 'contain') */
    objectFit?: VideoFit;
    /** Whether to show a coloured border around the video (default: false) */
    bordered?: boolean;
    /** Border radius in px or CSS string (default: '0.75rem') */
    borderRadius?: number | string;
    /** Caption displayed below the video */
    caption?: string;
    /** Whether to show native playback controls (default: true) */
    controls?: boolean;
    /** Whether the video should autoplay (default: false) */
    autoPlay?: boolean;
    /** Whether the video should loop (default: false) */
    loop?: boolean;
    /** Whether the video should be muted (default: false — true when autoPlay) */
    muted?: boolean;
    /** Poster image URL shown before play */
    poster?: string;
    /** Aspect ratio for embedded videos like YouTube (default: '16/9') */
    aspectRatio?: string;
    /** Optional className override */
    className?: string;
}

/* ──────────────────────────────────────────────
 *  Helpers
 * ────────────────────────────────────────────── */

/**
 * Attempt to parse a YouTube video ID from a URL.
 * Returns null if the URL is not a recognised YouTube format.
 */
function parseYouTubeId(url: string): string | null {
    try {
        const u = new URL(url);
        // youtube.com/watch?v=VIDEO_ID
        if (
            (u.hostname === 'www.youtube.com' || u.hostname === 'youtube.com') &&
            u.pathname === '/watch'
        ) {
            return u.searchParams.get('v');
        }
        // youtube.com/embed/VIDEO_ID
        if (
            (u.hostname === 'www.youtube.com' || u.hostname === 'youtube.com') &&
            u.pathname.startsWith('/embed/')
        ) {
            return u.pathname.split('/embed/')[1]?.split('?')[0] ?? null;
        }
        // youtu.be/VIDEO_ID
        if (u.hostname === 'youtu.be') {
            return u.pathname.slice(1).split('?')[0] || null;
        }
    } catch {
        // not a valid URL — treat as direct src
    }
    return null;
}

/**
 * Build a YouTube embed URL from a video ID and component props.
 */
function buildYouTubeEmbedUrl(
    videoId: string,
    opts: { autoPlay?: boolean; loop?: boolean; muted?: boolean; controls?: boolean },
): string {
    const params = new URLSearchParams();
    if (opts.autoPlay) params.set('autoplay', '1');
    if (opts.loop) {
        params.set('loop', '1');
        params.set('playlist', videoId); // YouTube requires playlist= for loop
    }
    if (opts.muted || opts.autoPlay) params.set('mute', '1');
    if (opts.controls === false) params.set('controls', '0');
    params.set('rel', '0'); // don't show unrelated videos
    const qs = params.toString();
    return `https://www.youtube.com/embed/${videoId}${qs ? `?${qs}` : ''}`;
}

/* ──────────────────────────────────────────────
 *  Component
 * ────────────────────────────────────────────── */

/**
 * VideoDisplay Component
 *
 * A styled, block-level video renderer designed for embedding inside lessons.
 * Supports captions, accent-colour borders, object-fit modes, poster images,
 * and standard HTML5 video playback controls.
 *
 * Automatically detects YouTube URLs and renders them as embedded iframes
 * instead of a `<video>` element. Direct file URLs (.mp4, .webm, etc.)
 * are rendered with the native HTML5 video player.
 *
 * The component reads its accent colour from the global variable store
 * (via `varName`) so colours can be kept in sync across the lesson.
 *
 * @example
 * ```tsx
 * // Direct video file
 * <VideoDisplay
 *     src="/videos/intro.mp4"
 *     alt="Introduction to wave mechanics"
 *     caption="Video 1 — Wave interference patterns"
 *     objectFit="contain"
 *     maxWidth={700}
 *     bordered
 *     controls
 *     color="#6366f1"
 * />
 *
 * // YouTube embed
 * <VideoDisplay
 *     src="https://www.youtube.com/watch?v=WUvTyaaNkzM"
 *     alt="3Blue1Brown — Euler's number"
 *     caption="e explained visually"
 *     bordered
 *     color="#3b82f6"
 * />
 * ```
 */
export const VideoDisplay: React.FC<VideoDisplayProps> = ({
    id,
    src,
    alt,
    varName,
    color = '#6366f1',
    width = '100%',
    height = 'auto',
    maxWidth,
    maxHeight,
    objectFit = 'contain',
    bordered = false,
    borderRadius = '0.75rem',
    caption,
    controls = true,
    autoPlay = false,
    loop = false,
    muted,
    poster,
    aspectRatio = '16/9',
    className,
}) => {
    const accentColor = useVarColor(varName, color);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [hasStarted, setHasStarted] = useState(autoPlay);

    // When autoPlay is true, mute by default (required by most browsers)
    const isMuted = muted ?? autoPlay;

    // Detect YouTube
    const youtubeId = useMemo(() => parseYouTubeId(src), [src]);
    const isYouTube = youtubeId !== null;
    const youtubeEmbedUrl = useMemo(
        () =>
            youtubeId
                ? buildYouTubeEmbedUrl(youtubeId, { autoPlay, loop, muted: isMuted, controls })
                : null,
        [youtubeId, autoPlay, loop, isMuted, controls],
    );

    const handlePlay = useCallback(() => {
        setIsPlaying(true);
        setHasStarted(true);
    }, []);

    const handlePause = useCallback(() => {
        setIsPlaying(false);
    }, []);

    const handleOverlayClick = useCallback(() => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
        } else {
            videoRef.current.pause();
        }
    }, []);

    const borderStyle = useMemo(
        () => (bordered ? `2px solid ${accentColor}40` : undefined),
        [bordered, accentColor],
    );

    const resolveSize = (v: number | string | undefined) => {
        if (v === undefined) return undefined;
        return typeof v === 'number' ? `${v}px` : v;
    };

    return (
        <div
            id={id}
            className={cn(
                'relative overflow-hidden inline-flex flex-col',
                className,
            )}
            style={{
                width: resolveSize(width),
                maxWidth: resolveSize(maxWidth),
                borderRadius: resolveSize(borderRadius),
                border: borderStyle,
            }}
        >
            {isYouTube && youtubeEmbedUrl ? (
                /* ── YouTube iframe ────────────────────────── */
                <div
                    className="relative w-full"
                    style={{
                        aspectRatio,
                        maxHeight: resolveSize(maxHeight),
                    }}
                >
                    <iframe
                        src={youtubeEmbedUrl}
                        title={alt ?? 'YouTube video'}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                        style={{
                            border: 'none',
                            borderRadius: caption
                                ? `calc(${resolveSize(borderRadius)} - 2px) calc(${resolveSize(borderRadius)} - 2px) 0 0`
                                : undefined,
                        }}
                    />
                </div>
            ) : (
                <>
                    {/* ── Play / pause click overlay (when no controls) ─── */}
                    {!controls && (
                        <div
                            className="absolute inset-0 z-10 cursor-pointer"
                            onClick={handleOverlayClick}
                            role="button"
                            tabIndex={0}
                            aria-label={isPlaying ? 'Pause video' : 'Play video'}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleOverlayClick();
                                }
                            }}
                        />
                    )}

                    {/* ── Big play button overlay ─────────────────── */}
                    {!controls && !isPlaying && !hasStarted && (
                        <div
                            className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
                            style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
                        >
                            <div
                                className="flex items-center justify-center rounded-full"
                                style={{
                                    width: 64,
                                    height: 64,
                                    backgroundColor: `${accentColor}cc`,
                                    boxShadow: `0 0 24px ${accentColor}40`,
                                }}
                            >
                                <svg width={28} height={28} viewBox="0 0 24 24" fill="white">
                                    <polygon points="6,3 20,12 6,21" />
                                </svg>
                            </div>
                        </div>
                    )}

                    {/* ── Video element ───────────────────────────── */}
                    <video
                        ref={videoRef}
                        src={src}
                        poster={poster}
                        controls={controls}
                        autoPlay={autoPlay}
                        loop={loop}
                        muted={isMuted}
                        playsInline
                        aria-label={alt}
                        onPlay={handlePlay}
                        onPause={handlePause}
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
                </>
            )}

            {/* ── Caption ───────────────────────────────── */}
            {caption && (
                <div
                    className="px-4 py-2 text-xs text-muted-foreground text-center"
                    style={{ backgroundColor: `${accentColor}08` }}
                >
                    {caption}
                </div>
            )}
        </div>
    );
};

export default VideoDisplay;
