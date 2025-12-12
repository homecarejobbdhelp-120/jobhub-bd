import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const redirectToRoleDashboard = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/login");
          return;
        }

        // Get user role
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();

        const userRole = roleData?.role;
        const userEmail = session.user.email?.toLowerCase();
        const isDefaultAdmin = userEmail === "homecarejobbd.help@gmail.com";
        
        // Redirect based on role (prioritize admin check)
        if (userRole === "admin" || isDefaultAdmin) {
          navigate("/admin", { replace: true });
        } else if (userRole === "caregiver" || userRole === "nurse") {
          navigate("/", { replace: true });
        } else if (userRole === "employer") {
          navigate("/dashboard/company?tab=jobs", { replace: true });
        } else {
          navigate("/general-dashboard", { replace: true });
        }
      } catch (error) {
        console.error("Error redirecting:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    redirectToRoleDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return null;
};

export default Dashboard;
