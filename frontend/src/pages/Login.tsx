import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { PublicRoute } from "@/components/ProtectedRoute";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth(); // inject loginWithGoogle  from there;
  const navigate = useNavigate();

  // Email Validation Logic
  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };
  // Password Regex Validation Logic
  const validatePasswordRegex = (pass: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Password Regex check
    if (!validatePasswordRegex(password)) {
      toast.error("Invalid password format. Check your credentials.");
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      toast.success("Welcome back to Thrifty Steps!");
      navigate("/", { replace: true });
    } catch (error) {
      const err = error as Error;
      console.error("Login error:", err);
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Google Sign In Handler
  const handleGoogleClick = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Google login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicRoute>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-28 pb-20 ">
          <section className="container-custom max-w-md mx-auto px-4">
            <div className="p-8 rounded-3xl shadow-xl border">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-black mb-2 tracking-tight">Welcome Back</h1>
                <p className="text-muted-foreground text-sm font-medium">
                  Sign in to your Thrifty Steps account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="malik@example.com"
                      className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-primary"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</Label>
                    <Link to="/forgot-password" title="Coming soon" className="text-xs font-bold text-primary hover:underline">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-12 rounded-xl border-slate-200 focus:ring-primary"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              {/* --- OR DIVIDER --- */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-400 px-2 text-slate-100 font-medium">Or continue with</span>
                </div>
              </div>

              {/* --- GOOGLE BUTTON --- */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 rounded-xl flex items-center justify-center gap-3 border-slate-200 hover:bg-slate-50 active:scale-[0.98] transition-all"
                onClick={handleGoogleClick}
                disabled={loading}
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                <span className="font-bold text-slate-700">Google</span>
              </Button>

              <div className="mt-8 text-center text-sm font-medium">
                <span className="text-slate-500">Don't have an account? </span>
                <Link to="/register" className="text-primary hover:underline font-bold">
                  Create Account
                </Link>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </PublicRoute>
  );
};

export default Login;