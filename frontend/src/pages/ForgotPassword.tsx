import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { toast } from "sonner";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import api from "@/lib/api"; // Make sure your api.ts has requestPasswordReset

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error("Please enter your email address");
            return;
        }

        setLoading(true);
        try {
            const response = await api.forgotPassword(email);

            if (response.success) {
                setIsSubmitted(true);
                toast.success("Reset link sent to your email!");
            }
        } catch (error) {
            const err = error as Error;
            console.error("Forgot password error:", err);
            toast.error(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow pt-28 pb-20 bg-slate-50">
                <section className="container-custom max-w-md mx-auto px-4">
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">

                        {/* Back to Login */}
                        <Link
                            to="/login"
                            className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary mb-6 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Sign In
                        </Link>

                        {!isSubmitted ? (
                            <>
                                <div className="text-left mb-8">
                                    <h1 className="text-3xl font-black mb-2 tracking-tight">Forgot Password?</h1>
                                    <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                                        Don't worry! Enter your email below and we'll send you a link to reset your password.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Email Address
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="malik@example.com"
                                                className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-primary"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                                        disabled={loading}
                                    >
                                        {loading ? "Sending Link..." : "Send Reset Link"}
                                    </Button>
                                </form>
                            </>
                        ) : (
                            /* Success State */
                            <div className="text-center py-4">
                                <div className="flex justify-center mb-6">
                                    <div className="bg-green-100 p-4 rounded-full">
                                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                                    </div>
                                </div>
                                <h2 className="text-2xl font-black mb-2">Check Your Email</h2>
                                <p className="text-muted-foreground text-sm font-medium mb-8 leading-relaxed">
                                    We've sent a password reset link to <br />
                                    <span className="text-slate-900 font-bold">{email}</span>
                                </p>
                                <Button
                                    variant="outline"
                                    className="w-full h-12 rounded-xl font-bold"
                                    onClick={() => setIsSubmitted(false)}
                                >
                                    Didn't get the email? Try again
                                </Button>
                            </div>
                        )}

                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default ForgotPassword;