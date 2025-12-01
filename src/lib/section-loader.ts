import type { Section } from "@/components/SectionBlock";

type SectionDSL = {
  id?: string;
  type?: "html" | "mermaid" | "excalidraw" | "desmos" | "geogebra";
  title?: string;
  description?: string;
  content?: string;
  mermaid?: string;
  elements?: any[];
  files?: Record<string, any>;
};

type SectionsFile =
  | { meta?: Record<string, any>; sections: SectionDSL[] }
  | SectionDSL[];

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

function ensureId(): string {
  return Math.random().toString(36).slice(2);
}

function normalizeSection(dsl: SectionDSL | Section): Section {
  // If already normalized, return as-is
  if ('id' in dsl && typeof dsl.id === 'string' && dsl.id.trim()) {
    return dsl as Section;
  }

  return {
    id: dsl.id && typeof dsl.id === "string" && dsl.id.trim() ? dsl.id : ensureId(),
    type: dsl.type,
    title: typeof dsl.title === "string" ? dsl.title : "",
    description: typeof dsl.description === "string" ? dsl.description : undefined,
    content: typeof dsl.content === "string" ? dsl.content : undefined,
    mermaid: typeof dsl.mermaid === "string" ? dsl.mermaid : undefined,
    elements: Array.isArray(dsl.elements) ? dsl.elements : undefined,
    files: dsl.files && typeof dsl.files === "object" ? dsl.files : undefined,
  };
}

/**
 * Load sections from TypeScript module (supports hot-reload)
 */
async function loadSectionsFromModule(): Promise<Section[]> {
  try {
    // Dynamic import to allow Vite HMR to work properly
    const module = await import("@/data/sections");
    const sections = module.sections || [];
    return Array.isArray(sections) ? sections.map(normalizeSection) : [];
  } catch (err) {
    console.warn("loadSectionsFromModule error:", err);
    return [];
  }
}

/**
 * Load sections from JSON file or API
 */
async function loadSectionsFromJSON(url = "/sections.json"): Promise<Section[]> {
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: 'no-cache' // Prevent caching to allow updates
    });
    if (!res.ok) throw new Error(`Failed to load sections: ${res.status}`);
    const json = (await res.json()) as SectionsFile;
    const list: SectionDSL[] = Array.isArray(json)
      ? json
      : Array.isArray(json.sections)
        ? json.sections
        : [];
    return list.map(normalizeSection);
  } catch (err) {
    console.warn("loadSectionsFromJSON error:", err);
    return [];
  }
}

/**
 * Main loader function with configurable strategy
 */
export async function loadSections(config: SectionLoaderConfig = {}): Promise<Section[]> {
  const {
    strategy = 'module', // Default to module for hot-reload support
    url = '/sections.json',
  } = config;

  switch (strategy) {
    case 'module':
      return loadSectionsFromModule();

    case 'json-public':
    case 'json-api':
      return loadSectionsFromJSON(url);

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
  onUpdate: (sections: Section[]) => void,
  config: SectionLoaderConfig = {}
): () => void {
  const {
    strategy = 'module',
    url = '/sections.json',
    enableDevPolling = import.meta.env.DEV,
    pollingInterval = 1000,
  } = config;

  // For module strategy, Vite HMR handles updates automatically
  // We set up HMR accept for the sections module
  if (strategy === 'module' && import.meta.hot) {
    import.meta.hot.accept('@/data/sections', (newModule) => {
      if (newModule?.sections) {
        const sections = newModule.sections.map(normalizeSection);
        onUpdate(sections);
      }
    });

    return () => {
      // Vite handles cleanup
    };
  }

  // For JSON strategies in dev mode, we can poll for changes
  if (enableDevPolling && import.meta.env.DEV) {
    let lastHash: string | null = null;

    const checkForUpdates = async () => {
      try {
        const sections = await loadSectionsFromJSON(url);
        const currentHash = JSON.stringify(sections);

        if (lastHash && lastHash !== currentHash) {
          onUpdate(sections);
        }
        lastHash = currentHash;
      } catch (err) {
        console.warn('Error checking for section updates:', err);
      }
    };

    const intervalId = setInterval(checkForUpdates, pollingInterval);

    // Initial check
    checkForUpdates();

    return () => {
      clearInterval(intervalId);
    };
  }

  return () => {
    // No cleanup needed
  };
}

// Backward compatibility - default export uses module strategy
export default loadSections;