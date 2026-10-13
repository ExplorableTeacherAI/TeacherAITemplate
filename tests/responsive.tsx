import "../src/responsive.css";
// Browser-only fixture: real components, no API or generated lesson changes.
import React from 'react';
import { createRoot } from 'react-dom/client';
import '../src/index.css';
import { AppModeProvider } from '../src/contexts/AppModeContext';
import { EditingProvider } from '../src/contexts/EditingContext';
import { TooltipProvider } from '../src/components/atoms/ui/tooltip';
import { InlineInteractionHintProvider } from '../src/contexts/InlineInteractionHintContext';
import { GridLayout } from '../src/components/layouts/GridLayout';
import { SplitLayout } from '../src/components/layouts/SplitLayout';
import { InlineScrubbleNumber } from '../src/components/atoms/text/InlineScrubbleNumber';
import { FormulaBlock } from '../src/components/molecules/formula/FormulaBlock';
import { registerVariables, useVar } from '../src/stores/variableStore';
import { cartesian2dDemo } from '../src/data/sections/cartesian2dDemo';
registerVariables({ responsiveValue: { defaultValue: 5, type: 'number', min: 0, max: 20, step: 1 } });
function Fixture() {
 React.useEffect(() => { window.parent.postMessage({ type: 'content-ready' }, '*'); }, []);
 const value = useVar('responsiveValue', 5);
 return <main className="mx-auto max-w-5xl p-3">
  <h1>Responsive component fixture</h1>
  <label>Draft <input aria-label="Template draft" className="border" /></label>
  <p>Drag this value: <InlineScrubbleNumber varName="responsiveValue" min={0} max={20} step={1} /> <output data-testid="value">{String(value)}</output></p>
  <GridLayout columns={4} tabletColumns={2}>{[1,2,3,4].map(n=><div className="border p-2" key={n}>Grid {n}</div>)}</GridLayout>
  <SplitLayout><p>A responsive paragraph</p><FormulaBlock latex={'x_1 + x_2 + x_3 + x_4 + x_5 + x_6 + x_7 + x_8 = 100'} /></SplitLayout>
  {cartesian2dDemo.slice(0,6)}
 </main>;
}
createRoot(document.getElementById('root')!).render(<AppModeProvider defaultMode="preview"><EditingProvider><InlineInteractionHintProvider><TooltipProvider><Fixture /></TooltipProvider></InlineInteractionHintProvider></EditingProvider></AppModeProvider>);
