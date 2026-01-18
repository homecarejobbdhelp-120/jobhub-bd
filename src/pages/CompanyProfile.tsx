import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import JobCard from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Globe, CheckCircle, MessageCircle, UserPlus, Star, Trash2, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext"; // ভাষা পরিবর্তন

const CompanyProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Review States
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    // 2. Get Profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();
    setProfile(profileData);

    // 3. Get Jobs
    const { data: jobsData } = await supabase
      .from("jobs")
      .select("*, profiles(name, company_name, avatar_url)")
      .eq("employer_id", id)
      .eq("status", "open");
    setJobs(jobsData || []);

    // 4. Get Reviews (with reviewer info)
    const { data: reviewsData } = await supabase
      .from("reviews")
      .select("*, profiles:reviewer_id(name, avatar_url)")
      .eq("company_id", id)
      .order("created_at", { ascending: false });
    setReviews(reviewsData || []);
  };

  const handleSubmitReview = async () => {
    if (!currentUser) return navigate("/login");
    
    // Validation: 15-20 words logic
    const wordCount = comment.trim().split(/\s+/).length;
    if (rating === 0) {
        return toast({ title: "Please select a rating", variant: "destructive" });
    }
    if (wordCount < 15) {
        return toast({ title: "মিনিমাম ১৫টি শব্দ লিখতে হবে", description: `আপনি লিখেছেন মাত্র ${wordCount}টি শব্দ।`, variant: "destructive" });
    }

    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
        company_id: id,
        reviewer_id: currentUser.id,
        rating: rating,
        comment: comment
    });

    setSubmitting(false);

    if (error) {
        toast({ title: "Error submitting review", variant: "destructive" });
    } else {
        toast({ title: "রিভিউ সফলভাবে জমা হয়েছে!", className: "bg-emerald-600 text-white" });
        setComment("");
        setRating(0);
        fetchData(); // Refresh list
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if(!confirm("আপনি কি নিশ্চিত এই রিভিউটি ডিলিট করতে চান?")) return;
    
    const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
    if (!error) {
        toast({ title: "Review deleted" });
        fetchData();
    }
  };

  // Calculate Average Rating
  const avgRating = reviews.length ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : "N/A";

  if (!profile) return <div className="p-10 text-center">Loading...</div>;
  const isOwner = currentUser?.id === id;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <Navbar />

      {/* FACEBOOK STYLE HEADER */}
      <div className="bg-white shadow-sm mb-6">
        {/* Cover Photo */}
        <div className="h-48 md:h-80 bg-gradient-to-r from-slate-700 to-slate-900 relative">
            {/* Cover photo logic can be added later */}
        </div>

        <div className="container mx-auto px-4 pb-6">
            <div className="flex flex-col md:flex-row items-end -mt-16 relative z-10 gap-6">
                
                {/* Logo / Avatar */}
                <div className="rounded-full p-1 bg-white shadow-xl mx-auto md:mx-0">
                    <Avatar className="h-32 w-32 md:h-44 md:w-44 border-4 border-white rounded-full bg-slate-100">
                        <AvatarImage src={profile.avatar_url} className="object-cover" />
                        <AvatarFallback className="text-4xl font-bold text-emerald-600 bg-emerald-50">
                        {profile.company_name?.[0]}
                        </AvatarFallback>
                    </Avatar>
                </div>

                {/* Name & Buttons (Inline Style) */}
                <div className="flex-1 text-center md:text-left mb-2 w-full">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        
                        {/* Name Section */}
                        <div>
                            <h1 className="text-2xl md:text-4xl font-black text-slate-900 flex items-center justify-center md:justify-start gap-2">
                                {profile.company_name}
                                {profile.verified && <CheckCircle className="h-6 w-6 text-blue-500 fill-white" />}
                            </h1>
                            <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-1 mt-1">
                                <MapPin className="h-4 w-4" /> {profile.address || "Location not added"} 
                                <span className="mx-2">•</span> 
                                <Star className="h-4 w-4 text-orange-500 fill-orange-500" /> {avgRating} ({reviews.length} Reviews)
                            </p>
                        </div>

                        {/* Action Buttons (Follow + Message) */}
                        {!isOwner && (
                            <div className="flex gap-3 justify-center md:justify-end">
                                <Button className="rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white px-6">
                                    <UserPlus className="mr-2 h-4 w-4" /> Follow
                                </Button>
                                <Button className="rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-6">
                                    <MessageCircle className="mr-2 h-4 w-4" /> Message
                                </Button>
                            </div>
                        )}
                         {isOwner && (
                            <Button onClick={() => navigate("/settings")} variant="outline" className="rounded-xl font-bold">
                                <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* DESCRIPTION TAB */}
            <div className="mt-8 md:mt-4 max-w-4xl">
                 <h3 className="font-bold text-slate-900 text-lg mb-2">About Us</h3>
                 <p className="text-slate-600 leading-relaxed">
                    {profile.bio || "No description added yet. Edit your profile to add a description about your company services and experience."}
                 </p>
            </div>
        </div>
      </div>

      {/* TABS SECTION */}
      <div className="container mx-auto px-4">
        <Tabs defaultValue="jobs" className="w-full">
            <TabsList className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-full md:w-auto flex justify-start h-auto mb-6">
                <TabsTrigger value="jobs" className="flex-1 md:flex-none px-6 py-3 rounded-lg font-bold data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
                    Active Jobs ({jobs.length})
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1 md:flex-none px-6 py-3 rounded-lg font-bold data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
                    Reviews ({reviews.length})
                </TabsTrigger>
            </TabsList>

            {/* ACTIVE JOBS */}
            <TabsContent value="jobs" className="space-y-4 max-w-4xl">
                {jobs.map((job) => (
                    <JobCard 
                        key={job.id} 
                        {...job}
                        company_name={profile.company_name}
                        avatar_url={profile.avatar_url}
                        hideApply={isOwner} // মালিক হলে অ্যাপ্লাই বাটন দেখাবে না
                    />
                ))}
            </TabsContent>

            {/* REVIEWS SYSTEM */}
            <TabsContent value="reviews" className="max-w-3xl">
                
                {/* Write Review Form (Only for non-owners) */}
                {!isOwner && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
                        <h4 className="font-bold text-lg mb-4">Write a Review</h4>
                        <div className="flex gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                    key={star}
                                    className={`h-8 w-8 cursor-pointer transition-colors ${rating >= star ? 'text-orange-500 fill-orange-500' : 'text-slate-300'}`}
                                    onClick={() => setRating(star)}
                                />
                            ))}
                        </div>
                        <Textarea 
                            placeholder="Share your experience working with this company (min 15 words)..."
                            className="bg-slate-50 border-slate-200 rounded-xl min-h-[100px] mb-4"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <Button onClick={handleSubmitReview} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl">
                            {submitting ? "Posting..." : "Post Review"}
                        </Button>
                    </div>
                )}

                {/* Review List */}
                <div className="space-y-4">
                    {reviews.length > 0 ? reviews.map((review) => (
                        <div key={review.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group">
                            <div className="flex items-start gap-4">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={review.profiles?.avatar_url} />
                                    <AvatarFallback>{review.profiles?.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h5 className="font-bold text-slate-900">{review.profiles?.name || "Anonymous User"}</h5>
                                            <div className="flex items-center gap-1 mt-1">
                                                {Array.from({ length: review.rating }).map((_, i) => (
                                                    <Star key={i} className="h-3 w-3 text-orange-500 fill-orange-500" />
                                                ))}
                                                <span className="text-xs text-slate-400 ml-2">
                                                    {new Date(review.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Delete Button (Only Reviewer can see) */}
                                        {currentUser?.id === review.reviewer_id && (
                                            <Button onClick={() => handleDeleteReview(review.id)} variant="ghost" size="icon" className="text-red-400 hover:bg-red-50 hover:text-red-600">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-slate-600 mt-3 text-sm leading-relaxed">
                                        {review.comment}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-slate-400 py-10">No reviews yet. Be the first to write one!</p>
                    )}
                </div>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CompanyProfile;