import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Briefcase, User, Settings, LogOut, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const CompanyFeed = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    checkUserAndFetchData();
  }, []);

  const checkUserAndFetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      // Get user role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      const userRole = roleData?.role;
      if (userRole !== "employer") {
        navigate("/feed");
        return;
      }

      setProfile(profileData);

      // Fetch company's jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .eq("employer_id", user.id)
        .order("created_at", { ascending: false });

      if (jobsError) throw jobsError;
      setJobs(jobsData || []);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const verificationPercentage = profile?.verified_percentage || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">HomeCare Job BD - Company Dashboard</h1>
            <div className="flex items-center gap-4">
              <Link to="/company-feed">
                <Button variant="ghost" size="sm">
                  <Briefcase className="h-4 w-4 mr-2" />
                  View Jobs
                </Button>
              </Link>
              <Link to="/post-job">
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Post a Job
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Link to="/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Verification Banner */}
        {verificationPercentage < 50 && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Please verify your company information (NID/license, address, etc.) to post jobs. 
              Current verification: {verificationPercentage}%
            </AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Jobs</CardDescription>
              <CardTitle className="text-3xl">{jobs.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Jobs</CardDescription>
              <CardTitle className="text-3xl">
                {jobs.filter(j => j.status === 'open').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Verification</CardDescription>
              <CardTitle className="text-3xl">{verificationPercentage}%</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Post Job Button */}
        <div className="mb-6">
          <Button 
            onClick={() => navigate("/post-job")}
            disabled={verificationPercentage < 50}
            className="bg-primary hover:bg-primary/90"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Post a New Job
          </Button>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-6">Your Posted Jobs</h2>
          
          {jobs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">You haven't posted any jobs yet.</p>
              </CardContent>
            </Card>
          ) : (
            jobs.map((job) => (
              <Card key={job.id} className="shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{job.title}</CardTitle>
                      <CardDescription>{job.location}</CardDescription>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.status === 'open' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {job.description?.substring(0, 150)}...
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-semibold">Salary:</span>{" "}
                      {job.salary_negotiable ? "Negotiable" : `BDT ${job.salary}`}
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyFeed;
