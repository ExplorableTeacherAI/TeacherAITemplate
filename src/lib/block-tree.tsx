import {
    Children,
    cloneElement,
    isValidElement,
    type ReactElement,
    type ReactNode,
} from "react";
import { Block } from "@/components/templates/Block";
import { GridLayout } from "@/components/layouts/GridLayout";
import { SplitLayout } from "@/components/layouts/SplitLayout";
import { StackLayout } from "@/components/layouts/StackLayout";

type BlockRecord = { id: string; element: ReactElement };

export type BlockDropPosition = "before" | "after";
export type BlockSplitSide = "left" | "right";
export type BlockLayoutKind = "stack" | "split" | "grid";

export type BlockLayoutRow = {
    id: string;
    type: BlockLayoutKind;
    columns: string[][];
    props?: Record<string, string | number | boolean>;
};

export type BlockLayoutManifest = {
    version: 3;
    blockIds: string[];
    rows: BlockLayoutRow[];
};

export const isBlockElement = (node: ReactNode): node is ReactElement =>
    isValidElement(node) && node.type === Block;

export const getDirectBlockId = (element: ReactElement): string | undefined => {
    const id = (element.props as { id?: unknown }).id;
    return typeof id === "string" && id.length > 0 ? id : undefined;
};

export const collectBlocks = (nodes: ReactNode): BlockRecord[] => {
    const result: BlockRecord[] = [];
    const visit = (node: ReactNode) => {
        if (!isValidElement(node)) return;
        if (isBlockElement(node)) {
            const id = getDirectBlockId(node);
            if (id) result.push({ id, element: node });
            return;
        }
        const children = (node.props as { children?: ReactNode }).children;
        Children.forEach(children, visit);
    };
    Children.forEach(nodes, visit);
    return result;
};

export const collectBlockIds = (nodes: ReactNode): string[] =>
    collectBlocks(nodes).map(({ id }) => id);

export const getLayoutRowId = (row: ReactElement, index: number): string => {
    if (typeof row.key === "string" && row.key.length > 0) return row.key;
    return `editor-row-${collectBlockIds(row)[0] ?? index}`;
};

const copySupportedProps = (
    element: ReactElement,
    names: string[],
): Record<string, string | number | boolean> => {
    const source = element.props as Record<string, unknown>;
    const props: Record<string, string | number | boolean> = {};
    for (const name of names) {
        const value = source[name];
        if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
            props[name] = value;
        }
    }
    return props;
};

const normalizeRows = (rows: BlockLayoutRow[]): BlockLayoutRow[] =>
    rows.flatMap((row) => {
        const columns = row.columns
            .map((column) => Array.from(new Set(column.filter(Boolean))))
            .filter((column) => column.length > 0);
        if (columns.length === 0) return [];
        if (row.type === "stack" || columns.length === 1) {
            return [{
                ...row,
                type: "stack" as const,
                columns: [columns.flat()],
                props: row.type === "stack" ? row.props : { maxWidth: "xl" },
            }];
        }
        return [{ ...row, columns }];
    });

/** Serialize both reading order and actual row/column placement. */
export const serializeBlockLayout = (trees: ReactElement[]): BlockLayoutManifest => {
    const rows = trees.flatMap((row, index): BlockLayoutRow[] => {
        const id = getLayoutRowId(row, index);
        const props = row.props as { children?: ReactNode };
        if (row.type === SplitLayout) {
            return [{
                id,
                type: "split",
                columns: Children.toArray(props.children).map((child) => collectBlockIds(child)),
                props: copySupportedProps(row, ["ratio", "gap", "reverse", "align"]),
            }];
        }
        if (row.type === GridLayout) {
            return [{
                id,
                type: "grid",
                columns: Children.toArray(props.children).map((child) => collectBlockIds(child)),
                props: copySupportedProps(row, ["columns", "tabletColumns", "mobileColumns", "gap", "align"]),
            }];
        }
        return [{
            id,
            type: "stack",
            columns: [collectBlockIds(row)],
            props: copySupportedProps(row, ["maxWidth"]),
        }];
    });
    const normalized = normalizeRows(rows);
    return {
        version: 3,
        blockIds: normalized.flatMap((row) => row.columns.flat()),
        rows: normalized,
    };
};

const keyedBlock = (record: BlockRecord): ReactElement =>
    cloneElement(record.element, { key: record.id });

