import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import ReCAPTCHA from "react-google-recaptcha";
import { AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Error state
  const [error, setError] = useState("");
  
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

  // Handle signup submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCaptchaError("");

    // Validate email format
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Validate password length (minimum 8 characters)
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Check captcha
    if (!captchaToken) {
      setCaptchaError("Please verify you are not a robot.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (authError) {
        // Handle specific auth errors
        if (authError.message.includes("User already registered")) {
          setError("Email already registered. Please log in instead.");
        } else {
          setError(authError.message);
        }
        return;
      }

      // Success - redirect to login with success message
      navigate("/login?msg=created");
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
        {/* Error Message Banner */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Signup Card */}
        <Card className="shadow-lg rounded-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl font-bold">
              Create Account
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Join HomeCare Job BD today
            </CardDescription>
          </CardHeader>
            
          <CardContent className="pb-8">
            <form onSubmit={handleSignup} className="space-y-4">
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
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-12 text-sm"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-base">
                  Confirm Password *
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
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
                {loading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>

            {/* Switch to Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:text-primary/90 font-medium hover:underline"
                >
                  Log in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
