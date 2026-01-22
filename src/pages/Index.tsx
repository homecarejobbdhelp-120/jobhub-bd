import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JobCard from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Star } from "lucide-react";

const Index = () => {
  return (
    // ✅ ফিক্স: ব্যাকগ্রাউন্ড কালার 'bg-white' করা হয়েছে
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />

      {/* === HERO SECTION === */}
      <div className="relative bg-blue-900 pt-20 pb-32 text-center text-white overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">
            Find <span className="text-green-400">Trusted Home Care</span> Jobs in Bangladesh
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            The most professional platform for Caregivers & Nurses. Connect with verified homecare services and build your career.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link to="/jobs">
              <Button className="w-full sm:w-auto h-14 px-8 text-lg font-bold bg-green-500 hover:bg-green-600 text-white shadow-lg rounded-full transition-all hover:scale-105">
                Get a HomeCare Job Today
              </Button>
            </Link>
            <div className="flex gap-4 justify-center">
              <Link to="/post-job">
                <Button variant="outline" className="h-14 px-6 text-base font-bold text-white border-blue-400 hover:bg-blue-800 hover:text-white rounded-full">
                  Post a Job
                </Button>
              </Link>
              <Link to="/training">
                <Button variant="outline" className="h-14 px-6 text-base font-bold text-white border-blue-400 hover:bg-blue-800 hover:text-white rounded-full">
                  Need Training?
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Section */}
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

      {/* Recent Opportunities Title */}
      <div className="container mx-auto px-4 mt-16 mb-6 flex justify-between items-end">
        <div>
           <h2 className="text-2xl md:text-3xl font-bold text-blue-900">Recent Opportunities</h2>
           <p className="text-gray-500 mt-1">Find your next career move</p>
        </div>
        <Link to="/jobs" className="text-blue-600 font-bold hover:underline hidden md:flex items-center gap-1">
            View All <span className="text-lg">→</span>
        </Link>
      </div>

      {/* Job Cards Section */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <JobCard
            title="Senior Caregiver Needed"
            location="Gulshan, Dhaka"
            salary="18,000"
            type="Full-time"
            posted="2 days ago"
          />
          <JobCard
            title="Patient Care Attendant"
            location="Uttara, Dhaka"
            salary="15,000"
            type="Part-time"
            posted="1 day ago"
          />
          <JobCard
            title="Registered Nurse for Home"
            location="Dhanmondi, Dhaka"
            salary="25,000"
            type="Contract"
            posted="Just now"
          />
           <JobCard
            title="Baby Sitter / Nanny"
            location="Banani, Dhaka"
            salary="12,000"
            type="Full-time"
            posted="3 days ago"
          />
           <JobCard
            title="Elderly Companion"
            location="Mirpur, Dhaka"
            salary="14,000"
            type="Part-time"
            posted="5 hours ago"
          />
           <JobCard
            title="Stroke Patient Care"
            location="Bashundhara, Dhaka"
            salary="20,000"
            type="Full-time"
            posted="1 week ago"
          />
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