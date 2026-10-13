import { InlineFormulaEditorModal, ScrubbleNumberEditorModal, ClozeInputEditorModal, ClozeChoiceEditorModal, ToggleEditorModal, TooltipEditorModal, TriggerEditorModal, HyperlinkEditorModal, SpotColorEditorModal, LinkedHighlightEditorModal, FormulaBlockEditorModal } from "./utility";

export default function EditorTools() {
  return <>
            <ScrubbleNumberEditorModal />
            <ClozeInputEditorModal />
            <ClozeChoiceEditorModal />
            <ToggleEditorModal />
            <TooltipEditorModal />
            <TriggerEditorModal />
            <HyperlinkEditorModal />
            <InlineFormulaEditorModal />
            <SpotColorEditorModal />
            <LinkedHighlightEditorModal />
            <FormulaBlockEditorModal />
  </>;
}
