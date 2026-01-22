import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { X, Loader2 } from "lucide-react";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ১. লগইন রিকোয়েস্ট
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Welcome Back!",
          description: "Successfully logged in.",
          className: "bg-green-600 text-white border-0",
        });

        // ২. রোল চেক করা (Role Check Logic)
        // প্রথমে মেটাডাটা চেক করব (দ্রুত রেসপন্সের জন্য)
        const metadataRole = data.user.user_metadata?.role;

        // অথবা ডাটাবেস টেবিল চেক করব (যদি মেটাডাটা না থাকে)
        if (!metadataRole) {
            const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", data.user.id)
            .maybeSingle();
            
            if (roleData?.role === "employer" || roleData?.role === "company") {
                navigate("/dashboard/company");
            } else {
                navigate("/dashboard/caregiver");
            }
        } else {
            // মেটাডাটা অনুযায়ী রিডাইরেক্ট
            if (metadataRole === "company" || metadataRole === "employer") {
                navigate("/dashboard/company");
            } else {
                // ডিফল্ট হিসেবে কেয়ারগিভার ড্যাশবোর্ড
                navigate("/dashboard/caregiver");
            }
        }
      }

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid login credentials",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      
      <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl relative">
          
          {/* Close Button */}
          <button 
            onClick={() => navigate("/")} 
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors bg-gray-100 hover:bg-red-50 p-1 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="mt-2 text-3xl font-extrabold text-blue-900">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Log in to your account to continue
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-700 font-bold">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 h-12"
                />
              </div>

              <div>
                <Label htmlFor="password" classname="text-gray-700 font-bold">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 h-12"
                />
                <div className="text-right mt-2">
                  <Link to="/forgot-password" class="text-xs font-bold text-blue-600 hover:text-blue-800">
                    Forgot Password?
                  </Link>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Logging In...
                </>
              ) : "Log In"}
            </Button>

            <div className="text-center text-sm mt-4 pt-4 border-t border-gray-100">
              <span className="text-gray-600">Don't have an account? </span>
              <Link to="/signup" className="font-bold text-blue-700 hover:text-blue-900 hover:underline">
                Create one here
              </Link>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;