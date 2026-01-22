import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 w-full border-b border-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 md:h-20 items-center">
          
          {/* === LEFT: LOGO === */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 md:gap-3 group">
              <div className="bg-blue-50 p-1.5 md:p-2 rounded-xl group-hover:bg-blue-100 transition-colors">
                 <Stethoscope className="h-6 w-6 md:h-8 md:w-8 text-blue-900" />
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center text-lg md:text-2xl font-extrabold tracking-tight leading-none">
                  <span className="text-blue-900">HomeCare</span>
                  <span className="text-green-600 ml-1">Job BD</span>
                </div>
                <span className="text-[8px] md:text-[10px] font-semibold text-gray-500 tracking-[0.1em] md:tracking-[0.2em] uppercase mt-0.5 hidden sm:block">
                  Trusted Medical Jobs
                </span>
              </div>
            </Link>
          </div>

          {/* === RIGHT: ACTIONS (MOBILE & DESKTOP) === */}
          <div className="flex items-center gap-3">
            
            {/* 1. Mobile Sign In / Create Account (Like BDJobs) */}
            {/* এটি শুধু মোবাইলে দেখাবে, মেনুর বাম পাশে */}
            <div className="md:hidden flex items-center gap-1 mr-1">
                {!user ? (
                    <div className="flex flex-col items-end leading-tight">
                        <Link to="/login" className="text-[11px] font-bold text-blue-700 hover:underline">
                            Sign in
                        </Link>
                        <div className="flex items-center gap-1">
                            <span className="text-[9px] text-gray-400">or</span>
                            <Link to="/login" className="text-[11px] font-bold text-green-600 hover:underline">
                                Create Account
                            </Link>
                        </div>
                    </div>
                ) : (
                    // লগইন করা থাকলে প্রোফাইল আইকন দেখাবে
                    <Link to="/profile" className="bg-blue-50 p-1.5 rounded-full text-blue-900">
                        <User className="w-5 h-5" />
                    </Link>
                )}
            </div>

            {/* 2. Desktop Menu (Hidden on Mobile) */}
            <div className="hidden md:flex items-center space-x-8">
                <Link to="/" className="text-gray-600 hover:text-blue-900 font-semibold transition text-sm uppercase tracking-wide">Home</Link>
                <Link to="/jobs" className="text-gray-600 hover:text-blue-900 font-semibold transition text-sm uppercase tracking-wide">Jobs</Link>
                <Link to="/training" className="text-gray-600 hover:text-blue-900 font-semibold transition text-sm uppercase tracking-wide">Training</Link>
                
                {user ? (
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
                    <Link to="/profile">
                    <Button variant="outline" className="flex items-center gap-2 border-blue-200 text-blue-900 hover:bg-blue-50 rounded-full px-4">
                        <User className="w-4 h-4" /> Profile
                    </Button>
                    </Link>
                    <Button onClick={handleLogout} variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-700 rounded-full px-3">
                    <LogOut className="w-4 h-4" />
                    </Button>
                </div>
                ) : (
                <Link to="/login">
                    <Button className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-8 py-2 rounded-full shadow-lg transition-all">
                    Login / Join
                    </Button>
                </Link>
                )}
            </div>

            {/* 3. Mobile Hamburger Menu Button */}
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-700 hover:text-blue-900 p-2 rounded-md hover:bg-gray-100 transition border border-gray-200">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown (When Hamburger is clicked) */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full animate-in slide-in-from-top-5 z-50">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link to="/" className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-900 border-b border-gray-50" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/jobs" className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-900 border-b border-gray-50" onClick={() => setIsOpen(false)}>All Jobs</Link>
            <Link to="/training" className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-900 border-b border-gray-50" onClick={() => setIsOpen(false)}>Training</Link>
            <Link to="/post-job" className="block px-4 py-3 rounded-lg text-base font-bold text-green-700 bg-green-50 mt-2" onClick={() => setIsOpen(false)}>+ Post a Job</Link>
            
            {user && (
              <div className="mt-2 pt-2">
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="flex items-center gap-2 w-full text-left px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50">
                  <LogOut className="w-4 h-4"/> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;