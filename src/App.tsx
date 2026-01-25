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

        // 1. Check profile logic
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Profile Error:", error);
          // রোল খুঁজে না পেলে হোম পেজে যাবেন না, প্রোফাইলে যান (লুপ বন্ধ হবে)
          navigate("/profile"); 
          return;
        }

        const role = profile?.role;

        // 2. Redirect based on role
        if (role === "admin") {
          navigate("/admin");
        } else if (role === "company" || role === "employer") {
          navigate("/dashboard/company");
        } else if (role === "caregiver" || role === "nurse") {
          navigate("/dashboard/caregiver");
        } else {
          // রোল সেট করা না থাকলে প্রোফাইলে পাঠান
          navigate("/profile");
        }

      } catch (error) {
        console.error("Critical Dashboard Error:", error);
        navigate("/profile"); // কোনো এরর হলে প্রোফাইল পেজে যাবে
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
      <p className="text-gray-600 font-medium">Checking your profile...</p>
    </div>
  );
};

export default Dashboard;