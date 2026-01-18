import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, MapPin, Banknote, Clock, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PostJob = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [companyName, setCompanyName] = useState("");

  // Form States
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [jobType, setJobType] = useState("Full-Time");
  const [shift, setShift] = useState("Day Shift");
  const [description, setDescription] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setUser(user);

    // Get Company Name for Notification
    const { data: profile } = await supabase.from('profiles').select('company_name').eq('id', user.id).single();
    if (profile) setCompanyName(profile.company_name || "A Company");
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ১. জব পোস্ট করা (Insert Job)
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .insert({
          title,
          employer_id: user.id,
          location,
          salary: parseInt(salary) || 0,
          salary_negotiable: false, // চাইলে পরে ইনপুট নিতে পারেন
          job_type: jobType,
          shift_type: shift,
          description,
          status: 'open'
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // ২. ফলোয়ারদের খুঁজে বের করা (Find Followers)
      const { data: followers } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("company_id", user.id);

      // ৩. সবাইকে নোটিফিকেশন পাঠানো (Send Bulk Notifications)
      if (followers && followers.length > 0) {
        const notifications = followers.map((f) => ({
          user_id: f.follower_id, // কে পাবে
          title: "নতুন চাকরির খবর 🔔",
          message: `${companyName} একটি নতুন নিয়োগ বিজ্ঞপ্তি দিয়েছে: ${title}`,
          link: `/jobs/${jobData.id}`, // ক্লিক করলে জবে নিয়ে যাবে
          type: "job_alert"
        }));

        const { error: notifError } = await supabase.from("notifications").insert(notifications);
        if (notifError) console.error("Notification error:", notifError);
      }

      toast({
        title: "Success!",
        description: "জব পোস্ট হয়েছে এবং ফলোয়ারদের নোটিফিকেশন পাঠানো হয়েছে।",
        className: "bg-emerald-600 text-white"
      });

      // Redirect to Feed or Dashboard
      setTimeout(() => navigate("/feed"), 1500);

    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <Navbar />
      
      <div className="container mx-auto px-4 mt-8 max-w-2xl">
        <Card className="shadow-lg border-slate-100">
          <CardHeader className="bg-emerald-50 rounded-t-xl border-b border-emerald-100">
            <CardTitle className="text-xl font-bold text-emerald-800 flex items-center gap-2">
              <Briefcase className="h-6 w-6" /> নতুন জব পোস্ট করুন
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handlePostJob} className="space-y-6">
              
              {/* Job Title */}
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">কাজের শিরোনাম (Job Title)</Label>
                <Input placeholder="যেমন: পেশেন্ট কেয়ারগিভার" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>

              {/* Location & Salary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">এলাকা (Location)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input className="pl-9" placeholder="ঢাকা, গুলশান" value={location} onChange={(e) => setLocation(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">বেতন (Salary)</Label>
                  <div className="relative">
                    <Banknote className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input className="pl-9" type="number" placeholder="BDT 20000" value={salary} onChange={(e) => setSalary(e.target.value)} required />
                  </div>
                </div>
              </div>

              {/* Type & Shift */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">কাজের ধরণ</Label>
                  <Select onValueChange={setJobType} defaultValue={jobType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-Time">Full-Time</SelectItem>
                      <SelectItem value="Part-Time">Part-Time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">শিফট (Shift)</Label>
                  <Select onValueChange={setShift} defaultValue={shift}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Day Shift">Day Shift (দিন)</SelectItem>
                      <SelectItem value="Night Shift">Night Shift (রাত)</SelectItem>
                      <SelectItem value="24 Hours">24 Hours (আবাসিক)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">কাজের বিবরণ</Label>
                <Textarea 
                  placeholder="কাজের বিস্তারিত লিখুন..." 
                  className="min-h-[150px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required 
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 text-lg rounded-xl">
                {loading ? "পোস্ট হচ্ছে..." : (
                  <span className="flex items-center">
                    জব পাবলিশ করুন <Send className="ml-2 h-5 w-5" />
                  </span>
                )}
              </Button>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostJob;