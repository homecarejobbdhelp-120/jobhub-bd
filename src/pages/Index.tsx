import { useState } from "react";
import { Search, MapPin, Briefcase, Users, Building2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    navigate(`/jobs?search=${keyword}&location=${location}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans selection:bg-primary/20">
      <Navbar />
      
      {/* Hero Section with Gradient & Glass Effect */}
      <div className="relative flex-1 flex flex-col items-center justify-center pt-20 pb-32 px-4 overflow-hidden">
        
        {/* Background Decorative Blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-[100px] -z-10 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-400/20 rounded-full blur-[100px] -z-10" />

        <div className="text-center max-w-4xl mx-auto space-y-6 z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-slate-800">
            Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">Trusted Home Care</span> <br />
            Jobs in <span className="text-emerald-600">Bangladesh</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto">
            Connect with verified families and hospitals. The most trusted platform for Caregivers & Nurses in Dhaka, Dhanmondi, Gulshan & Uttara.
          </p>

          {/* Modern Glass Search Box */}
          <div className="mt-10 p-4 bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl shadow-xl shadow-blue-900/5 max-w-3xl mx-auto transform transition-all hover:scale-[1.01]">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Briefcase className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input 
                  placeholder="Job title (e.g. Caregiver, Nurse)" 
                  className="pl-10 h-12 bg-white/80 border-slate-200 focus:ring-2 focus:ring-emerald-500/20 text-base"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input 
                  placeholder="Location (e.g. Dhaka, Gulshan)" 
                  className="pl-10 h-12 bg-white/80 border-slate-200 focus:ring-2 focus:ring-emerald-500/20 text-base"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleSearch}
                className="h-12 px-8 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/30 transition-all rounded-xl"
              >
                <Search className="mr-2 h-5 w-5" />
                Search
              </Button>
            </div>
            
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-slate-500">
              <span className="font-medium">Popular:</span>
              <span className="bg-slate-100 px-2 py-1 rounded-md cursor-pointer hover:bg-slate-200">Elderly Care</span>
              <span className="bg-slate-100 px-2 py-1 rounded-md cursor-pointer hover:bg-slate-200">Baby Care</span>
              <span className="bg-slate-100 px-2 py-1 rounded-md cursor-pointer hover:bg-slate-200">Hospital Duty</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex justify-center gap-4 pt-6">
            <Button variant="outline" className="h-11 border-slate-300 text-slate-600 hover:bg-slate-50" onClick={() => navigate('/jobs')}>
              Browse All Jobs
            </Button>
            <Button variant="ghost" className="h-11 text-emerald-700 hover:bg-emerald-50 font-medium" onClick={() => navigate('/dashboard/company?tab=post')}>
              Post a Job (Free)
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section with Glass Cards */}
      <div className="bg-white/50 border-y border-slate-100 py-12 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-4 rounded-xl hover:bg-white/60 transition-colors">
              <div className="text-4xl font-bold text-emerald-600 mb-1">500+</div>
              <div className="text-slate-500 font-medium flex items-center justify-center gap-2">
                <Briefcase className="h-4 w-4" /> Active Jobs
              </div>
            </div>
            <div className="p-4 rounded-xl hover:bg-white/60 transition-colors">
              <div className="text-4xl font-bold text-blue-600 mb-1">2000+</div>
              <div className="text-slate-500 font-medium flex items-center justify-center gap-2">
                <Users className="h-4 w-4" /> Caregivers
              </div>
            </div>
            <div className="p-4 rounded-xl hover:bg-white/60 transition-colors">
              <div className="text-4xl font-bold text-purple-600 mb-1">200+</div>
              <div className="text-slate-500 font-medium flex items-center justify-center gap-2">
                <Building2 className="h-4 w-4" /> Companies
              </div>
            </div>
            <div className="p-4 rounded-xl hover:bg-white/60 transition-colors">
              <div className="text-4xl font-bold text-orange-500 mb-1">98%</div>
              <div className="text-slate-500 font-medium flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4" /> Success Rate
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer / Copyright Mockup for visual balance */}
      <div className="py-6 text-center text-slate-400 text-sm">
        © 2026 HomeCare Job BD. Trusted by 500+ Families.
      </div>
    </div>
  );
};

export default Index;