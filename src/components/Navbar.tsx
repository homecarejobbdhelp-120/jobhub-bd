// src/components/Navbar.tsx
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { Menu, X, Home, Briefcase, GraduationCap, LogOut, User } from "lucide-react";
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
          .from("profiles")
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
  };

  const getDashboardLink = () => {
    if (role === "admin") return "/admin";
    if (role === "employer" || role === "company") return "/dashboard/company";
    return "/dashboard/caregiver";
  };

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        <Link to="/" className="flex items-center gap-2">
          <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">HC</span>
          </div>
          <div>
            <span className="font-bold text-lg text-blue-900">
              HomeCare<span className="text-green-600">JobBD</span>
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-gray-600 hover:text-blue-600">Home</Link>
          <Link to="/jobs" className="text-gray-600 hover:text-blue-600">Jobs</Link>
          <Link to="/training" className="text-gray-600 hover:text-blue-600">Training</Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <Link to={getDashboardLink()}>
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Button variant="ghost" onClick={handleLogout}>Logout</Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost">Log In</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-green-600 hover:bg-green-700">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t py-4 px-4 space-y-3">
          <Link to="/" className="block py-2" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/jobs" className="block py-2" onClick={() => setMenuOpen(false)}>Jobs</Link>
          <Link to="/training" className="block py-2" onClick={() => setMenuOpen(false)}>Training</Link>
          
          {user && (
            <>
              <Link to={getDashboardLink()} className="block py-2" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={handleLogout} className="block py-2 text-red-600">Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;