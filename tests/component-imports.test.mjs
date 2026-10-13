import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { rewriteComponentImports } from '../build/component-imports.mjs';
const root = fileURLToPath(new URL('..', import.meta.url));

test('keeps named aliases, type imports, and unknown exports', () => {
  const result = rewriteComponentImports(`import { Block as B, type BlockProps, FutureComponent } from '@/components/templates';`, root);
  assert.match(result, /import \{ Block as B \} from "@\/components\/templates\/Block"/);
  assert.match(result, /type BlockProps/);
  // BlockProps is not currently re-exported by this barrel, so must remain there.
  assert.match(result, /FutureComponent/);
  assert.match(rewriteComponentImports(`import type { StackLayoutProps } from '@/components/layouts';`, root), /import type \{ StackLayoutProps \} from "@\/components\/layouts\/StackLayout"/);
});
test('unused heavy visual modules are not required by simple named atoms', () => {
  const result = rewriteComponentImports(`import { EditableParagraph, Button } from '@/components/atoms';`, root);
  assert.match(result, /atoms\/text\/EditableParagraph/);
  assert.match(result, /atoms\/ui\/button/);
  assert.doesNotMatch(result, /from ['"]@\/components\/atoms['"]/);
});
test('namespace and side-effect imports remain intact; 3D remains available on demand', () => {
  const source = `import * as atoms from '@/components/atoms'; import '@/components/atoms';`;
  assert.equal(rewriteComponentImports(source, root), source);
  assert.match(rewriteComponentImports(`import { Cartesian3D } from '@/components/atoms';`, root), /atoms\/visual\/Cartesian3D/);
});
