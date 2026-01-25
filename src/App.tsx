import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Navbar আমি এখান থেকে সরিয়েছি যাতে ডাবল না দেখায়
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import Training from "./pages/Training";
import PostJob from "./pages/PostJob";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Help from "./pages/Help";

// ড্যাশবোর্ড ইম্পোর্ট
import Dashboard from "./pages/Dashboard";
import CaregiverDashboard from "./pages/CaregiverDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";

// অ্যাডমিন ইম্পোর্ট (আপনার অ্যাডমিন প্যানেল ঠিক করার জন্য)
import AdminLayout from "./components/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminJobs from "./pages/admin/AdminJobs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">
            <Routes>
              {/* পাবলিক পেজ */}
              <Route path="/" element={<Index />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/training" element={<Training />} />
              <Route path="/post-job" element={<PostJob />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<Profile />} />

              {/* ড্যাশবোর্ড রাউট */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/caregiver" element={<CaregiverDashboard />} />
              <Route path="/dashboard/company" element={<CompanyDashboard />} />

              {/* অ্যাডমিন রাউট */}
              <Route path="/admin" element={<AdminLayout><AdminOverview /></AdminLayout>} />
              <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
              <Route path="/admin/jobs" element={<AdminLayout><AdminJobs /></AdminLayout>} />

              {/* সাপোর্ট পেজ */}
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/help" element={<Help />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;