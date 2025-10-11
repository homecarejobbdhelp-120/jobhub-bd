import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, DollarSign, Star, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [jobType, setJobType] = useState("");

  // Mock featured jobs - will be replaced with real data
  const featuredJobs = [
    {
      id: "1",
      title: "Full-Time Elder Care Assistant",
      description: "Looking for experienced caregiver for elderly patient with mobility issues",
      location: "Dhaka, Gulshan",
      salary: 25000,
      salary_negotiable: true,
      job_type: "full-time",
      shift_type: "8am-8pm",
      featured: true,
      employer: { name: "Care Home Services", verified: true }
    },
    {
      id: "2",
      title: "Night Shift Care Specialist",
      description: "Need professional caregiver for night shift assistance",
      location: "Dhaka, Dhanmondi",
      salary: 30000,
      salary_negotiable: false,
      job_type: "full-time",
      shift_type: "8pm-8am",
      featured: true,
      employer: { name: "Comfort Care Ltd", verified: true }
    },
    {
      id: "3",
      title: "24-Hour Live-in Caregiver",
      description: "Seeking dedicated live-in caregiver for patient with special needs",
      location: "Dhaka, Banani",
      salary: 45000,
      salary_negotiable: true,
      job_type: "live-in",
      shift_type: "24hr",
      featured: true,
      employer: { name: "Family Care Services", verified: false }
    }
  ];

  const handleSearch = () => {
    // Navigate to jobs page with filters
    window.location.href = `/jobs?keyword=${searchKeyword}&location=${searchLocation}&type=${jobType}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/5 to-background py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Find Your Perfect Home Care Job
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connecting compassionate caregivers with families in need across Bangladesh
            </p>
          </div>

          {/* Search Bar */}
          <Card className="max-w-4xl mx-auto shadow-lg">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Job title or keyword"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Location"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-Time</SelectItem>
                    <SelectItem value="part-time">Part-Time</SelectItem>
                    <SelectItem value="live-in">Live-In</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full mt-4" size="lg" onClick={handleSearch}>
                Search Jobs
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Featured Jobs</h2>
              <p className="text-muted-foreground">Top opportunities from verified employers</p>
            </div>
            <Link to="/jobs">
              <Button variant="outline">
                View All Jobs
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">Featured</Badge>
                    {job.employer.verified && (
                      <Badge variant="default" className="bg-accent">
                        <Star className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {job.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {job.shift_type}
                    </div>
                    <div className="flex items-center font-semibold text-foreground">
                      <DollarSign className="h-4 w-4 mr-2" />
                      ৳{job.salary.toLocaleString()}
                      {job.salary_negotiable && " (Negotiable)"}
                    </div>
                  </div>
                  <Link to={`/jobs/${job.id}`}>
                    <Button className="w-full">View Details</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>For Caregivers</CardTitle>
                <CardDescription>
                  Find your next opportunity and advance your career
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/jobs">
                  <Button variant="outline" className="w-full justify-start">
                    Browse All Jobs
                  </Button>
                </Link>
                <Link to="/auth?mode=signup&role=caregiver">
                  <Button variant="outline" className="w-full justify-start">
                    Create Caregiver Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>For Employers</CardTitle>
                <CardDescription>
                  Find qualified caregivers for your loved ones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/post-job">
                  <Button variant="outline" className="w-full justify-start">
                    Post a Job
                  </Button>
                </Link>
                <Link to="/auth?mode=signup&role=employer">
                  <Button variant="outline" className="w-full justify-start">
                    Create Employer Account
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">HomeCare Job BD</h3>
              <p className="text-sm text-muted-foreground">
                Connecting caregivers and families across Bangladesh with trust and professionalism.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/jobs" className="text-muted-foreground hover:text-primary">Browse Jobs</Link></li>
                <li><Link to="/post-job" className="text-muted-foreground hover:text-primary">Post a Job</Link></li>
                <li><Link to="/auth" className="text-muted-foreground hover:text-primary">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <p className="text-sm text-muted-foreground">
                Email: homecarejobbd.help@gmail.com
              </p>
              <Link to="/contact">
                <Button variant="link" className="px-0 text-primary">
                  Send us a message
                </Button>
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2025 HomeCare Job BD. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
