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
  Users
} from "lucide-react";

interface CompanyProfile {
  id: string;
  name: string;
  company_name: string;
  avatar_url: string | null;
  location: string | null;
  verified_percentage: number;
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

const CompanyProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCompanyData();
    }
  }, [id]);

  const fetchCompanyData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      // Fetch company profile from public_profiles view (excludes sensitive data)
      const { data: profileData, error: profileError } = await supabase
        .from("public_profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (profileError) throw profileError;
      setCompany(profileData);

      // Fetch company's active jobs
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("*")
        .eq("employer_id", id)
        .eq("status", "open")
        .order("created_at", { ascending: false });

      setJobs(jobsData || []);

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
          .single();

        setIsFollowing(!!followData);
      }
    } catch (error) {
      console.error("Error fetching company data:", error);
      toast({
        title: "Error",
        description: "Failed to load company profile",
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
        // Unfollow
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", id);
        
        setIsFollowing(false);
        setFollowerCount(prev => prev - 1);
        toast({ title: "Unfollowed", description: "You are no longer following this company" });
      } else {
        // Follow
        await supabase
          .from("follows")
          .insert({ follower_id: currentUserId, following_id: id });
        
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
        toast({ title: "Following", description: "You are now following this company" });
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

    setMessageLoading(true);
    try {
      // Check if conversation already exists
      const { data: existingMessages } = await supabase
        .from("messages")
        .select("id")
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${currentUserId})`)
        .limit(1);

      if (existingMessages && existingMessages.length > 0) {
        // Conversation exists, navigate to messages
        navigate("/dashboard/caregiver?tab=messages");
      } else {
        // Create new conversation by sending initial message
        await supabase
          .from("messages")
          .insert({
            sender_id: currentUserId,
            receiver_id: id,
            text: "Hello! I'm interested in your company.",
          });
        
        toast({ title: "Message sent", description: "Conversation started!" });
        navigate("/dashboard/caregiver?tab=messages");
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      });
    } finally {
      setMessageLoading(false);
    }
  };

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

  if (!company) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold">Company not found</h1>
          <p className="text-muted-foreground mt-2">This company profile doesn't exist.</p>
          <Button onClick={() => navigate("/")} className="mt-4">Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Company Header */}
        <Card className="mb-6">
          <CardHeader className="text-center pb-2">
            <Avatar className="h-20 w-20 mx-auto mb-3">
              <AvatarImage src={company.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {(company.company_name || company.name)?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl">
              {company.company_name || company.name}
            </CardTitle>
            {company.location && (
              <CardDescription className="flex items-center justify-center gap-1">
                <MapPin className="h-3 w-3" />
                {company.location}
              </CardDescription>
            )}
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {followerCount} Followers
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {jobs.length} Active Jobs
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex gap-3 justify-center pt-4">
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
            <Button
              variant="outline"
              onClick={handleMessage}
              disabled={messageLoading || currentUserId === id}
              className="flex-1 max-w-[140px]"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
          </CardContent>
        </Card>

        {/* Active Jobs */}
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          Active Jobs
        </h2>
        
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No active jobs at the moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
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
      </div>
    </div>
  );
};

export default CompanyProfile;