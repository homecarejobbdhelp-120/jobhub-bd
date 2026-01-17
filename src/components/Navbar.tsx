import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Menu, Bell, User as UserIcon, LogOut, Briefcase, Home, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  job_id: string | null;
}

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  // Fetch Role
  const fetchUserRole = async (userId: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).single();
    if (data) setUserRole(data.role);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchNotifications(session.user.id);
        fetchUserRole(session.user.id);
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
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) setProfile(data);
  };

  const fetchNotifications = async (userId: string) => {
    const { data } = await supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(5);
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // FIXED NAVBAR DESIGN
  return (
    <nav className={`bg-[#0f172a] border-b border-slate-800 sticky top-0 z-50 transition-all duration-300 ${isScrolled ? "shadow-lg" : "shadow-sm"}`}>
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        
        {/* LOGO & TITLE SECTION */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => { navigate("/"); scrollToTop(); }}>
          {/* Logo Image */}
          <img 
            src="/logo-new.png" 
            alt="Logo" 
            className="h-10 w-auto rounded-md border border-slate-600 shadow-sm"
          />
          
          {/* Title - Fixed for Mobile (No Wrapping) */}
          <div className="flex flex-col">
            <span className="text-base md:text-xl font-bold text-white whitespace-nowrap leading-none">
              HomeCare <span className="text-emerald-500">Job BD</span>
            </span>
            <span className="hidden md:block text-[10px] text-slate-400 font-medium tracking-wider">
              TRUSTED CARE PLATFORM
            </span>
          </div>
        </div>

        {/* RIGHT SIDE MENU */}
        <div className="flex items-center gap-3">
          {!user && (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="text-slate-300 hover:text-white font-medium text-sm px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">Sign in</Link>
              <Link to="/signup" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-4 py-2 rounded-full shadow-lg shadow-emerald-900/20 transition-all">Create Account</Link>
            </div>
          )}

          {/* Mobile Menu / Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-slate-800 rounded-full relative h-10 w-10">
                <Menu className="h-6 w-6" />
                {unreadCount > 0 && <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-[#0f172a]" />}
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-64 mt-2 bg-white border-slate-200 shadow-xl rounded-xl p-2">
              {!user ? (
                <>
                  <DropdownMenuItem onClick={() => navigate("/")} className="font-medium cursor-pointer"><Home className="mr-2 h-4 w-4" /> Home</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/jobs")} className="font-medium cursor-pointer"><Briefcase className="mr-2 h-4 w-4" /> Browse Jobs</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/login")} className="cursor-pointer text-slate-700">Log In</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/signup")} className="cursor-pointer text-emerald-600 font-bold">Create Account</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg mb-1">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                       {profile?.name?.[0] || "U"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 truncate max-w-[120px]">{profile?.name || "User"}</p>
                      <p className="text-xs text-slate-500 font-normal">My Account</p>
                    </div>
                  </DropdownMenuLabel>
                  
                  <DropdownMenuItem onClick={() => navigate("/")}><Home className="mr-2 h-4 w-4 text-slate-500" /> Home</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/jobs")}><Briefcase className="mr-2 h-4 w-4 text-slate-500" /> Jobs</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setNotificationsOpen(true)}>
                    <Bell className="mr-2 h-4 w-4 text-slate-500" /> Notifications 
                    {unreadCount > 0 && <Badge variant="destructive" className="ml-auto h-5 px-1">{unreadCount}</Badge>}
                  </DropdownMenuItem>

                  {userRole === "employer" && (
                    <DropdownMenuItem onClick={() => navigate("/dashboard/company?tab=post")} className="text-emerald-600 font-medium">
                      <PlusCircle className="mr-2 h-4 w-4" /> Post a Job
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Popups */}
      {showWelcome && profile && <WelcomePopup userName={profile.name} onClose={() => setShowWelcome(false)} />}
      <ShareModal open={showShareModal} onOpenChange={setShowShareModal} />
      <AuthPopup open={showAuthPopup} onOpenChange={setShowAuthPopup} defaultMode={authMode} />
      
      {/* Notifications Side Drawer */}
      <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <SheetContent>
          <SheetHeader><SheetTitle>Notifications</SheetTitle></SheetHeader>
          <div className="mt-4 space-y-2">
            {notifications.length === 0 ? <p className="text-center text-slate-500 py-4">No new notifications</p> : 
              notifications.map((n) => (
                <div key={n.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                </div>
              ))
            }
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default Navbar;