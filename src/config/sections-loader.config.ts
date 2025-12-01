import type { SectionLoaderConfig } from "@/lib/section-loader";

/**
 * Configuration for section loading strategies
 * 
 * This file centralizes the section loading configuration,
 * making it easy to switch between different strategies based on environment.
 */

/**
 * Strategy configurations for different environments
 */
export const sectionLoaderConfigs: Record<string, SectionLoaderConfig> = {
    // Development: Use TypeScript module for instant hot-reload
    development: {
        strategy: 'module',
        enableDevPolling: false, // Not needed for module strategy (Vite HMR handles it)
    },

    // Can also use JSON in development with polling for changes
    developmentJson: {
        strategy: 'json-public',
        url: '/sections.json',
        enableDevPolling: true,
        pollingInterval: 1000,
    },

    // Production: Use bundled TypeScript module (recommended)
    production: {
        strategy: 'module',
    },

    // Production API: Load from backend API
    productionApi: {
        strategy: 'json-api',
        url: '/api/sections',
    },

    // Staging: Load from static JSON
    staging: {
        strategy: 'json-public',
        url: '/sections.json',
    },
};

/**
 * Get configuration based on current environment
 */
export function getSectionLoaderConfig(): SectionLoaderConfig {
    const mode = import.meta.env.MODE || 'development';

    // You can customize this logic based on your needs
    if (mode === 'production') {
        // Use module strategy in production (sections bundled with app)
        return sectionLoaderConfigs.production;

        // Or use API strategy if you need dynamic content:
        // return sectionLoaderConfigs.productionApi;
    }

    // Default to module strategy in development
    return sectionLoaderConfigs.development;
}

/**
 * Default export for convenient importing
 */
export default getSectionLoaderConfig();
