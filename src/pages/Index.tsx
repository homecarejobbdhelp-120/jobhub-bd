import { useState, useEffect } from "react";
import { Search, MapPin, GraduationCap, ArrowRight, Briefcase, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

const Index = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  // Mock Jobs for Teaser
  const featuredJobs = [
    {
      id: "1",
      title: "Full-Time Elder Care Assistant",
      company: "Care Home Services",
      location: "Gulshan, Dhaka",
      salary: "25,000",
      type: "Full-Time",
      verified: true
    },
    {
      id: "2",
      title: "Night Shift Care Specialist",
      company: "Comfort Care Ltd",
      location: "Dhanmondi, Dhaka",
      salary: "30,000",
      type: "Contract",
      verified: true
    }
  ];

  const handleSearch = () => {
    navigate(`/jobs?search=${keyword}&location=${location}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />
      
      {/* ✨ HERO SECTION: Deep Royal Blue */}
      <div className="bg-[#1e40af] pt-16 pb-32 px-4 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="text-center max-w-4xl mx-auto relative z-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            Find <span className="text-emerald-400">Trusted Home Care</span> <br/> 
            Jobs in Bangladesh
          </h1>
          
          <p className="text-blue-100 text-lg mb-12 max-w-2xl mx-auto">
            The most professional platform for Caregivers & Nurses. Connect with verified families and build your career.
          </p>

          {/* ✨ CONDITIONAL VIEW LOGIC */}
          {!user ? (
            /* VISITOR VIEW: Professional CTA Button */
            <div className="flex flex-col items-center gap-6">
              <Button 
                onClick={() => navigate("/signup")}
                className="h-16 px-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-2xl rounded-full shadow-[0_10px_40px_rgba(16,185,129,0.3)] transition-transform hover:scale-105 border-none group"
              >
                Get a HomeCare Job Today
                <ArrowRight className="ml-3 h-7 w-7 group-hover:translate-x-2 transition-transform" />
              </Button>
              
              <div className="flex gap-6 pt-4">
                <Button 
                  onClick={() => navigate("/dashboard/company?tab=post")}
                  variant="ghost"
                  className="text-white hover:bg-white/10 font-bold text-lg"
                >
                  Post a Job
                </Button>
                <div className="w-px h-6 bg-white/20 my-auto"></div>
                <Button 
                   onClick={() => navigate("/training")}
                   variant="ghost"
                   className="text-white hover:bg-white/10 font-bold text-lg"
                >
                  Need Training?
                </Button>
              </div>
            </div>
          ) : (
            /* LOGGED-IN USER VIEW: Job Search Bar */
            <div className="bg-white p-3 rounded-2xl shadow-2xl max-w-3xl mx-auto flex flex-col md:flex-row gap-2 border border-white/20">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <Input 
                  placeholder="Job title or keyword..." 
                  className="pl-12 h-12 border-none shadow-none bg-slate-50 focus-visible:ring-0 text-slate-700 font-medium"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              <div className="hidden md:block w-px bg-slate-200 my-2"></div>
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <Input 
                  placeholder="Location..." 
                  className="pl-12 h-12 border-none shadow-none bg-slate-50 focus-visible:ring-0 text-slate-700 font-medium"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <Button onClick={handleSearch} className="h-12 px-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg">
                Search
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* FEATURED SECTION */}
      <div className="container mx-auto px-4 -mt-16 relative z-20 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Training Info Box */}
          <div className="md:col-span-1 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-5 rotate-3 group-hover:rotate-0 transition-transform">
              <GraduationCap className="h-9 w-9" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Build Your Skills</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Join our 1-3 month short courses and get government certificates to boost your career.
            </p>
            <Button onClick={() => navigate("/training")} variant="outline" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 font-bold rounded-xl">
              Learn Training
            </Button>
          </div>

          {/* Job Teaser List */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-2 px-2">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-emerald-500" /> Recent Opportunities
              </h3>
              <Link to="/jobs" className="text-sm font-bold text-blue-600 hover:underline">View All</Link>
            </div>
            
            {featuredJobs.map((job) => (
              <div key={job.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex justify-between items-center group cursor-pointer" onClick={() => navigate('/jobs')}>
                <div className="flex gap-4 items-center">
                  <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex gap-2 mb-1">
                      {job.verified && <Badge className="bg-blue-50 text-blue-600 border-none text-[10px] py-0"><Star className="h-2 w-2 mr-1 fill-blue-600" /> Verified</Badge>}
                      <Badge variant="outline" className="text-[10px] py-0 text-slate-400 border-slate-200">{job.type}</Badge>
                    </div>
                    <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{job.title}</h4>
                    <p className="text-xs text-slate-500 font-medium">{job.company} • {job.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-600 font-bold text-lg">৳{job.salary}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Negotiable</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Index;