import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import CarDetails from "./pages/CarDetails";
import Calculator from "./pages/Calculator";
import About from "./pages/About";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminCars from "./pages/admin/AdminCars";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminManagers from "./pages/admin/AdminManagers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import ManagerLeads from "./pages/manager/ManagerLeads";
import RateLead from "./pages/RateLead";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/car/:id" element={<CarDetails />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/cars" element={<AdminCars />} />
            <Route path="/admin/leads" element={<AdminLeads />} />
            <Route path="/admin/managers" element={<AdminManagers />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/manager/leads" element={<ManagerLeads />} />
            <Route path="/rate" element={<RateLead />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
