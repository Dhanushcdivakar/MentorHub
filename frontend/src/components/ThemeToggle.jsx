import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
      aria-label="Toggle theme"
      className="rounded-full hover:bg-muted"
    >
      <Sun className="h-5 w-5 dark:hidden block text-yellow-500 animate-pulse" />
      <Moon className="h-5 w-5 dark:block hidden text-slate-400" />
    </Button>
  );
}
