import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Clock, Building2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: number;
  salary_negotiable: boolean;
  company_name: string;
  job_type: string;
  shift_type: string;
  employer_id: string;
  created_at: string;
  profiles: {
    name: string;
    company_name: string;
  } | null;
}

const JobFeed = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [verificationPercentage, setVerificationPercentage] = useState(0);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchJobsAndProfile();
  }, []);

  const fetchJobsAndProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUserId(user.id);

      // Fetch profile for verification status
      const { data: profile } = await supabase
        .from("profiles")
        .select("verified_percentage")
        .eq("id", user.id)
        .single();

      if (profile) {
        setVerificationPercentage(profile.verified_percentage || 0);
      }

      // Fetch jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("*, profiles(name, company_name)")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (jobsError) throw jobsError;
      setJobs(jobsData || []);

      // Fetch user's applications
      const { data: applicationsData } = await supabase
        .from("applications")
        .select("job_id")
        .eq("caregiver_id", user.id);

      if (applicationsData) {
        setAppliedJobs(new Set(applicationsData.map(app => app.job_id)));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    if (verificationPercentage < 50) {
      toast({
        title: "Verification Required",
        description: "Please complete your profile verification to apply for jobs",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("applications")
        .insert({
          job_id: jobId,
          caregiver_id: userId,
          status: "pending",
        });

      if (error) throw error;

      setAppliedJobs(prev => new Set([...prev, jobId]));
      
      toast({
        title: "Success",
        description: "Your application has been submitted!",
      });
    } catch (error: any) {
      console.error("Error applying:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {verificationPercentage < 50 && (
        <Alert className="mb-4 border-orange-200 bg-orange-50">
          <AlertDescription className="text-orange-800">
            Complete your profile verification ({verificationPercentage}%) to apply for jobs
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No jobs available at the moment</p>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => {
            const hasApplied = appliedJobs.has(job.id);
            return (
              <Card key={job.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{job.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {job.profiles?.company_name || job.company_name}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{job.job_type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {job.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="font-semibold text-foreground">
                        {job.salary_negotiable ? "Negotiable" : `৳${job.salary?.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{job.shift_type}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={verificationPercentage < 50 || hasApplied}
                    onClick={() => handleApply(job.id)}
                  >
                    {hasApplied ? "Already Applied" : "Apply Now"}
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default JobFeed;
