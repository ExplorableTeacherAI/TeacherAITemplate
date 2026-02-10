import { type ReactElement } from "react";

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
            return Array.isArray(blocks) ? blocks : [];
        }

        // Dynamic import to allow Vite HMR to work properly
        const module = await import("@/data/blocks");
        const blocks = module.blocks || [];
        return Array.isArray(blocks) ? blocks : [];
    } catch (err) {
        console.warn("loadBlocksFromModule error:", err);
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
                    onUpdate(newModule.exampleBlocks);
                }
            });
        } else {
            import.meta.hot.accept('@/data/blocks', (newModule) => {
                if (newModule?.blocks) {
                    onUpdate(newModule.blocks);
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
