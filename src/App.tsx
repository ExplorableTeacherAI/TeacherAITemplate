import "./responsive.css";
import { TooltipProvider } from "@/components/atoms/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AppModeProvider, useAppMode } from "@/contexts/AppModeContext";
import { EditingProvider } from "@/contexts/EditingContext";
import { InlineInteractionHintProvider } from "@/contexts/InlineInteractionHintContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { HierarchyReporter } from "./components/HierarchyReporter";
const EditorTools = lazy(() => import("./components/EditorTools"));
const ModeEditorTools = () => {
  const { isEditor } = useAppMode();
  return isEditor ? <Suspense fallback={null}><EditorTools /></Suspense> : null;
};

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
            <ModeEditorTools />
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
