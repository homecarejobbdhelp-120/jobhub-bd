import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Users, Trash2, Pencil } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: number;
  status: string;
  created_at: string;
  job_type: string;
  shift_type: string;
  salary_negotiable: boolean;
  patient_details?: string;
  applications?: { count: number }[];
}

const MyJobsTab = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    location: "",
    salary: 0,
    job_type: "",
    shift_type: "",
    salary_negotiable: false,
    patient_details: "",
    status: "open",
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          applications(count)
        `)
        .eq("employer_id", user.id)
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

  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", jobId);

      if (error) throw error;

      setJobs(jobs.filter(job => job.id !== jobId));
      toast({
        title: "Success",
        description: "Job deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete job",
        variant: "destructive",
      });
    }
  };

  const handleViewApplicants = (jobId: string) => {
    navigate(`/dashboard/company?tab=applicants&jobId=${jobId}`);
  };

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    setEditForm({
      title: job.title,
      description: job.description,
      location: job.location,
      salary: job.salary,
      job_type: job.job_type,
      shift_type: job.shift_type,
      salary_negotiable: job.salary_negotiable || false,
      patient_details: job.patient_details || "",
      status: job.status,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingJob) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("jobs")
        .update({
          title: editForm.title,
          description: editForm.description,
          location: editForm.location,
          salary: editForm.salary,
          job_type: editForm.job_type,
          shift_type: editForm.shift_type as "8am-8pm" | "8pm-8am" | "24hr" | "10hr",
          salary_negotiable: editForm.salary_negotiable,
          patient_details: editForm.patient_details,
          status: editForm.status as "open" | "closed" | "expired",
        })
        .eq("id", editingJob.id);

      if (error) throw error;

      setJobs(jobs.map(job => 
        job.id === editingJob.id 
          ? { ...job, ...editForm }
          : job
      ));
      
      toast({
        title: "Success",
        description: "Job updated successfully",
      });
      setEditingJob(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update job",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No jobs posted yet</p>
              <Button onClick={() => navigate("/dashboard/company?tab=post")}>
                Post Your First Job
              </Button>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => (
            <Card key={job.id} className="shadow-md relative">
              {/* Edit Button - Top Right */}
              <button
                onClick={() => openEditModal(job)}
                className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors z-10"
                aria-label="Edit job"
              >
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </button>
              
              <CardHeader className="pb-3 pr-10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{job.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </CardDescription>
                  </div>
                  <Badge variant={job.status === "open" ? "default" : "secondary"}>
                    {job.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {job.description}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{job.applications?.[0]?.count || 0} Applications</span>
                  </div>
                  <span className="text-sm font-semibold">৳{job.salary?.toLocaleString()}</span>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleViewApplicants(job.id)}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    View Applicants
                  </Button>
                  <Button 
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(job.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Job Modal */}
      <Dialog open={!!editingJob} onOpenChange={() => setEditingJob(null)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="salary">Salary (৳)</Label>
                <Input
                  id="salary"
                  type="number"
                  value={editForm.salary}
                  onChange={(e) => setEditForm({ ...editForm, salary: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="job_type">Job Type</Label>
                <Select
                  value={editForm.job_type}
                  onValueChange={(value) => setEditForm({ ...editForm, job_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift_type">Shift Type</Label>
                <Select
                  value={editForm.shift_type}
                  onValueChange={(value) => setEditForm({ ...editForm, shift_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8am-8pm">8am-8pm</SelectItem>
                    <SelectItem value="8pm-8am">8pm-8am</SelectItem>
                    <SelectItem value="24hr">24hr</SelectItem>
                    <SelectItem value="10hr">10hr</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient_details">Patient Details (Optional)</Label>
              <Textarea
                id="patient_details"
                rows={2}
                value={editForm.patient_details}
                onChange={(e) => setEditForm({ ...editForm, patient_details: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingJob(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyJobsTab;
