import { Link, Outlet } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function AuthLayout() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-muted/30 dark:bg-background/95 px-4 overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Buttons */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <ThemeToggle />
      </div>

      {/* Centered Auth Card */}
      <div className="w-full max-w-[440px] z-10 animate-in fade-in duration-300">
        <div className="rounded-2xl border border-border/80 bg-card p-8 shadow-xl shadow-foreground/[0.02] dark:shadow-none">
          {/* Logo Brand Header */}
          <div className="flex flex-col items-center mb-6">
            <Link to="/" className="font-bold text-2xl tracking-tight mb-2">
              <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                MentorHub
              </span>
            </Link>
          </div>
          
          <Outlet />
        </div>
      </div>
    </div>
  );
}
