import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { applyBlockLayoutToTree, applyBlockOrderToTree, type BlockLayoutKind, type BlockLayoutManifest, type BlockLayoutRow } from "@/lib/block-tree";

const visualEditorOrderModules = import.meta.glob<{ default: unknown }>(
    "../data/visual-editor-order.json",
    { eager: true },
);

type VisualEditorOrder =
    | { scope: "layout" | "block"; ids: string[] }
    | { scope: "placement"; ids: string[]; manifest: BlockLayoutManifest };

const visualEditorOrder: VisualEditorOrder = (() => {
    const module = Object.values(visualEditorOrderModules)[0];
    const value = module?.default;
    if (Array.isArray(value)) {
        return {
            scope: "layout",
            ids: value.filter((id): id is string => typeof id === "string"),
        };
    }
    if (value && typeof value === "object") {
        const object = value as { version?: unknown; blockIds?: unknown; rows?: unknown };
        const blockIds = object.blockIds;
        if (object.version === 3 && Array.isArray(blockIds) && Array.isArray(object.rows)) {
            const allowedTypes = new Set<BlockLayoutKind>(["stack", "split", "grid"]);
            const rows = object.rows.flatMap((candidate): BlockLayoutRow[] => {
                if (!candidate || typeof candidate !== "object") return [];
                const row = candidate as { id?: unknown; type?: unknown; columns?: unknown; props?: unknown };
                if (typeof row.id !== "string" || !allowedTypes.has(row.type as BlockLayoutKind) || !Array.isArray(row.columns)) return [];
                const columns = row.columns.map((column) =>
                    Array.isArray(column)
                        ? column.filter((id): id is string => typeof id === "string")
                        : []
                );
                const props = row.props && typeof row.props === "object"
                    ? Object.fromEntries(Object.entries(row.props).filter(([, prop]) =>
                        typeof prop === "string" || typeof prop === "number" || typeof prop === "boolean"
                    ))
                    : undefined;
                return [{ id: row.id, type: row.type as BlockLayoutKind, columns, props }];
            });
            if (rows.length > 0) {
                const ids = blockIds.filter((id): id is string => typeof id === "string");
                return { scope: "placement", ids, manifest: { version: 3, blockIds: ids, rows } };
            }
        }
        if (Array.isArray(blockIds)) {
            return {
                scope: "block",
                ids: blockIds.filter((id): id is string => typeof id === "string"),
            };
        }
    }
    return { scope: "block", ids: [] };
})();

/** Match the identity LessonView sends for drag-and-drop ordering. */
const getBlockIdentity = (element: ReactElement): string | undefined => {
    if (typeof element.key === "string") {
        return element.key.startsWith("layout-")
            ? element.key.slice("layout-".length)
            : element.key;
    }
    const props = element.props as { id?: string; children?: ReactNode };
    if (typeof props.id === "string") return props.id;
    for (const child of Children.toArray(props.children)) {
        if (!isValidElement(child)) continue;
        const id = getBlockIdentity(child as ReactElement);
        if (id) return id;
    }
    return undefined;
};

export const applyVisualEditorOrder = (blocks: ReactElement[]): ReactElement[] => {
    if (visualEditorOrder.ids.length === 0) return blocks;
    if (visualEditorOrder.scope === "placement") {
        return applyBlockLayoutToTree(blocks, visualEditorOrder.manifest);
    }
    if (visualEditorOrder.scope === "block") {
        return applyBlockOrderToTree(blocks, visualEditorOrder.ids);
    }

    // Compatibility with the original array manifest, whose entries identify
    // whole top-level layouts. New manifests use { version: 2, blockIds }.
    const rank = new Map(visualEditorOrder.ids.map((id, index) => [id, index]));
    return blocks
        .map((block, originalIndex) => ({ block, originalIndex, id: getBlockIdentity(block) }))
        .sort((left, right) => {
            const leftRank = left.id === undefined ? undefined : rank.get(left.id);
            const rightRank = right.id === undefined ? undefined : rank.get(right.id);
            if (leftRank === undefined && rightRank === undefined) {
                return left.originalIndex - right.originalIndex;
            }
            if (leftRank === undefined) return 1;
            if (rightRank === undefined) return -1;
            return leftRank - rightRank;
        })
        .map(({ block }) => block);
};

