import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import JobCard from "@/components/JobCard"; // ✨ Smart JobCard
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Briefcase } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

const Feed = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // ১. ইউজার এবং রোল চেক করা (Login না থাকলেও ফিড দেখা যাবে)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();
        
        if (roleData) setUserRole(roleData.role);
      }

      // ২. জব ফেচ করা (কোম্পানির নাম ও লোগো সহ)
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select(`
          *,
          profiles:employer_id (
            name,
            company_name,
            avatar_url
          )
        `)
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (jobsError) throw jobsError;
      setJobs(jobsData || []);

    } catch (error) {
      console.error("Error fetching feed:", error);
      toast({
        title: "Error",
        description: "জব লোড করা সম্ভব হয়নি। ইন্টারনেট কানেকশন চেক করুন।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // সার্চ ফিল্টার লজিক
  const filteredJobs = jobs.filter(job => 
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <Navbar /> {/* ✨ Professional Navbar */}

      {/* ✨ STICKY SEARCH HEADER */}
      <div className="bg-white sticky top-16 z-30 px-4 py-3 shadow-sm border-b border-slate-100">
        <div className="max-w-2xl mx-auto flex gap-2">
           <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <Input 
                placeholder="কাজের ধরণ বা এলাকা দিয়ে খুঁজুন..." 
                className="pl-12 h-12 bg-slate-50 border-none rounded-xl text-base focus-visible:ring-1 focus-visible:ring-emerald-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <Button variant="outline" className="h-12 w-12 p-0 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-600">
             <Filter className="h-5 w-5" />
           </Button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="container mx-auto px-4 mt-6 max-w-2xl">
        
        {/* Header Title */}
        <div className="flex items-center gap-2 mb-6 px-1">
          <div className="p-2 bg-emerald-100 rounded-lg">
             <Briefcase className="h-5 w-5 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            {searchTerm ? `সার্চ ফলাফল: ${filteredJobs.length} টি` : "নতুন জবের তালিকা"}
          </h2>
        </div>

        {/* JOBS LIST */}
        <div className="space-y-4">
          {loading ? (
            // Loading Skeleton
            [1, 2, 3].map((n) => (
              <div key={n} className="bg-white p-4 rounded-2xl space-y-3">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            ))
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <JobCard 
                key={job.id}
                id={job.id}
                title={job.title}
                location={job.location}
                salary={job.salary}
                salary_negotiable={job.salary_negotiable}
                job_type={job.job_type}
                shift_type={job.shift_type}
                featured={job.is_featured}
                company_name={job.profiles?.company_name || job.profiles?.name} // Handle generic name if company name missing
                employer_id={job.employer_id}
                avatar_url={job.profiles?.avatar_url}
                userRole={userRole} // ✨ Passing User Role for logic
                onApply={() => console.log("Applied")} // JobCard handles the logic, this is callback
              />
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
               <div className="mx-auto h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-slate-300" />
               </div>
               <h3 className="text-lg font-bold text-slate-700">কোনো জব পাওয়া যায়নি</h3>
               <p className="text-slate-400">অন্য কোনো কি-ওয়ার্ড দিয়ে চেষ্টা করুন</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;