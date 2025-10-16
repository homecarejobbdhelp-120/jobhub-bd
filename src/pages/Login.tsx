import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import ReCAPTCHA from "react-google-recaptcha";
import { AlertCircle, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Error and success states
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // reCAPTCHA
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState("");

  // Get reCAPTCHA site key from environment
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; // Test key for development

  // Check if already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  // Show success message if redirected from signup
  useEffect(() => {
    if (searchParams.get("msg") === "created") {
      setSuccessMessage("Account created successfully, please log in.");
    }
  }, [searchParams]);

  // Handle reCAPTCHA change
  const onCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
    setCaptchaError("");
  };

  // Email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCaptchaError("");

    // Validate email format
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Check captcha
    if (!captchaToken) {
      setCaptchaError("Please verify you are not a robot.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Handle specific auth errors
        if (authError.message.includes("Invalid login credentials")) {
          setError("Invalid email or password.");
        } else if (authError.message.includes("Email not confirmed")) {
          setError("Please verify your email before logging in.");
        } else {
          setError(authError.message);
        }
        return;
      }

      // Success - redirect to dashboard
      navigate("/dashboard");
    } catch (err: any) {
      setError("Something went wrong, please try again.");
    } finally {
      setLoading(false);
      // Reset captcha after submission
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Navbar />
      
      <div className="w-full max-w-md mx-auto">
        {/* Success Message Banner */}
        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message Banner */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Login Card */}
        <Card className="shadow-lg rounded-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl font-bold">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Log in to your account to continue
            </CardDescription>
          </CardHeader>
            
          <CardContent className="pb-8">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-sm"
                  disabled={loading}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base">
                  Password *
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 text-sm"
                  disabled={loading}
                />
              </div>

              {/* reCAPTCHA */}
              <div className="flex flex-col items-center py-3">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={RECAPTCHA_SITE_KEY}
                  onChange={onCaptchaChange}
                />
                {captchaError && (
                  <p className="text-destructive text-sm mt-2">{captchaError}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {loading ? "Logging in..." : "Log In"}
              </Button>
            </form>

            {/* Switch to Signup Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-primary hover:text-primary/90 font-medium hover:underline"
                >
                  Create one here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
