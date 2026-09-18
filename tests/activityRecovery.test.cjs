const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

// Execute the real hook with deterministic message/timer/store boundaries.
function runtime({ enabled = true, query = '?activityRecovery=1&activityChannel=c', sources = 'lesson-v1' } = {}) {
  const effects = [], listeners = new Set(), subscribers = new Set(), timers = new Map(), messages = [];
  let variables = { radius: 2, answer: '', activity_explored: false }, hydrated;
  let nextTimer = 0;
  const parent = { postMessage: (message) => messages.push(message) };
  const window = { parent, location: { search: query },
    addEventListener: (_, fn) => listeners.add(fn), removeEventListener: (_, fn) => listeners.delete(fn),
    setInterval: fn => { timers.set(++nextTimer, fn); return nextTimer; },
    setTimeout: fn => { timers.set(++nextTimer, fn); return nextTimer; } };
  const store = { getState: () => ({ variables, setVariables: vars => {
    variables = { ...variables, ...vars }; subscribers.forEach(fn => fn({ variables }));
  }}), subscribe: fn => { subscribers.add(fn); return () => subscribers.delete(fn); } };
  const exports = {};
  const source = fs.readFileSync(require('node:path').join(__dirname, '../src/lib/activityRecovery.ts'), 'utf8')
    .replace(/import\.meta\.glob\([^;]+;/, `({ 'lesson.tsx': ${JSON.stringify(sources)} });`);
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, {
    exports, window, document: { referrer: 'https://mathvibe.online/tutor/test' }, URL, URLSearchParams,
    clearInterval: id => timers.delete(id), clearTimeout: id => timers.delete(id),
    require: name => name === 'react' ? {
      useEffect: fn => effects.push(fn), useState: initial => { hydrated = initial; return [initial, value => hydrated = value]; }
    } : { useVariableStore: store }
  });
  exports.useActivityRecovery('lesson', enabled);
  const cleanups = effects.map(fn => fn());
  return { exports, messages, store, timers, get hydrated() { return hydrated; },
    restore: (value, origin = 'https://mathvibe.online', source = parent, channel = 'c') =>
      listeners.forEach(fn => fn({ source, origin, data: { type: 'mathvibe-activity-restore', channel, variables: value } })),
    close: () => cleanups.forEach(fn => fn?.()), parent };
}

test('restores parameters, answers and reveal gates before allowing rendering; hydration sends no state event', () => {
  const r = runtime();
  assert.equal(r.hydrated, false);
  r.restore({ radius: 3, answer: '9', activity_explored: true });
  assert.equal(r.hydrated, true);
  assert.equal(r.store.getState().variables.answer, '9');
  assert.equal(r.store.getState().variables.activity_explored, true);
  assert.equal(r.exports.isRestoredAnswer('answer', '9'), true);
  assert.equal(r.messages.filter(m => m.type.endsWith('-state')).length, 0);
  r.store.getState().setVariables({ answer: '' });
  assert.equal(r.exports.isRestoredAnswer('answer', '9'), false);
  r.store.getState().setVariables({ answer: '9' });
  assert.equal(r.messages.at(-1).variables.answer, '9');
  r.close();
  const before = r.messages.length;
  r.store.getState().setVariables({ radius: 4 });
  assert.equal(r.messages.length, before);
});

test('rejects messages from other windows, origins and obsolete channels', () => {
  const r = runtime();
  r.restore({ radius: 99 }, 'https://evil.invalid');
  r.restore({ radius: 99 }, 'https://mathvibe.online', {});
  r.restore({ radius: 99 }, 'https://mathvibe.online', r.parent, 'old');
  assert.equal(r.hydrated, false);
  assert.equal(r.store.getState().variables.radius, 2);
  r.close();
});

test('invalid or missing cache falls back; late restore cannot overwrite user work', () => {
  const r = runtime();
  [...r.timers.values()].at(-1)();
  r.store.getState().setVariables({ radius: 4 });
  r.restore({ radius: 9 });
  assert.equal(r.store.getState().variables.radius, 4);
  assert.equal(r.hydrated, true);
  r.close();
  const s = runtime();
  s.restore({ radius: 'invalid', answer: 'ok' });
  assert.equal(s.store.getState().variables.radius, 2);
  assert.equal(s.store.getState().variables.answer, 'ok');
  s.close();
});

test('editor and legacy frames do not activate persistence', () => {
  for (const options of [{ enabled: false }, { query: '' }]) {
    const r = runtime(options);
    assert.equal(r.hydrated, true);
    assert.equal(r.messages.length, 0);
    r.close();
  }
});

test('source changes invalidate the revision, malformed snapshots are rejected', () => {
  const a = runtime(), b = runtime({ sources: 'lesson-v2' });
  assert.notEqual(a.messages[0].revision, b.messages[0].revision);
  for (const value of [null, [], { answer: null }, JSON.parse('{"__proto__":{}}')]) {
    assert.equal(a.exports.validSnapshot(value), false);
  }
  a.close(); b.close();
});
