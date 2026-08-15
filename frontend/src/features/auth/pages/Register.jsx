import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, Loader2, GraduationCap, Briefcase } from "lucide-react";
import toast from "react-hot-toast";

import { registerSchema } from "../schemas/auth.schema";
import { registerUserApi } from "@/api/auth.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "student",
    },
  });

  const activeRole = watch("role");

  const onSubmit = async (data) => {
    setIsLoading(true);
    const toastId = toast.loading("Creating your account...");
    try {
      const response = await registerUserApi(data);
      if (response.success) {
        toast.success("Account created! Please sign in.", { id: toastId });
        navigate("/login", { state: { email: data.email } });
      } else {
        toast.error(response.message || "Registration failed", { id: toastId });
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Something went wrong. Email may already be in use.";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Create Account</h2>
        <p className="text-sm text-muted-foreground">
          Sign up to get started on MentorHub
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role Selector Card */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            Choose Account Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* Student Option */}
            <div
              onClick={() => setValue("role", "student")}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all hover:bg-muted/50 ${
                activeRole === "student"
                  ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/10"
                  : "border-border/80 text-muted-foreground bg-muted/10"
              }`}
            >
              <GraduationCap className="h-6 w-6" />
              <div className="text-center">
                <p className="text-xs font-bold">Student</p>
                <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">I want to learn</p>
              </div>
            </div>

            {/* Mentor Option */}
            <div
              onClick={() => setValue("role", "mentor")}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all hover:bg-muted/50 ${
                activeRole === "mentor"
                  ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/10"
                  : "border-border/80 text-muted-foreground bg-muted/10"
              }`}
            >
              <Briefcase className="h-6 w-6" />
              <div className="text-center">
                <p className="text-xs font-bold">Mentor</p>
                <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">I want to teach</p>
              </div>
            </div>
          </div>
          {errors.role && (
            <p className="text-xs font-medium text-destructive">{errors.role.message}</p>
          )}
        </div>

        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground" htmlFor="name">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              className="pl-9 bg-muted/20 border-border/80 rounded-xl py-5"
              disabled={isLoading}
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p className="text-xs font-medium text-destructive">{errors.name.message}</p>
          )}
        </div>

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
          <label className="text-xs font-semibold text-muted-foreground" htmlFor="password">
            Password
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

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full py-5 rounded-xl bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-600/95 font-semibold tracking-wide text-primary-foreground shadow-lg shadow-primary/10 transition-all"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creating Account...
            </>
          ) : (
            "Sign Up"
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground mt-2">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline transition-all">
          Log In
        </Link>
      </div>
    </div>
  );
}
