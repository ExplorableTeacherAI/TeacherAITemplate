import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const barrels = new Set(['atoms', 'templates', 'molecules', 'layouts', 'utility', 'organisms']);

function exportedNames(file) {
  const ast = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  const names = [];
  for (const node of ast.statements) {
    if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)) {
      names.push(...node.exportClause.elements.map(e => e.name.text));
    } else if (node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
      if (node.name && ts.isIdentifier(node.name)) names.push(node.name.text);
      if (ts.isVariableStatement(node)) {
        for (const d of node.declarationList.declarations) if (ts.isIdentifier(d.name)) names.push(d.name.text);
      }
    }
  }
  return names;
}

function exportMap(root, barrel) {
  const dir = path.join(root, 'src/components', barrel);
  const file = path.join(dir, 'index.ts');
  if (!fs.existsSync(file)) return new Map();
  const ast = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  // Only optimize pure export barrels. Preserve any future barrel side effects.
  if (ast.statements.some(n => !ts.isExportDeclaration(n))) return new Map();
  const result = new Map();
  for (const node of ast.statements) {
    if (!node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier)) continue;
    const source = node.moduleSpecifier.text;
    if (!source.startsWith('./')) continue;
    const target = `@/components/${barrel}/${source.slice(2)}`;
    if (node.exportClause && ts.isNamedExports(node.exportClause)) {
      for (const e of node.exportClause.elements) result.set(e.name.text, { target, name: (e.propertyName ?? e.name).text });
    } else if (!node.exportClause) {
      const base = path.resolve(dir, source);
      const child = ['.tsx', '.ts', '/index.ts'].map(ext => base + ext).find(p => fs.existsSync(p));
      if (child) for (const name of exportedNames(child)) result.set(name, { target, name });
    }
  }
  return result;
}

// Keep the public component API and authored lesson files unchanged. Resolve
// named imports to the same exports before Vite walks the dev module graph.
// Namespace imports and unknown exports retain their original semantics.
export function rewriteComponentImports(code, root) {
  const ast = ts.createSourceFile('lesson.tsx', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = [];
  for (const node of ast.statements) {
    if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) continue;
    const match = /^@\/components\/([^/]+)$/.exec(node.moduleSpecifier.text);
    const clause = node.importClause;
    if (!match || !barrels.has(match[1]) || !clause?.namedBindings || !ts.isNamedImports(clause.namedBindings)) continue;
    const map = exportMap(root, match[1]);
    const statements = [], remaining = [];
    for (const e of clause.namedBindings.elements) {
      const entry = map.get((e.propertyName ?? e.name).text);
      if (!entry) { remaining.push(e.getText(ast)); continue; }
      const type = clause.isTypeOnly || e.isTypeOnly ? 'type ' : '';
      const binding = entry.name === e.name.text ? entry.name : `${entry.name} as ${e.name.text}`;
      statements.push(`import ${type}{ ${binding} } from ${JSON.stringify(entry.target)};`);
    }
    if (!statements.length) continue;
    if (clause.name || remaining.length) {
      const bindings = [clause.name?.text, remaining.length ? `{ ${remaining.join(', ')} }` : ''].filter(Boolean).join(', ');
      statements.push(`import ${clause.isTypeOnly ? 'type ' : ''}${bindings} from ${JSON.stringify(node.moduleSpecifier.text)};`);
    }
    edits.push({ start: node.getStart(ast), end: node.end, text: statements.join('\n') });
  }
  for (const e of edits.reverse()) code = code.slice(0, e.start) + e.text + code.slice(e.end);
  return code;
}

export function componentImports() {
  let root;
  return {
    name: 'mathvibe-component-imports', enforce: 'pre',
    configResolved(config) { root = config.root; },
    transform(code, id) {
      if (id.includes('node_modules') || !/\.[jt]sx?(?:\?|$)/.test(id) || !code.includes('@/components/')) return;
      const next = rewriteComponentImports(code, root);
      if (next !== code) return { code: next, map: null };
    },
  };
}
