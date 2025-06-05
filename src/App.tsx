import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import RiskProfileSection from "@/components/RiskProfileSection";
import RecommendationsSection from "@/components/RecommendationsSection";
import CoachingSection from "@/components/CoachingSection";
import AlertsPage from "@/pages/Alerts";
import CalendarPage from "@/pages/Calendar";
import AppointmentsPage from "@/pages/Appointments";
import VoiceModePage from "@/pages/VoiceMode";
import MedGemmaChatPage from "@/pages/MedGemmaChat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Index />} />
          <Route path="/voice-mode" element={<VoiceModePage />} />
          <Route path="/medgemma-chat" element={<MedGemmaChatPage />} />
          <Route path="/risk-profile" element={<RiskProfileSection />} />
          <Route path="/recommendations" element={<RecommendationsSection />} />
          <Route path="/coaching" element={<CoachingSection />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
