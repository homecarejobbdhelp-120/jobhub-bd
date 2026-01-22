import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react"; // X আইকন ইমপোর্ট

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
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: role,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account.",
      });
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
        {/* Card এ relative ক্লাস দেওয়া হয়েছে যাতে X বাটন পজিশন করা যায় */}
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl relative">
          
          {/* ✅ ফিক্স: Close Button (X) */}
          <button 
            onClick={() => navigate("/")} 
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors bg-gray-100 hover:bg-red-50 p-1 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="mt-2 text-3xl font-extrabold text-blue-900">
              Create an Account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Join as a professional or hire one
            </p>
          </div>

          {/* Role Slider */}
          <div className="bg-gray-100 p-1 rounded-lg flex relative">
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

          <form className="mt-8 space-y-6" onSubmit={handleSignup}>
            <div className="space-y-4">
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
              </div>

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