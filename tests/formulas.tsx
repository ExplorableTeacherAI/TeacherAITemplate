// Deliberately no app responsive.css: FormulaBlock owns its responsive layout.
import React from 'react';
import { createRoot } from 'react-dom/client';
import '../src/index.css';
import { FormulaBlock } from '../src/components/molecules/formula/FormulaBlock';
import { AppModeProvider } from '../src/contexts/AppModeContext';
import { EditingProvider } from '../src/contexts/EditingContext';
import { InlineInteractionHintProvider } from '../src/contexts/InlineInteractionHintContext';
import { TooltipProvider } from '../src/components/atoms/ui/tooltip';
import { registerVariables, useVar } from '../src/stores/variableStore';

registerVariables({ formulaValue: { defaultValue: 3, type: 'number', min: 0, max: 20, step: 1 } });
function Formulas() {
 const value = useVar('formulaValue', 3);
 const cases = {
  short: 'a^2+b^2=c^2',
  sum: 'x_1+x_2+x_3+x_4+x_5+x_6+x_7+x_8=100',
  fraction: '\\frac{x_1+x_2+x_3+x_4+x_5+x_6+x_7+x_8+x_9+x_{10}}{\\sqrt{a^2+b^2}}',
  matrix: '\\begin{pmatrix}1 & 2 \\\\ 3 & 4\\end{pmatrix}',
  interactive: '\\scrub{formulaValue}+2=\\val{formulaValue}+2',
 };
 return <main className="mx-auto max-w-5xl p-3">
  {Object.entries(cases).map(([id, latex]) => <section data-case={id} key={id}><h2>{id}</h2><FormulaBlock latex={latex} showHint={false} /></section>)}
  <output data-testid="formula-value">{value}</output>
 </main>;
}
createRoot(document.getElementById('root')!).render(<AppModeProvider defaultMode="preview"><EditingProvider><InlineInteractionHintProvider><TooltipProvider><Formulas /></TooltipProvider></InlineInteractionHintProvider></EditingProvider></AppModeProvider>);
