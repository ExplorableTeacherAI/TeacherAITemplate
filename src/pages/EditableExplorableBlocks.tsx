import { type ReactElement, useEffect, useState } from "react";
import { BlockRenderer } from "@/components/templates";
import { useBlockStructureEditing } from "@/hooks/useBlockStructureEditing";

/**
 * The teacher's explorable editor: the same block controls as the lesson
 * editor (add, drag to reorder, delete, saved empty paragraphs stay
 * editable), recorded as structure edits that the editor page saves.
 */
export default function EditableExplorableBlocks({ blocks }: { blocks: ReactElement[] }) {
    const [current, setCurrent] = useState(blocks);
    // A saved edit (or the refine agent) rewrites the file; HMR then hands
    // us the new blocks, which replace the locally edited list.
    useEffect(() => setCurrent(blocks), [blocks]);
    const { renderedBlocks, handleAddBlock, handleReorder, handleDeleteBlock } =
        useBlockStructureEditing(current, setCurrent);
    return (
        <BlockRenderer
            initialBlocks={renderedBlocks}
            hideLegend
            embedded
            onAddBlock={handleAddBlock}
            onReorder={handleReorder}
            onDeleteBlock={handleDeleteBlock}
        />
    );
}
