// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Briefcase, Shield, Loader2 } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/login");
          return;
        }

        // Get role from profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profile?.role) {
          setUserRole(profile.role);
          
          // Auto redirect based on role
          if (profile.role === "admin") {
            navigate("/admin");
          } else if (profile.role === "company" || profile.role === "employer") {
            navigate("/dashboard/company");
          } else if (profile.role === "caregiver" || profile.role === "nurse") {
            navigate("/dashboard/caregiver");
          }
        }
        
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Your Dashboard</CardTitle>
            <CardDescription>Choose the dashboard based on your role</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => navigate("/dashboard/caregiver")}
              className="h-auto py-6 flex flex-col items-center gap-2"
              variant="outline"
            >
              <User className="h-8 w-8" />
              <span className="font-bold">Caregiver</span>
              <span className="text-sm text-gray-500">For nurses & caregivers</span>
            </Button>

            <Button 
              onClick={() => navigate("/dashboard/company")}
              className="h-auto py-6 flex flex-col items-center gap-2"
              variant="outline"
            >
              <Briefcase className="h-8 w-8" />
              <span className="font-bold">Company</span>
              <span className="text-sm text-gray-500">For employers</span>
            </Button>

            <Button 
              onClick={() => navigate("/admin")}
              className="h-auto py-6 flex flex-col items-center gap-2"
              variant="outline"
            >
              <Shield className="h-8 w-8" />
              <span className="font-bold">Admin</span>
              <span className="text-sm text-gray-500">For administrators</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;