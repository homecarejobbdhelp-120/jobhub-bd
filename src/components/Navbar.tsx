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
    // ১. স্লিম হেডার (h-16), বেশি মোটা প্যাডিং বাদ দিয়েছি
    <nav className="bg-white shadow-sm sticky top-0 z-50 w-full border-b border-gray-100 font-sans h-16 flex items-center">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center w-full">
          
          {/* === কাস্টম লোগো (Deep Thought Design) === */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              
              {/* --- লোগো আইকন: ঘরের ভেতরে স্টেথিসকোপ (SVG Code) --- */}
              <div className="relative w-10 h-10 flex items-center justify-center">
                 {/* নীল রঙের ঘর (House Outline) */}
                 <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-blue-900 transition-transform group-hover:scale-105" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                 </svg>
                 
                 {/* সবুজ রঙের স্টেথিসকোপ (ঘরের ভেতরে হার্ট শেপ তৈরি করছে) */}
                 <svg viewBox="0 0 24 24" className="absolute top-2 left-0 w-full h-full p-[5px]" fill="none">
                    <path d="M4.5 9a4.5 4.5 0 0 1 9 0 4.5 4.5 0 0 1 9 0c0 4.5-5.5 8.5-9 11-3.5-2.5-9-6.5-9-11z" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="12" cy="18" r="1.5" fill="#16a34a" />
                 </svg>
              </div>
              
              {/* --- লোগো টেক্সট --- */}
              <div className="flex flex-col justify-center -space-y-0.5">
                <div className="flex items-center text-xl md:text-2xl font-extrabold tracking-tight">
                  <span className="text-blue-900">HomeCare</span>
                  <span className="text-green-600 ml-1">JobBD</span>
                </div>
                {/* ট্যাগলাইন (মোবাইলে লুকানো থাকবে) */}
                <span className="text-[9px] font-bold text-gray-400 tracking-[0.15em] uppercase hidden md:block">
                  Medical & Care
                </span>
              </div>
            </Link>
          </div>

          {/* === ডান পাশ: অ্যাকশন === */}
          <div className="flex items-center justify-end gap-3 flex-1 md:flex-none">
            
            {/* ২. মোবাইল ভিউ: শুধু ক্লিন "Log In" টেক্সট (কোনো মোটা বাটন না) */}
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

            {/* ৩. ডেস্কটপ মেনু */}
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

            {/* ৪. মোবাইল হ্যামবার্গার */}
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-600 hover:text-blue-900 p-1 rounded-md hover:bg-gray-100 transition">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* মোবাইল ড্রপডাউন */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute top-16 left-0 w-full animate-in slide-in-from-top-2 z-40">
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