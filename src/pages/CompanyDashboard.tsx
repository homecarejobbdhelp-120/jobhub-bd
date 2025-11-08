import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabaseClient";

interface Job {
  id: string;
  title: string;
  location: string;
  status: string | null;
  created_at: string | null;
}

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }

        // Ensure only employers access this page
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();
        if (roleData?.role !== "employer") {
          navigate("/");
          return;
        }

        const { data, error } = await supabase
          .from("jobs")
          .select("id, title, location, status, created_at")
          .eq("employer_id", session.user.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        setJobs(data || []);
      } catch (e: any) {
        setError(e.message || "Failed to load your jobs.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  const handleDelete = async (id: string) => {
    const ok = window.confirm("Delete this job?");
    if (!ok) return;
    const { error } = await supabase.from("jobs").delete().eq("id", id);
    if (!error) {
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } else {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-5xl mx-auto p-4 sm:p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Company Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your postings and connect with caregivers.</p>
        </header>

        {error && (
          <Alert className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Your Jobs</h2>
          <Button onClick={() => navigate("/post-job")}>Post a Job</Button>
        </div>

        {jobs.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No jobs yet</CardTitle>
              <CardDescription>Post your first job to start receiving applications.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/post-job">Create Job</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {jobs.map((job) => (
              <Card key={job.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{job.title}</CardTitle>
                  <CardDescription className="flex justify-between text-sm">
                    <span>{job.location}</span>
                    <span className="capitalize">{job.status ?? "open"}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto flex justify-end gap-2">
                  <Button variant="secondary" asChild>
                    <Link to={`/jobs/${job.id}`}>View</Link>
                  </Button>
                  <Button variant="destructive" onClick={() => handleDelete(job.id)}>
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CompanyDashboard;
