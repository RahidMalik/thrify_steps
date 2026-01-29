import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";

const ResetPasswordPage = () => {
    const { token } = useParams(); // URL se token nikalne ke liye
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        setLoading(true);
        try {
            // Backend ko naya password bhej rahe hain
            await api.resetPassword(token!, password);

            setIsSuccess(true);
            toast.success("Password reset successfully!");

            // 3 second baad login page par bhej denge
            setTimeout(() => navigate("/login"), 3000);
        } catch (error) {
            const err = error as Error;
            toast.error(err.message || "Reset failed. Link might be expired.");
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-black mb-2">All Set!</h2>
                    <p className="text-muted-foreground mb-6">Your password has been updated. Redirecting you to login...</p>
                    <Button onClick={() => navigate("/login")} className="w-full">Go to Login</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black mb-2">Set New Password</h1>
                    <p className="text-muted-foreground text-sm">Create a strong password for your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* New Password */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-500">New Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <Input
                                type={showPassword ? "text" : "password"}
                                className="pl-10 pr-10 h-12 rounded-xl"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-500">Confirm Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <Input
                                type={showPassword ? "text" : "password"}
                                className="pl-10 h-12 rounded-xl"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-12 rounded-xl font-bold" disabled={loading}>
                        {loading ? "Updating..." : "Reset Password"}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;