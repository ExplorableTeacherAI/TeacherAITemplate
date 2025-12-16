import { type ReactElement } from "react";

/**
 * Configuration for section loading strategy
 */
export type SectionLoaderConfig = {
  /**
   * Strategy to use for loading sections.
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
 * Load sections from TypeScript module (supports hot-reload)
 * Returns array of React elements
 */
async function loadSectionsFromModule(): Promise<ReactElement[]> {
  try {
    // If VITE_SHOW_EXAMPLES is true, load from exampleSections
    if (import.meta.env.VITE_SHOW_EXAMPLES === 'true') {
      const module = await import("@/data/exampleSections");
      const sections = module.exampleSections || [];
      return Array.isArray(sections) ? sections : [];
    }

    // Dynamic import to allow Vite HMR to work properly
    const module = await import("@/data/sections");
    const sections = module.sections || [];
    return Array.isArray(sections) ? sections : [];
  } catch (err) {
    console.warn("loadSectionsFromModule error:", err);
    return [];
  }
}

/**
 * Main loader function with configurable strategy
 */
export async function loadSections(config: SectionLoaderConfig = {}): Promise<ReactElement[]> {
  const {
    strategy = 'module', // Default to module for hot-reload support
  } = config;

  switch (strategy) {
    case 'module':
      return loadSectionsFromModule();

    case 'json-public':
    case 'json-api':
      console.warn('JSON strategies are not supported in component-based architecture');
      return [];

    default:
      console.warn(`Unknown strategy: ${strategy}, falling back to module`);
      return loadSectionsFromModule();
  }
}

/**
 * Create a sections watcher for development mode
 * Returns a cleanup function to stop watching
 */
export function createSectionsWatcher(
  onUpdate: (sections: ReactElement[]) => void,
  config: SectionLoaderConfig = {}
): () => void {
  const {
    strategy = 'module',
  } = config;

  // For module strategy, Vite HMR handles updates automatically
  // We set up HMR accept for the sections module
  if (strategy === 'module' && import.meta.hot) {
    if (import.meta.env.VITE_SHOW_EXAMPLES === 'true') {
      import.meta.hot.accept('@/data/exampleSections', (newModule) => {
        if (newModule?.exampleSections) {
          onUpdate(newModule.exampleSections);
        }
      });
    } else {
      import.meta.hot.accept('@/data/sections', (newModule) => {
        if (newModule?.sections) {
          onUpdate(newModule.sections);
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
export default loadSections;