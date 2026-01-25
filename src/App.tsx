// App.tsx - সম্পূর্ণ ফাইল
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar"; 
import { useEffect } from "react";

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

// Dashboard Imports
import Dashboard from "./pages/Dashboard";
import CaregiverDashboard from "./pages/CaregiverDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";

// Admin Imports
import AdminLayout from "./components/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminVerifications from "./pages/admin/AdminVerifications";

const queryClient = new QueryClient();

// Navbar প্রদর্শন কন্ট্রোল করার কম্পোনেন্ট
const NavbarWrapper = () => {
  const location = useLocation();
  
  // এই পাথগুলোতে ন্যাভবার দেখাবে না
  const hideNavbarPaths = [
    '/login',
    '/signup',
    '/dashboard',
    '/dashboard/caregiver',
    '/dashboard/company',
    '/admin',
    '/admin/users',
    '/admin/jobs',
    '/admin/reports',
    '/admin/settings',
    '/admin/verifications'
  ];
  
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

  return shouldShowNavbar ? <Navbar /> : null;
};

// Main content এর padding ঠিক করার জন্য
const MainContent = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  // যে পেজগুলোতে ন্যাভবার নেই তাদের জন্য padding কম
  const hideNavbarPaths = [
    '/login',
    '/signup',
    '/dashboard',
    '/dashboard/caregiver',
    '/dashboard/company',
    '/admin'
  ];
  
  const hasNavbar = !hideNavbarPaths.some(path => location.pathname.startsWith(path));

  return (
    <main className={`flex-grow ${hasNavbar ? 'pt-0' : ''}`}>
      {children}
    </main>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          {/* Conditional Navbar - ড্যাশবোর্ড এবং অ্যাডমিনে দেখাবে না */}
          <NavbarWrapper />
          
          {/* Main Content */}
          <MainContent>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/training" element={<Training />} />
              <Route path="/post-job" element={<PostJob />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<Profile />} />

              {/* Dashboard Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/caregiver" element={<CaregiverDashboard />} />
              <Route path="/dashboard/company" element={<CompanyDashboard />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout><AdminOverview /></AdminLayout>} />
              <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
              <Route path="/admin/jobs" element={<AdminLayout><AdminJobs /></AdminLayout>} />
              <Route path="/admin/reports" element={<AdminLayout><AdminReports /></AdminLayout>} />
              <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
              <Route path="/admin/verifications" element={<AdminLayout><AdminVerifications /></AdminLayout>} />

              {/* Support Pages */}
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/help" element={<Help />} />
            </Routes>
          </MainContent>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;