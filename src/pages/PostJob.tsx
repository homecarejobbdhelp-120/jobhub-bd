import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PostJob = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    job_type: "",
    location: "",
    salary: "",
    salary_negotiable: false,
    shift_type: "8am-8pm",
    duty_time: "",
    description: "",
    patient_details: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login as an employer to post a job.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("jobs").insert([{
        employer_id: user.id,
        title: formData.title,
        job_type: formData.job_type,
        location: formData.location,
        salary: parseFloat(formData.salary),
        salary_negotiable: formData.salary_negotiable,
        shift_type: formData.shift_type as "8am-8pm" | "8pm-8am" | "24hr" | "10hr",
        duty_time: formData.duty_time,
        description: formData.description,
        patient_details: formData.patient_details || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        status: "open" as const,
      }]);

      if (error) throw error;

      toast({
        title: "Job Posted Successfully!",
        description: "Your job listing is now live.",
      });

      navigate("/jobs");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <Briefcase className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Post a Job</h1>
            <p className="text-lg text-muted-foreground">
              Find the perfect caregiver or home service professional
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>
                Fill in the details below to post your job listing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Full-time Caregiver Needed"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="job_type">Job Type *</Label>
                    <Select
                      value={formData.job_type}
                      onValueChange={(value) => handleSelectChange("job_type", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Caregiver">Caregiver</SelectItem>
                        <SelectItem value="Nurse">Nurse</SelectItem>
                        <SelectItem value="Maid">Maid</SelectItem>
                        <SelectItem value="Babysitter">Babysitter</SelectItem>
                        <SelectItem value="Cook">Cook</SelectItem>
                        <SelectItem value="Driver">Driver</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="e.g., Dhaka, Bangladesh"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="salary">Salary (BDT) *</Label>
                    <Input
                      id="salary"
                      name="salary"
                      type="number"
                      placeholder="e.g., 15000"
                      value={formData.salary}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="shift_type">Shift Type *</Label>
                    <Select
                      value={formData.shift_type}
                      onValueChange={(value) => handleSelectChange("shift_type", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8am-8pm">Day Shift (8 AM - 8 PM)</SelectItem>
                        <SelectItem value="8pm-8am">Night Shift (8 PM - 8 AM)</SelectItem>
                        <SelectItem value="10hr">10 Hours</SelectItem>
                        <SelectItem value="24hr">24 Hours (Full Time)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="salary_negotiable"
                    name="salary_negotiable"
                    checked={formData.salary_negotiable}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="salary_negotiable" className="cursor-pointer">
                    Salary is negotiable
                  </Label>
                </div>

                <div>
                  <Label htmlFor="duty_time">Duty Time/Hours *</Label>
                  <Input
                    id="duty_time"
                    name="duty_time"
                    placeholder="e.g., 8:00 AM - 5:00 PM"
                    value={formData.duty_time}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      name="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      name="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe the job responsibilities, requirements, and any other relevant details..."
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="patient_details">Patient/Care Details (Optional)</Label>
                  <Textarea
                    id="patient_details"
                    name="patient_details"
                    placeholder="Provide details about the patient or care requirements..."
                    value={formData.patient_details}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Posting..." : "Post Job"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PostJob;
