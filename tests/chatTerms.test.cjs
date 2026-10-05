const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

// The real contract module (it has no imports), run as CommonJS.
// Values come from another realm (vm), so compare them as plain data.
const plain = (value) => JSON.parse(JSON.stringify(value));

function load() {
  const source = fs.readFileSync(require('node:path').join(__dirname, '../src/lib/chatTerms.ts'), 'utf8');
  const exports = {};
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, { exports });
  return exports;
}

const DEFS = {
  circleDissection_numRings: { defaultValue: 4, type: 'number', label: 'Number of rings', min: 2, max: 12, step: 1, color: '#AC8BF9' },
  circleDissection_thickness: { defaultValue: 0.25, type: 'number', min: 0.05, max: 1, step: 0.05, unit: 'cm' },
  circleDissection_area: { defaultValue: 12.57, type: 'number', label: 'Area', unit: 'cm²' },
  circleDissection_mode: { defaultValue: 'rings', type: 'select', options: ['rings', 'slices'] },
  circleDissection_explored: { defaultValue: false, type: 'boolean' },
  circleDissection_widthAnswer: { defaultValue: 0, type: 'number', min: 0, max: 10, step: 1 },
  circleDissection_guess: { defaultValue: 0, type: 'number', min: 0, max: 10, step: 1, correctAnswer: '5' },
  circleDissection_badRange: { defaultValue: 1, type: 'number', min: 5, max: 1, step: 1 },
  ringUnwrap_deltaR: { defaultValue: 0.8, type: 'number', min: 0.1, max: 1.5, step: 0.1 },
  radius: { defaultValue: 2, type: 'number', min: 0, max: 5, step: 1 },
};

test('the variable prefix is the camelCase id plus an underscore', () => {
  const { explorableVariablePrefix } = load();
  assert.equal(explorableVariablePrefix('circle-dissection'), 'circleDissection_');
  assert.equal(explorableVariablePrefix('circle-area-growth'), 'circleAreaGrowth_');
  assert.equal(explorableVariablePrefix('rings'), 'rings_');
});

test('derives settable and read-only numbers from the explorable\'s own definitions', () => {
  const { deriveChatVariables } = load();
  const vars = plain(deriveChatVariables('circle-dissection', DEFS));
  assert.deepEqual(vars.map(v => v.id), ['numRings', 'thickness', 'area', 'badRange']);
  const rings = vars[0];
  assert.deepEqual(rings, { id: 'numRings', label: 'Number of rings', varName: 'circleDissection_numRings',
    color: '#AC8BF9', decimals: 0, settable: { min: 2, max: 12, step: 1 } });
  const thickness = vars[1];
  assert.equal(thickness.label, 'thickness'); // humanized from the name
  assert.equal(thickness.decimals, 2);         // from the step 0.05
  assert.equal(thickness.unit, 'cm');
  const area = vars[2];
  assert.equal(area.settable, undefined);      // no range → live readout only
  assert.equal(area.decimals, 2);
  assert.equal(vars[3].settable, undefined);   // max < min is not a range
});

test('leaves out other explorables, lesson variables, gates and answers', () => {
  const { deriveChatVariables } = load();
  const names = plain(deriveChatVariables('circle-dissection', DEFS)).map(v => v.varName);
  for (const hidden of ['ringUnwrap_deltaR', 'radius', 'circleDissection_mode', 'circleDissection_explored',
    'circleDissection_widthAnswer', 'circleDissection_guess']) {
    assert.ok(!names.includes(hidden), hidden);
  }
  assert.deepEqual(plain(deriveChatVariables('ring-unwrap', DEFS)).map(v => v.id), ['deltaR']);
  assert.deepEqual(plain(deriveChatVariables('nothing-here', DEFS)), []);
  assert.deepEqual(plain(deriveChatVariables('', DEFS)), []);
});

test('derived variables pass the same validation as declared ones', () => {
  const { deriveChatVariables, sanitizeChatVariables } = load();
  const derived = deriveChatVariables('circle-dissection', DEFS);
  assert.deepEqual(plain(sanitizeChatVariables(derived)), plain(derived));
});