/** Rebuild editor rows from a persisted v3 placement manifest. */
export const applyBlockLayoutToTree = (
    trees: ReactElement[],
    manifest: BlockLayoutManifest,
): ReactElement[] => {
    const records = collectBlocks(trees);
    if (records.length === 0 || manifest.rows.length === 0) return trees;
    const byId = new Map(records.map((record) => [record.id, record]));
    const used = new Set<string>();
    const takeColumn = (ids: string[]) => ids.flatMap((id) => {
        const record = byId.get(id);
        if (!record || used.has(id)) return [];
        used.add(id);
        return [keyedBlock(record)];
    });

    const rebuilt = normalizeRows(manifest.rows).flatMap((row): ReactElement[] => {
        const columns = row.columns.map(takeColumn).filter((column) => column.length > 0);
        if (columns.length === 0) return [];
        if (row.type === "split" && columns.length >= 2) {
            return [
                <SplitLayout
                    key={row.id}
                    ratio={(row.props?.ratio as React.ComponentProps<typeof SplitLayout>["ratio"]) ?? "1:1"}
                    gap={(row.props?.gap as React.ComponentProps<typeof SplitLayout>["gap"]) ?? "lg"}
                    align={(row.props?.align as React.ComponentProps<typeof SplitLayout>["align"]) ?? "start"}
                    reverse={Boolean(row.props?.reverse)}
                >
                    {columns.slice(0, 2).map((column, index) => (
                        <div key={`${row.id}-column-${index}`} className="space-y-4">{column}</div>
                    ))}
                </SplitLayout>,
            ];
        }
        if (row.type === "grid" && columns.length >= 2) {
            return [
                <GridLayout
                    key={row.id}
                    columns={(row.props?.columns as React.ComponentProps<typeof GridLayout>["columns"]) ?? 3}
                    tabletColumns={row.props?.tabletColumns as React.ComponentProps<typeof GridLayout>["tabletColumns"]}
                    mobileColumns={(row.props?.mobileColumns as React.ComponentProps<typeof GridLayout>["mobileColumns"]) ?? 1}
                    gap={(row.props?.gap as React.ComponentProps<typeof GridLayout>["gap"]) ?? "md"}
                    align={(row.props?.align as React.ComponentProps<typeof GridLayout>["align"]) ?? "start"}
                >
                    {columns.map((column, index) => column.length === 1
                        ? column[0]
                        : <div key={`${row.id}-column-${index}`} className="space-y-4">{column}</div>)}
                </GridLayout>,
            ];
        }
        const content = columns.flat();
        return [
            <StackLayout
                key={row.id}
                maxWidth={(row.props?.maxWidth as React.ComponentProps<typeof StackLayout>["maxWidth"]) ?? "xl"}
            >
                {content.length === 1 ? content[0] : <div className="space-y-2">{content}</div>}
            </StackLayout>,
        ];
    });

    // Never lose a newly generated block because an older manifest did not
    // know about it. Append it as a safe full-width row.
    for (const record of records) {
        if (used.has(record.id)) continue;
        rebuilt.push(
            <StackLayout key={`editor-full-${record.id}`} maxWidth="xl">
                {keyedBlock(record)}
            </StackLayout>,
        );
    }
    return rebuilt;
};

const refillBlockSlots = (
    nodes: ReactElement[],
    orderedBlocks: ReactElement[],
): ReactElement[] => {
    let cursor = 0;
    const replace = (node: ReactNode): ReactNode => {
        if (!isValidElement(node)) return node;
        if (isBlockElement(node)) {
            const replacement = orderedBlocks[cursor];
            cursor += 1;
            return replacement ?? node;
        }
        const children = (node.props as { children?: ReactNode }).children;
        if (children === undefined) return node;
        return cloneElement(
            node as ReactElement<{ children?: ReactNode }>,
            undefined,
            Children.map(children, replace),
        );
    };
    return nodes.map((node) => replace(node) as ReactElement);
};

/** Compatibility path for the original flat v2 block-order manifest. */
export const applyBlockOrderToTree = (
    trees: ReactElement[],
    requestedIds: string[],
): ReactElement[] => {
    const records = collectBlocks(trees);
    if (records.length === 0 || requestedIds.length === 0) return trees;

    const byId = new Map(records.map((record) => [record.id, record.element]));
    const seen = new Set<string>();
    const ordered: ReactElement[] = [];
    for (const id of requestedIds) {
        const block = byId.get(id);
        if (!block || seen.has(id)) continue;
        seen.add(id);
        ordered.push(block);
    }
    for (const record of records) {
        if (seen.has(record.id)) continue;
        seen.add(record.id);
        ordered.push(record.element);
    }
    return refillBlockSlots(trees, ordered);
};

const withoutBlock = (rows: BlockLayoutRow[], sourceId: string): BlockLayoutRow[] =>
    normalizeRows(rows.map((row) => ({
        ...row,
        columns: row.columns.map((column) => column.filter((id) => id !== sourceId)),
    })));

