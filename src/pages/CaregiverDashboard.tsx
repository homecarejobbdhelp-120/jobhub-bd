import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, User, MessageSquare, Home, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  salary: number;
  description: string;
  job_type: string;
  employer_id: string;
  status: string;
}

const CaregiverDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);

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

      // Fetch all open jobs
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(6);

      if (jobsData) {
        setJobs(jobsData);
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
          <h1 className="text-3xl font-bold mb-2">Welcome back, {userName || "Caregiver"}!</h1>
          <p className="text-muted-foreground">Manage your job applications and profile</p>
        </div>

        {/* Quick Navigation Menu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/dashboard")}>
            <CardHeader className="flex flex-row items-center space-x-4">
              <User className="h-8 w-8 text-primary" />
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">View and edit your profile</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/dashboard")}>
            <CardHeader className="flex flex-row items-center space-x-4">
              <MessageSquare className="h-8 w-8 text-primary" />
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Chat with employers</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/feed")}>
            <CardHeader className="flex flex-row items-center space-x-4">
              <Briefcase className="h-8 w-8 text-primary" />
              <CardTitle>Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Browse all available jobs</p>
            </CardContent>
          </Card>
        </div>

        {/* Jobs Feed Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Available Jobs</h2>
            <Button onClick={() => navigate("/feed")}>
              <Briefcase className="mr-2 h-4 w-4" />
              Find a Job
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                      <CardDescription 
                        className="text-primary hover:underline cursor-pointer"
                        onClick={() => navigate(`/dashboard`)}
                      >
                        {job.company_name}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{job.job_type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {job.location}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-primary">
                      ৳{job.salary?.toLocaleString()}
                    </span>
                    <Button onClick={() => navigate("/feed")}>
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {jobs.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No jobs available at the moment</p>
              </CardContent>
            </Card>
          )}
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

export default CaregiverDashboard;
