import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Search, MapPin, Clock, DollarSign, Star, Filter, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; // Footer import যোগ করা হয়েছে

const Jobs = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [shiftType, setShiftType] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [salaryRange, setSalaryRange] = useState([0, 100000]);
  const [sortBy, setSortBy] = useState("newest");

  // Mock jobs data
  const jobs = [
    {
      id: "1",
      title: "Full-Time Elder Care Assistant",
      description: "Looking for experienced caregiver for elderly patient with mobility issues. Responsibilities include daily care, medication management.",
      location: "Gulshan 2, Dhaka",
      salary: 25000,
      salary_negotiable: true,
      job_type: "Full-Time",
      shift_type: "Day (8am-8pm)",
      duty_time: "12 hours",
      status: "open",
      featured: true,
      employer: { name: "Care Home Services", verified: true },
      created_at: "2 Days ago",
      applications_count: 12
    },
    {
      id: "2",
      title: "Night Shift Care Specialist",
      description: "Need professional caregiver for night shift assistance. Must have Nursing Diploma and 1 year experience.",
      location: "Dhanmondi 32, Dhaka",
      salary: 30000,
      salary_negotiable: false,
      job_type: "Contract",
      shift_type: "Night (8pm-8am)",
      duty_time: "12 hours",
      status: "open",
      featured: true,
      employer: { name: "Comfort Care Ltd", verified: true },
      created_at: "5 Hours ago",
      applications_count: 8
    },
    {
      id: "3",
      title: "Patient Care Attendant",
      description: "Urgent requirement for stroke patient care. Feeding, cleaning and physiotherapy assistance needed.",
      location: "Uttara Sector 7",
      salary: 18000,
      salary_negotiable: true,
      job_type: "Part-Time",
      shift_type: "10 Hours",
      duty_time: "10 hours",
      status: "open",
      featured: false,
      employer: { name: "Mr. Rahman", verified: false },
      created_at: "1 Day ago",
      applications_count: 3
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* Page Header */}
      <div className="bg-[#0f172a] text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Find Your Dream Care Job</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">Browse thousands of verified caregiver and nursing jobs from trusted employers across Bangladesh.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-24">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                <Filter className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800">Filters</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-slate-600 mb-2 block">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input placeholder="Job title..." className="pl-9 bg-slate-50" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label className="text-slate-600 mb-2 block">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input placeholder="City..." className="pl-9 bg-slate-50" value={location} onChange={(e) => setLocation(e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label className="text-slate-600 mb-2 block">Job Type</Label>
                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger className="bg-slate-50"><SelectValue placeholder="All Types" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="full-time">Full-Time</SelectItem>
                      <SelectItem value="part-time">Part-Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-600 mb-2 block">Salary Range (৳)</Label>
                  <Slider value={salaryRange} onValueChange={setSalaryRange} max={100000} step={1000} className="my-4" />
                  <div className="flex justify-between text-xs font-medium text-emerald-600">
                    <span>৳{salaryRange[0].toLocaleString()}</span>
                    <span>৳{salaryRange[1].toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox id="verified" checked={verifiedOnly} onCheckedChange={(c) => setVerifiedOnly(c as boolean)} />
                  <Label htmlFor="verified" className="cursor-pointer text-sm font-medium">Verified Employers Only</Label>
                </div>

                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4">Apply Filters</Button>
              </div>
            </div>
          </aside>

          {/* Jobs List */}
          <main className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800">Showing <span className="text-emerald-600">{jobs.length}</span> Jobs</h2>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] border-none shadow-none bg-slate-50"><SelectValue placeholder="Sort by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="salary-high">Highest Salary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="group relative bg-white rounded-xl border border-slate-200 p-6 transition-all duration-300 hover:shadow-md hover:border-emerald-500/50 hover:-translate-y-1">
                  
                  {job.featured && (
                    <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                      FEATURED
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Job Icon/Logo */}
                    <div className="hidden md:flex h-16 w-16 rounded-lg bg-slate-50 border border-slate-100 items-center justify-center shrink-0 group-hover:bg-emerald-50 transition-colors">
                      <Briefcase className="h-8 w-8 text-slate-400 group-hover:text-emerald-600" />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {job.employer.verified && (
                          <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                            <Star className="h-3 w-3 mr-1 fill-blue-700" /> Verified
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-slate-500 border-slate-300">{job.job_type}</Badge>
                        <span className="text-xs text-slate-400 flex items-center ml-auto md:ml-2">
                          <Clock className="h-3 w-3 mr-1" /> {job.created_at}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-emerald-600 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-slate-500 font-medium text-sm mb-3">{job.employer.name}</p>
                      
                      <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="grid grid-cols-2 md:flex md:items-center gap-4 text-sm text-slate-500 border-t border-slate-100 pt-4 mt-auto">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1.5 text-slate-400" /> {job.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1.5 text-slate-400" /> {job.shift_type}
                        </div>
                        <div className="flex items-center font-bold text-emerald-600 md:ml-auto">
                          <DollarSign className="h-4 w-4" /> 
                          <span className="text-lg">৳{job.salary.toLocaleString()}</span>
                          {job.salary_negotiable && <span className="text-xs font-normal text-slate-400 ml-1">(Neg.)</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/jobs/${job.id}`} className="flex-1">
                       <Button variant="outline" className="w-full border-slate-200 hover:bg-slate-50 hover:text-emerald-600">View Details</Button>
                    </Link>
                    <Link to={`/jobs/${job.id}/apply`} className="flex-1">
                       <Button className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20">Apply Now</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Jobs;