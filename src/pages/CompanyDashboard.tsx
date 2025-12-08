import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import BottomNavigation from "@/components/BottomNavigation";
import MyJobsTab from "@/components/company/MyJobsTab";
import PostJobTab from "@/components/company/PostJobTab";
import CompanyProfileTab from "@/components/company/CompanyProfileTab";
import ApplicantsTab from "@/components/company/ApplicantsTab";
import CompanyFeedTab from "@/components/company/CompanyFeedTab";
import Navbar from "@/components/Navbar";
import CompactHeader from "@/components/CompactHeader";

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const currentTab = searchParams.get("tab") || "jobs";

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

      if (roleData?.role !== "employer") {
        navigate("/dashboard/caregiver");
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-14">
      {/* Desktop: Full Navbar */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Mobile: Compact Header with Hamburger */}
      <div className="md:hidden">
        <CompactHeader />
      </div>

      {/* Main Content */}
      <main className="px-3 py-3 max-w-lg mx-auto md:max-w-4xl md:px-4 md:py-6">
        {currentTab === "jobs" && <MyJobsTab />}
        {currentTab === "post" && <PostJobTab />}
        {currentTab === "profile" && <CompanyProfileTab />}
        {currentTab === "applicants" && <ApplicantsTab />}
        {currentTab === "feed" && <CompanyFeedTab />}
      </main>

      {/* Mobile: Bottom Navigation */}
      <div className="md:hidden">
        <BottomNavigation role="employer" />
      </div>
    </div>
  );
};

export default CompanyDashboard;
