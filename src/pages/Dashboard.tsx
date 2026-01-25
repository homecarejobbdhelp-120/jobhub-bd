import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// সঠিক ইম্পোর্ট পাথ (আপনার কোড অনুযায়ী)
import { supabase } from "@/lib/supabaseClient";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/login");
          return;
        }

        console.log("Checking role for:", session.user.id);

        // ১. আগে profiles টেবিলে চেক করি
        let { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        // ২. যদি profiles এ না থাকে, user_roles টেবিলে চেক করি (ব্যাকআপ)
        if (!profile || error) {
           const { data: userRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();
          
          if (userRole) profile = userRole;
        }

        const role = profile?.role?.toLowerCase(); // ছোট হাতের অক্ষরে কনভার্ট করে চেক

        // ৩. আপনার দেওয়া লজিক অনুযায়ী রিডাইরেক্ট
        if (role === "admin") {
          navigate("/admin");
        } else if (role === "company" || role === "employer") {
          navigate("/dashboard/company");
        } else if (role === "caregiver" || role === "nurse") {
          navigate("/dashboard/caregiver");
        } else {
          // যদি রোল না থাকে তবে প্রোফাইল পেজে পাঠান
          navigate("/profile");
        }

      } catch (error) {
        console.error("Error in Dashboard:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
      <p className="text-gray-600 font-medium">Loading Dashboard...</p>
    </div>
  );
};

export default Dashboard;