import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, PlusCircle, Search, GraduationCap, User, FileText } from "lucide-react";

const GeneralDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState(""); // ✅ রোল রাখার জন্য স্টেট যোগ করলাম

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      // ✅ ডাটাবেস থেকে name এর পাশাপাশি 'role' টাও নিয়ে আসছি
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, role")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setUserName(profile.name);
        setUserRole(profile.role); // ✅ রোল সেট করছি
      }

      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {userName || "User"}!</h1>
          <p className="text-muted-foreground">
            {userRole === 'employer' 
              ? "Manage your jobs and applications" 
              : "Find your dream job and manage your profile"}
          </p>
        </div>

        {/* ✅ লজিক: যদি Employer হয়, তবে এই কার্ডগুলো দেখাবে */}
        {userRole === 'employer' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/post-job")}>
              <CardHeader className="flex flex-row items-center space-x-4">
                <PlusCircle className="h-8 w-8 text-primary" />
                <CardTitle>Post a Job</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Create a new job posting</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/company-feed")}>
              <CardHeader className="flex flex-row items-center space-x-4">
                <Briefcase className="h-8 w-8 text-primary" />
                <CardTitle>My Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">View and manage your job postings</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/company-feed")}>
              <CardHeader className="flex flex-row items-center space-x-4">
                <Users className="h-8 w-8 text-primary" />
                <CardTitle>Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Review candidate applications</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ✅ লজিক: যদি Caregiver বা Nurse হয়, তবে এই কার্ডগুলো দেখাবে */}
        {(userRole === 'caregiver' || userRole === 'nurse') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/jobs")}>
              <CardHeader className="flex flex-row items-center space-x-4">
                <Search className="h-8 w-8 text-primary" />
                <CardTitle>Find Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Browse available jobs</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/training")}>
              <CardHeader className="flex flex-row items-center space-x-4">
                <GraduationCap className="h-8 w-8 text-primary" />
                <CardTitle>Training</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Enhance your skills</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/profile")}>
              <CardHeader className="flex flex-row items-center space-x-4">
                <User className="h-8 w-8 text-primary" />
                <CardTitle>My Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Edit profile & settings</p>
              </CardContent>
            </Card>
            
             <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/applications")}>
              <CardHeader className="flex flex-row items-center space-x-4">
                <FileText className="h-8 w-8 text-primary" />
                <CardTitle>My Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Track your job applications</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </main>
    </div>
  );
};

export default GeneralDashboard;