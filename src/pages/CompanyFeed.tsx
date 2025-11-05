import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Briefcase, User, Settings, LogOut, Plus, MessageSquare, MapPin, DollarSign, Calendar, Trash2, Users } from "lucide-react";
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

  const handleDeleteJob = async (jobId: string) => {
    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", jobId);

    if (!error) {
      setJobs(jobs.filter(job => job.id !== jobId));
    }
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

        {/* Navigation Menu */}
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

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/post-job")}>
            <CardHeader className="flex flex-row items-center space-x-4">
              <Plus className="h-8 w-8 text-primary" />
              <CardTitle>Job Post</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Create and manage job postings</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/dashboard")}>
            <CardHeader className="flex flex-row items-center space-x-4">
              <MessageSquare className="h-8 w-8 text-primary" />
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Chat with applicants</p>
            </CardContent>
          </Card>
        </div>

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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Your Posted Jobs</h2>
            <Button onClick={() => navigate("/post-job")}>
              <Plus className="mr-2 h-4 w-4" />
              Post New Job
            </Button>
          </div>
          
          {jobs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">You haven't posted any jobs yet</p>
                <Button onClick={() => navigate("/post-job")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Post Your First Job
                </Button>
              </CardContent>
            </Card>
          ) : (
            jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <CardDescription className="flex items-center mt-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </CardDescription>
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
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {job.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        ৳{job.salary?.toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(job.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => navigate("/dashboard")}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      View Applicants
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => navigate("/dashboard")}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Messages
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => handleDeleteJob(job.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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
