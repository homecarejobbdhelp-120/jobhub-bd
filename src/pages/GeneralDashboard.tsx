import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, PlusCircle } from "lucide-react";

const GeneralDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setUserName(profile.name);
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
          <p className="text-muted-foreground">Manage your jobs and applications</p>
        </div>

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
