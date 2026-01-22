import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Home, Stethoscope } from "lucide-react"; // Home এবং Stethoscope আইকন আনলাম
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
    <nav className="bg-white shadow-sm sticky top-0 z-50 w-full border-b border-gray-100 font-sans h-14 md:h-20 flex items-center">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center w-full">
          
          {/* === বাম পাশ: কাস্টম লোগো + নাম === */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              
              {/* --- কাস্টম কোড লোগো (Home + Stethoscope) --- */}
              <div className="relative flex items-center justify-center bg-blue-50 p-1 rounded-xl w-9 h-9 md:w-11 md:h-11 group-hover:bg-blue-100 transition-colors">
                 {/* পেছনের হোম আইকন (নীল) */}
                 <Home className="w-full h-full text-blue-900 absolute opacity-90" strokeWidth={1.5} />
                 {/* সামনের স্টেথিসকোপ আইকন (সবুজ) */}
                 <Stethoscope className="w-3/5 h-3/5 text-green-600 relative z-10 bg-white/80 rounded-full p-0.5" strokeWidth={2} />
              </div>
              
              {/* --- আলাদা টেক্সট নাম --- */}
              <div className="flex flex-col justify-center">
                <div className="flex items-center text-lg md:text-2xl font-extrabold tracking-tight leading-none">
                  <span className="text-blue-900">HomeCare</span>
                  <span className="text-green-600 ml-0.5">JobBD</span>
                </div>
              </div>
            </Link>
          </div>

          {/* === ডান পাশ: অ্যাকশন বাটন === */}
          <div className="flex items-center justify-end gap-3 flex-1 md:flex-none">
            
            {/* ১. মোবাইল ভিউ: শুধু ক্লিন "Log In" টেক্সট */}
            <div className="md:hidden flex items-center gap-3 mr-1">
                {!user ? (
                    <Link to="/login" className="text-sm font-bold text-blue-700 hover:text-blue-900 transition-colors">
                        Log In
                    </Link>
                ) : (
                    <Link to="/profile" className="bg-blue-50 p-1.5 rounded-full text-blue-900 border border-blue-100">
                        <User className="w-4 h-4" />
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
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-600 hover:text-blue-900 p-1 rounded-md hover:bg-gray-100 transition border border-gray-200">
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* মোবাইল ড্রপডাউন মেনু */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute top-14 left-0 w-full animate-in slide-in-from-top-2 z-40">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link to="/" className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 border-b border-gray-50" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/jobs" className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 border-b border-gray-50" onClick={() => setIsOpen(false)}>All Jobs</Link>
            <Link to="/training" className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 border-b border-gray-50" onClick={() => setIsOpen(false)}>Training</Link>
            
            {!user && (
                <Link to="/login" className="block px-4 py-3 rounded-lg text-sm font-bold text-green-700 bg-green-50 mt-2" onClick={() => setIsOpen(false)}>Create Account</Link>
            )}
            
            {user && (
              <div className="mt-2 pt-2">
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="flex items-center gap-2 w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
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