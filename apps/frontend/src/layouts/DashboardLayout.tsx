import * as React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAppStore, useThemeStore, useUserStore } from "../store";
import {
  Button,
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
} from "@studio/ui";
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  Menu,
  Database,
  Sun,
  Moon,
  LogOut,
  Bell,
  User as UserIcon,
  BarChart2,
  Star,
  BrainCircuit,
} from "lucide-react";

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const { isSidebarOpen, toggleSidebar } = useAppStore();
  const { theme, setTheme } = useThemeStore();
  const { user, logout } = useUserStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Datasets", path: "/dashboard/datasets", icon: Database },
    { name: "Machine Learning", path: "/dashboard/ml", icon: BrainCircuit },
    { name: "Analytics", path: "/dashboard/analytics", icon: BarChart2 },
    { name: "Saved", path: "/dashboard/saved", icon: Star },
    { name: "Projects", path: "/dashboard/projects", icon: FolderKanban },
    { name: "Settings", path: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 flex flex-col border-r bg-card text-card-foreground transition-all duration-300 md:static ${
          isSidebarOpen ? "w-64" : "w-20"
        } ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Database className="h-6 w-6 text-primary shrink-0" />
            {isSidebarOpen && (
              <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
                Studio.ai
              </span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-grow space-y-1 p-4 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                `flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-premium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {isSidebarOpen && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={`w-full flex items-center justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive ${
              !isSidebarOpen && "px-2.5"
            }`}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span>Sign Out</span>}
          </Button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between border-b px-6 bg-card text-card-foreground">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hidden md:flex"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold tracking-tight md:text-2xl font-sans text-foreground">
              Workspace
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
            </Button>

            {/* User Dropdown */}
            <Dropdown
              trigger={
                <button className="flex items-center gap-2 hover:opacity-85 focus:outline-none transition-all duration-200">
                  <Avatar
                    fallback={user?.email ? user.email.slice(0, 2) : "AI"}
                    className="border border-primary/20 h-9 w-9"
                  />
                  <div className="hidden text-left md:block">
                    <p className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                      {user?.email || "developer@studio.ai"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Premium User
                    </p>
                  </div>
                </button>
              }
            >
              <DropdownLabel>My Account</DropdownLabel>
              <DropdownSeparator />
              <DropdownItem onClick={() => navigate("/dashboard/settings")}>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownItem>
              <DropdownItem onClick={() => navigate("/dashboard/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem
                onClick={handleLogout}
                className="text-destructive hover:bg-destructive/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownItem>
            </Dropdown>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-background">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
export default DashboardLayout;
