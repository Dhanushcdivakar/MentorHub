import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { LogOut, ChevronLeft, ChevronRight, Menu, User } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ThemeToggle from "@/components/ThemeToggle";
import { clearCredentials } from "@/redux/slices/authSlice";
import { clearUserProfile } from "@/redux/slices/userSlice";
import { logoutUserApi } from "@/api/auth.api";
import { ROLE_NAV_LINKS, APP_NAME } from "@/constants";
import { useApp } from "@/context/AppContext";

export default function DashboardLayout() {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Retrieve sidebar state from global context
  const {
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileOpen,
    setIsMobileOpen,
  } = useApp();

  const handleLogout = async () => {
    try {
      await logoutUserApi();
    } catch (err) {
      console.error("Logout failed:", err);
    }
    dispatch(clearCredentials());
    dispatch(clearUserProfile());
    queryClient.clear();
    setIsMobileOpen(false);
    navigate("/");
  };

  const userRole = user?.role?.toLowerCase() || "student";
  const menuLinks = ROLE_NAV_LINKS[userRole] || [];

  const getPageTitle = () => {
    const activeLink = menuLinks.find((l) => location.pathname === l.path);
    return activeLink ? activeLink.label : "Dashboard";
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground overflow-hidden">
      {/* ========================================================
          DESKTOP SIDEBAR
      ======================================================== */}
      <aside
        className={`hidden md:flex flex-col border-r border-border/40 bg-card transition-all duration-300 relative ${
          isSidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Header/Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border/40">
          {!isSidebarCollapsed ? (
            <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
              <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                {APP_NAME}
              </span>
            </Link>
          ) : (
            <Link to="/" className="font-bold text-lg text-primary mx-auto">M</Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute top-1/2 -right-3 transform -translate-y-1/2 bg-card border border-border/40 rounded-full h-6 w-6 hidden md:flex items-center justify-center p-0 hover:bg-muted"
          >
            {isSidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 p-3 mt-4">
          {menuLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  } ${isSidebarCollapsed ? "justify-center" : ""}`
                }
                title={isSidebarCollapsed ? link.label : ""}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {!isSidebarCollapsed && <span>{link.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Info / Logout */}
        <div className="border-t border-border/40 p-3 flex flex-col gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            className={`w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl ${
              isSidebarCollapsed ? "justify-center px-0" : "px-3"
            }`}
            onClick={handleLogout}
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            {!isSidebarCollapsed && <span className="ml-3">Log Out</span>}
          </Button>
        </div>
      </aside>

      {/* ========================================================
          MOBILE MENU SHEETS / HEADER
      ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex h-16 items-center justify-between px-4 border-b border-border/40 bg-card sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Hamburger for mobile */}
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger className="md:hidden size-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-all">
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] flex flex-col p-6">
                <SheetTitle className="text-left font-bold text-xl mb-4">
                  <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                    {APP_NAME}
                  </span>
                </SheetTitle>
                <nav className="flex flex-col gap-3 mt-4">
                  {menuLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <NavLink
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsMobileOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
                            isActive
                              ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`
                        }
                      >
                        <Icon className="h-5 w-5" />
                        <span>{link.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>

                <div className="mt-auto border-t border-border/40 pt-6 flex flex-col gap-3">
                  <ThemeToggle />
                  <Button variant="outline" className="w-full gap-2 justify-center text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleLogout}>
                    <LogOut className="h-4.5 w-4.5" />
                    Log Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <h1 className="text-lg font-semibold tracking-tight truncate">
              {getPageTitle()}
            </h1>
          </div>

          {/* Topbar Right Content */}
          <div className="flex items-center gap-4">
            <ThemeToggle className="md:block hidden" />
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <Avatar className="h-8 w-8 ring-2 ring-primary/10 ring-offset-2 hover:ring-primary/20">
                  <AvatarImage src={user?.profilePicture} alt={user?.name} />
                  <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold uppercase">
                    {user?.name?.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal p-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground mt-0.5">{user?.email}</p>
                      <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-3xs font-medium text-primary mt-1 w-max capitalize">
                        {userRole}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="py-2.5 gap-2 cursor-pointer" asChild>
                    <Link to="/profile">
                      <User className="h-4 w-4" />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="py-2.5 gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
