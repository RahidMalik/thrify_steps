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
import { Eye, EyeOff, Check, X } from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, loginWithGoogle } = useAuth(); // Access the GoogleLogin function from there;
  const navigate = useNavigate();

  const requirements = [
    { re: /[a-z]/, label: "One lowercase letter" },
    { re: /[A-Z]/, label: "One uppercase letter" },
    { re: /[0-9]/, label: "One number" },
    { re: /[^A-Za-z0-9]/, label: "One special character" },
    { re: /.{8,}/, label: "At least 8 characters" },
  ];

  const validatePassword = (pass: string) => {
    return requirements.every((req) => req.re.test(pass));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!validatePassword(password)) {
      toast.error("Password does not meet all requirements");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/", { replace: true });
    } catch (error) {
      const err = error as Error;
      console.error("Registration error:", err);
      toast.error(err.message || "Registration failed");
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
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-20 pb-20">
          <section className="section-padding bg-background">
            <div className="container-custom max-w-md mx-auto">
              <div className="bg-card p-8 rounded-2xl shadow-lg border border-border/50">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                  <p className="text-muted-foreground">Join Thrifty Steps today</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pr-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>


                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pr-10"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-1 mt-3">
                    {requirements.map((req, idx) => {
                      const isMet = req.re.test(password);
                      return (
                        <div key={idx} className={`flex items-center text-xs ${isMet ? 'text-green-500' : 'text-muted-foreground'}`}>
                          {isMet ? <Check size={12} className="mr-1" /> : <X size={12} className="mr-1" />}
                          {req.label}
                        </div>
                      );
                    })}
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>

                {/* --- OR DIVIDER --- */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500">Or continue with</span>
                  </div>
                </div>

                {/* --- GOOGLE BUTTON --- */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 rounded-xl flex items-center justify-center gap-3 border-slate-200 hover:bg-slate-50 transition-all"
                  onClick={handleGoogleClick}
                  disabled={loading}
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                  <span className="font-semibold text-slate-700">Continue with Google</span>
                </Button>

                <div className="mt-6 text-center text-sm">
                  <span className="text-muted-foreground">Already have an account? </span>
                  <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </PublicRoute>
  );
};

export default Register;