import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current) {
      return;
    }

    const redirectToRoleDashboard = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/login");
          hasRedirected.current = true;
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
        
        // Redirect logic update
        if (userRole === "admin") {
          navigate("/admin", { replace: true });
        } else if (userRole === "caregiver" || userRole === "nurse") {
          navigate("/dashboard/caregiver", { replace: true }); 
        } else if (userRole === "employer" || userRole === "company") {
          navigate("/dashboard/company", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
        hasRedirected.current = true;
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
        <p className="text-muted-foreground">Loading Dashboard...</p>
      </div>
    );
  }

  return null;
};

export default Dashboard;