const pruneBlock = (nodes: ReactElement[], blockId: string): ReactElement[] => {
    const prune = (node: ReactNode): ReactNode => {
        if (!isValidElement(node)) return node;
        if (isBlockElement(node)) {
            return getDirectBlockId(node) === blockId ? null : node;
        }
        // isBlockElement narrows the positive branch, leaving `node` typed as
        // never here, so re-assert the element shape before reading children.
        const element = node as ReactElement<{ children?: ReactNode }>;
        const children = element.props.children;
        if (children === undefined) return element;
        return cloneElement(element, undefined, Children.map(children, prune));
    };
    return nodes
        .map((node) => prune(node))
        .filter((node): node is ReactElement => isValidElement(node));
};

/**
 * Drop a single Block and keep its siblings. Deleting one side of a split row
 * collapses that row to a stack rather than taking the whole row with it.
 */
export const removeBlockFromTree = (
    trees: ReactElement[],
    blockId: string,
): ReactElement[] => {
    const manifest = serializeBlockLayout(trees);
    if (!manifest.blockIds.includes(blockId)) return trees;

    const rows = withoutBlock(manifest.rows, blockId);
    if (rows.length === 0) return [];

    // Prune first: applyBlockLayoutToTree re-appends any block the manifest
    // does not mention, which would resurrect the one just deleted.
    return applyBlockLayoutToTree(pruneBlock(trees, blockId), {
        version: 3,
        blockIds: rows.flatMap((row) => row.columns.flat()),
        rows,
    });
};

export const moveBlockInTree = (
    trees: ReactElement[],
    sourceId: string,
    targetId: string,
    position: BlockDropPosition,
): ReactElement[] => {
    if (sourceId === targetId) return trees;
    const manifest = serializeBlockLayout(trees);
    if (!manifest.blockIds.includes(sourceId) || !manifest.blockIds.includes(targetId)) return trees;

    const rows = withoutBlock(manifest.rows, sourceId);
    for (const row of rows) {
        for (const column of row.columns) {
            const targetIndex = column.indexOf(targetId);
            if (targetIndex === -1) continue;
            column.splice(targetIndex + (position === "after" ? 1 : 0), 0, sourceId);
            return applyBlockLayoutToTree(trees, {
                version: 3,
                blockIds: manifest.blockIds,
                rows: normalizeRows(rows),
            });
        }
    }
    return trees;
};

/** Extract a block from any column and insert it as its own full-width row. */
export const moveBlockToFullWidthRow = (
    trees: ReactElement[],
    sourceId: string,
    beforeRowId: string | null,
): ReactElement[] => {
    const manifest = serializeBlockLayout(trees);
    if (!manifest.blockIds.includes(sourceId)) return trees;
    const rows = withoutBlock(manifest.rows, sourceId);
    const foundIndex = beforeRowId === null
        ? rows.length
        : rows.findIndex((row) => row.id === beforeRowId);
    const safeInsertAt = foundIndex === -1 ? rows.length : foundIndex;
    rows.splice(safeInsertAt, 0, {
        id: `editor-full-${sourceId}`,
        type: "stack",
        columns: [[sourceId]],
        props: { maxWidth: "xl" },
    });
    return applyBlockLayoutToTree(trees, {
        version: 3,
        blockIds: manifest.blockIds,
        rows,
    });
};

/** Pair a dragged block with an existing full-width row as a new split. */
export const moveBlockToSplitRow = (
    trees: ReactElement[],
    sourceId: string,
    targetRowId: string,
    side: BlockSplitSide,
): ReactElement[] => {
    const manifest = serializeBlockLayout(trees);
    if (!manifest.blockIds.includes(sourceId)) return trees;

    // Nested splits are intentionally excluded. Existing split/grid rows keep
    // accepting drops into their individual columns through moveBlockInTree.
    const originalTarget = manifest.rows.find((row) => row.id === targetRowId);
    if (!originalTarget || originalTarget.type !== "stack") return trees;

    const rows = withoutBlock(manifest.rows, sourceId);
    const targetIndex = rows.findIndex((row) => row.id === targetRowId);
    if (targetIndex === -1) return trees;
    const target = rows[targetIndex];
    const targetIds = target.columns.flat();
    if (target.type !== "stack" || targetIds.length === 0) return trees;

    rows[targetIndex] = {
        id: target.id,
        type: "split",
        columns: side === "left"
            ? [[sourceId], targetIds]
            : [targetIds, [sourceId]],
        props: {
            ratio: "1:1",
            gap: "lg",
            align: "start",
            reverse: false,
        },
    };
    return applyBlockLayoutToTree(trees, {
        version: 3,
        blockIds: manifest.blockIds,
        rows,
    });
};
