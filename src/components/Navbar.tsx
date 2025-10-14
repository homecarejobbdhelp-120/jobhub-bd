import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Menu, X, Share2, Bell, User as UserIcon, LogOut, Settings, Briefcase } from "lucide-react";
import logo from "@/assets/homecarejobbd.png";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const handleShare = async () => {
    const shareData = {
      title: "HomeCareJobBD",
      text: "Share this website with your friend so that he can get a perfect home care job.",
      url: "https://homecarejobbd.vercel.app",
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({ title: "Thanks for sharing!" });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      toast({ title: "Link copied to clipboard!" });
    }
    setMobileMenuOpen(false);
  };

  const handleNotifications = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Not supported",
        description: "Your browser doesn't support notifications",
        variant: "destructive",
      });
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      toast({
        title: "✅ Notifications enabled!",
        description: "You will now receive updates from HomeCareJobBD.",
      });
    } else {
      toast({
        title: "Notifications blocked",
        description: "Please enable notifications in your browser settings",
        variant: "destructive",
      });
    }
    setMobileMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const isActiveRoute = (path: string) => location.pathname === path;

  const mockNotifications = [
    { id: 1, text: "New job posted: Senior Caregiver", time: "2 hours ago" },
    { id: 2, text: "Application status updated", time: "1 day ago" },
    { id: 3, text: "New message from employer", time: "2 days ago" },
  ];

  return (
    <nav className={`bg-white border-b sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? "shadow-lg" : "shadow-sm"
    }`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <motion.button 
            onClick={scrollToTop}
            className="flex flex-col items-start focus:outline-none group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <img src={logo} alt="HomeCare Job BD" className="h-12 md:h-14 transition-transform duration-300 group-hover:scale-105" />
            <span className="text-xs text-[#0B4A79] mt-1 hidden md:block">Connecting Caregivers, Nurses & Companies</span>
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
            <Link 
              to="/jobs" 
              className={`text-[#0B4A79] hover:text-[#6DBE45] transition-all duration-200 hover:scale-105 relative group ${
                isActiveRoute("/jobs") ? "text-[#6DBE45] font-medium" : ""
              }`}
            >
              Browse Jobs
              {isActiveRoute("/jobs") && <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#6DBE45]" />}
            </Link>
            <Link 
              to="/contact" 
              className={`text-[#0B4A79] hover:text-[#6DBE45] transition-all duration-200 hover:scale-105 relative group ${
                isActiveRoute("/contact") ? "text-[#6DBE45] font-medium" : ""
              }`}
            >
              Post a Job
              {isActiveRoute("/contact") && <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#6DBE45]" />}
            </Link>
            
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
                      <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 bg-white z-50">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {mockNotifications.map((notif) => (
                      <DropdownMenuItem key={notif.id} className="flex flex-col items-start py-3">
                        <span className="text-sm font-medium">{notif.text}</span>
                        <span className="text-xs text-gray-500">{notif.time}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[#0B4A79] hover:text-[#6DBE45] hover:bg-[#6DBE45]/10"
                    >
                      <UserIcon className="h-5 w-5 mr-1" />
                      <span className="hidden lg:inline">{user.email?.split('@')[0]}</span>
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
                <Link to="/auth">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-[#6DBE45] text-[#6DBE45] hover:bg-[#6DBE45]/10"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/auth">
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

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#0B4A79] hover:text-[#6DBE45] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
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
              <Link
                to="/jobs"
                className="text-[#0B4A79] hover:text-[#6DBE45] transition-colors px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Jobs
              </Link>
              <Link
                to="/contact"
                className="text-[#0B4A79] hover:text-[#6DBE45] transition-colors px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Post a Job
              </Link>
              <button
                onClick={handleShare}
                className="text-[#0B4A79] hover:text-[#6DBE45] transition-colors text-left flex items-center gap-2 px-2 py-1"
              >
                <Share2 size={18} />
                Share this website
              </button>
              <button
                onClick={handleNotifications}
                className="text-[#0B4A79] hover:text-[#6DBE45] transition-colors text-left flex items-center gap-2 px-2 py-1"
              >
                <Bell size={18} />
                Enable Notifications
              </button>
              {user ? (
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
              ) : (
                <>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-[#6DBE45] text-[#6DBE45] hover:bg-[#6DBE45]/10">Login</Button>
                  </Link>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-[#6DBE45] hover:bg-[#6DBE45]/90 text-white">Sign Up</Button>
                  </Link>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* About Dialog */}
      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>About HomeCareJobBD</DialogTitle>
            <DialogDescription className="pt-4">
              HomeCareJobBD helps you find your perfect home care job easily and quickly.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Us</DialogTitle>
            <DialogDescription className="pt-4">
              <strong>Email:</strong> support@homecarejobbd.vercel.app
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default Navbar;
