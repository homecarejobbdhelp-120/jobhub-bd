import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Menu, X, Share2, Bell } from "lucide-react";
import logo from "@/assets/homecarejobbd.png";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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

  return (
    <nav className={`bg-white border-b sticky top-0 z-50 transition-shadow duration-300 ${
      isScrolled ? "shadow-md" : "shadow-sm"
    }`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <button 
            onClick={scrollToTop}
            className="flex items-center transition-transform duration-300 hover:scale-105 focus:outline-none"
          >
            <img src={logo} alt="HomeCare Job BD" className="h-12 md:h-14" />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/" className="text-gray-700 hover:text-[#00AEEF] transition-colors">
              Home
            </Link>
            <Link to="/jobs" className="text-gray-700 hover:text-[#00AEEF] transition-colors">
              Jobs
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-[#00AEEF] transition-colors">
              Contact
            </Link>
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" className="border-[#00AEEF] text-[#00AEEF] hover:bg-[#00AEEF] hover:text-white">Dashboard</Button>
                </Link>
                <Button onClick={handleSignOut} variant="outline" size="sm" className="border-[#6DBE45] text-[#6DBE45] hover:bg-[#6DBE45] hover:text-white">
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="bg-[#00AEEF] hover:bg-[#00AEEF]/90 text-white">Sign In / Sign Up</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 hover:text-[#00AEEF] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 flex flex-col gap-4 animate-fade-in bg-white">
            <button
              onClick={scrollToTop}
              className="text-gray-700 hover:text-[#00AEEF] transition-colors text-left"
            >
              Home
            </button>
            <button
              onClick={() => {
                setAboutOpen(true);
                setMobileMenuOpen(false);
              }}
              className="text-gray-700 hover:text-[#00AEEF] transition-colors text-left"
            >
              About
            </button>
            <button
              onClick={() => {
                setContactOpen(true);
                setMobileMenuOpen(false);
              }}
              className="text-gray-700 hover:text-[#00AEEF] transition-colors text-left"
            >
              Contact
            </button>
            <Link
              to="/jobs"
              className="text-gray-700 hover:text-[#00AEEF] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Jobs
            </Link>
            <button
              onClick={handleShare}
              className="text-gray-700 hover:text-[#00AEEF] transition-colors text-left flex items-center gap-2"
            >
              <Share2 size={18} />
              Share this website
            </button>
            <button
              onClick={handleNotifications}
              className="text-gray-700 hover:text-[#00AEEF] transition-colors text-left flex items-center gap-2"
            >
              <Bell size={18} />
              Enable Notifications
            </button>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-[#00AEEF] text-[#00AEEF] hover:bg-[#00AEEF] hover:text-white">Dashboard</Button>
                </Link>
                <Button onClick={handleSignOut} variant="outline" className="w-full border-[#6DBE45] text-[#6DBE45] hover:bg-[#6DBE45] hover:text-white">
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-[#00AEEF] hover:bg-[#00AEEF]/90 text-white">Login</Button>
              </Link>
            )}
          </div>
        )}
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
