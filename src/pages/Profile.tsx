import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Briefcase, 
  MessageSquare, 
  UserPlus, 
  UserCheck,
  Building2,
  Users,
  Star,
  Shield,
  Clock,
  User,
  Check,
  X,
  BadgeCheck
} from "lucide-react";
import RatingDisplay from "@/components/profile/RatingDisplay";
import ReviewList from "@/components/profile/ReviewList";
import ReviewForm from "@/components/profile/ReviewForm";

interface ProfileData {
  id: string;
  name: string;
  company_name: string | null;
  avatar_url: string | null;
  location: string | null;
  verified: boolean;
  verified_percentage: number;
  skills: string[] | null;
  shift_preferences: string[] | null;
  gender: string | null;
  age: number | null;
  marital_status: string | null;
  cv_url: string | null;
  certificate_url: string | null;
  expected_salary_min: number | null;
  expected_salary_max: number | null;
}

interface Job {
  id: string;
  title: string;
  location: string;
  salary: number | null;
  job_type: string;
  shift_type: string;
  created_at: string;
  status: string;
}

interface PendingApplication {
  id: string;
  job_id: string;
  job_title: string;
  status: string;
}

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [pendingApplications, setPendingApplications] = useState<PendingApplication[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProfileData();
    }
  }, [id]);

  const fetchProfileData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      // Get current user's role
      if (user) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();
        setCurrentUserRole(roleData?.role || null);
      }

      // Fetch profile from public_profiles view
      const { data: profileData, error: profileError } = await supabase
        .from("public_profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (profileError) throw profileError;
      if (profileData) {
        const mappedProfile: ProfileData = {
          id: profileData.id ?? "",
          name: profileData.name ?? "",
          company_name: profileData.company_name ?? null,
          avatar_url: profileData.avatar_url ?? null,
          location: profileData.location ?? null,
          verified: profileData.verified ?? false,
          verified_percentage: profileData.verified_percentage ?? 0,
          skills: profileData.skills ?? null,
          shift_preferences: profileData.shift_preferences ?? null,
          gender: profileData.gender ?? null,
          age: profileData.age ?? null,
          marital_status: profileData.marital_status ?? null,
          cv_url: profileData.cv_url ?? null,
          certificate_url: profileData.certificate_url ?? null,
          expected_salary_min: (profileData as any).expected_salary_min ?? null,
          expected_salary_max: (profileData as any).expected_salary_max ?? null,
        };
        setProfile(mappedProfile);
      }

      // Get the profile's role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", id)
        .single();
      setUserRole(roleData?.role || null);

      // If employer, fetch their active jobs
      if (roleData?.role === "employer") {
        const { data: jobsData } = await supabase
          .from("jobs")
          .select("*")
          .eq("employer_id", id)
          .eq("status", "open")
          .order("created_at", { ascending: false });
        setJobs(jobsData || []);
      }

      // Fetch follower count
      const { count } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", id);
      setFollowerCount(count || 0);

      // Check if current user is following
      if (user) {
        const { data: followData } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", user.id)
          .eq("following_id", id)
          .maybeSingle();
        setIsFollowing(!!followData);
      }

      // Fetch average rating
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("rating")
        .eq("reviewed_id", id);

      if (reviewsData && reviewsData.length > 0) {
        const avg = reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length;
        setAverageRating(Math.round(avg * 10) / 10);
        setReviewCount(reviewsData.length);
      }

      // If current user is employer and viewing a caregiver, check for pending applications
      if (user && roleData?.role !== "employer") {
        const { data: currentUserRoleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (currentUserRoleData?.role === "employer") {
          // Get applications from this caregiver to any of the employer's jobs
          const { data: applicationsData } = await supabase
            .from("applications")
            .select(`
              id,
              job_id,
              status,
              jobs!inner(title, employer_id)
            `)
            .eq("caregiver_id", id)
            .eq("jobs.employer_id", user.id)
            .eq("status", "pending");

          if (applicationsData) {
            setPendingApplications(
              applicationsData.map((app: any) => ({
                id: app.id,
                job_id: app.job_id,
                job_title: app.jobs?.title || "Job",
                status: app.status,
              }))
            );
          }
        }
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUserId) {
      navigate("/login");
      return;
    }

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", id);
        
        setIsFollowing(false);
        setFollowerCount(prev => prev - 1);
        toast({ title: "Unfollowed" });
      } else {
        await supabase
          .from("follows")
          .insert({ follower_id: currentUserId, following_id: id });
        
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
        toast({ title: "Following" });
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!currentUserId) {
      navigate("/login");
      return;
    }

    if (!profile) return;

    // Build query params with partner info
    const partnerName = profile.company_name || profile.name;
    const params = new URLSearchParams({
      tab: "messages",
      partnerId: id!,
      partnerName: partnerName,
    });
    if (profile.company_name) {
      params.set("partnerCompany", profile.company_name);
    }

    // Navigate based on current user's role
    if (currentUserRole === "employer") {
      navigate(`/dashboard/company?${params.toString()}`);
    } else {
      navigate(`/dashboard/caregiver?${params.toString()}`);
    }
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    fetchProfileData();
  };

  const handleApplicationAction = async (applicationId: string, newStatus: "accepted" | "rejected") => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", applicationId);

      if (error) throw error;

      // If accepted, send a message
      if (newStatus === "accepted" && currentUserId) {
        await supabase
          .from("messages")
          .insert({
            sender_id: currentUserId,
            receiver_id: id,
            text: "Your application has been accepted! Let's discuss further.",
          });
      }

      // Remove from pending list
      setPendingApplications(prev => prev.filter(app => app.id !== applicationId));

      toast({
        title: "Success",
        description: `Application ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update application",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const isCompany = userRole === "employer";
  const isCaregiver = userRole === "caregiver" || userRole === "nurse";
  const isEmployerViewingCaregiver = currentUserRole === "employer" && isCaregiver;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <Skeleton className="h-20 w-20 rounded-full mx-auto" />
              <Skeleton className="h-6 w-48 mx-auto mt-4" />
              <Skeleton className="h-4 w-32 mx-auto mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold">Profile not found</h1>
          <p className="text-muted-foreground mt-2">This profile doesn't exist.</p>
          <Button onClick={() => navigate("/")} className="mt-4">Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardHeader className="text-center pb-2">
            <Avatar className="h-20 w-20 mx-auto mb-3">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {(profile.company_name || profile.name)?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl flex items-center justify-center gap-2">
              {isCompany ? profile.company_name || profile.name : profile.name}
              {profile.verified && (
                <Shield className="h-5 w-5 text-green-500" />
              )}
            </CardTitle>
            {profile.location && (
              <CardDescription className="flex items-center justify-center gap-1">
                <MapPin className="h-3 w-3" />
                {profile.location}
              </CardDescription>
            )}
            
            {/* Stats Row - Different for Company vs Caregiver */}
            <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
              {/* Company Stats: Followers + Active Jobs */}
              {isCompany && (
                <>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {followerCount} Followers
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {jobs.length} Active Jobs
                  </Badge>
                </>
              )}
              
              {/* Caregiver Stats: Verification Badge (no followers) */}
              {isCaregiver && (
                <>
                  {profile.verified ? (
                    <Badge className="flex items-center gap-1 bg-green-600 text-white">
                      <BadgeCheck className="h-3 w-3" />
                      Verified Caregiver
                    </Badge>
                  ) : profile.verified_percentage > 0 ? (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {profile.verified_percentage}% Verified
                    </Badge>
                  ) : null}
                </>
              )}
              
              {/* Rating - shown for all */}
              {averageRating !== null && (
                <Badge variant="default" className="flex items-center gap-1 bg-amber-500">
                  <Star className="h-3 w-3" />
                  {averageRating} ({reviewCount})
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="flex gap-3 justify-center pt-4">
            {/* Follow Button - Only for Companies */}
            {isCompany && (
              <Button
                variant={isFollowing ? "secondary" : "default"}
                onClick={handleFollow}
                disabled={followLoading || currentUserId === id}
                className="flex-1 max-w-[140px]"
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
            )}
            
            {/* Message Button - Always shown */}
            <Button
              variant="outline"
              onClick={handleMessage}
              disabled={messageLoading || currentUserId === id}
              className={isCaregiver ? "flex-1 max-w-[200px]" : "flex-1 max-w-[140px]"}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
          </CardContent>
        </Card>

        {/* Caregiver Details */}
        {isCaregiver && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {profile.gender && (
                  <div>
                    <span className="text-muted-foreground">Gender:</span>
                    <span className="ml-2 font-medium capitalize">{profile.gender}</span>
                  </div>
                )}
                {profile.age && (
                  <div>
                    <span className="text-muted-foreground">Age:</span>
                    <span className="ml-2 font-medium">{profile.age} years</span>
                  </div>
                )}
                {profile.marital_status && (
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <span className="ml-2 font-medium capitalize">{profile.marital_status}</span>
                  </div>
                )}
              </div>

              {profile.skills && profile.skills.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground block mb-2">Skills</span>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {(profile.expected_salary_min || profile.expected_salary_max) && (
                <div>
                  <span className="text-sm text-muted-foreground block mb-2">Expected Salary</span>
                  <Badge variant="default" className="bg-green-600 text-white">
                    ৳{profile.expected_salary_min?.toLocaleString() || "0"} - ৳{profile.expected_salary_max?.toLocaleString() || "N/A"} /month
                  </Badge>
                </div>
              )}

              {profile.shift_preferences && profile.shift_preferences.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground block mb-2">Shift Preferences</span>
                  <div className="flex flex-wrap gap-2">
                    {profile.shift_preferences.map((pref, i) => (
                      <Badge key={i} variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {pref}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {(profile.cv_url || profile.certificate_url) && (
                <div className="flex gap-2 pt-2">
                  {profile.cv_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={profile.cv_url} target="_blank" rel="noopener noreferrer">
                        View CV
                      </a>
                    </Button>
                  )}
                  {profile.certificate_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={profile.certificate_url} target="_blank" rel="noopener noreferrer">
                        View Certificate
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Company Jobs */}
        {isCompany && (
          <>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Active Jobs
            </h2>
            
            {jobs.length === 0 ? (
              <Card className="mb-6">
                <CardContent className="py-8 text-center">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No active jobs at the moment</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3 mb-6">
                {jobs.map((job) => (
                  <Card 
                    key={job.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/jobs?job=${job.id}`)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{job.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </span>
                        {job.salary && (
                          <span>৳{job.salary.toLocaleString()}/month</span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">{job.job_type}</Badge>
                        <Badge variant="secondary" className="text-xs">{job.shift_type}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Rating Display */}
        <RatingDisplay 
          averageRating={averageRating} 
          reviewCount={reviewCount} 
        />

        {/* Review Form Button */}
        {currentUserId && currentUserId !== id && (
          <div className="mb-6">
            {showReviewForm ? (
              <ReviewForm
                reviewedId={id!}
                reviewerId={currentUserId}
                onSuccess={handleReviewSubmitted}
                onCancel={() => setShowReviewForm(false)}
              />
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setShowReviewForm(true)}
                className="w-full"
              >
                <Star className="h-4 w-4 mr-2" />
                Write a Review
              </Button>
            )}
          </div>
        )}

        {/* Reviews List */}
        <ReviewList reviewedId={id!} />
      </div>

      {/* Sticky Action Bar for Employers viewing Caregivers with pending applications */}
      {isEmployerViewingCaregiver && pendingApplications.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg p-4 z-50">
          <div className="container mx-auto max-w-2xl">
            <div className="mb-2 text-sm text-muted-foreground text-center">
              Pending application for: <span className="font-medium text-foreground">{pendingApplications[0].job_title}</span>
            </div>
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => handleApplicationAction(pendingApplications[0].id, "accepted")}
                disabled={actionLoading}
              >
                <Check className="mr-2 h-4 w-4" />
                Accept Application
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleApplicationAction(pendingApplications[0].id, "rejected")}
                disabled={actionLoading}
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
