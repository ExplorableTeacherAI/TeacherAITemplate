import { TooltipProvider } from "@/components/atoms/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AppModeProvider } from "@/contexts/AppModeContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { HierarchyReporter } from "./components/HierarchyReporter";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    try { localStorage.setItem("theme", "light"); } catch { }
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <AppModeProvider>
        <HierarchyReporter />
        <TooltipProvider>
          <HashRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        </TooltipProvider>
      </AppModeProvider>
    </QueryClientProvider>
  );
};

export default App;
