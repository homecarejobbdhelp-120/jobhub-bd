import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import JobCard from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Globe, Phone, Mail, Building2, CheckCircle, MessageCircle, Edit, Share2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const CompanyProfile = () => {
  const { id } = useParams(); // URL থেকে কোম্পানি ID নিচ্ছি
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchCompanyData();
  }, [id]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      
      // ১. বর্তমান ইউজার চেক (Edit বাটন দেখানোর জন্য)
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // ২. কোম্পানির প্রোফাইল ফেচ করা
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // ৩. এই কোম্পানির পোস্ট করা জবগুলো আনা
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("*, profiles(name, company_name, avatar_url)")
        .eq("employer_id", id)
        .eq("status", "open") // শুধু ওপেন জব দেখাবো
        .order("created_at", { ascending: false });

      setJobs(jobsData || []);

    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "প্রোফাইল লোড করা যায়নি।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    // চ্যাট পেজে রিডাইরেক্ট (ভবিষ্যতে চ্যাট ইমপ্লিমেন্ট করলে এটা কাজ করবে)
    navigate(`/chat/${id}`); 
    toast({
        title: "মেসেজ অপশন",
        description: "চ্যাট ফিচার শীঘ্রই চালু হবে!", 
        className: "bg-blue-500 text-white"
    });
  };

  const isOwner = currentUser?.id === id;

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  if (!profile) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Company not found</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 md:pb-10">
      <Navbar />

      {/* HEADER SECTION (Facebook Style) */}
      <div className="bg-white shadow-sm pb-4">
        <div className="relative h-48 md:h-64 w-full bg-gradient-to-r from-blue-600 to-emerald-600">
           {/* Cover Photo Placeholder */}
           <div className="absolute inset-0 bg-black/10"></div>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-16 md:-mt-12 mb-4 relative z-10">
            {/* Avatar */}
            <div className="rounded-full p-1.5 bg-white shadow-lg">
              <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-white rounded-full bg-slate-100">
                <AvatarImage src={profile.avatar_url} className="object-cover" />
                <AvatarFallback className="text-4xl font-bold text-emerald-600 bg-emerald-50">
                  {profile.company_name?.[0] || profile.name?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Basic Info */}
            <div className="flex-1 mt-2 md:mt-0 md:mb-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900">
                  {profile.company_name || profile.name}
                </h1>
                {profile.verified && (
                   <CheckCircle className="h-6 w-6 text-blue-500 fill-white" />
                )}
              </div>
              <p className="text-slate-500 font-medium flex items-center gap-1 mt-1">
                 <MapPin className="h-4 w-4" /> {profile.address || "Location not added"}
              </p>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex gap-3 mb-2">
              {isOwner ? (
                <Button onClick={() => navigate("/settings")} variant="outline" className="gap-2 border-slate-300">
                  <Edit className="h-4 w-4" /> Edit Profile
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="gap-2 border-slate-300">
                    <Share2 className="h-4 w-4" /> Share
                  </Button>
                  <Button onClick={handleMessage} className="bg-blue-600 hover:bg-blue-700 gap-2 font-bold shadow-md">
                    <MessageCircle className="h-4 w-4" /> Message
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT TABS */}
      <div className="container mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Sidebar: Info */}
          <div className="md:col-span-1 space-y-6">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">About Company</h3>
                <div className="space-y-4 text-sm">
                   {profile.bio && (
                     <p className="text-slate-600 leading-relaxed">{profile.bio}</p>
                   )}
                   
                   <div className="space-y-3 pt-2">
                      {profile.website && (
                        <div className="flex items-center gap-3 text-slate-600">
                           <Globe className="h-5 w-5 text-slate-400" />
                           <a href={profile.website} target="_blank" className="hover:text-blue-600 hover:underline">{profile.website}</a>
                        </div>
                      )}
                      {profile.phone && (
                        <div className="flex items-center gap-3 text-slate-600">
                           <Phone className="h-5 w-5 text-slate-400" />
                           <span>{profile.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-slate-600">
                           <Building2 className="h-5 w-5 text-slate-400" />
                           <span>Member since {new Date(profile.created_at || Date.now()).getFullYear()}</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Right Content: Jobs */}
          <div className="md:col-span-2">
            <Tabs defaultValue="jobs" className="w-full">
              <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 mb-4 inline-flex">
                 <TabsList className="bg-transparent h-auto p-0 gap-2">
                    <TabsTrigger value="jobs" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 px-6 py-2 rounded-lg font-bold">
                       Active Jobs ({jobs.length})
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 px-6 py-2 rounded-lg font-bold">
                       Reviews
                    </TabsTrigger>
                 </TabsList>
              </div>

              <TabsContent value="jobs" className="space-y-4">
                 {jobs.length > 0 ? (
                    jobs.map((job) => (
                       <JobCard 
                          key={job.id} 
                          {...job}
                          company_name={profile.company_name}
                          avatar_url={profile.avatar_url}
                          employer_id={id}
                          // কোম্পানি মালিক হলে অ্যাপ্লাই দেখাবে না
                          hideApply={isOwner} 
                       />
                    ))
                 ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                       <p className="text-slate-400 font-medium">No active jobs posted yet.</p>
                    </div>
                 )}
              </TabsContent>

              <TabsContent value="reviews">
                 <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                    <p className="text-slate-400 font-medium">Reviews feature coming soon!</p>
                 </div>
              </TabsContent>
            </Tabs>
          </div>

        </div>
      </div>

      {/* ✨ MOBILE STICKY BOTTOM ACTION BAR */}
      {!isOwner && (
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40 flex gap-3">
           <Button variant="outline" className="flex-1 rounded-xl font-bold border-slate-300 text-slate-700">
              Follow
           </Button>
           <Button onClick={handleMessage} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-100">
              <MessageCircle className="mr-2 h-5 w-5" /> Message
           </Button>
        </div>
      )}

    </div>
  );
};

export default CompanyProfile;