import { useEffect, useMemo, useRef, cloneElement, isValidElement, Children, Fragment, type CSSProperties, type ReactElement, type ReactNode } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { BlockContext } from "@/contexts/BlockContext";
import { InteractionLegend } from "@/components/molecules";
import { BlockErrorBoundary } from "./BlockErrorBoundary";

export interface BlockRendererProps {
    /** Array of Block elements to render */
    initialBlocks?: ReactElement[];
    isPreview?: boolean;
    /** Hide the auto-rendered InteractionLegend (used for small embedded explorables) */
    hideLegend?: boolean;
    /** Render at natural content height with compact padding (for iframe embeds)
     *  instead of the default absolutely-positioned scroll container */
    embedded?: boolean;
    onEditBlock?: (instruction: string) => void;
    onAddBlock?: (blockId: string) => void;
    onReorder?: (newBlocks: ReactElement[]) => void;
    onDeleteBlock?: (blockId: string) => void;
    /** Rendered after the blocks, inside the scroll container (e.g. skeletons
     *  for sections still being built in the background) */
    trailingContent?: ReactNode;
}

/**
 * Recursively clone React elements and inject props into all children.
 * Only inject props into custom components, not host components (DOM elements) or Fragments.
 */
const deepCloneWithProps = (element: ReactNode, props: { isPreview?: boolean; onEditBlock?: (instruction: string) => void; onAddBlock?: (blockId: string) => void }): ReactNode => {
    if (!isValidElement(element)) {
        return element;
    }

    const isHostComponent = typeof element.type === 'string';
    const isFragment = element.type === Fragment;
    const shouldInjectProps = !isHostComponent && !isFragment;

    const clonedElement = cloneElement(
        element as ReactElement,
        shouldInjectProps ? { ...props } : {},
        element.props.children
            ? Children.map(element.props.children, (child) => deepCloneWithProps(child, props))
            : undefined
    );

    return clonedElement;
};

// The preview iframe is reloaded by the parent frontend whenever a section
// registers/completes or an edit is saved. Persisting scroll per page URL in
// sessionStorage (same origin across reloads) keeps the teacher where they
// were instead of snapping back to the top of the lesson every time.
const SCROLL_STORAGE_KEY = `lesson-scroll:${window.location.pathname}${window.location.search}`;

/**
 * Extract block ID from element - handles both direct Block components and wrapped layouts
 */
const getBlockId = (element: ReactElement): string | undefined => {
    // Direct id prop
    if (element.props.id) return element.props.id;

    // Check data-block-id
    if (element.props['data-block-id']) return element.props['data-block-id'];

    // Try to find id in nested children (for layout wrappers)
    if (element.props.children && isValidElement(element.props.children)) {
        return getBlockId(element.props.children as ReactElement);
    }

    // Check first child if multiple children
    const children = Children.toArray(element.props.children);
    for (const child of children) {
        if (isValidElement(child)) {
            const id = getBlockId(child as ReactElement);
            if (id) return id;
        }
    }

    return undefined;
};

// Wrapper for individual draggable blocks to isolate hooks
const DraggableBlock = ({
    block,
    isPreview,
    onEditBlock,
    onAddBlock,
    onDeleteBlock
}: {
    block: ReactElement;
    isPreview?: boolean;
    onEditBlock?: (instruction: string) => void;
    onAddBlock?: (blockId: string) => void;
    onDeleteBlock?: (blockId: string) => void;
}) => {
    const dragControls = useDragControls();
    const blockId = getBlockId(block);

    const handleDelete = () => {
        if (blockId && onDeleteBlock) {
            onDeleteBlock(blockId);
        }
    };

    return (
        <Reorder.Item
            value={block}
            dragListener={false}
            dragControls={dragControls}
            className="w-full relative"
            style={{ position: "relative" }}
        >
            <BlockContext.Provider value={{ dragControls, onDelete: handleDelete, id: blockId }}>
                <BlockErrorBoundary blockId={blockId}>
                    {deepCloneWithProps(block, { isPreview, onEditBlock, onAddBlock })}
                </BlockErrorBoundary>
            </BlockContext.Provider>
        </Reorder.Item>
    );
};

/**
 * BlockRenderer - Renders and manages a list of draggable blocks.
 * 
 * Each block can be:
 * - Dragged and reordered
 * - Deleted
 * - Edited
 * 
 * Blocks are the primary unit of content, no Section wrapper is required.
 */
