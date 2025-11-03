import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

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
  
  // Cloudflare Turnstile
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState("");
  const [showCaptcha, setShowCaptcha] = useState(false);

  // Cloudflare Turnstile site key
  const TURNSTILE_SITE_KEY = "0x4AAAAAB-jAF9b9QV3eY20";

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

  // Set up Turnstile callback
  useEffect(() => {
    // Define callback function on window for Turnstile
    (window as any).onTurnstileSuccess = (token: string) => {
      setCaptchaToken(token);
      setCaptchaError("");
    };

    return () => {
      delete (window as any).onTurnstileSuccess;
    };
  }, []);

  // Show success message if redirected from signup
  useEffect(() => {
    if (searchParams.get("msg") === "created") {
      setSuccessMessage("Account created successfully, please log in.");
    }
  }, [searchParams]);


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

    // Show captcha if not already shown
    if (!showCaptcha) {
      setShowCaptcha(true);
      setCaptchaError("Please complete the CAPTCHA verification below.");
      return;
    }

    // Check captcha token after captcha is shown
    if (!captchaToken) {
      setCaptchaError("Please verify you are not a robot.");
      return;
    }

    setLoading(true);

    try {
      // Call edge function to verify CAPTCHA and login
      const { data: functionData, error: functionError } = await supabase.functions.invoke('verify-login', {
        body: {
          email,
          password,
          captchaToken,
        },
      });

      if (functionError) {
        setError(functionError.message || "Login failed. Please try again.");
        return;
      }

      if (functionData.error) {
        setError(functionData.error);
        return;
      }

      // Set the session in Supabase client
      if (functionData.session) {
        await supabase.auth.setSession({
          access_token: functionData.session.access_token,
          refresh_token: functionData.session.refresh_token,
        });
      }

      // Get user role and redirect accordingly
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", functionData.user.id)
        .single();

      const userRole = roleData?.role;
      
      if (userRole === "caregiver" || userRole === "nurse") {
        navigate("/caregiver-dashboard");
      } else {
        navigate("/general-dashboard");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Something went wrong, please try again.");
    } finally {
      setLoading(false);
      // Reset captcha after submission
      if ((window as any).turnstile) {
        (window as any).turnstile.reset();
      }
      setCaptchaToken(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
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

              {/* Cloudflare Turnstile - Only shown after first submit attempt */}
              {showCaptcha && (
                <div className="flex flex-col items-center justify-center py-3 w-full">
                  <div 
                    className="cf-turnstile w-full flex justify-center"
                    data-sitekey={TURNSTILE_SITE_KEY}
                    data-callback="onTurnstileSuccess"
                    style={{ minHeight: '65px' }}
                  ></div>
                </div>
              )}
              {captchaError && (
                <p className="text-destructive text-sm mt-2 text-center">{captchaError}</p>
              )}

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
