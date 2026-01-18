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

  // 4 Featured Jobs for Professional Look
  const featuredJobs = [
    { id: "1", title: "Full-Time Elder Care Assistant", company: "Care Home Services", location: "Gulshan, Dhaka", salary: "25,000", type: "Full-Time", verified: true },
    { id: "2", title: "Night Shift Care Specialist", company: "Comfort Care Ltd", location: "Dhanmondi, Dhaka", salary: "30,000", type: "Contract", verified: true },
    { id: "3", title: "Professional Baby Caregiver", company: "HomeAid BD", location: "Uttara, Dhaka", salary: "18,000", type: "Part-Time", verified: false },
    { id: "4", title: "Hospital Duty Nurse", company: "Apex Health Care", location: "Mirpur 10, Dhaka", salary: "35,000", type: "Full-Time", verified: true }
  ];

  const handleSearch = () => {
    navigate(`/jobs?search=${keyword}&location=${location}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans overflow-x-hidden">
      <Navbar />
      
      {/* HERO SECTION */}
      <div className="bg-[#1e40af] pt-12 pb-24 px-4 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="text-center max-w-4xl mx-auto z-10 relative">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            Find <span className="text-emerald-400">Trusted Home Care</span> <br className="hidden md:block"/> 
            Jobs in Bangladesh
          </h1>
          <p className="text-blue-100 text-base md:text-lg mb-10 max-w-2xl mx-auto px-4">
            The most professional platform for Caregivers & Nurses. Connect with verified homecare services and build your career.
          </p>

          {!user ? (
            <div className="flex flex-col items-center gap-6 px-4">
              <Button onClick={() => navigate("/signup")} className="h-14 px-8 md:px-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xl md:text-2xl rounded-full shadow-2xl transition-transform hover:scale-105 border-none group w-full max-w-md">
                Get a HomeCare Job Today <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </Button>
              <div className="flex gap-4 md:gap-8 flex-wrap justify-center">
                <Button onClick={() => navigate("/dashboard/company?tab=post")} variant="ghost" className="text-white hover:bg-white/10 font-bold text-sm md:text-lg">Post a Job</Button>
                <div className="hidden md:block w-px h-6 bg-white/20 my-auto"></div>
                <Button onClick={() => navigate("/training")} variant="ghost" className="text-white hover:bg-white/10 font-bold text-sm md:text-lg">Need Training?</Button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-3 rounded-2xl shadow-2xl max-w-3xl mx-auto flex flex-col md:flex-row gap-2 border border-white/20">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <Input placeholder="Job title..." className="pl-12 h-12 border-none shadow-none bg-slate-50 focus-visible:ring-0 text-slate-700" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
              </div>
              <div className="relative flex-1 border-t md:border-t-0 md:border-l border-slate-100">
                <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <Input placeholder="Location..." className="pl-12 h-12 border-none shadow-none bg-slate-50 focus-visible:ring-0 text-slate-700" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <Button onClick={handleSearch} className="h-12 px-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold">Search</Button>
            </div>
          )}
        </div>
      </div>

      {/* UPDATED STATS SECTION (100+) */}
      <div className="container mx-auto px-4 -mt-10 mb-16 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-1">100+</div> {/* Changed 500 to 100 */}
            <div className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">Active Jobs</div>
          </div>
          <div className="border-l border-slate-100">
            <div className="text-3xl font-bold text-emerald-600 mb-1">2000+</div>
            <div className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">Caregivers</div>
          </div>
          <div className="border-l border-slate-100 hidden md:block">
            <div className="text-3xl font-bold text-purple-600 mb-1">100+</div> {/* Changed 200 to 100 */}
            <div className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">Companies</div>
          </div>
          <div className="border-l border-slate-100">
            <div className="text-3xl font-bold text-blue-700 mb-1">98%</div>
            <div className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">Success Rate</div>
          </div>
        </div>
      </div>

      {/* JOBS LISTING */}
      <div className="container mx-auto px-4 mb-16">
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               <Briefcase className="h-5 w-5 text-emerald-500" /> Recent Opportunities
            </h3>
            <Link to="/jobs" className="text-sm font-bold text-blue-600 hover:underline">View All</Link>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredJobs.map((job) => (
              <div key={job.id} onClick={() => navigate('/jobs')} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-300 transition-all flex justify-between items-center group cursor-pointer">
                <div className="flex gap-4 items-center">
                  <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 font-bold">💼</div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{job.title}</h4>
                    <p className="text-[10px] text-slate-500">{job.company} • {job.location}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-emerald-600 font-bold text-sm md:text-base">৳{job.salary}</div>
                  <div className="text-[10px] text-slate-400">Negotiable</div>
                </div>
              </div>
            ))}
         </div>
      </div>

      {/* UPDATED FOOTER TEXT (100+) */}
      <div className="py-10 text-center text-slate-400 text-[10px] md:text-xs bg-slate-900 mt-auto">
        © 2026 HomeCare Job BD. Trusted by 100+ homecare services.
      </div>
    </div>
  );
};

export default Index;