export const BlockRenderer = ({
    initialBlocks = [],
    isPreview = false,
    hideLegend = false,
    embedded = false,
    onEditBlock,
    onAddBlock,
    onReorder,
    onDeleteBlock,
    trailingContent
}: BlockRendererProps) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const stackRef = useRef<HTMLDivElement | null>(null);
    const scrollRestoredRef = useRef(false);

    // Save scroll position (rAF-throttled) so it survives iframe reloads
    useEffect(() => {
        if (embedded) return;
        const el = containerRef.current;
        if (!el) return;
        let raf = 0;
        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                try {
                    sessionStorage.setItem(SCROLL_STORAGE_KEY, String(el.scrollTop));
                } catch {
                    // storage unavailable (private mode etc.) — scroll just resets
                }
            });
        };
        el.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            el.removeEventListener("scroll", onScroll);
            cancelAnimationFrame(raf);
        };
    }, [embedded]);

    // Restore the saved position once, after real content has rendered.
    // Content keeps growing for a moment (images, lazy visualizations), so
    // retry briefly until the saved offset is actually reachable.
    useEffect(() => {
        if (embedded || scrollRestoredRef.current || initialBlocks.length === 0) return;
        const el = containerRef.current;
        if (!el) return;
        scrollRestoredRef.current = true;
        let saved = 0;
        try {
            saved = parseInt(sessionStorage.getItem(SCROLL_STORAGE_KEY) ?? "0", 10) || 0;
        } catch {
            return;
        }
        if (saved <= 0) return;
        let attempts = 0;
        let timer: ReturnType<typeof setTimeout> | undefined;
        const tryRestore = () => {
            if (el.scrollHeight - el.clientHeight >= saved || attempts >= 10) {
                el.scrollTop = saved;
                return;
            }
            attempts += 1;
            timer = setTimeout(tryRestore, 150);
        };
        const raf = requestAnimationFrame(() => requestAnimationFrame(tryRestore));
        return () => {
            cancelAnimationFrame(raf);
            if (timer) clearTimeout(timer);
        };
    }, [embedded, initialBlocks]);

    // Typeset MathJax
    useEffect(() => {
        const el = stackRef.current;
        const mj = window.MathJax;
        if (!el || !mj) return;
        try {
            if (mj.typesetPromise) {
                mj.typesetPromise([el]).catch(() => { });
            } else if (mj.typeset) {
                mj.typeset([el]);
            }
        } catch { }
    }, [initialBlocks]);

    const containerStyles = useMemo<CSSProperties>(() => (
        embedded
            ? {
                position: "relative",
                overflow: "visible",
            }
            : {
                position: "absolute",
                inset: 0,
                overflowY: "auto",
                overflowX: "hidden",
            }
    ), [embedded]);

    const handleReorder = (newOrder: ReactElement[]) => {
        if (onReorder) {
            onReorder(newOrder);
        }
    };

    return (
        <div ref={containerRef} style={containerStyles} className="pointer-events-auto">
            <div
                ref={stackRef}
                className={
                    embedded
                        ? "z-30 flex flex-col gap-4 px-4 py-4 md:px-6"
                        : "min-h-full z-30 flex flex-col gap-6 pt-8 pb-16 px-8 md:px-16 lg:px-24"
                }
                aria-label="Content Blocks"
            >
                <div className="max-w-5xl mx-auto w-full">
                    {/* Interaction legend — teaches first-time users how the interactive elements work */}
                    {initialBlocks.length > 0 && !hideLegend && <InteractionLegend />}

                    {onReorder ? (
                        <Reorder.Group
                            axis="y"
                            values={initialBlocks}
                            onReorder={handleReorder}
                            className="space-y-2"
                        >
                            {initialBlocks.map((block, index) => (
                                <DraggableBlock
                                    key={block.key || getBlockId(block) || `block-${index}`}
                                    block={block}
                                    isPreview={isPreview}
                                    onEditBlock={onEditBlock}
                                    onAddBlock={onAddBlock}
                                    onDeleteBlock={onDeleteBlock}
                                />
                            ))}
                        </Reorder.Group>
                    ) : (
                        <div className="space-y-2">
                            {initialBlocks.map((block, index) => (
                                <BlockContext.Provider
                                    key={block.key || `block-${index}`}
                                    value={{ id: getBlockId(block) }}
                                >
                                    <div className="w-full">
                                        <BlockErrorBoundary blockId={getBlockId(block)}>
                                            {deepCloneWithProps(block, { isPreview, onEditBlock, onAddBlock })}
                                        </BlockErrorBoundary>
                                    </div>
                                </BlockContext.Provider>
                            ))}
                        </div>
                    )}
                    {trailingContent}
                </div>
            </div>
        </div>
    );
};

export default BlockRenderer;
