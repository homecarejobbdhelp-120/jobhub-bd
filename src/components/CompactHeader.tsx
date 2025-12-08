import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, Briefcase, Settings, Bell, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface CompactHeaderProps {
  showBackButton?: boolean;
}

const CompactHeader = ({ showBackButton }: CompactHeaderProps) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchNotificationCount(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchNotificationCount(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchNotificationCount = async (userId: string) => {
    const { data } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", userId)
      .eq("read", false);
    
    if (data) {
      setUnreadCount(data.length);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    navigate("/");
  };

  const menuItems = [
    { icon: Briefcase, label: "Browse Jobs", path: "/jobs", priority: true },
    { icon: Settings, label: "Settings", path: "/settings" },
    { 
      icon: Bell, 
      label: "Notifications", 
      path: "/dashboard",
      badge: unreadCount > 0 ? unreadCount : undefined 
    },
  ];

  return (
    <>
      {/* Compact Fixed Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
        <div className="flex items-center justify-between px-3 h-12">
          {/* Logo */}
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5"
          >
            <span className="text-base font-bold text-primary">HomeCare</span>
            <span className="text-base font-bold text-secondary">Job BD</span>
          </button>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-md hover:bg-muted transition-colors relative"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className="h-5 w-5 text-foreground" />
            ) : (
              <>
                <Menu className="h-5 w-5 text-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
                )}
              </>
            )}
          </button>
        </div>
      </header>

      {/* Slide-out Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Slide Menu */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.2 }}
              className="fixed top-0 right-0 h-full w-64 bg-background border-l border-border z-50 shadow-lg"
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between p-3 border-b border-border">
                <span className="text-sm font-semibold text-foreground">Menu</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Menu Items */}
              <nav className="flex flex-col p-2">
                {menuItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                      item.priority 
                        ? "bg-primary/10 text-primary font-medium hover:bg-primary/20" 
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge variant="destructive" className="h-5 min-w-5 flex items-center justify-center text-xs px-1.5">
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                ))}

                {/* Divider */}
                <div className="my-2 h-px bg-border" />

                {/* Logout */}
                {user && (
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                )}

                {!user && (
                  <button
                    onClick={() => {
                      navigate("/login");
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <span>Login / Sign Up</span>
                  </button>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CompactHeader;
