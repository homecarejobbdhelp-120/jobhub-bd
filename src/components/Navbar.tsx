import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { Menu, X, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();
        setRole(data?.role || null);
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const getDashboardLink = () => {
    if (role === "employer" || role === "company") return "/dashboard/company";
    return "/dashboard/caregiver";
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm font-sans">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* লোগো এবং টাইটেল সেকশন - টাইটেল ফিরিয়ে আনা হয়েছে */}
        <Link to="/" className="flex items-center gap-3 group">
          <img 
            src="/app-logo.png" 
            alt="HomeCare JobBD" 
            className="h-14 w-14 transition-transform group-hover:scale-105 object-contain" 
          />
          <div className="flex flex-col leading-none">
            <span className="text-xl font-extrabold text-blue-900 tracking-tight">
              HomeCare <span className="text-green-600">JobBD</span>
            </span>
            <span className="text-[10px] text-gray-500 font-medium tracking-wider hidden sm:block">
              FIND YOUR CAREER
            </span>
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
              <Avatar className="cursor-pointer border border-gray-200" onClick={() => window.location.href = getDashboardLink()}>
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-green-100 text-green-700 font-bold">
                  <User className="w-4 h-4" />
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

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 shadow-lg py-4 px-4 flex flex-col gap-4">
          <Link to="/" className="text-gray-600 font-medium p-2 hover:bg-gray-50 rounded">Home</Link>
          <Link to="/jobs" className="text-gray-600 font-medium p-2 hover:bg-gray-50 rounded">Browse Jobs</Link>
          <Link to="/training" className="text-gray-600 font-medium p-2 hover:bg-gray-50 rounded">Training</Link>
          
          {user ? (
            <div className="flex flex-col gap-3 mt-2">
              <Link to={getDashboardLink()}>
                <Button className="w-full bg-blue-900 text-white">Go to Dashboard</Button>
              </Link>
              <Button variant="outline" onClick={handleLogout} className="w-full text-red-600 border-red-100 hover:bg-red-50">
                Log Out
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mt-2">
              <Link to="/login"><Button variant="outline" className="w-full">Log In</Button></Link>
              <Link to="/signup"><Button className="w-full bg-green-600 hover:bg-green-700">Sign Up</Button></Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;