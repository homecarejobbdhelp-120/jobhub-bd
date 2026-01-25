import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import MobileCompanyBottomNav from "@/components/company/MobileCompanyBottomNav";
import { Bell } from "lucide-react";

// আপনার তৈরি করা কম্পোনেন্টগুলো ইমপোর্ট
import CompanyMenu from "@/components/company/CompanyMenu";
import CompanyFeedTab from "@/components/company/CompanyFeedTab"; 
import MyJobsTab from "@/components/company/MyJobsTab";
import PostJobTab from "@/components/company/PostJobTab";
import ApplicantsTab from "@/components/company/ApplicantsTab";
import CompanyProfileTab from "@/components/company/CompanyProfileTab";
import MessagesTab from "@/components/caregiver/MessagesTab"; // মেসেজ ট্যাব (কেয়ারগিভার ফোল্ডার থেকে)

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  
  // ডিফল্ট ট্যাব 'home' (আগের কোডে 'jobs' ছিল, এখন আমরা 'home' দিচ্ছি)
  const currentTab = searchParams.get("tab") || "home";

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      // রোল চেক: যদি কোম্পানি না হয়, তবে কেয়ারগিভার ড্যাশবোর্ডে পাঠাবে
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (roleData?.role !== "employer" && roleData?.role !== "company") {
        navigate("/login"); 
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  // ট্যাব পরিবর্তনের ফাংশন
  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
    window.scrollTo(0, 0); 
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-10 font-sans">
      
      {/* --- Desktop Navbar --- */}
      <div className="hidden md:block sticky top-0 z-50">
        <Navbar />
      </div>

      {/* --- Mobile Top Bar (Header) --- */}
      {/* শুধুমাত্র মেনু ট্যাব ছাড়া বাকি সব ট্যাবে দেখাবে */}
      {currentTab !== "menu" && (
        <div className="md:hidden bg-white px-4 py-3 shadow-sm sticky top-0 z-40 flex justify-between items-center">
           <div className="flex items-center gap-2">
             <h1 className="text-xl font-bold text-blue-900">
               HomeCare<span className="text-green-500">JobBD</span>
             </h1>
             <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
               Employer
             </span>
           </div>
           
           <div className="relative cursor-pointer hover:bg-gray-100 p-2 rounded-full transition">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
           </div>
        </div>
      )}

      {/* --- Main Content Area --- */}
      <main className="max-w-5xl mx-auto px-0 md:px-4 md:py-6">
        <div className="md:bg-white md:rounded-xl md:shadow-sm md:min-h-[600px] md:p-6 p-0">
            
            {/* 1. Home Feed */}
            {currentTab === "home" && <CompanyFeedTab />}

            {/* 2. My Jobs List */}
            {currentTab === "jobs" && <MyJobsTab />}

            {/* 3. Post a Job */}
            {currentTab === "post" && <PostJobTab />}

            {/* 4. Applicants / CVs */}
            {currentTab === "applicants" && <ApplicantsTab />}

            {/* 5. Company Menu (Settings, etc.) */}
            {currentTab === "menu" && <CompanyMenu />}

            {/* 6. Profile */}
            {currentTab === "profile" && <CompanyProfileTab />}

            {/* 7. Messages */}
            {currentTab === "messages" && (
                <div className="p-3">
                    <MessagesTab 
                        initialPartnerId={searchParams.get("partnerId") || undefined}
                        initialPartnerName={searchParams.get("partnerName") || undefined}
                        initialPartnerCompany={searchParams.get("partnerCompany") || undefined}
                    />
                </div>
            )}

        </div>
      </main>

      {/* --- Mobile Bottom Navigation (Special Company Version) --- */}
      <MobileCompanyBottomNav activeTab={currentTab} onTabChange={handleTabChange} />
      
    </div>
  );
};

export default CompanyDashboard;