import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import BottomNavigation from "@/components/BottomNavigation";
import JobFeed from "@/components/caregiver/JobFeed";
import MessagesTab from "@/components/caregiver/MessagesTab";
import ProfileTab from "@/components/caregiver/ProfileTab";
import Navbar from "@/components/Navbar";

const CaregiverDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const currentTab = searchParams.get("tab") || "feed";

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      // Verify user role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (roleData?.role !== "caregiver" && roleData?.role !== "nurse") {
        navigate("/dashboard/company");
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop: Full Navbar */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Mobile: Simple Header */}
      <header className="md:hidden sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-3">
          <h1 className="text-lg font-bold">HomeCare Job BD</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-lg md:max-w-4xl">
        {currentTab === "feed" && <JobFeed />}
        {currentTab === "messages" && <MessagesTab />}
        {currentTab === "profile" && <ProfileTab />}
      </main>

      {/* Mobile: Bottom Navigation */}
      <div className="md:hidden">
        <BottomNavigation role="caregiver" />
      </div>
    </div>
  );
};

export default CaregiverDashboard;
