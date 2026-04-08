import { TooltipProvider } from "@/components/atoms/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AppModeProvider } from "@/contexts/AppModeContext";
import { EditingProvider } from "@/contexts/EditingContext";
import { InlineInteractionHintProvider } from "@/contexts/InlineInteractionHintContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { HierarchyReporter } from "./components/HierarchyReporter";
import { InlineFormulaEditorModal, ScrubbleNumberEditorModal, ClozeInputEditorModal, ClozeChoiceEditorModal, ToggleEditorModal, TooltipEditorModal, TriggerEditorModal, HyperlinkEditorModal, SpotColorEditorModal, LinkedHighlightEditorModal, FormulaBlockEditorModal } from "./components/utility";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    try { localStorage.setItem("theme", "light"); } catch { }
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <AppModeProvider>
        <EditingProvider>
          <InlineInteractionHintProvider>
            <HierarchyReporter />
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
            <TooltipProvider>
              <HashRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </HashRouter>
            </TooltipProvider>
          </InlineInteractionHintProvider>
        </EditingProvider>
      </AppModeProvider>
    </QueryClientProvider>
  );
};

export default App;
