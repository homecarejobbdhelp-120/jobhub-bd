import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const PostJobTab = () => {
  const navigate = useNavigate();
  const [posting, setPosting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    salary: "",
    salary_negotiable: false,
    job_type: "Full-time",
    shift_type: "8am-8pm",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // If salary is not negotiable, require a salary amount
    if (!formData.salary_negotiable && !formData.salary) {
      toast({
        title: "Error",
        description: "Please enter a salary amount or mark it as negotiable",
        variant: "destructive",
      });
      return;
    }

    setPosting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("jobs")
        .insert([{
          title: formData.title,
          description: formData.description,
          location: formData.location,
          salary: formData.salary_negotiable ? 0 : (formData.salary ? parseFloat(formData.salary) : null),
          salary_negotiable: formData.salary_negotiable,
          job_type: formData.job_type,
          shift_type: formData.shift_type as "8am-8pm" | "8pm-8am" | "24hr" | "10hr",
          duty_time: formData.shift_type,
          employer_id: user.id,
          status: "open",
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job posted successfully!",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        location: "",
        salary: "",
        salary_negotiable: false,
        job_type: "Full-time",
        shift_type: "8am-8pm",
      });

      // Navigate to jobs tab
      navigate("/dashboard/company?tab=jobs");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post job",
        variant: "destructive",
      });
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="pb-20">
      <Card>
        <CardHeader>
          <CardTitle>Post a New Job</CardTitle>
          <CardDescription>Fill in the details to post a new job opening</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Home Care Nurse"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the job responsibilities, requirements, etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., Dhaka, Bangladesh"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">Salary (BDT)</Label>
              <Input
                id="salary"
                type="number"
                placeholder={formData.salary_negotiable ? "Negotiable" : "e.g., 15000"}
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                disabled={formData.salary_negotiable}
                className={formData.salary_negotiable ? "bg-muted" : ""}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="salary_negotiable"
                checked={formData.salary_negotiable}
                onCheckedChange={(checked) => 
                  setFormData({ 
                    ...formData, 
                    salary_negotiable: checked as boolean,
                    salary: checked ? "" : formData.salary 
                  })
                }
              />
              <Label htmlFor="salary_negotiable" className="text-sm font-normal cursor-pointer">
                Salary is Negotiable
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_type">Job Type</Label>
              <Select
                value={formData.job_type}
                onValueChange={(value) => setFormData({ ...formData, job_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shift_type">Shift Type</Label>
              <Select
                value={formData.shift_type}
                onValueChange={(value) => setFormData({ ...formData, shift_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8am-8pm">8am-8pm (Day)</SelectItem>
                  <SelectItem value="8pm-8am">8pm-8am (Night)</SelectItem>
                  <SelectItem value="24hr">24 Hour</SelectItem>
                  <SelectItem value="10hr">10 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={posting}>
              {posting ? "Posting..." : "Post Job"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostJobTab;
