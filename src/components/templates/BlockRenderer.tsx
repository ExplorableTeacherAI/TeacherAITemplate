import { useEffect, useMemo, useRef, cloneElement, isValidElement, Children, Fragment, type CSSProperties, type ReactElement, type ReactNode } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { BlockContext } from "@/contexts/BlockContext";

export interface BlockRendererProps {
    /** Array of Block elements to render */
    initialBlocks?: ReactElement[];
    isPreview?: boolean;
    onEditBlock?: (instruction: string) => void;
    onAddBlock?: (blockId: string) => void;
    onReorder?: (newBlocks: ReactElement[]) => void;
    onDeleteBlock?: (blockId: string) => void;
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
                {deepCloneWithProps(block, { isPreview, onEditBlock, onAddBlock })}
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
    onEditBlock,
    onAddBlock,
    onReorder,
    onDeleteBlock
}: BlockRendererProps) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const stackRef = useRef<HTMLDivElement | null>(null);

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

    const containerStyles = useMemo<CSSProperties>(() => ({
        position: "absolute",
        inset: 0,
        overflowY: "auto",
        overflowX: "hidden",
    }), []);

    const handleReorder = (newOrder: ReactElement[]) => {
        if (onReorder) {
            onReorder(newOrder);
        }
    };

    return (
        <div ref={containerRef} style={containerStyles} className="pointer-events-auto">
            <div
                ref={stackRef}
                className="min-h-full z-30 flex flex-col gap-6 pt-8 pb-16 px-8 md:px-16 lg:px-24"
                aria-label="Content Blocks"
            >
                <div className="max-w-5xl mx-auto w-full">
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
                                        {deepCloneWithProps(block, { isPreview, onEditBlock, onAddBlock })}
                                    </div>
                                </BlockContext.Provider>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BlockRenderer;
