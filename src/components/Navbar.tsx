import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { Menu, X, User, Home, Briefcase, GraduationCap, LayoutDashboard, LogOut, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data } = await supabase
          .from("profiles") // আপনার ডাটাবেস অনুযায়ী profiles বা user_roles চেক করবে
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();
        setRole(data?.role || null);
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
    setMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (role === "employer" || role === "company") return "/dashboard/company";
    if (role === "admin") return "/admin";
    return "/dashboard/caregiver";
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm font-sans">
      <div className="container mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Branding - Blue & Green Combination */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
          <img 
            src="/app-logo.png" 
            alt="HomeCare JobBD" 
            className="h-10 w-10 sm:h-14 sm:w-14 transition-transform group-hover:scale-105 object-contain" 
          />
          <div className="flex flex-col justify-center">
            <span className="text-base sm:text-xl font-extrabold text-blue-900 leading-tight">
              HomeCare <span className="text-green-600">JobBD</span>
            </span>
            <div className="flex gap-1 text-[7px] sm:text-[10px] font-bold uppercase tracking-tight whitespace-nowrap mt-0.5">
              <span className="text-green-600">Connecting</span>
              <span className="text-blue-900">Caregivers, Nurses</span>
              <span className="text-green-600">& Companies</span>
            </div>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-gray-600 hover:text-green-600 font-medium transition">Home</Link>
          <Link to="/jobs" className="text-gray-600 hover:text-green-600 font-medium transition">Browse Jobs</Link>
          <Link to="/training" className="text-gray-600 hover:text-green-600 font-medium transition">Training</Link>
          
          {user ? (
            <div className="flex items-center gap-4 ml-4">
              <Link to={getDashboardLink()}>
                <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                  Dashboard
                </Button>
              </Link>
              <Avatar className="h-10 w-10 cursor-pointer border border-gray-200" onClick={() => navigate(getDashboardLink())}>
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-green-100 text-green-700">
                  <User className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
            </div>
          ) : (
            <div className="flex items-center gap-3 ml-4">
              <Link to="/login">
                <Button variant="ghost" className="text-gray-600 font-bold hover:text-blue-700">Log In</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-md">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Action Controls */}
        <div className="flex items-center gap-3 md:hidden">
          {!user && (
            <Link to="/login">
              <Button size="sm" variant="outline" className="text-blue-700 border-blue-100 font-bold text-xs h-8">
                Log In
              </Button>
            </Link>
          )}
          <button className="p-2 text-gray-600 bg-gray-50 rounded-lg" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu (Shomvob Style Drawer) */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 shadow-2xl py-6 px-4 flex flex-col gap-2 animate-in slide-in-from-top duration-300">
          {/* User Profile Card in Menu */}
          {user && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl mb-4">
              <Avatar className="h-12 w-12 border-2 border-white">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-blue-100 text-blue-700"><User /></AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-blue-900 text-sm">{user.email}</p>
                <p className="text-[10px] text-blue-600 uppercase font-bold tracking-widest">{role || 'Member'}</p>
              </div>
            </div>
          )}

          <Link to="/" className="flex items-center gap-3 text-gray-700 font-bold p-3 hover:bg-green-50 rounded-lg transition" onClick={() => setMenuOpen(false)}>
            <Home size={20} className="text-green-600" /> Home
          </Link>
          <Link to="/jobs" className="flex items-center gap-3 text-gray-700 font-bold p-3 hover:bg-green-50 rounded-lg transition" onClick={() => setMenuOpen(false)}>
            <Briefcase size={20} className="text-green-600" /> Browse Jobs
          </Link>
          <Link to="/training" className="flex items-center gap-3 text-gray-700 font-bold p-3 hover:bg-green-50 rounded-lg transition" onClick={() => setMenuOpen(false)}>
            <GraduationCap size={20} className="text-green-600" /> Training
          </Link>
          
          <div className="border-t border-gray-100 my-2"></div>
          
          {user ? (
            <div className="flex flex-col gap-3 pt-2">
              <Link to={getDashboardLink()} onClick={() => setMenuOpen(false)}>
                <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white flex gap-2">
                  <LayoutDashboard size={18} /> Dashboard
                </Button>
              </Link>
              <Button variant="ghost" onClick={handleLogout} className="w-full text-red-600 hover:bg-red-50 flex gap-2">
                <LogOut size={18} /> Log Out
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 pt-2">
              <Link to="/signup" className="w-full" onClick={() => setMenuOpen(false)}>
                <Button className="w-full bg-green-600 hover:bg-green-700 font-bold">Create Free Account</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;