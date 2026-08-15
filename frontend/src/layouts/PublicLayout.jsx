import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Menu, LogOut, LayoutDashboard, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import ThemeToggle from "@/components/ThemeToggle";
import { clearCredentials } from "@/redux/slices/authSlice";
import { clearUserProfile } from "@/redux/slices/userSlice";
import { logoutUserApi } from "@/api/auth.api";
import { PUBLIC_NAV_LINKS, APP_NAME } from "@/constants";
import { useApp } from "@/context/AppContext";

export default function PublicLayout() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isMobileOpen, setIsMobileOpen } = useApp();

  const handleLogout = async () => {
    try {
      await logoutUserApi();
    } catch (err) {
      console.error("Logout failed:", err);
    }
    dispatch(clearCredentials());
    dispatch(clearUserProfile());
    setIsMobileOpen(false);
    navigate("/");
  };


  const getDashboardPath = () => {
    if (!user) return "/";
    const role = user.role?.toLowerCase();
    if (role === "student") return "/student";
    if (role === "mentor") return "/mentor";
    if (role === "admin") return "/admin";
    return "/";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
              {APP_NAME}
            </span>
          </Link>

          {/* Desktop Navlinks */}
          <nav className="hidden md:flex items-center gap-6">
            {PUBLIC_NAV_LINKS.filter((link) => {
              if (link.path === "/books") {
                return isAuthenticated;
              }
              if (link.path === "/mentors") {
                return isAuthenticated && user?.role?.toLowerCase() !== "mentor";
              }
              return true;
            }).map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors hover:text-primary ${
                    isActive ? "text-primary font-semibold" : "text-muted-foreground"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                  <Link to={getDashboardPath()}>
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Log Out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">Log In</Link>
                </Button>
                <Button asChild size="sm" className="bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-primary-foreground">
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Navigation Trigger */}
          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle />
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger className="size-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-all">
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] flex flex-col p-6">
                <SheetTitle className="text-left font-bold text-xl mb-4">
                  <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                    {APP_NAME}
                  </span>
                </SheetTitle>
                <nav className="flex flex-col gap-4 mt-4">
                  {PUBLIC_NAV_LINKS.filter((link) => {
                    if (link.path === "/books") {
                      return isAuthenticated;
                    }
                    if (link.path === "/mentors") {
                      return isAuthenticated && user?.role?.toLowerCase() !== "mentor";
                    }
                    return true;
                  }).map((link) => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={({ isActive }) =>
                        `text-lg font-medium py-1 transition-colors hover:text-primary ${
                          isActive ? "text-primary font-semibold" : "text-muted-foreground"
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </nav>

                <div className="mt-auto border-t border-border/40 pt-6 flex flex-col gap-3">
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center gap-3 mb-2 px-1">
                        <div className="rounded-full bg-muted p-2">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold truncate max-w-[180px]">{user?.name}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[180px]">{user?.email}</span>
                        </div>
                      </div>
                      <Button asChild className="w-full gap-2 justify-center" onClick={() => setIsMobileOpen(false)}>
                        <Link to={getDashboardPath()}>
                          <LayoutDashboard className="h-4 w-4" />
                          Go to Dashboard
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full gap-2 justify-center text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                        Log Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild variant="outline" className="w-full" onClick={() => setIsMobileOpen(false)}>
                        <Link to="/login">Log In</Link>
                      </Button>
                      <Button asChild className="w-full bg-gradient-to-r from-primary to-violet-600 text-primary-foreground" onClick={() => setIsMobileOpen(false)}>
                        <Link to="/register">Sign Up</Link>
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">About</Link>
            {isAuthenticated && (
              <>
                {user?.role?.toLowerCase() !== "mentor" && (
                  <Link to="/mentors" className="text-sm text-muted-foreground hover:text-foreground">Mentors</Link>
                )}
                <Link to="/books" className="text-sm text-muted-foreground hover:text-foreground">Books</Link>
              </>
            )}
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-muted-foreground">
              &copy; {new Date().getFullYear()} {APP_NAME}, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
