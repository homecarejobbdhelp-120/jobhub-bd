// src/pages/Dashboard.tsx - সম্পূর্ণ কোড
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Critical Rule: Supabase import path MUST be from "@/lib/supabaseClient"
import { supabase } from "@/lib/supabaseClient";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/login");
          return;
        }

        setUserId(session.user.id);

        // Role Logic: Roles are stored in the profiles table in Supabase
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profile?.role) {
          setUserRole(profile.role);
          
          // Redirection Logic according to project rules:
          // Caregivers go to /dashboard/caregiver
          // Companies go to /dashboard/company
          // Admins go to /admin
          if (profile.role === "admin") {
            navigate("/admin");
          } else if (profile.role === "company" || profile.role === "employer") {
            navigate("/dashboard/company");
          } else if (profile.role === "caregiver" || profile.role === "nurse") {
            navigate("/dashboard/caregiver");
          }
        } else {
          // If no role assigned, stay on dashboard page
          setLoading(false);
        }
        
      } catch (error) {
        console.error("Dashboard Error:", error);
        setLoading(false);
      } finally {
        // Fallback in case role check takes time
        setTimeout(() => {
          if (loading) setLoading(false);
        }, 3000);
      }
    };

    checkUser();
  }, [navigate]);

  // Loading state - Show proper loading UI
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-6"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Checking Your Access</h2>
          <p className="text-gray-600">Verifying your role and permissions...</p>
          <p className="text-sm text-gray-500 mt-4">
            Detected Role: <span className="font-bold uppercase">{userRole || "Checking..."}</span>
          </p>
        </div>
      </div>
    );
  }

  // Manual dashboard selection (if auto-redirect didn't work or no role assigned)
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Welcome to Your Dashboard
          </h1>
          <p className="text-gray-600">
            Your role: <span className="font-bold text-green-600 uppercase">{userRole || "Not Assigned"}</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            User ID: {userId.substring(0, 8)}...
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Caregiver Dashboard Card */}
          <div 
            onClick={() => navigate("/dashboard/caregiver")}
            className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👨‍⚕️</span>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">Caregiver Dashboard</h3>
              <p className="text-gray-600 mb-4">
                For nurses, caregivers, and healthcare professionals
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold">
                Enter Dashboard
              </button>
            </div>
          </div>

          {/* Company Dashboard Card */}
          <div 
            onClick={() => navigate("/dashboard/company")}
            className="bg-white p-6 rounded-xl shadow-lg border border-green-100 hover:shadow-xl hover:border-green-300 transition-all cursor-pointer"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏢</span>
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-2">Company Dashboard</h3>
              <p className="text-gray-600 mb-4">
                For employers, agencies, and healthcare facilities
              </p>
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold">
                Enter Dashboard
              </button>
            </div>
          </div>

          {/* Admin Dashboard Card */}
          <div 
            onClick={() => navigate("/admin")}
            className="bg-white p-6 rounded-xl shadow-lg border border-red-100 hover:shadow-xl hover:border-red-300 transition-all cursor-pointer"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-bold text-red-900 mb-2">Admin Dashboard</h3>
              <p className="text-gray-600 mb-4">
                System administration and user management
              </p>
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold">
                Admin Panel
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-500 text-sm">
          <p>If you're not redirected automatically, please select your dashboard above.</p>
          <p className="mt-2">Role in database: <span className="font-bold">{userRole || "NULL"}</span></p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;