import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Banknote } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: number;
  salary_negotiable: boolean;
  job_type: string;
  shift_type: string;
  company_name: string;
  created_at: string;
  employer_id: string;
  patient_details?: string;
}

const CompanyFeedTab = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const fetchJobs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "open")
        .neq("employer_id", user?.id || "") // Exclude own jobs
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
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
      <h2 className="text-lg font-semibold mb-3">All Job Postings</h2>
      
      <div className="space-y-3">
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No jobs available at the moment</p>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => (
            <Card key={job.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 pt-3 px-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-0.5">{job.company_name || "Company"}</p>
                    <CardTitle className="text-sm font-semibold line-clamp-1">{job.title}</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {job.job_type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {job.shift_type}
                  </span>
                  <span className="flex items-center gap-1">
                    <Banknote className="h-3 w-3" />
                    ৳{job.salary?.toLocaleString()}
                    {job.salary_negotiable && " (Negotiable)"}
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {job.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{formatDate(job.created_at)}</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => setSelectedJob(job)}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Job Details Modal */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedJob?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedJob && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Company</p>
                <p className="text-sm">{selectedJob.company_name || "Not specified"}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p className="text-sm">{selectedJob.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Job Type</p>
                  <p className="text-sm">{selectedJob.job_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Shift</p>
                  <p className="text-sm">{selectedJob.shift_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Salary</p>
                  <p className="text-sm">
                    ৳{selectedJob.salary?.toLocaleString()}
                    {selectedJob.salary_negotiable && " (Negotiable)"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                <p className="text-sm whitespace-pre-wrap">{selectedJob.description}</p>
              </div>

              {selectedJob.patient_details && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Patient Details</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedJob.patient_details}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyFeedTab;