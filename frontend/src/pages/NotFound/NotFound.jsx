import { Link } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex max-w-md flex-col items-center gap-6 rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="rounded-full bg-muted p-4 text-muted-foreground animate-bounce">
          <HelpCircle className="h-12 w-12" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            404
          </h1>
          <h2 className="text-xl font-semibold text-foreground">
            Page Not Found
          </h2>
          <p className="text-sm text-muted-foreground">
            The page you are looking for does not exist or has been moved. Check the URL or navigate home.
          </p>
        </div>
        <Button asChild className="w-full">
          <Link to="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
