import { useEffect, useMemo, useState, type ReactElement } from "react";
import { WelcomeScreen } from "./WelcomeScreen";
import { SectionBuildSkeleton } from "./SectionBuildSkeleton";
import { Card } from "@/components/atoms/ui/card";
import BlockRenderer from "./BlockRenderer";
import {
    collectBlockIds,
    getSectionBlockIds,
    isInFlight,
    useSectionBuildStatus,
    type SectionBuildInfo,
} from "@/lib/section-build-status";
import { loadBlocks, createBlocksWatcher } from "@/lib/block-loader";
import blockLoaderConfig from "@/config/blocks-loader.config";
import { useAppMode } from "@/contexts/AppModeContext";
import { LoadingScreen } from "@/components/utility/LoadingScreen";
import { useBlockStructureEditing } from "@/hooks/useBlockStructureEditing";

interface LessonViewProps {
    onEditBlock?: (instruction: string) => void;
}

export const LessonView = ({ onEditBlock }: LessonViewProps) => {
    const [initialBlocks, setInitialBlocks] = useState<ReactElement[]>([]);
    const [loadingBlocks, setLoadingBlocks] = useState(true);
    const { isPreview } = useAppMode();

    // ---- live section-build progress (teacher's editor preview only) ------
    // The parent frontend posts section-build-status messages while builds
    // run. In-flight sections whose blocks are already in the lesson get an
    // update glow; the rest render as skeletons below the existing content.
    const buildSections = useSectionBuildStatus();
    const lessonBlockIds = useMemo(() => {
        const ids = new Set<string>();
        initialBlocks.forEach((block) => collectBlockIds(block, ids));
        return ids;
    }, [initialBlocks]);
    // Block id → badge label for blocks being updated (label only on the
    // section's first block so it isn't repeated on every block).
    const [glowBlocks, setGlowBlocks] = useState<Map<string, string>>(new Map());
    const [skeletonSections, setSkeletonSections] = useState<SectionBuildInfo[]>([]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const glow = new Map<string, string>();
            const skeletons: SectionBuildInfo[] = [];
            for (const section of buildSections.filter(isInFlight)) {
                const sectionIds = await getSectionBlockIds(section.id);
                const visible = [...sectionIds].filter((id) => lessonBlockIds.has(id));
                if (visible.length > 0) {
                    const label = "Updating…";
                    visible.forEach((id, index) => glow.set(id, index === 0 ? label : ""));
                } else {
                    skeletons.push(section);
                }
            }
            if (cancelled) return;
            setGlowBlocks((prev) => {
                if (prev.size === glow.size && [...glow].every(([k, v]) => prev.get(k) === v)) {
                    return prev;
                }
                return glow;
            });
            setSkeletonSections((prev) => {
                const same =
                    prev.length === skeletons.length &&
                    prev.every(
                        (s, i) =>
                            s.id === skeletons[i].id &&
                            s.status === skeletons[i].status &&
                            s.detail === skeletons[i].detail
                    );
                return same ? prev : skeletons;
            });
        })();
        return () => {
            cancelled = true;
        };
    }, [buildSections, lessonBlockIds]);

    // Apply the glow at the DOM level: wrapping the block elements would break
    // BlockRenderer's reorder/editing identity, but every Block renders a
    // stable [data-block-id] node we can decorate. pointer-events is disabled
    // via the class so the teacher can't interact with a half-verified section.
    useEffect(() => {
        const applied: HTMLElement[] = [];
        glowBlocks.forEach((label, id) => {
            const el = document.querySelector(
                `[data-block-id="${CSS.escape(id)}"]`
            ) as HTMLElement | null;
            if (!el) return;
            el.classList.add("section-build-glow");
            if (label) el.setAttribute("data-build-label", label);
            applied.push(el);
        });
        return () =>
            applied.forEach((el) => {
                el.classList.remove("section-build-glow");
                el.removeAttribute("data-build-label");
            });
    }, [glowBlocks, initialBlocks, loadingBlocks]);

    const { renderedBlocks, handleAddBlock, handleReorder, handleDeleteBlock } =
        useBlockStructureEditing(initialBlocks, setInitialBlocks);

    // Notify parent when all content (including images) is fully loaded
    useEffect(() => {
        if (loadingBlocks) return;

        let contentReadySent = false;
        const notifyContentReady = () => {
            if (contentReadySent) return;
            contentReadySent = true;
            window.parent.postMessage({ type: 'content-ready' }, '*');
        };

        // Wait for DOM to actually be painted before checking content
        // Use requestAnimationFrame twice to ensure React has committed and painted
        const waitForPaint = () => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    // Verify that content is actually rendered in DOM
                    // Either blocks exist, build skeletons are shown, OR the
                    // welcome screen is shown
                    const hasBlocks = document.querySelectorAll('section, [data-block-id], [data-build-skeleton]').length > 0;
                    const hasWelcomeScreen = document.querySelector('.glass') !== null;

                    if (!hasBlocks && !hasWelcomeScreen) {
                        // Content not yet rendered, wait a bit and retry
                        setTimeout(waitForPaint, 100);
                        return;
                    }

                    // Now check for images
                    const images = document.querySelectorAll('img');
                    if (images.length === 0) {
                        // No images, we're ready immediately
                        notifyContentReady();
                        return;
                    }

                    let loadedCount = 0;
                    const totalImages = images.length;

                    const checkAllLoaded = () => {
                        loadedCount++;
                        if (loadedCount >= totalImages) {
                            notifyContentReady();
                        }
                    };

                    images.forEach((img) => {
                        if (img.complete) {
                            checkAllLoaded();
                        } else {
                            img.addEventListener('load', checkAllLoaded, { once: true });
                            img.addEventListener('error', checkAllLoaded, { once: true });
                        }
                    });
                });
            });
        };

        waitForPaint();

        // Fallback: send ready after 5 seconds even if something is slow
        const fallbackTimeout = setTimeout(() => {
            notifyContentReady();
        }, 5000);

        return () => {
            clearTimeout(fallbackTimeout);
        };
    }, [loadingBlocks, initialBlocks]);


    useEffect(() => {
        let cancelled = false;
        let cleanup: (() => void) | null = null;

        (async () => {
            // Load blocks using the configured strategy
            const blocks = await loadBlocks(blockLoaderConfig);
            if (cancelled) return;
            setInitialBlocks(Array.isArray(blocks) ? blocks : []);
            setLoadingBlocks(false);

            // Set up watcher for automatic updates in dev mode
            if (import.meta.env.DEV) {
                cleanup = createBlocksWatcher(
                    (updatedBlocks) => {
                        if (cancelled) return;
                        // A builder mid-write leaves the blocks file briefly
                        // non-compiling, and the watcher then reports zero
                        // blocks. Keep the last good lesson on screen instead
                        // of blanking to the welcome screen; the next good
                        // update (or the post-turn reload) replaces it.
                        setInitialBlocks((previous) =>
                            updatedBlocks.length === 0 && previous.length > 0
                                ? previous
                                : updatedBlocks
                        );
                    },
                    blockLoaderConfig
                );
            }
        })();

        return () => {
            cancelled = true;
            if (cleanup) cleanup();
        };
    }, []);


    // Keep every hook above this loading branch so the editor and loading
    // renders always execute hooks in exactly the same order.
    if (loadingBlocks) {
        return <LoadingScreen />;
    }

    // Skeleton placeholders for sections still building in the background,
    // rendered below the real blocks (or instead of the welcome screen).
    const buildSkeletons =
        skeletonSections.length > 0 ? (
            <div className={initialBlocks.length > 0 ? "space-y-4 pt-4" : "space-y-4"}>
                {skeletonSections.map((section) => (
                    <SectionBuildSkeleton
                        key={section.id}
                        title={section.title}
                        status={section.status}
                        detail={section.detail}
                    />
                ))}
            </div>
        ) : null;

    return (
        <div className="flex flex-col h-full glass">
            <Card className="flex-1 overflow-hidden bg-white no-border relative">
                {initialBlocks.length > 0 || skeletonSections.length > 0 ? (
                    <div className="relative w-full h-full">
                        <BlockRenderer
                            initialBlocks={renderedBlocks}
                            isPreview={isPreview}
                            onEditBlock={onEditBlock}
                            onAddBlock={handleAddBlock}
                            onReorder={handleReorder}
                            onDeleteBlock={handleDeleteBlock}
                            trailingContent={buildSkeletons}
                        />
                    </div>
                ) : (
                    // Nothing built yet (e.g. during clarification, before the
                    // plan is confirmed). Once section builds start, their
                    // `Section:` skeletons satisfy the branch above, and an
                    // existing lesson is protected from mid-write blanking by
                    // the watcher keeping the last good blocks.
                    <WelcomeScreen />
                )}
            </Card>
        </div>
    );
};
