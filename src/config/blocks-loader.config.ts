import type { BlockLoaderConfig } from "@/lib/block-loader";

/**
 * Configuration for block loading strategies
 * 
 * This file centralizes the block loading configuration,
 * making it easy to switch between different strategies based on environment.
 */

/**
 * Strategy configurations for different environments
 */
export const blockLoaderConfigs: Record<string, BlockLoaderConfig> = {
    // Development: Use TypeScript module for instant hot-reload
    development: {
        strategy: 'module',
        enableDevPolling: false, // Not needed for module strategy (Vite HMR handles it)
    },

    // Can also use JSON in development with polling for changes
    developmentJson: {
        strategy: 'json-public',
        url: '/blocks.json',
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
        url: '/api/blocks',
    },

    // Staging: Load from static JSON
    staging: {
        strategy: 'json-public',
        url: '/blocks.json',
    },
};

/**
 * Get configuration based on current environment
 */
export function getBlockLoaderConfig(): BlockLoaderConfig {
    const mode = import.meta.env.MODE || 'development';

    // You can customize this logic based on your needs
    if (mode === 'production') {
        // Use module strategy in production (blocks bundled with app)
        return blockLoaderConfigs.production;

        // Or use API strategy if you need dynamic content:
        // return blockLoaderConfigs.productionApi;
    }

    // Default to module strategy in development
    return blockLoaderConfigs.development;
}

/**
 * Default export for convenient importing
 */
export default getBlockLoaderConfig();
