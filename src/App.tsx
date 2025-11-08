import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import PostJob from "./pages/PostJob";
import Feed from "./pages/Feed";
import CompanyFeed from "./pages/CompanyFeed";
import CaregiverDashboard from "./pages/CaregiverDashboard";
import GeneralDashboard from "./pages/GeneralDashboard";
import NotFound from "./pages/NotFound";
import CompanyDashboard from "./pages/CompanyDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/company-feed" element={<CompanyFeed />} />
          <Route path="/company-dashboard" element={<CompanyFeed />} />
          <Route path="/caregiver-dashboard" element={<CaregiverDashboard />} />
          <Route path="/dashboard/caregiver" element={<ProtectedRoute allowedRoles={['caregiver','nurse']}>\
            <CaregiverDashboard />\
          </ProtectedRoute>} />
          <Route path="/dashboard/company" element={<ProtectedRoute allowedRoles={['employer']}>\
            <CompanyDashboard />\
          </ProtectedRoute>} />
          <Route path="/general-dashboard" element={<GeneralDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
