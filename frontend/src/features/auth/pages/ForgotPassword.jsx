import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { forgotPasswordSchema } from "../schemas/auth.schema";
import { forgotPasswordApi } from "@/api/auth.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    const toastId = toast.loading("Sending reset link...");
    try {
      const response = await forgotPasswordApi(data.email);
      if (response.success) {
        toast.success("Reset link sent to your email!", { id: toastId });
        setIsSent(true);
      } else {
        toast.error(response.message || "Failed to send reset link.", { id: toastId });
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Failed to send reset link. Please check the email and try again.";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Reset Password</h2>
        <p className="text-sm text-muted-foreground">
          {!isSent
            ? "Enter your email and we'll send you a link to reset your password"
            : "Please check your inbox for password reset instructions"}
        </p>
      </div>

      {!isSent ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="pl-9 bg-muted/20 border-border/80 rounded-xl py-5"
                disabled={isLoading}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs font-medium text-destructive">{errors.email.message}</p>
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
                Sending Link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
      ) : (
        <div className="flex flex-col gap-4 text-center mt-2">
          <p className="text-sm text-muted-foreground">
            If an account matches that email address, we have sent a link to reset your password.
          </p>
          <Button asChild className="w-full rounded-xl py-5 font-semibold">
            <Link to="/login">Return to Log In</Link>
          </Button>
        </div>
      )}

      {!isSent && (
        <div className="text-center text-sm text-muted-foreground mt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Log In
          </Link>
        </div>
      )}
    </div>
  );
}
