import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Menu, X, Share2, Bell, User as UserIcon, LogOut, Settings, Briefcase, ExternalLink, Home, MessageSquare, PlusCircle } from "lucide-react";
import logo from "@/assets/homecarejobbd.png";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import WelcomePopup from "./WelcomePopup";
import ShareModal from "./ShareModal";
import AuthPopup from "./AuthPopup";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  job_id: string | null;
}

interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  notifications_enabled: boolean;
  push_notifications_enabled: boolean;
}

type UserRole = "admin" | "employer" | "caregiver" | "nurse" | null;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const fetchUserRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();
    if (data) setUserRole(data.role as UserRole);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchNotifications(session.user.id);
        fetchUserRole(session.user.id);
        
        // Check if we should show welcome popup
        const shouldShowWelcome = localStorage.getItem("showWelcomePopup");
        if (shouldShowWelcome === "true") {
          setShowWelcome(true);
          localStorage.removeItem("showWelcomePopup");
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchNotifications(session.user.id);
        fetchUserRole(session.user.id);
      } else {
        setProfile(null);
        setNotifications([]);
        setUnreadCount(0);
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) setProfile(data);
  };

  const fetchNotifications = async (userId: string) => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);
    
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    }
  };

  // Realtime subscription for notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev.slice(0, 4)]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast notification
          toast({
            title: "New Notification",
            description: (payload.new as Notification).title,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const markNotificationAsRead = async (notificationId: string) => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);
    
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleNotificationClick = (notification: Notification) => {
    markNotificationAsRead(notification.id);
    if (notification.job_id) {
      navigate(`/jobs`);
    }
    setNotificationsOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const isActiveRoute = (path: string) => location.pathname === path;

  const handleProtectedNavigation = async (path: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setPendingAction(path);
      setAuthMode("login");
      setShowAuthPopup(true);
      setMobileMenuOpen(false); // Close mobile menu when showing auth popup
    } else {
      navigate(path);
    }
  };

  // Redirect after successful login
  useEffect(() => {
    if (user && pendingAction) {
      navigate(pendingAction);
      setPendingAction(null);
      setShowAuthPopup(false);
    }
  }, [user, pendingAction, navigate]);

  return (
    <nav className={`bg-white border-b sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? "shadow-lg" : "shadow-sm"
    }`}>
      <div className="container mx-auto px-3 md:px-4 h-12 md:h-14">
        <div className="flex justify-between items-center h-full">
          {/* Logo Section */}
          <motion.button 
            onClick={scrollToTop}
            className="flex items-center gap-2 focus:outline-none group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <img src={logo} alt="HomeCare Job BD" className="h-8 md:h-10 transition-transform duration-300 group-hover:scale-105" />
          </motion.button>

          {/* Right Side Navigation */}
          <div className="flex items-center gap-2">
            {!user && (
              /* Guest User: Single compact "Sign in or Create" text link */
              <Link 
                to="/login"
                className="text-xs md:text-sm font-medium text-secondary hover:text-primary transition-colors whitespace-nowrap"
              >
                Sign in or Create
              </Link>
            )}

            {/* Hamburger Menu - Always visible */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-secondary hover:text-primary hover:bg-primary/10 relative"
                >
                  <Menu className="h-5 w-5" />
                  {user && unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white z-50">
                {user ? (
                  <>
                    <DropdownMenuLabel className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      {profile?.name || user.email?.split('@')[0]}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={() => navigate("/")}>
                      <Home className="mr-2 h-4 w-4" />
                      Home
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/jobs")}>
                      <Briefcase className="mr-2 h-4 w-4" />
                      Browse Jobs
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowShareModal(true)}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Website
                    </DropdownMenuItem>
                    
                    {/* Notifications */}
                    <DropdownMenuItem onClick={() => setNotificationsOpen(true)}>
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-auto h-5 min-w-5 flex items-center justify-center text-xs px-1.5">
                          {unreadCount}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    {/* Role-specific navigation */}
                    {(userRole === "caregiver" || userRole === "nurse") && (
                      <>
                        <DropdownMenuItem onClick={() => navigate("/dashboard/caregiver?tab=feed")}>
                          <Home className="mr-2 h-4 w-4" />
                          Job Feed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/dashboard/caregiver?tab=messages")}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Messages
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/dashboard/caregiver?tab=profile")}>
                          <UserIcon className="mr-2 h-4 w-4" />
                          My Profile
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    {userRole === "employer" && (
                      <>
                        <DropdownMenuItem onClick={() => navigate("/dashboard/company?tab=jobs")}>
                          <Briefcase className="mr-2 h-4 w-4" />
                          My Jobs
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/dashboard/company?tab=post")}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Post a Job
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/dashboard/company?tab=profile")}>
                          <UserIcon className="mr-2 h-4 w-4" />
                          Company Profile
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    {userRole === "admin" && (
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <Briefcase className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/")}>
                      <Home className="mr-2 h-4 w-4" />
                      Home
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/jobs")}>
                      <Briefcase className="mr-2 h-4 w-4" />
                      Browse Jobs
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowShareModal(true)}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Website
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/login")}>
                      Login
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/signup")}>
                      Sign Up
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Welcome Popup */}
      {showWelcome && profile && (
        <WelcomePopup
          userName={profile.name || user?.email || ""}
          onClose={() => setShowWelcome(false)}
        />
      )}

      {/* Share Modal */}
      <ShareModal open={showShareModal} onOpenChange={setShowShareModal} />

      {/* Auth Popup Modal */}
      <AuthPopup 
        open={showAuthPopup} 
        onOpenChange={setShowAuthPopup}
        defaultMode={authMode}
      />
    </nav>
  );
};

export default Navbar;
