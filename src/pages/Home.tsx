import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import JobCard from "@/components/JobCard";
import AuthPopup from "@/components/AuthPopup";
import NotificationPrompt from "@/components/NotificationPrompt";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { Search, MapPin, Briefcase, Users } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      // Close login prompt when user logs in
      if (session?.user) {
        setShowLoginPrompt(false);
      }
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
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data;
    },
  });

  const handleSearch = () => {
    navigate(`/jobs?keyword=${keyword}&location=${location}`);
  };

  const handleViewDetails = (id: string) => {
    navigate(`/jobs?job=${id}`);
  };

  const handleApplyJob = (id: string) => {
    if (!user) {
      setShowLoginPrompt(true);
    } else {
      navigate(`/jobs?job=${id}&apply=true`);
    }
  };

  const handlePostJob = () => {
    if (!user) {
      setShowLoginPrompt(true);
    } else {
      navigate("/post-job");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <NotificationPrompt />
      <AuthPopup 
        open={showLoginPrompt} 
        onOpenChange={setShowLoginPrompt}
        defaultMode="login"
      />

      {/* Hero Section with Background */}
      <section className="relative bg-gradient-to-b from-primary/5 to-background pt-20 pb-12 md:pt-24 md:pb-16 lg:pt-28 lg:pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto mb-8 md:mb-10"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-foreground leading-tight px-2">
              Find Trusted Home Care Jobs{" "}
              <span className="text-primary block md:inline">in Bangladesh</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-8 px-4">
              Search and apply for verified caregiver and home service jobs easily.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto mb-6 md:mb-8 px-4"
          >
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 md:w-5 md:h-5" />
                  <Input
                    type="text"
                    placeholder="Job title or keyword"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="pl-9 md:pl-10 h-11 md:h-12 text-sm md:text-base"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 md:w-5 md:h-5" />
                  <Input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-9 md:pl-10 h-11 md:h-12 text-sm md:text-base"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  className="w-full sm:w-auto h-11 md:h-12 text-sm md:text-base font-semibold px-6"
                  size="lg"
                >
                  <Search className="mr-2 w-4 h-4 md:w-5 md:h-5" />
                  Search
                </Button>
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center max-w-md mx-auto px-4"
          >
            <Button
              onClick={() => navigate("/jobs")}
              size="lg"
              className="w-full sm:w-auto h-11 md:h-12 text-sm md:text-base font-semibold px-8"
            >
              <Briefcase className="mr-2 w-4 h-4 md:w-5 md:h-5" />
              Find Jobs
            </Button>
            <Button
              onClick={handlePostJob}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-11 md:h-12 text-sm md:text-base font-semibold border-2 px-8"
            >
              <Users className="mr-2 w-4 h-4 md:w-5 md:h-5" />
              Post a Job
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 md:py-12 bg-white border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { label: "Active Jobs", value: "500+" },
              { label: "Caregivers", value: "2000+" },
              { label: "Companies", value: "200+" },
              { label: "Success Rate", value: "95%" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="text-center"
              >
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-1 md:mb-2">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 md:mb-3">
            Featured Jobs
          </h2>
          <p className="text-sm md:text-base text-muted-foreground px-4">
            Discover the latest opportunities from verified employers
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg p-6 animate-pulse border border-border">
                <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : featuredJobs && featuredJobs.length > 0 ? (
          <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredJobs.map((job) => (
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
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-muted/30 rounded-xl"
          >
            <p className="text-muted-foreground mb-4 text-sm md:text-base">No featured jobs available at the moment.</p>
            <Button onClick={() => navigate("/jobs")} size="lg">
              Browse All Jobs
            </Button>
          </motion.div>
        )}

        <div className="text-center mt-8 md:mt-12">
          <Button
            onClick={() => navigate("/jobs")}
            variant="outline"
            size="lg"
            className="text-sm md:text-base px-8"
          >
            View All Jobs
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
