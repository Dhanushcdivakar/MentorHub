import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Unauthorized() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.user.user);
  const role = user?.role?.toLowerCase();

  const dashboardPath = role === "mentor" ? "/mentor" : role === "admin" ? "/admin" : "/student";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="rounded-full bg-destructive/10 p-4 text-destructive">
          <ShieldAlert className="h-12 w-12" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Access Denied
          </h1>
          <p className="text-sm text-muted-foreground">
            You do not have the required permissions to view this page. Please
            contact an administrator if you believe this is an error.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2.5 sm:flex-row mt-2">
          {isAuthenticated ? (
            <Button asChild className="w-full rounded-xl bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-600/95 py-5 font-semibold text-primary-foreground">
              <Link to={dashboardPath}>Back to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline" className="w-full rounded-xl border-border/80">
                <Link to="/login">Log In</Link>
              </Button>
              <Button asChild className="w-full rounded-xl bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-600/95">
                <Link to="/">Go Home</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
