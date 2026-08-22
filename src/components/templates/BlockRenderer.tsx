import { useCallback, useEffect, useMemo, useRef, useState, cloneElement, isValidElement, Children, Fragment, type CSSProperties, type ReactElement, type ReactNode } from "react";
import { motion, useDragControls, type PanInfo } from "framer-motion";
import { BlockContext } from "@/contexts/BlockContext";
import {
    getDirectBlockId,
    getLayoutRowId,
    isBlockElement,
    moveBlockInTree,
    moveBlockToFullWidthRow,
    moveBlockToSplitRow,
    serializeBlockLayout,
    type BlockDropPosition,
    type BlockSplitSide,
} from "@/lib/block-tree";
import { BlockErrorBoundary } from "./BlockErrorBoundary";

export interface BlockRendererProps {
    /** Array of Block elements to render */
    initialBlocks?: ReactElement[];
    isPreview?: boolean;
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
    onDeleteBlock,
    dropPosition,
    onDragStart,
    onDragMove,
    onDragFinish,
}: {
    block: ReactElement;
    isPreview?: boolean;
    onEditBlock?: (instruction: string) => void;
    onAddBlock?: (blockId: string) => void;
    onDeleteBlock?: (blockId: string) => void;
    dropPosition?: BlockDropPosition;
    onDragStart: (sourceId: string) => void;
    onDragMove: (sourceId: string, point: { x: number; y: number }) => void;
    onDragFinish: (sourceId: string) => void;
}) => {
    const dragControls = useDragControls();
    const blockId = getDirectBlockId(block) ?? getBlockId(block);
    const [dragging, setDragging] = useState(false);

    const handleDelete = () => {
        if (blockId && onDeleteBlock) {
            onDeleteBlock(blockId);
        }
    };

    return (
        <motion.div
            drag={Boolean(blockId)}
            dragListener={false}
            dragControls={dragControls}
            dragMomentum={false}
            dragSnapToOrigin
            layout
            onDragStart={() => {
                setDragging(true);
                if (blockId) onDragStart(blockId);
            }}
            onDrag={(_event, info: PanInfo) => {
                if (blockId) onDragMove(blockId, info.point);
            }}
            onDragEnd={() => {
                setDragging(false);
                if (blockId) onDragFinish(blockId);
            }}
            data-sortable-block-id={blockId}
            className={`w-full relative ${dragging ? "z-50" : ""}`}
            style={{ position: "relative" }}
            whileDrag={{ scale: 1.01, opacity: 0.88 }}
        >
            {dropPosition && (
                <div
                    className={`pointer-events-none absolute inset-x-0 z-[60] h-0.5 rounded-full bg-[#0D7377] shadow-[0_0_0_2px_rgba(212,237,229,0.9)] ${dropPosition === "before" ? "-top-1" : "-bottom-1"}`}
                />
            )}
            <BlockContext.Provider value={{ dragControls, onDelete: handleDelete, id: blockId }}>
                <BlockErrorBoundary blockId={blockId}>
                    {deepCloneWithProps(block, { isPreview, onEditBlock, onAddBlock })}
                </BlockErrorBoundary>
            </BlockContext.Provider>
        </motion.div>
    );
};

type DropTarget =
    | { kind: "block"; id: string; position: BlockDropPosition }
    | { kind: "row"; beforeRowId: string | null }
    | { kind: "split"; targetRowId: string; side: BlockSplitSide };

type DraggableTreeOptions = {
    isPreview?: boolean;
    onEditBlock?: (instruction: string) => void;
    onAddBlock?: (blockId: string) => void;
    onDeleteBlock?: (blockId: string) => void;
    dropTarget: DropTarget | null;
    onDragStart: (sourceId: string) => void;
    onDragMove: (sourceId: string, point: { x: number; y: number }) => void;
    onDragFinish: (sourceId: string) => void;
};

