import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/login");
          return;
        }

        // Fetch user profile to get role
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          // If error, verify if profile exists, otherwise go to profile creation
          navigate("/profile");
          return;
        }

        const role = profile?.role;

        // Strict Redirect Logic
        if (role === "admin") {
          navigate("/admin");
        } else if (role === "company" || role === "employer") {
          navigate("/dashboard/company");
        } else if (role === "caregiver" || role === "nurse") {
          navigate("/dashboard/caregiver");
        } else {
          // If no role found, go to index or profile
          navigate("/profile");
        }
      } catch (error) {
        console.error("Dashboard Error:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center animate-pulse">
        <p className="text-lg font-medium text-gray-600">Loading your Dashboard...</p>
      </div>
    </div>
  );
};

export default Dashboard;