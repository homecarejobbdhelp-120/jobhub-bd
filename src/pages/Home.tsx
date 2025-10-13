import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import JobCard from "@/components/JobCard";
import NotificationPrompt from "@/components/NotificationPrompt";
import LoginPrompt from "@/components/LoginPrompt";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const Home = () => {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: featuredJobs, isLoading } = useQuery({
    queryKey: ["featured-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "open")
        .or("featured.eq.true")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data;
    },
  });

  const handleSearch = () => {
    navigate(`/jobs?keyword=${searchKeyword}&location=${searchLocation}`);
  };

  const handleViewDetails = (id: string) => {
    navigate(`/jobs?job=${id}`);
  };

  const handleApplyJob = (id: string) => {
    if (!user) {
      setLoginPromptOpen(true);
    } else {
      // Navigate to job application page
      navigate(`/jobs?job=${id}&apply=true`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <NotificationPrompt />
      <LoginPrompt open={loginPromptOpen} onOpenChange={setLoginPromptOpen} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#00AEEF] to-[#6DBE45] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm md:text-base mb-6 opacity-90 animate-fade-in">
            Bangladesh's first and most trusted free job platform for caregivers and nurses.
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Your Perfect Home Care Job
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Connecting Caregivers, Nurses & Companies
          </p>
          
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-4 flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Job title or keyword"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="h-12 text-gray-900"
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="Location"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="h-12 text-gray-900"
              />
            </div>
            <Button onClick={handleSearch} size="lg" className="h-12 bg-[#6DBE45] hover:bg-[#6DBE45]/90 text-white">
              <Search className="mr-2 h-4 w-4" />
              Search Jobs
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Jobs</h2>
          
          {isLoading ? (
            <div className="text-center py-12">Loading jobs...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs?.map((job) => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  title={job.title}
                  location={job.location}
                  salary={job.salary}
                  salary_negotiable={job.salary_negotiable}
                  job_type={job.job_type}
                  shift_type={job.shift_type}
                  featured={job.featured}
                  onViewDetails={handleViewDetails}
                  onApply={handleApplyJob}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Button variant="outline" size="lg" onClick={() => navigate("/jobs")}>
              View All Jobs
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-8">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-lg font-bold text-primary mb-4">HomeCare Job BD</h3>
          <div className="flex justify-center gap-6 mb-4">
            <a href="/" className="text-muted-foreground hover:text-primary transition">Home</a>
            <a href="/jobs" className="text-muted-foreground hover:text-primary transition">Jobs</a>
            <a href="/contact" className="text-muted-foreground hover:text-primary transition">Contact</a>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 HomeCare Job BD. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
