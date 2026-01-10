import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Check, 
  X, 
  MapPin, 
  FileText, 
  MessageSquare, 
  Star,
  Bookmark,
  User,
  Clock,
  Eye
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import CandidateCVModal from "./CandidateCVModal";

interface ApplicantProfile {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  verified_percentage: number | null;
  avatar_url: string | null;
  location: string | null;
  age: number | null;
  gender: string | null;
  skills: string[] | null;
  expected_salary_min: number | null;
  expected_salary_max: number | null;
  marital_status?: string | null;
  shift_preferences?: string[] | null;
  cv_url?: string | null;
  certificate_url?: string | null;
}

interface Application {
  id: string;
  status: string;
  created_at: string;
  caregiver_id: string;
  job_id: string;
  message: string | null;
  cv_url: string | null;
  expected_salary: number | null;
  applicant: ApplicantProfile | null;
  jobs: {
    title: string;
    employer_id: string;
  } | null;
}

const ApplicantsTab = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobId = searchParams.get("jobId");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());
  
  // Modal state
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [cvModalOpen, setCvModalOpen] = useState(false);

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

      let query = supabase
        .from("applications")
        .select(`
          *,
          applicant:profiles!caregiver_id(
            id, name, email, phone, verified_percentage, avatar_url,
            location, age, gender, skills, expected_salary_min, expected_salary_max,
            marital_status, shift_preferences, cv_url, certificate_url
          ),
          jobs(title, employer_id)
        `)
        .order("created_at", { ascending: false });

      if (jobId) {
        query = query.eq("job_id", jobId);
      }

      const { data, error } = await query;

      if (error) throw error;

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
        description: newStatus === "accepted" ? "Applicant shortlisted!" : "Application rejected",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update application",
        variant: "destructive",
      });
    }
  };

  const handleViewCV = (application: Application) => {
    setSelectedApplication(application);
    setCvModalOpen(true);
  };

  const handleMessage = async (caregiverId: string, applicantName: string) => {
    const params = new URLSearchParams({
      tab: "messages",
      partnerId: caregiverId,
      partnerName: applicantName,
    });
    navigate(`/dashboard/company?${params.toString()}`);
  };

  const toggleShortlist = (applicationId: string) => {
    setShortlisted(prev => {
      const newSet = new Set(prev);
      if (newSet.has(applicationId)) {
        newSet.delete(applicationId);
        toast({ title: "Removed from shortlist" });
      } else {
        newSet.add(applicationId);
        toast({ title: "Added to shortlist" });
      }
      return newSet;
    });
  };

  const calculateMatchScore = (applicant: ApplicantProfile | null): number => {
    if (!applicant) return 0;
    let score = 0;
    if (applicant.verified_percentage) score += Math.min(applicant.verified_percentage * 0.4, 40);
    if (applicant.skills && applicant.skills.length > 0) score += Math.min(applicant.skills.length * 5, 25);
    if (applicant.location) score += 15;
    if (applicant.age) score += 10;
    if (applicant.expected_salary_min) score += 10;
    return Math.min(Math.round(score), 100);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
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
      {/* Header Stats */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          Applicants {applications.length > 0 && `(${applications.length})`}
        </h2>
        {shortlisted.size > 0 && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Bookmark className="h-3 w-3" />
            {shortlisted.size} Shortlisted
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        {applications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {jobId ? "No applications for this job yet" : "Select a job to view applicants"}
              </p>
            </CardContent>
          </Card>
        ) : (
          applications.map((app) => {
            const applicant = app.applicant;
            const applicantName = applicant?.name || "Unknown Applicant";
            const applicantInitial = applicantName.charAt(0).toUpperCase();
            const matchScore = calculateMatchScore(applicant);
            const isShortlisted = shortlisted.has(app.id);
            
            return (
              <Card 
                key={app.id} 
                className={`shadow-sm border transition-all ${
                  isShortlisted ? "border-primary/50 bg-primary/5" : ""
                } ${app.status === "accepted" ? "border-green-500/30 bg-green-50/50 dark:bg-green-900/10" : ""}`}
              >
                <CardContent className="p-4">
                  {/* Top Row: Avatar, Info, Status */}
                  <div className="flex items-start gap-3">
                    {/* Avatar with Match Score */}
                    <div className="relative">
                      <Avatar className="h-14 w-14 ring-2 ring-background shadow-md">
                        <AvatarImage src={applicant?.avatar_url || undefined} alt={applicantName} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                          {applicantInitial}
                        </AvatarFallback>
                      </Avatar>
                      {matchScore > 0 && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
                          {matchScore}%
                        </div>
                      )}
                    </div>

                    {/* Applicant Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <Link
                          to={`/profile/${app.caregiver_id}`}
                          className="font-semibold text-base hover:text-primary hover:underline transition-colors truncate"
                        >
                          {applicantName}
                        </Link>
                        <Badge 
                          variant={
                            app.status === "accepted" ? "default" :
                            app.status === "rejected" ? "destructive" :
                            "secondary"
                          }
                          className={app.status === "accepted" ? "bg-green-600" : ""}
                        >
                          {app.status === "accepted" ? "Shortlisted" : app.status}
                        </Badge>
                      </div>

                      {/* Key Details Row */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        {applicant?.age && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {applicant.age} yrs
                          </span>
                        )}
                        {applicant?.gender && (
                          <span className="capitalize">{applicant.gender}</span>
                        )}
                        {applicant?.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {applicant.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(app.created_at)}
                        </span>
                      </div>

                      {/* Skills */}
                      {applicant?.skills && applicant.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {applicant.skills.slice(0, 3).map((skill, i) => (
                            <Badge key={i} variant="outline" className="text-xs py-0">
                              {skill}
                            </Badge>
                          ))}
                          {applicant.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs py-0">
                              +{applicant.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Expected Salary */}
                      {(app.expected_salary || applicant?.expected_salary_min) && (
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">Expected: </span>
                          <span className="font-medium text-green-600">
                            ৳{(app.expected_salary || applicant?.expected_salary_min || 0).toLocaleString()}/mo
                          </span>
                        </div>
                      )}

                      {/* Job Applied */}
                      <div className="mt-2 text-xs text-muted-foreground">
                        Applied for: <span className="font-medium text-foreground">{app.jobs?.title || "Job"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {/* Primary: View CV */}
                    <Button
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => handleViewCV(app)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View CV
                    </Button>

                    {/* Secondary: Message */}
                    <Button
                      variant="outline"
                      onClick={() => handleMessage(app.caregiver_id, applicantName)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message
                    </Button>
                  </div>

                  {/* Quick Actions for Pending */}
                  {app.status === "pending" && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleStatusChange(app.id, "accepted", app.caregiver_id)}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Shortlist
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                        onClick={() => handleStatusChange(app.id, "rejected", app.caregiver_id)}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleShortlist(app.id)}
                        className={isShortlisted ? "text-primary" : "text-muted-foreground"}
                      >
                        <Bookmark className={`h-4 w-4 ${isShortlisted ? "fill-current" : ""}`} />
                      </Button>
                    </div>
                  )}

                  {/* Show verification */}
                  {applicant?.verified_percentage && applicant.verified_percentage > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all" 
                          style={{ width: `${applicant.verified_percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {applicant.verified_percentage}% verified
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* CV Modal */}
      <CandidateCVModal
        open={cvModalOpen}
        onOpenChange={setCvModalOpen}
        applicant={selectedApplication?.applicant || null}
        application={selectedApplication}
        jobTitle={selectedApplication?.jobs?.title || "Job Position"}
        onShortlist={() => {
          if (selectedApplication) {
            handleStatusChange(selectedApplication.id, "accepted", selectedApplication.caregiver_id);
          }
        }}
        onReject={() => {
          if (selectedApplication) {
            handleStatusChange(selectedApplication.id, "rejected", selectedApplication.caregiver_id);
          }
        }}
        isPending={selectedApplication?.status === "pending"}
      />
    </div>
  );
};

export default ApplicantsTab;
