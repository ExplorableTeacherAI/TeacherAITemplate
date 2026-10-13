import { defineConfig, mergeConfig } from 'vite';
import original from './vite.config';
import { componentImports } from './build/component-imports.mjs';
import { rrwebWebkitGuard } from './build/rrweb-webkit.mjs';

// Wrap, rather than overwrite, each lesson's original configuration and aliases.
export default defineConfig(async env => {
  const config = await (typeof original === 'function' ? original(env) : original);
  const merged = mergeConfig(config, { plugins: [componentImports(), rrwebWebkitGuard()] });
  // rrweb must pass through the WebKit guard, not the dependency pre-bundler.
  if (merged.optimizeDeps?.include) merged.optimizeDeps.include = merged.optimizeDeps.include.filter(name => name !== 'rrweb');
  return merged;
});
