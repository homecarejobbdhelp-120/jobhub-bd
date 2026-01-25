// Dashboard.tsx - সম্পূর্ণ ফাইল
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Briefcase, Shield, LogOut, Loader2 } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session Error:", sessionError);
          navigate("/login");
          return;
        }

        if (!session) {
          navigate("/login");
          return;
        }

        setUserEmail(session.user.email || "");

        // ✅ profiles টেবিল থেকে role আনছি
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error("Profile Error:", profileError);
          // যদি profiles টেবিলে না থাকে, তাহলে user_metadata চেক করি
          const roleFromMeta = session.user.user_metadata?.role;
          if (roleFromMeta) {
            setUserRole(roleFromMeta);
          }
        } else if (profile?.role) {
          setUserRole(profile.role);
        }
        
      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [navigate]);

  // রোল পেয়ে গেলে অটোমেটিক রিডাইরেক্ট
  useEffect(() => {
    if (!loading && userRole) {
      // ২ সেকেন্ড পরে রিডাইরেক্ট (ইউজারকে দেখার জন্য)
      const timer = setTimeout(() => {
        if (userRole === 'admin') {
          navigate("/admin");
        } else if (userRole === 'company' || userRole === 'employer') {
          navigate("/dashboard/company");
        } else if (userRole === 'caregiver' || userRole === 'nurse') {
          navigate("/dashboard/caregiver");
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [loading, userRole, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // লোডিং স্টেট
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto" />
          <p className="mt-4 text-gray-600">Checking your access...</p>
        </div>
      </div>
    );
  }

  // যদি রোল পাওয়া যায় এবং রিডাইরেক্ট হতে সময় লাগে
  if (userRole && (userRole === 'admin' || userRole === 'company' || userRole === 'caregiver' || userRole === 'nurse' || userRole === 'employer')) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Redirecting to your dashboard...</h1>
          <p className="text-gray-600 mb-2">
            Detected role: <span className="font-bold text-green-600 uppercase">{userRole}</span>
          </p>
          <p className="text-gray-500 text-sm">You will be redirected automatically</p>
        </div>
      </div>
    );
  }

  // রোল না পাওয়া গেলে বা অন্য কোনো সমস্যা হলে ম্যানুয়াল সিলেকশন দেখাবে
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Welcome to Your Dashboard
          </h1>
          <p className="text-gray-600">
            {userEmail && `Logged in as: ${userEmail}`}
          </p>
          <p className="text-gray-500 mt-2">
            Role detected: <span className="font-bold uppercase">{userRole || "Not Assigned"}</span>
          </p>
        </div>

        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Your current role and available dashboards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${
                  userRole === 'admin' ? 'bg-red-100' : 
                  userRole === 'company' ? 'bg-purple-100' : 
                  'bg-blue-100'
                }`}>
                  {userRole === 'admin' ? (
                    <Shield className="h-8 w-8 text-red-600" />
                  ) : userRole === 'company' ? (
                    <Briefcase className="h-8 w-8 text-purple-600" />
                  ) : (
                    <User className="h-8 w-8 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Your Role</p>
                  <p className="text-2xl font-bold text-gray-800 uppercase">
                    {userRole || 'Not Assigned'}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <Button 
                  onClick={() => navigate("/dashboard/caregiver")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <User className="mr-2 h-4 w-4" />
                  Caregiver Dashboard
                </Button>
                <Button 
                  onClick={() => navigate("/dashboard/company")}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Briefcase className="mr-2 h-4 w-4" />
                  Company Dashboard
                </Button>
                <Button 
                  onClick={() => navigate("/admin")}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;