import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JobCard from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Star } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* === HERO SECTION === */}
      <div className="relative bg-blue-900 pt-10 pb-32 text-center text-white overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">
            Find <span className="text-green-400">Trusted Home Care</span> Jobs in Bangladesh
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            The most professional platform for Caregivers & Nurses. Connect with verified homecare services and build your career.
          </p>

          <div className="flex flex-col items-center gap-6 mb-16">
            
            {/* ✅ ফিক্স: লিংক এখন /signup এ নিয়ে যাবে */}
            <Link to="/signup">
              <Button className="w-full sm:w-auto h-14 px-10 text-lg font-bold bg-green-500 hover:bg-green-600 text-white shadow-xl rounded-full transition-all hover:scale-105 border-2 border-green-400">
                Get a HomeCare Job Today
              </Button>
            </Link>

            <div className="flex flex-row gap-4 justify-center w-full">
              <Link to="/post-job">
                <Button className="h-12 px-6 text-sm md:text-base font-bold bg-white text-blue-900 hover:bg-gray-100 rounded-full shadow-lg border-0">
                  Post a Job
                </Button>
              </Link>
              <Link to="/training">
                <Button className="h-12 px-6 text-sm md:text-base font-bold bg-pink-600 text-white hover:bg-pink-700 rounded-full shadow-lg border-0">
                  Need Training?
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-white text-gray-800 rounded-3xl shadow-xl p-8 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-b-4 border-green-500">
            <div className="text-center">
              <div className="flex justify-center items-center gap-2 mb-1">
                <Briefcase className="w-6 h-6 text-blue-600" />
                <span className="text-3xl font-bold text-blue-900">100+</span>
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Active Jobs</p>
            </div>
            
            <div className="text-center md:border-l md:border-r border-gray-100">
              <div className="flex justify-center items-center gap-2 mb-1">
                <Users className="w-6 h-6 text-green-600" />
                <span className="text-3xl font-bold text-blue-900">2000+</span>
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Caregivers</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center items-center gap-2 mb-1">
                <Star className="w-6 h-6 text-yellow-500 fill-current" />
                <span className="text-3xl font-bold text-blue-900">98%</span>
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Success Rate</p>
            </div>
          </div>

        </div>
      </div>

      <div className="container mx-auto px-4 mt-16 mb-6 flex justify-between items-end">
        <div>
           <h2 className="text-2xl md:text-3xl font-bold text-blue-900">Recent Opportunities</h2>
           <p className="text-gray-500 mt-1">Visitors can view these sample jobs. Login to see real posts.</p>
        </div>
        <Link to="/jobs" className="text-blue-600 font-bold hover:underline hidden md:flex items-center gap-1">
            View All <span className="text-lg">→</span>
        </Link>
      </div>

      <div className="container mx-auto px-4 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <JobCard title="Senior Caregiver Needed" company="Care Home BD" location="Gulshan, Dhaka" salary="25,000" type="Full-time" posted="2h ago" description="Urgent requirement for an experienced caregiver for an elderly patient." />
          <JobCard title="Night Shift Care Specialist" company="Comfort Care Ltd" location="Dhanmondi, Dhaka" salary="30,000" type="Contract" posted="5h ago" description="Looking for a certified nurse for night shift duty. Safe environment provided." />
          <JobCard title="Patient Care Attendant" company="Private Employer" location="Uttara, Dhaka" salary="18,000" type="Part-time" posted="1d ago" description="Need a female attendant for daytime support. 8 hours duty." />
           <JobCard title="Baby Sitter / Nanny" company="HomeAid Service" location="Banani, Dhaka" salary="15,000" type="Full-time" posted="2d ago" description="Experienced nanny needed for a 2-year-old child." />
           <JobCard title="Elderly Companion" company="Family Support" location="Mirpur, Dhaka" salary="14,000" type="Part-time" posted="3d ago" description="Simple companion job for an elderly person." />
           <JobCard title="Stroke Patient Care" company="Medical Care BD" location="Bashundhara, Dhaka" salary="35,000" type="Full-time" posted="1w ago" description="Professional nurse needed for stroke patient rehabilitation." />
        </div>

        <div className="mt-8 text-center md:hidden">
            <Link to="/jobs">
                <Button variant="outline" className="w-full border-blue-600 text-blue-600 font-bold">View All Jobs</Button>
            </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Index;