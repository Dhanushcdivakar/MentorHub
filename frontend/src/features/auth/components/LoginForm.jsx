import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { loginSchema } from "../schemas/auth.schema";
import { loginUserApi, googleLoginApi } from "@/api/auth.api";
import { setCredentials } from "@/redux/slices/authSlice";
import { setUserProfile } from "@/redux/slices/userSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to previously saved location or dashboard
  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    const toastId = toast.loading("Logging you in...");
    try {
      const response = await loginUserApi(data);
      if (response.success && response.data) {
        const { accessToken, user } = response.data;

        // Save credentials and profile in Redux/LocalStorage
        dispatch(setCredentials({ accessToken }));
        dispatch(setUserProfile(user));

        toast.success("Welcome back!", { id: toastId });

        // Navigate based on user role or previous route
        if (from === "/") {
          const role = user.role?.toLowerCase();
          if (role === "student") navigate("/student", { replace: true });
          else if (role === "mentor") navigate("/mentor", { replace: true });
          else if (role === "admin") navigate("/admin", { replace: true });
          else navigate("/", { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      } else {
        toast.error(response.message || "Invalid email or password", { id: toastId });
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Something went wrong. Please check your credentials.";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    const toastId = toast.loading("Signing in with Google...");
    try {
      const response = await googleLoginApi(credentialResponse.credential);
      if (response.success && response.data) {
        const { accessToken, user } = response.data;

        // Save credentials and profile in Redux/LocalStorage
        dispatch(setCredentials({ accessToken }));
        dispatch(setUserProfile(user));

        toast.success("Welcome back!", { id: toastId });

        // Navigate based on user role or previous route
        if (from === "/") {
          const role = user.role?.toLowerCase();
          if (role === "student") navigate("/student", { replace: true });
          else if (role === "mentor") navigate("/mentor", { replace: true });
          else if (role === "admin") navigate("/admin", { replace: true });
          else navigate("/", { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      } else {
        toast.error(response.message || "Google sign-in failed", { id: toastId });
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Google sign-in failed. Please try again.";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Welcome Back</h2>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to log into your account
        </p>
      </div>

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

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-muted-foreground" htmlFor="password">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-primary hover:underline transition-all"
            >
              Forgot password?
            </Link>
          </div>
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

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full py-5 rounded-xl bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-600/95 font-semibold tracking-wide text-primary-foreground shadow-lg shadow-primary/10 transition-all"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <div className="relative my-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/80" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 text-muted-foreground font-semibold">Or continue with</span>
        </div>
      </div>

      <div className="flex justify-center w-full">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            toast.error("Google sign-in was cancelled or failed.");
          }}
          useOneTap
        />
      </div>

      <div className="text-center text-sm text-muted-foreground mt-1">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-semibold text-primary hover:underline transition-all">
          Sign Up
        </Link>
      </div>
    </div>
  );
}
