import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Menu, X, Share2, Bell, User as UserIcon, LogOut, Settings, Briefcase, ExternalLink } from "lucide-react";
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

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchNotifications(session.user.id);
        
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
      } else {
        setProfile(null);
        setNotifications([]);
        setUnreadCount(0);
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
      <div className="container mx-auto px-4 py-2 md:py-3">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <motion.button 
            onClick={scrollToTop}
            className="flex flex-col items-start focus:outline-none group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <img src={logo} alt="HomeCare Job BD" className="h-10 md:h-12 transition-transform duration-300 group-hover:scale-105" />
            <span className="text-xs text-secondary mt-0.5 hidden lg:block">Connecting Caregivers, Nurses & Companies</span>
          </motion.button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className={`text-[#0B4A79] hover:text-[#6DBE45] transition-all duration-200 hover:scale-105 relative group ${
                isActiveRoute("/") ? "text-[#6DBE45] font-medium" : ""
              }`}
            >
              Home
              {isActiveRoute("/") && <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#6DBE45]" />}
            </Link>
            <button
              onClick={() => handleProtectedNavigation("/jobs")}
              className={`text-[#0B4A79] hover:text-[#6DBE45] transition-all duration-200 hover:scale-105 relative group ${
                isActiveRoute("/jobs") ? "text-[#6DBE45] font-medium" : ""
              }`}
            >
              Browse Jobs
              {isActiveRoute("/jobs") && <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#6DBE45]" />}
            </button>
            <button
              onClick={() => handleProtectedNavigation("/post-job")}
              className={`text-[#0B4A79] hover:text-[#6DBE45] transition-all duration-200 hover:scale-105 relative group ${
                isActiveRoute("/post-job") ? "text-[#6DBE45] font-medium" : ""
              }`}
            >
              Post a Job
              {isActiveRoute("/post-job") && <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#6DBE45]" />}
            </button>
            
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[#0B4A79] hover:text-[#6DBE45] hover:bg-[#6DBE45]/10"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[#0B4A79] hover:text-[#6DBE45] hover:bg-[#6DBE45]/10"
                  >
                    <Briefcase className="h-4 w-4 mr-1" />
                    My Jobs
                  </Button>
                </Link>
                
                {/* Notifications Dropdown */}
                <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[#0B4A79] hover:text-[#6DBE45] hover:bg-[#6DBE45]/10 relative"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 bg-white z-50">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className={`px-4 py-3 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="w-full">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium text-sm">{notification.title}</p>
                              {!notification.read && (
                                <div className="w-2 h-2 rounded-full bg-[#6DBE45] mt-1 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                            {notification.job_id && (
                              <span className="text-xs text-[#6DBE45] mt-1 inline-flex items-center gap-1">
                                View Job <ExternalLink className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-sm text-gray-500">
                        No notifications yet
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Share Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#0B4A79] hover:text-[#6DBE45] hover:bg-[#6DBE45]/10"
                  onClick={() => setShowShareModal(true)}
                >
                  <Share2 className="h-5 w-5" />
                </Button>

                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[#0B4A79] hover:text-[#6DBE45] hover:bg-[#6DBE45]/10"
                    >
                      <UserIcon className="h-5 w-5 mr-1" />
                      <span className="hidden lg:inline">{profile?.name || user.email?.split('@')[0]}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white z-50">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-[#6DBE45] text-[#6DBE45] hover:bg-[#6DBE45]/10"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button 
                    size="sm" 
                    className="bg-[#6DBE45] hover:bg-[#6DBE45]/90 text-white"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Auth Buttons + Menu */}
          <div className="md:hidden flex items-center gap-2">
            {!user && (
              <>
                <Link to="/login">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-[#6DBE45] text-[#6DBE45] hover:bg-[#6DBE45]/10 h-8 px-3 text-xs"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button 
                    size="sm" 
                    className="bg-[#6DBE45] hover:bg-[#6DBE45]/90 text-white h-8 px-3 text-xs"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
            <button
              className="text-[#0B4A79] hover:text-[#6DBE45] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && !showAuthPopup && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden py-4 flex flex-col gap-4 bg-white overflow-hidden"
            >
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#0B4A79] hover:text-[#6DBE45] transition-colors text-left px-2 py-1"
              >
                Home
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleProtectedNavigation("/jobs");
                }}
                className="text-[#0B4A79] hover:text-[#6DBE45] transition-colors px-2 py-1 text-left"
              >
                Browse Jobs
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleProtectedNavigation("/post-job");
                }}
                className="text-[#0B4A79] hover:text-[#6DBE45] transition-colors px-2 py-1 text-left"
              >
                Post a Job
              </button>
              <button
                onClick={() => { setShowShareModal(true); setMobileMenuOpen(false); }}
                className="text-[#0B4A79] hover:text-[#6DBE45] transition-colors text-left flex items-center gap-2 px-2 py-1"
              >
                <Share2 size={18} />
                Share this website
              </button>
              {user && (
                <>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-[#6DBE45] text-[#6DBE45] hover:bg-[#6DBE45]/10">Dashboard</Button>
                  </Link>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-[#6DBE45] text-[#6DBE45] hover:bg-[#6DBE45]/10">
                      <Briefcase className="h-4 w-4 mr-1" />
                      My Jobs
                    </Button>
                  </Link>
                  <Button onClick={handleSignOut} variant="outline" className="w-full border-red-500 text-red-500 hover:bg-red-50">
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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
