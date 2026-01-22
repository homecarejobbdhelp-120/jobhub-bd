import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
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
        <div className="flex justify-between h-20 items-center">
          
          {/* === বাম পাশ: লোগো (স্পষ্ট ও বড়) === */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center gap-2">
              {/* লোগো সাইজ মোবাইলে h-12 (৪৮px) করেছি যাতে স্পষ্ট দেখা যায় */}
              <img 
                src="/logo.png" 
                alt="HomeCare Logo" 
                className="h-12 w-12 md:h-14 md:w-14 object-contain"
                onError={(e) => {
                    e.currentTarget.style.display = 'none'; 
                }}
              />
              
              {/* টাইটেল */}
              <div className="flex flex-col justify-center">
                <div className="flex items-center text-lg md:text-2xl font-extrabold tracking-tight leading-none">
                  <span className="text-blue-900">HomeCare</span>
                  <span className="text-green-600 ml-1">Job BD</span>
                </div>
                <span className="text-[10px] font-semibold text-gray-500 tracking-wider uppercase hidden md:block">
                  Trusted Medical Jobs
                </span>
              </div>
            </Link>
          </div>

          {/* === ডান পাশ: মোবাইল বাটন (সিরিয়াল) === */}
          <div className="flex items-center justify-end gap-3 flex-1 md:flex-none">
            
            {/* ১. মোবাইলে সিরিয়াল বাটন (Login & Create Account) */}
            <div className="md:hidden flex flex-col items-end gap-1 mr-1">
                {!user ? (
                    <>
                        {/* Login Button */}
                        <Link to="/login">
                            <span className="block text-[11px] font-bold px-3 py-1 border border-blue-600 text-blue-700 rounded bg-blue-50 leading-none active:scale-95 transition-transform text-center w-24">
                                Login
                            </span>
                        </Link>
                        
                        {/* OR text (Optional, clean look) */}
                        {/* <span className="text-[8px] text-gray-400 -my-0.5 pr-8">or</span> */}

                        {/* Create Account Button */}
                        <Link to="/login">
                            <span className="block text-[11px] font-bold px-3 py-1 bg-green-600 text-white rounded leading-none active:scale-95 transition-transform text-center w-24 border border-green-700">
                                Create Account
                            </span>
                        </Link>
                    </>
                ) : (
                    // লগইন করা থাকলে প্রোফাইল আইকন
                    <Link to="/profile" className="bg-blue-100 p-2 rounded-full text-blue-900 border border-blue-200">
                        <User className="w-5 h-5" />
                    </Link>
                )}
            </div>

            {/* ২. ডেস্কটপ মেনু (লুকানো থাকবে মোবাইলে) */}
            <div className="hidden md:flex items-center space-x-8">
                <Link to="/" className="text-gray-600 hover:text-blue-900 font-semibold transition text-sm uppercase">Home</Link>
                <Link to="/jobs" className="text-gray-600 hover:text-blue-900 font-semibold transition text-sm uppercase">Jobs</Link>
                <Link to="/training" className="text-gray-600 hover:text-blue-900 font-semibold transition text-sm uppercase">Training</Link>
                
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
                    <Button className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-8 py-2 rounded-full shadow-lg">
                    Login / Join
                    </Button>
                </Link>
                )}
            </div>

            {/* ৩. মোবাইল হ্যামবার্গার মেনু */}
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-700 hover:text-blue-900 p-1.5 rounded-md hover:bg-gray-100 transition border border-gray-200 flex-shrink-0">
              {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>

        </div>
      </div>

      {/* মোবাইল ড্রপডাউন মেনু */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full animate-in slide-in-from-top-5 z-50">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link to="/" className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-blue-50 border-b border-gray-50" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/jobs" className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-blue-50 border-b border-gray-50" onClick={() => setIsOpen(false)}>All Jobs</Link>
            <Link to="/training" className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-blue-50 border-b border-gray-50" onClick={() => setIsOpen(false)}>Training</Link>
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