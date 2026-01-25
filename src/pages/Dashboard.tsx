import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

        // শুধু profiles টেবিল চেক করা হচ্ছে
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Profile Error:", error);
          // প্রোফাইল না থাকলে প্রোফাইল পেজে পাঠাবে, লগিন পেজে নয়
          navigate("/profile");
          return;
        }

        const role = profile?.role;

        // সঠিক ড্যাশবোর্ডে রিডাইরেক্ট
        if (role === "admin") {
          navigate("/admin");
        } else if (role === "company" || role === "employer") {
          navigate("/dashboard/company");
        } else if (role === "caregiver" || role === "nurse") {
          navigate("/dashboard/caregiver");
        } else {
          navigate("/profile");
        }

      } catch (error) {
        console.error("Dashboard Critical Error:", error);
        // এখানে আর লগিন পেজে পাঠাবো না, যাতে লুপ না হয়
        navigate("/"); 
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
      <p className="text-gray-600 font-medium">Connecting to your Dashboard...</p>
    </div>
  );
};

export default Dashboard;