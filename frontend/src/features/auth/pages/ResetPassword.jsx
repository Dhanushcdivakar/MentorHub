import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import { resetPasswordSchema } from "../schemas/auth.schema";
import { resetPasswordApi } from "@/api/auth.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    if (!token) {
      toast.error("Invalid or missing password reset token.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Updating password...");
    try {
      const response = await resetPasswordApi(token, data.password);
      if (response.success) {
        toast.success("Password updated successfully! Please log in.", { id: toastId });
        navigate("/login");
      } else {
        toast.error(response.message || "Failed to reset password.", { id: toastId });
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Failed to reset password. The link may have expired.";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col gap-6 text-center">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Invalid Link</h2>
          <p className="text-sm text-muted-foreground">
            This password reset link is invalid, broken, or has expired.
          </p>
        </div>
        <Button asChild className="w-full rounded-xl py-5 font-semibold">
          <Link to="/forgot-password">Request New Link</Link>
        </Button>
        <div className="text-center text-sm">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Set New Password</h2>
        <p className="text-sm text-muted-foreground">
          Enter your new password below to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* New Password Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground" htmlFor="password">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-9 pr-10 bg-muted/20 border-border/80 rounded-xl py-5"
              disabled={isLoading}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-destructive">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground" htmlFor="confirmPassword">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-9 pr-10 bg-muted/20 border-border/80 rounded-xl py-5"
              disabled={isLoading}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs font-medium text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full py-5 rounded-xl bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-600/95 font-semibold tracking-wide text-primary-foreground shadow-lg shadow-primary/10 transition-all"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Resetting Password...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
    </div>
  );
}
