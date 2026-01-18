import { useState, useEffect } from "react";
import { Search, MapPin, GraduationCap, ArrowRight, Briefcase, Star } from "lucide-react";
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

  const featuredJobs = [
    { id: "1", title: "Full-Time Elder Care Assistant", company: "Care Home Services", location: "Gulshan, Dhaka", salary: "25,000", type: "Full-Time", verified: true },
    { id: "2", title: "Night Shift Care Specialist", company: "Comfort Care Ltd", location: "Dhanmondi, Dhaka", salary: "30,000", type: "Contract", verified: true },
    { id: "3", title: "Professional Baby Caregiver", company: "HomeAid BD", location: "Uttara, Dhaka", salary: "18,000", type: "Part-Time", verified: false },
    { id: "4", title: "Hospital Duty Nurse", company: "Apex Health Care", location: "Mirpur 10, Dhaka", salary: "35,000", type: "Full-Time", verified: true }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans overflow-x-hidden">
      <Navbar />
      
      {/* HERO SECTION - Improved Spacing */}
      <div className="bg-[#1e40af] pt-16 pb-28 px-4 rounded-b-[3rem] shadow-xl relative text-center">
        <div className="max-w-4xl mx-auto z-10 relative">
          <h1 className="text-3xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Find <span className="text-emerald-400">Trusted Home Care</span> <br className="hidden md:block"/> 
            Jobs in Bangladesh
          </h1>
          <p className="text-blue-100 text-base md:text-xl mb-12 max-w-2xl mx-auto px-4">
            The most professional platform for Caregivers & Nurses. Connect with verified homecare services and build your career.
          </p>

          {!user ? (
            <div className="flex flex-col items-center gap-8">
              <Button onClick={() => navigate("/signup")} className="h-16 px-10 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xl md:text-2xl rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 border-none w-full max-w-sm">
                Get a HomeCare Job Today <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
              <div className="flex gap-6 justify-center flex-wrap">
                <Button onClick={() => navigate("/dashboard/company?tab=post")} variant="ghost" className="text-white hover:bg-white/10 font-bold text-lg px-6 py-2 rounded-lg border border-white/20">Post a Job</Button>
                <Button onClick={() => navigate("/training")} variant="ghost" className="text-white hover:bg-white/10 font-bold text-lg px-6 py-2 rounded-lg border border-white/20">Need Training?</Button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-2xl shadow-2xl max-w-3xl mx-auto flex flex-col md:flex-row gap-3 border border-white/20">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <Input placeholder="Job title..." className="pl-12 h-12 border-none bg-slate-50 text-slate-700" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
              </div>
              <Button onClick={() => navigate(`/jobs?search=${keyword}`)} className="h-12 px-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold">Search Jobs</Button>
            </div>
          )}
        </div>
      </div>

      {/* STATS SECTION - Balanced Padding */}
      <div className="container mx-auto px-4 -mt-12 mb-20 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-black text-blue-600 mb-1">100+</div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Active Jobs</div>
          </div>
          <div className="border-l border-slate-100">
            <div className="text-4xl font-black text-emerald-600 mb-1">2000+</div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Caregivers</div>
          </div>
          <div className="border-l border-slate-100 hidden md:block">
            <div className="text-4xl font-black text-purple-600 mb-1">100+</div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Companies</div>
          </div>
          <div className="border-l border-slate-100">
            <div className="text-4xl font-black text-blue-700 mb-1">98%</div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Success Rate</div>
          </div>
        </div>
      </div>

      {/* JOBS LISTING - Card Spacing Fix */}
      <div className="container mx-auto px-4 mb-24">
         <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="text-2xl font-black text-slate-800">Recent Opportunities</h3>
              <p className="text-slate-500 text-sm">Find your next career move</p>
            </div>
            <Link to="/jobs" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">View All <ArrowRight className="h-4 w-4"/></Link>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredJobs.map((job) => (
              <div key={job.id} onClick={() => navigate('/jobs')} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex justify-between items-center group cursor-pointer">
                <div className="flex gap-4 items-center">
                  <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">💼</div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base md:text-lg">{job.title}</h4>
                    <p className="text-xs text-slate-500 font-medium">{job.company} • {job.location}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-emerald-600 font-black text-lg">৳{job.salary}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Negotiable</div>
                </div>
              </div>
            ))}
         </div>
      </div>

      <Footer /> {/* Footer is always included here */}
    </div>
  );
};

export default Index;