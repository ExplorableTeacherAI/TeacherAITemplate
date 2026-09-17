import React from 'react';
import { createRoot } from 'react-dom/client';
import ExplorableView from '../../src/pages/ExplorableView';
import { explorables } from '../../src/data/explorables';
import { Block } from '../../src/components/templates/Block';
import { TooltipProvider } from '../../src/components/atoms/ui/tooltip';
import { useVariableStore, useVar } from '../../src/stores/variableStore';
import { InlineFeedback } from '../../src/components/atoms/text/InlineFeedback';
import { AppModeProvider } from '../../src/contexts/AppModeContext';
import { EditingProvider } from '../../src/contexts/EditingContext';
useVariableStore.getState().initialize({ scale: 2, answer: '', fixture_explored: false });
function Activity() {
  const scale = useVar('scale', 2);
  const answer = useVar('answer', '');
  const explored = useVar('fixture_explored', false);
  const set = useVariableStore.getState().setVariables;
  return <><h2>Scale: {scale}</h2><p>Answer: {answer || 'empty'}</p>
    <button onClick={() => set({ scale: 3, fixture_explored: true })}>Explore scale 3</button>
    {explored && <><button onClick={() => set({ answer: '9' })}>Answer 9</button>
    <button onClick={() => set({ answer: '6' })}>Wrong answer 6</button>
    <button onClick={() => set({ answer: '' })}>Clear answer</button>
    <InlineFeedback varName="answer" correctValue="9" successMessage="Correct" /></>}
  </>;
}
explorables.fixture = { blocks: [<Block id="test-block" key="test-block"><Activity /></Block>] };
explorables.other = explorables.fixture;
createRoot(document.getElementById('root')!).render(<React.StrictMode><AppModeProvider defaultMode="preview"><EditingProvider><TooltipProvider><ExplorableView /></TooltipProvider></EditingProvider></AppModeProvider></React.StrictMode>);
