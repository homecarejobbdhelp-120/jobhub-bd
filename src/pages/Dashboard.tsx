import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// আপনার দেওয়া সঠিক পাথ ব্যবহার করছি
import { supabase } from "@/lib/supabaseClient";

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

        // শুধু profiles টেবিল চেক করছি (user_roles বাদ দিয়েছি)
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profile?.role) {
          setUserRole(profile.role);
          // অটোমেটিক রিডাইরেক্ট আপাতত বন্ধ রেখেছি যাতে সাদা স্ক্রিন না হয়
        }
        
      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [navigate]);

  // লোডিং শেষ হলে সাদা স্ক্রিন না দেখিয়ে বাটন দেখাবে
  if (loading) {
    return <div className="p-10 text-center">Checking access...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Welcome to Dashboard</h2>
        
        <p className="mb-6 text-gray-600">
          Your detected role is: <span className="font-bold text-green-600 uppercase">{userRole || "Unknown"}</span>
        </p>

        <div className="flex flex-col gap-3">
          {/* ম্যানুয়াল বাটন - যাতে লুপ না হয় */}
          <button 
            onClick={() => navigate("/dashboard/caregiver")}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
          >
            Go to Caregiver Dashboard
          </button>

          <button 
            onClick={() => navigate("/dashboard/company")}
            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded transition"
          >
            Go to Company/Employer Dashboard
          </button>

          {userRole === 'admin' && (
            <button 
              onClick={() => navigate("/admin")}
              className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-900 text-white rounded transition"
            >
              Go to Admin Panel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;