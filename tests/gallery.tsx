import "../src/responsive.css";
import React from 'react';
import { createRoot } from 'react-dom/client';
import '../src/index.css';
import { AppModeProvider } from '../src/contexts/AppModeContext';
import { EditingProvider } from '../src/contexts/EditingContext';
import { TooltipProvider } from '../src/components/atoms/ui/tooltip';
import { InlineInteractionHintProvider } from '../src/contexts/InlineInteractionHintContext';
import { exampleVariableDefinitions } from '../src/data/exampleVariables';
import { registerVariables } from '../src/stores/variableStore';
registerVariables(exampleVariableDefinitions);
const modules = import.meta.glob('../src/data/sections/*Demo.tsx');
function Gallery() {
 const [blocks,setBlocks] = React.useState<React.ReactNode[]>([]);
 const [error,setError] = React.useState('');
 const name = new URLSearchParams(location.search).get('demo') || 'matrixDemo';
 React.useEffect(() => {
  const load=modules[`../src/data/sections/${name}.tsx`];
  if (!load) {setError('Unknown demo');return;}
  load().then(m=>setBlocks(Object.values(m as Record<string, unknown>).find(Array.isArray) || [])).catch(e=>setError(String(e)));
 },[name]);
 return <main className="mx-auto max-w-5xl space-y-4 p-3" data-ready={blocks.length>0}><h1>{name}</h1>{error && <p role="alert">{error}</p>}{blocks}</main>;
}
createRoot(document.getElementById('root')!).render(<AppModeProvider><EditingProvider><InlineInteractionHintProvider><TooltipProvider><Gallery /></TooltipProvider></InlineInteractionHintProvider></EditingProvider></AppModeProvider>);