/**
 * Configuration for block loading strategy
 */
export type BlockLoaderConfig = {
    /**
     * Strategy to use for loading blocks.
     * - 'module': Import from TypeScript module (supports hot-reload in dev mode)
     * - 'json-public': Fetch from public folder JSON file (requires restart)
     * - 'json-api': Fetch from API endpoint (dynamic)
     */
    strategy?: 'module' | 'json-public' | 'json-api';

    /**
     * URL or path to load from (for JSON strategies)
     */
    url?: string;

    /**
     * Enable polling in development mode for file changes
     */
    enableDevPolling?: boolean;

    /**
     * Polling interval in milliseconds (default: 1000)
     */
    pollingInterval?: number;
};

/**
 * Load blocks from TypeScript module (supports hot-reload)
 * Returns array of React elements
 */
async function loadBlocksFromModule(): Promise<ReactElement[]> {
    try {
        // If VITE_SHOW_EXAMPLES is true, load from exampleBlocks
        if (import.meta.env.VITE_SHOW_EXAMPLES === 'true') {
            const module = await import("@/data/exampleBlocks");
            const blocks = module.exampleBlocks || [];
            return Array.isArray(blocks) ? applyVisualEditorOrder(blocks) : [];
        }

        // Dynamic import to allow Vite HMR to work properly
        const module = await import("@/data/blocks");
        const blocks = module.blocks || [];
        return Array.isArray(blocks) ? applyVisualEditorOrder(blocks) : [];
    } catch (err) {
        // Log the error with more detail
        console.error("Failed to load blocks module:", err);
        
        // Notify parent window about the error (for debugging)
        if (typeof window !== 'undefined' && window.parent !== window) {
            window.parent.postMessage({ 
                type: 'blocks-load-error',
                error: err instanceof Error ? err.message : String(err)
            }, '*');
        }
        
        return [];
    }
}

/**
 * Main loader function with configurable strategy
 */
export async function loadBlocks(config: BlockLoaderConfig = {}): Promise<ReactElement[]> {
    const {
        strategy = 'module', // Default to module for hot-reload support
    } = config;

    switch (strategy) {
        case 'module':
            return loadBlocksFromModule();

        case 'json-public':
        case 'json-api':
            console.warn('JSON strategies are not supported in component-based architecture');
            return [];

        default:
            console.warn(`Unknown strategy: ${strategy}, falling back to module`);
            return loadBlocksFromModule();
    }
}

/**
 * Create a blocks watcher for development mode
 * Returns a cleanup function to stop watching
 */
export function createBlocksWatcher(
    onUpdate: (blocks: ReactElement[]) => void,
    config: BlockLoaderConfig = {}
): () => void {
    const {
        strategy = 'module',
    } = config;

    // For module strategy, Vite HMR handles updates automatically
    // We set up HMR accept for the blocks module
    if (strategy === 'module' && import.meta.hot) {
        if (import.meta.env.VITE_SHOW_EXAMPLES === 'true') {
            import.meta.hot.accept('@/data/exampleBlocks', (newModule) => {
                if (newModule?.exampleBlocks) {
                    onUpdate(applyVisualEditorOrder(newModule.exampleBlocks));
                }
            });
        } else {
            import.meta.hot.accept('@/data/blocks', (newModule) => {
                if (newModule?.blocks) {
                    onUpdate(applyVisualEditorOrder(newModule.blocks));
                }
            });
        }

        return () => {
            // Vite handles cleanup
        };
    }

    return () => {
        // No cleanup needed
    };
}

// Backward compatibility - default export uses module strategy
export default loadBlocks;
