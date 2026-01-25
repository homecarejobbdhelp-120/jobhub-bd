// AdminJobs.tsx - সম্পূর্ণ ফাইল (ডাবল ন্যাভবার ফিক্স সহ)
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

const AdminJobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, profiles(name, company_name)') // রিলেশন ঠিক করা হয়েছে
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setJobs(data || []);
    setLoading(false);
  };

  const handleDeleteJob = async (jobId: string) => {
    if(!confirm("Delete this job?")) return;
    const { error } = await supabase.from('jobs').delete().eq('id', jobId);
    if (error) toast.error("Failed to delete");
    else {
        toast.success("Job deleted");
        fetchJobs();
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Job Management</h1>
      <Card>
          <CardHeader><CardTitle>Active Jobs ({jobs.length})</CardTitle></CardHeader>
          <CardContent>
              {loading ? <p>Loading...</p> : (
                  <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                          <tr>
                              <th className="px-6 py-3">Title</th>
                              <th className="px-6 py-3">Company</th>
                              <th className="px-6 py-3">Status</th>
                              <th className="px-6 py-3 text-right">Action</th>
                          </tr>
                      </thead>
                      <tbody>
                          {jobs.map((job) => (
                              <tr key={job.id} className="bg-white border-b hover:bg-gray-50">
                                  <td className="px-6 py-4 font-medium text-gray-900">{job.title}</td>
                                  <td className="px-6 py-4">{job.profiles?.company_name || job.profiles?.name || "N/A"}</td>
                                  <td className="px-6 py-4">
                                      <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>{job.status}</Badge>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteJob(job.id)}>
                                          <Trash2 className="h-4 w-4" />
                                      </Button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              )}
          </CardContent>
      </Card>
    </div>
  );
};

export default AdminJobs;