/** Keep layout components in place, but wrap every nested Block independently. */
const renderDraggableTree = (node: ReactNode, options: DraggableTreeOptions): ReactNode => {
    if (!isValidElement(node)) return node;
    if (isBlockElement(node)) {
        const id = getDirectBlockId(node);
        return (
            <DraggableBlock
                key={node.key ?? id}
                block={node}
                isPreview={options.isPreview}
                onEditBlock={options.onEditBlock}
                onAddBlock={options.onAddBlock}
                onDeleteBlock={options.onDeleteBlock}
                dropPosition={options.dropTarget?.kind === "block" && id === options.dropTarget.id ? options.dropTarget.position : undefined}
                onDragStart={options.onDragStart}
                onDragMove={options.onDragMove}
                onDragFinish={options.onDragFinish}
            />
        );
    }

    const isHostComponent = typeof node.type === "string";
    const isFragment = node.type === Fragment;
    const children = (node.props as { children?: ReactNode }).children;
    return cloneElement(
        node as ReactElement<{ children?: ReactNode }>,
        !isHostComponent && !isFragment
            ? {
                isPreview: options.isPreview,
                onEditBlock: options.onEditBlock,
                onAddBlock: options.onAddBlock,
            } as object
            : undefined,
        children === undefined
            ? undefined
            : Children.map(children, (child) => renderDraggableTree(child, options)),
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
    const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
    const [draggingSourceId, setDraggingSourceId] = useState<string | null>(null);
    const dropTargetRef = useRef(dropTarget);
    const layoutRowsById = useMemo(() => new Map(
        serializeBlockLayout(initialBlocks).rows.map((row) => [row.id, row]),
    ), [initialBlocks]);

    useEffect(() => {
        dropTargetRef.current = dropTarget;
    }, [dropTarget]);

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
        } catch {
            // MathJax failures must not block lesson editing.
        }
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

    const handleDragMove = useCallback((sourceId: string, point: { x: number; y: number }) => {
        const root = stackRef.current;
        if (!root) return;

        // Keep long lessons sortable without interrupting the pointer gesture.
        // The scroll speed ramps up as the pointer approaches either edge.
        if (!embedded) {
            const scroller = containerRef.current;
            if (scroller) {
                const bounds = scroller.getBoundingClientRect();
                const edgeSize = 80;
                const maxStep = 22;
                if (point.y < bounds.top + edgeSize) {
                    const pressure = Math.min(1, (bounds.top + edgeSize - point.y) / edgeSize);
                    scroller.scrollTop -= Math.ceil(maxStep * pressure);
                } else if (point.y > bounds.bottom - edgeSize) {
                    const pressure = Math.min(1, (point.y - (bounds.bottom - edgeSize)) / edgeSize);
                    scroller.scrollTop += Math.ceil(maxStep * pressure);
                }
            }
        }

        const elementsAtPoint = document.elementsFromPoint(point.x, point.y);
        const rowZone = elementsAtPoint
            .map((element) => element.closest<HTMLElement>("[data-full-width-drop-before]"))
            .find(Boolean);
        if (rowZone) {
            const value = rowZone.dataset.fullWidthDropBefore;
            const next: DropTarget = {
                kind: "row",
                beforeRowId: value === "__end__" ? null : value ?? null,
            };
            dropTargetRef.current = next;
            setDropTarget((current) =>
                current?.kind === "row" && current.beforeRowId === next.beforeRowId ? current : next,
            );
            return;
        }

        const splitZone = elementsAtPoint
            .map((element) => element.closest<HTMLElement>("[data-split-drop-row]"))
            .find(Boolean);
        if (splitZone) {
            const targetRowId = splitZone.dataset.splitDropRow;
            const side = splitZone.dataset.splitDropSide;
            if (targetRowId && (side === "left" || side === "right")) {
                const next: DropTarget = { kind: "split", targetRowId, side };
                dropTargetRef.current = next;
                setDropTarget((current) =>
                    current?.kind === "split" &&
                        current.targetRowId === next.targetRowId &&
                        current.side === next.side
                        ? current
                        : next,
                );
                return;
            }
        }

        const candidates = Array.from(
            root.querySelectorAll<HTMLElement>("[data-sortable-block-id]"),
        ).filter((element) => element.dataset.sortableBlockId !== sourceId);
        if (candidates.length === 0) return;

        const hit = elementsAtPoint
            .map((element) => element.closest<HTMLElement>("[data-sortable-block-id]"))
            .find((element) => element && element.dataset.sortableBlockId !== sourceId);
        const target = hit ?? candidates.reduce((nearest, candidate) => {
            const candidateRect = candidate.getBoundingClientRect();
            const nearestRect = nearest.getBoundingClientRect();
            return Math.abs(point.y - (candidateRect.top + candidateRect.height / 2)) <
                Math.abs(point.y - (nearestRect.top + nearestRect.height / 2))
                ? candidate
                : nearest;
        });
        const targetId = target.dataset.sortableBlockId;
        if (!targetId) return;
        const rect = target.getBoundingClientRect();
        const position: BlockDropPosition = point.y < rect.top + rect.height / 2 ? "before" : "after";
        const next: DropTarget = { kind: "block", id: targetId, position };
        dropTargetRef.current = next;
        setDropTarget((current) =>
            current?.kind === "block" && current.id === next.id && current.position === next.position ? current : next,
        );
    }, [embedded]);

    const handleDragFinish = useCallback((sourceId: string) => {
        const target = dropTargetRef.current;
        dropTargetRef.current = null;
        setDropTarget(null);
        setDraggingSourceId(null);
        if (!target || !onReorder) return;
        const reordered = target.kind === "row"
            ? moveBlockToFullWidthRow(initialBlocks, sourceId, target.beforeRowId)
            : target.kind === "split"
                ? moveBlockToSplitRow(initialBlocks, sourceId, target.targetRowId, target.side)
                : moveBlockInTree(initialBlocks, sourceId, target.id, target.position);
        const before = JSON.stringify(serializeBlockLayout(initialBlocks));
        const after = JSON.stringify(serializeBlockLayout(reordered));
        if (before !== after) {
            onReorder(reordered);
        }
    }, [initialBlocks, onReorder]);

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

                    {onReorder ? (
                        <div className="space-y-2">
                            {initialBlocks.map((block, index) => {
                                const rowId = getLayoutRowId(block, index);
                                const row = layoutRowsById.get(rowId);
                                const rowSelected = dropTarget?.kind === "row" && dropTarget.beforeRowId === rowId;
                                const canCreateSplit = Boolean(
                                    draggingSourceId &&
                                    row?.type === "stack" &&
                                    row.columns.flat().some((id) => id !== draggingSourceId),
                                );
                                return (
                                    <div key={rowId} data-editor-row-id={rowId} className="relative">
                                        {draggingSourceId && (
                                            <div
                                                data-full-width-drop-before={rowId}
                                                className="absolute inset-x-0 -top-3 z-[70] h-6"
                                            >
                                                {rowSelected && (
                                                    <>
                                                        <div className="absolute inset-x-0 top-1/2 h-0.5 rounded-full bg-[#0D7377]" />
                                                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0D7377] px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                                                            Full width
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                        {canCreateSplit && (
                                            <>
                                                <div
                                                    data-split-drop-row={rowId}
                                                    data-split-drop-side="left"
                                                    aria-hidden="true"
                                                    className={`absolute inset-y-0 left-0 z-[65] flex w-[22%] min-w-20 items-center justify-start rounded-l-lg border-l-2 border-dashed px-2 transition-colors ${dropTarget?.kind === "split" && dropTarget.targetRowId === rowId && dropTarget.side === "left"
                                                        ? "border-[#0D7377] bg-[#D4EDE5]/80"
                                                        : "border-[#0D7377]/30 bg-transparent"
                                                        }`}
                                                >
                                                    <span className={`rounded-full bg-[#0D7377] px-2 py-1 text-[10px] font-semibold text-white shadow-sm transition-opacity ${dropTarget?.kind === "split" && dropTarget.targetRowId === rowId && dropTarget.side === "left"
                                                        ? "opacity-100"
                                                        : "opacity-55"
                                                        }`}>
                                                        Split left
                                                    </span>
                                                </div>
                                                <div
                                                    data-split-drop-row={rowId}
                                                    data-split-drop-side="right"
                                                    aria-hidden="true"
                                                    className={`absolute inset-y-0 right-0 z-[65] flex w-[22%] min-w-20 items-center justify-end rounded-r-lg border-r-2 border-dashed px-2 transition-colors ${dropTarget?.kind === "split" && dropTarget.targetRowId === rowId && dropTarget.side === "right"
                                                        ? "border-[#0D7377] bg-[#D4EDE5]/80"
                                                        : "border-[#0D7377]/30 bg-transparent"
                                                        }`}
                                                >
                                                    <span className={`rounded-full bg-[#0D7377] px-2 py-1 text-[10px] font-semibold text-white shadow-sm transition-opacity ${dropTarget?.kind === "split" && dropTarget.targetRowId === rowId && dropTarget.side === "right"
                                                        ? "opacity-100"
                                                        : "opacity-55"
                                                        }`}>
                                                        Split right
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                        {renderDraggableTree(block, {
                                            isPreview,
                                            onEditBlock,
                                            onAddBlock,
                                            onDeleteBlock,
                                            dropTarget,
                                            onDragStart: setDraggingSourceId,
                                            onDragMove: handleDragMove,
                                            onDragFinish: handleDragFinish,
                                        })}
                                    </div>
                                );
                            })}
                            {draggingSourceId && (
                                <div className="relative h-0">
                                    <div
                                        data-full-width-drop-before="__end__"
                                        className="absolute inset-x-0 -top-1 z-[70] h-6"
                                    >
                                        {dropTarget?.kind === "row" && dropTarget.beforeRowId === null && (
                                            <>
                                                <div className="absolute inset-x-0 top-1/2 h-0.5 rounded-full bg-[#0D7377]" />
                                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0D7377] px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                                                    Full width
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
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
