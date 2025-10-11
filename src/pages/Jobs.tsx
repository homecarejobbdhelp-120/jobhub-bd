import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Search, MapPin, Clock, DollarSign, Star, Filter } from "lucide-react";
import { Link } from "react-router-dom";

const Jobs = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [shiftType, setShiftType] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [salaryRange, setSalaryRange] = useState([0, 100000]);
  const [sortBy, setSortBy] = useState("newest");

  // Mock jobs data - will be replaced with real data
  const jobs = [
    {
      id: "1",
      title: "Full-Time Elder Care Assistant",
      description: "Looking for experienced caregiver for elderly patient with mobility issues. Responsibilities include daily care, medication management, and companionship.",
      location: "Dhaka, Gulshan",
      salary: 25000,
      salary_negotiable: true,
      job_type: "full-time",
      shift_type: "8am-8pm",
      duty_time: "12 hours",
      status: "open",
      featured: true,
      employer: { name: "Care Home Services", verified: true },
      created_at: "2025-01-10",
      applications_count: 5
    },
    {
      id: "2",
      title: "Night Shift Care Specialist",
      description: "Need professional caregiver for night shift assistance with elderly patient requiring overnight monitoring.",
      location: "Dhaka, Dhanmondi",
      salary: 30000,
      salary_negotiable: false,
      job_type: "full-time",
      shift_type: "8pm-8am",
      duty_time: "12 hours",
      status: "open",
      featured: true,
      employer: { name: "Comfort Care Ltd", verified: true },
      created_at: "2025-01-09",
      applications_count: 8
    },
    {
      id: "3",
      title: "Part-Time Weekend Caregiver",
      description: "Weekend assistance needed for patient with special needs. Must be compassionate and patient.",
      location: "Chittagong",
      salary: 15000,
      salary_negotiable: true,
      job_type: "part-time",
      shift_type: "10hr",
      duty_time: "10 hours",
      status: "open",
      featured: false,
      employer: { name: "Family First Care", verified: false },
      created_at: "2025-01-08",
      applications_count: 3
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/">
              <h1 className="text-2xl font-bold text-primary">HomeCare Job BD</h1>
            </Link>
            <div className="flex gap-2">
              <Link to="/post-job">
                <Button>Post Job</Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <Label>Keyword</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Job title..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <Label>Location</Label>
                  <div className="relative mt-2">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="City or area..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Job Type */}
                <div>
                  <Label>Job Type</Label>
                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="full-time">Full-Time</SelectItem>
                      <SelectItem value="part-time">Part-Time</SelectItem>
                      <SelectItem value="live-in">Live-In</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Shift Type */}
                <div>
                  <Label>Shift Type</Label>
                  <Select value={shiftType} onValueChange={setShiftType}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Shifts</SelectItem>
                      <SelectItem value="8am-8pm">Day (8am-8pm)</SelectItem>
                      <SelectItem value="8pm-8am">Night (8pm-8am)</SelectItem>
                      <SelectItem value="24hr">24 Hour</SelectItem>
                      <SelectItem value="10hr">10 Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Salary Range */}
                <div>
                  <Label>Salary Range (৳)</Label>
                  <div className="mt-4 mb-2">
                    <Slider
                      value={salaryRange}
                      onValueChange={setSalaryRange}
                      max={100000}
                      step={5000}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>৳{salaryRange[0].toLocaleString()}</span>
                    <span>৳{salaryRange[1].toLocaleString()}</span>
                  </div>
                </div>

                {/* Verified Only */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verified"
                    checked={verifiedOnly}
                    onCheckedChange={(checked) => setVerifiedOnly(checked as boolean)}
                  />
                  <Label htmlFor="verified" className="cursor-pointer">
                    Verified employers only
                  </Label>
                </div>

                <Button className="w-full">Apply Filters</Button>
              </CardContent>
            </Card>
          </aside>

          {/* Jobs List */}
          <main className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {jobs.length} Jobs Found
              </h2>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="salary-high">Highest Salary</SelectItem>
                  <SelectItem value="salary-low">Lowest Salary</SelectItem>
                  <SelectItem value="most-applied">Most Applied</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {job.featured && (
                            <Badge variant="secondary">Featured</Badge>
                          )}
                          {job.employer.verified && (
                            <Badge variant="default" className="bg-accent">
                              <Star className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          <Badge variant="outline">{job.job_type}</Badge>
                        </div>
                        <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                        <CardDescription className="text-base">
                          {job.employer.name}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          ৳{job.salary.toLocaleString()}
                        </div>
                        {job.salary_negotiable && (
                          <div className="text-sm text-muted-foreground">Negotiable</div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {job.description}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        {job.location}
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        {job.shift_type}
                      </div>
                      <div className="flex items-center text-sm">
                        <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                        {job.duty_time}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {job.applications_count} applications
                      </span>
                      <div className="flex gap-2">
                        <Link to={`/jobs/${job.id}`}>
                          <Button variant="outline">View Details</Button>
                        </Link>
                        <Link to={`/jobs/${job.id}/apply`}>
                          <Button>Apply Now</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
