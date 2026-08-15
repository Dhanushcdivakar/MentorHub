import { Loader2 } from "lucide-react";

export default function PageLoader() {
  return (
    <div className="flex h-[80vh] w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading page...
        </p>
      </div>
    </div>
  );
}
