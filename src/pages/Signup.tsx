import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Signup = () => {
  const [role, setRole] = useState<"caregiver" | "company">("caregiver");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "Passwords do not match!",
      });
      setLoading(false);
      return;
    }

    try {
      // 1. Sign up user with metadata (Name & Role)
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: role, // 'caregiver' or 'company'
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account.",
      });
      
      // একাউন্ট খোলার পর লগইন পেজে পাঠাবো
      navigate("/login");

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
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
              Create an Account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Join as a professional or hire one
            </p>
          </div>

          {/* === Role Slider / Toggle === */}
          <div className="bg-gray-100 p-1 rounded-lg flex relative">
            {/* Slider Animation Background */}
            <div 
              className={`absolute top-1 bottom-1 w-[48%] bg-white rounded-md shadow-sm transition-all duration-300 ease-in-out ${
                role === "company" ? "translate-x-[104%]" : "translate-x-0"
              }`}
            ></div>

            <button
              onClick={() => setRole("caregiver")}
              className={`flex-1 relative z-10 py-2 text-sm font-bold rounded-md transition-colors duration-300 ${
                role === "caregiver" ? "text-blue-700" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Caregiver / Nurse
            </button>
            <button
              onClick={() => setRole("company")}
              className={`flex-1 relative z-10 py-2 text-sm font-bold rounded-md transition-colors duration-300 ${
                role === "company" ? "text-blue-700" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Company / Employer
            </button>
          </div>

          {/* === Signup Form === */}
          <form className="mt-8 space-y-6" onSubmit={handleSignup}>
            <div className="space-y-4">
              
              {/* Name Field */}
              <div>
                <Label htmlFor="fullName" className="text-gray-700">
                  {role === "company" ? "Company Name" : "Full Name"}
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder={role === "company" ? "e.g. HealthCare BD Ltd." : "e.g. Md. Asadullah"}
                  value={formData.fullName}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>

              {/* Email Field */}
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

              {/* Password Field */}
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
              </div>

              {/* Confirm Password Field */}
              <div>
                <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>

            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-blue-900 hover:bg-blue-800 text-white font-bold text-lg rounded-lg shadow-md transition-all"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Link to="/login" className="font-bold text-blue-700 hover:text-blue-900">
                Log In
              </Link>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Signup;