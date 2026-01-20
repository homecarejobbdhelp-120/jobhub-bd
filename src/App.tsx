import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Index"; 
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
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import Settings from "./pages/Settings";
import AdminLayout from "./components/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminVerifications from "./pages/admin/AdminVerifications";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import CompanyProfile from "./pages/CompanyProfile";
import Profile from "./pages/Profile";
import Training from "./pages/Training";
import { LanguageProvider } from "@/contexts/LanguageContext";

// ✅ নতুন ইম্পোর্ট
import CaregiverProfile from "./pages/CaregiverProfile";
import CaregiverApplications from "./pages/CaregiverApplications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/training" element={<Training />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/company-feed" element={<CompanyFeed />} />
            <Route path="/company-dashboard" element={<CompanyFeed />} />
            <Route path="/company/:id" element={<CompanyProfile />} />
            
            {/* ✅ পাবলিক প্রোফাইল (মানুষ যা দেখবে) */}
            <Route path="/profile/:id" element={<Profile />} />

            {/* ✅ প্রাইভেট প্রোফাইল (যেখানে এডিট করবেন) - এটা আপনার মিসিং ছিল */}
            <Route path="/profile" element={<CaregiverProfile />} />
            
            {/* ✅ অ্যাপ্লিকেশন পেজ - এটাও মিসিং ছিল */}
            <Route path="/applications" element={<CaregiverApplications />} />

            <Route path="/caregiver-dashboard" element={<CaregiverDashboard />} />
            
            <Route path="/dashboard/caregiver" element={
              <ProtectedRoute allowedRoles={['caregiver','nurse']}>
                <CaregiverDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/company" element={
              <ProtectedRoute allowedRoles={['employer']}>
                <CompanyDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/general-dashboard" element={<GeneralDashboard />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="verifications" element={<AdminVerifications />} />
              <Route path="jobs" element={<AdminJobs />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;