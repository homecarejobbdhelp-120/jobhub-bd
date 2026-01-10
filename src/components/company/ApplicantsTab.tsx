import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, Mail, Phone, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ApplicantProfile {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  verified_percentage: number | null;
  avatar_url: string | null;
}

interface Application {
  id: string;
  status: string;
  created_at: string;
  caregiver_id: string;
  job_id: string;
  message: string | null;
  cv_url: string | null;
  applicant: ApplicantProfile | null;
  jobs: {
    title: string;
    employer_id: string;
  } | null;
}

const ApplicantsTab = () => {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const fetchApplications = async () => {
    setLoading(true);
    setCheckingAuth(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCheckingAuth(false);
        setLoading(false);
        return;
      }
      setCheckingAuth(false);

      // Use the exact join syntax with foreign key hint
      let query = supabase
        .from("applications")
        .select(`
          *,
          applicant:profiles!caregiver_id(*),
          jobs(title, employer_id)
        `)
        .order("created_at", { ascending: false });

      if (jobId) {
        query = query.eq("job_id", jobId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter to only jobs owned by current user
      const filteredData = (data || []).filter((app: any) => 
        app.jobs && app.jobs.employer_id === user.id
      );
      setApplications(filteredData as Application[]);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: "accepted" | "rejected", caregiverId: string) => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", applicationId);

      if (error) throw error;

      // If accepted, create a conversation
      if (newStatus === "accepted") {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("messages")
            .insert({
              sender_id: user.id,
              receiver_id: caregiverId,
              text: "Your application has been accepted! Let's discuss further.",
            });
        }
      }

      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));

      toast({
        title: "Success",
        description: `Application ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update application",
        variant: "destructive",
      });
    }
  };

  if (checkingAuth || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">
          {checkingAuth ? "Checking permissions..." : "Loading applicants..."}
        </p>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="space-y-4">
        {applications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {jobId ? "No applications for this job yet" : "Select a job to view applicants"}
              </p>
            </CardContent>
          </Card>
        ) : (
          applications.map((app) => {
            const applicantName = app.applicant?.name || "Unknown Applicant";
            const applicantInitial = app.applicant?.name?.charAt(0).toUpperCase() || "?";
            
            return (
              <Card key={app.id} className="shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Link
                      to={`/profile/${app.caregiver_id}`}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <Avatar className="ring-2 ring-transparent group-hover:ring-primary transition-all">
                        <AvatarImage src={app.applicant?.avatar_url || undefined} alt={applicantName} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {applicantInitial}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base flex items-center gap-1 transition-colors group-hover:text-primary group-hover:underline">
                          {applicantName}
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Applied for: {app.jobs?.title || "Job"}
                        </CardDescription>
                      </div>
                    </Link>
                    <Badge 
                      variant={
                        app.status === "accepted" ? "default" :
                        app.status === "rejected" ? "destructive" :
                        "secondary"
                      }
                    >
                      {app.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {app.applicant?.email && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 mr-2" />
                        {app.applicant.email}
                      </div>
                    )}
                    {app.applicant?.phone && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 mr-2" />
                        {app.applicant.phone}
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      Verification: {app.applicant?.verified_percentage || 0}%
                    </div>
                  </div>

                {app.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleStatusChange(app.id, "accepted", app.caregiver_id)}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Accept
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleStatusChange(app.id, "rejected", app.caregiver_id)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ApplicantsTab;
