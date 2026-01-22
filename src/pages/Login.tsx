import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      toast({
        title: "Welcome Back!",
        description: "Successfully logged in.",
      });
      
      // লগইন সফল হলে প্রোফাইলে বা ড্যাশবোর্ডে পাঠাবো
      navigate("/profile");

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      
      <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
          
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
                <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1"
                />
                <div className="text-right mt-1">
                  <Link to="/forgot-password" class="text-xs font-bold text-green-600 hover:text-green-800">
                    Forgot Password?
                  </Link>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-lg shadow-md transition-all"
              disabled={loading}
            >
              {loading ? "Logging In..." : "Log In"}
            </Button>

            <div className="text-center text-sm mt-4">
              <span className="text-gray-600">Don't have an account? </span>
              {/* এই লিংকটি এখন Signup পেজে নিয়ে যাবে */}
              <Link to="/signup" className="font-bold text-green-600 hover:text-green-800">
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