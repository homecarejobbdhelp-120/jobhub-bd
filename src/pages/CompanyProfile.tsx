import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import JobCard from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, CheckCircle, MessageCircle, UserPlus, UserCheck, Star, Trash2, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CompanyProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // ✨ Follow States
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

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

    // 4. Get Reviews
    const { data: reviewsData } = await supabase
      .from("reviews")
      .select("*, profiles:reviewer_id(name, avatar_url)")
      .eq("company_id", id)
      .order("created_at", { ascending: false });
    setReviews(reviewsData || []);

    // 5. ✨ Get Follow Status & Count
    if (id) {
        // Count
        const { count } = await supabase
            .from("follows")
            .select("*", { count: 'exact', head: true })
            .eq("company_id", id);
        setFollowerCount(count || 0);

        // Status (If user logged in)
        if (user) {
            const { data: followData } = await supabase
                .from("follows")
                .select("*")
                .eq("company_id", id)
                .eq("follower_id", user.id)
                .single();
            setIsFollowing(!!followData);
        }
    }
  };

  // ✨ Handle Follow / Unfollow
  const handleFollow = async () => {
    if (!currentUser) return navigate("/login");
    if (followLoading) return;

    setFollowLoading(true);

    if (isFollowing) {
        // Unfollow Logic
        const { error } = await supabase
            .from("follows")
            .delete()
            .eq("company_id", id)
            .eq("follower_id", currentUser.id);
        
        if (!error) {
            setIsFollowing(false);
            setFollowerCount(prev => prev - 1);
            toast({ title: "Unfollowed successfully" });
        }
    } else {
        // Follow Logic
        const { error } = await supabase
            .from("follows")
            .insert({
                company_id: id,
                follower_id: currentUser.id
            });
        
        if (!error) {
            setIsFollowing(true);
            setFollowerCount(prev => prev + 1);
            toast({ title: "Following!", className: "bg-emerald-600 text-white" });

            // 🔔 Send Notification to Company
            await supabase.from("notifications").insert({
                user_id: id, // To Company
                title: "New Follower 🎉",
                message: `${currentUser.user_metadata?.name || "Someone"} started following your company.`,
                type: "new_follower",
                link: `/profile/${currentUser.id}`
            });
        }
    }
    setFollowLoading(false);
  };

  const handleSubmitReview = async () => {
    if (!currentUser) return navigate("/login");
    
    const wordCount = comment.trim().split(/\s+/).length;
    if (rating === 0) return toast({ title: "Please select a rating", variant: "destructive" });
    if (wordCount < 10) return toast({ title: "Too short", description: "Please write at least 10 words.", variant: "destructive" });

    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
        company_id: id,
        reviewer_id: currentUser.id,
        rating: rating,
        comment: comment
    });
    setSubmitting(false);

    if (!error) {
        toast({ title: "Review submitted!", className: "bg-emerald-600 text-white" });
        setComment("");
        setRating(0);
        fetchData();
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if(!confirm("Are you sure?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
    if (!error) {
        toast({ title: "Review deleted" });
        fetchData();
    }
  };

  const avgRating = reviews.length ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : "N/A";

  if (!profile) return <div className="p-10 text-center">Loading...</div>;
  const isOwner = currentUser?.id === id;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <Navbar />

      {/* HEADER */}
      <div className="bg-white shadow-sm mb-6">
        <div className="h-48 md:h-80 bg-gradient-to-r from-slate-700 to-slate-900 relative"></div>

        <div className="container mx-auto px-4 pb-6">
            <div className="flex flex-col md:flex-row items-end -mt-16 relative z-10 gap-6">
                
                {/* Logo */}
                <div className="rounded-full p-1 bg-white shadow-xl mx-auto md:mx-0">
                    <Avatar className="h-32 w-32 md:h-44 md:w-44 border-4 border-white rounded-full bg-slate-100">
                        <AvatarImage src={profile.avatar_url} className="object-cover" />
                        <AvatarFallback className="text-4xl font-bold text-emerald-600 bg-emerald-50">
                        {profile.company_name?.[0]}
                        </AvatarFallback>
                    </Avatar>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left mb-2 w-full">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-4xl font-black text-slate-900 flex items-center justify-center md:justify-start gap-2">
                                {profile.company_name}
                                {profile.verified && <CheckCircle className="h-6 w-6 text-blue-500 fill-white" />}
                            </h1>
                            <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-3 mt-1">
                                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {profile.address || "Dhaka, Bangladesh"}</span>
                                <span className="flex items-center gap-1 text-orange-500 font-bold"><Star className="h-4 w-4 fill-orange-500" /> {avgRating}</span>
                                <span className="font-bold text-slate-700">{followerCount} Followers</span>
                            </p>
                        </div>

                        {/* Buttons */}
                        {!isOwner && (
                            <div className="flex gap-3 justify-center md:justify-end">
                                <Button 
                                    onClick={handleFollow} 
                                    disabled={followLoading}
                                    className={`rounded-xl font-bold px-6 ${isFollowing ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                >
                                    {isFollowing ? <><UserCheck className="mr-2 h-4 w-4" /> Following</> : <><UserPlus className="mr-2 h-4 w-4" /> Follow</>}
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

            <div className="mt-8 md:mt-4 max-w-4xl">
                 <h3 className="font-bold text-slate-900 text-lg mb-2">About Us</h3>
                 <p className="text-slate-600 leading-relaxed">
                    {profile.bio || "Welcome to our company profile. We are dedicated to providing the best care services."}
                 </p>
            </div>
        </div>
      </div>

      {/* TABS */}
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

            <TabsContent value="jobs" className="space-y-4 max-w-4xl">
                {jobs.map((job) => (
                    <JobCard 
                        key={job.id} 
                        {...job}
                        company_name={profile.company_name}
                        avatar_url={profile.avatar_url}
                        hideApply={isOwner} 
                        userRole={currentUser ? 'caregiver' : undefined} // For Apply Logic
                    />
                ))}
            </TabsContent>

            <TabsContent value="reviews" className="max-w-3xl">
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
                            placeholder="Share your experience (min 10 words)..."
                            className="bg-slate-50 border-slate-200 rounded-xl min-h-[100px] mb-4"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <Button onClick={handleSubmitReview} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl">
                            {submitting ? "Posting..." : "Post Review"}
                        </Button>
                    </div>
                )}

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
                                            <h5 className="font-bold text-slate-900">{review.profiles?.name || "Anonymous"}</h5>
                                            <div className="flex items-center gap-1 mt-1">
                                                {Array.from({ length: review.rating }).map((_, i) => (
                                                    <Star key={i} className="h-3 w-3 text-orange-500 fill-orange-500" />
                                                ))}
                                                <span className="text-xs text-slate-400 ml-2">{new Date(review.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        {currentUser?.id === review.reviewer_id && (
                                            <Button onClick={() => handleDeleteReview(review.id)} variant="ghost" size="icon" className="text-red-400 hover:bg-red-50 hover:text-red-600">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-slate-600 mt-3 text-sm leading-relaxed">{review.comment}</p>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-slate-400 py-10">No reviews yet.</p>
                    )}
                </div>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CompanyProfile;