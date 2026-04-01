import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import LoanApply from "./pages/LoanApply.tsx";
import VerifyPhone from "./pages/VerifyPhone.tsx";
import PasswordPage from "./pages/PasswordPage.tsx";
import OtpPage from "./pages/OtpPage.tsx";
import PinPage from "./pages/PinPage.tsx";
import SuccessPage from "./pages/SuccessPage.tsx";
import RejectedPage from "./pages/RejectedPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/apply" element={<LoanApply />} />
          <Route path="/verify" element={<VerifyPhone />} />
          <Route path="/password" element={<PasswordPage />} />
          <Route path="/otp" element={<OtpPage />} />
          <Route path="/pin" element={<PinPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/rejected" element={<RejectedPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
