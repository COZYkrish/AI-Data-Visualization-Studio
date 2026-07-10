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
  Keyboard,
  Lightbulb,
} from "lucide-react";
import { CommandPalette } from "../features/premium/components/CommandPalette";
import { NotificationCenter } from "../features/premium/components/NotificationCenter";
import { NaturalLanguageQueryBar } from "../features/premium/components/NaturalLanguageQueryBar";
import { SkipNavigation } from "../features/premium/components/SkipNavigation";
import { KeyboardShortcutDialog } from "../features/premium/components/KeyboardShortcutDialog";
import { SuggestionPanel } from "../features/premium/components/SuggestionPanel";
import {
  useCommandPaletteStore,
  useNotificationPanelStore,
  useSuggestionStore,
} from "../store/premium.store";
import { useNotifications } from "../features/premium/hooks/useNotifications";
import {
  useShortcuts,
  useKeyboardShortcutListener,
} from "../features/premium/hooks/useKeyboardShortcuts";
import { usePreferences } from "../features/premium/hooks/usePreferences";

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const { isSidebarOpen, toggleSidebar } = useAppStore();
  const { theme, setTheme } = useThemeStore();
  const { user, logout } = useUserStore();

  // Premium state
  const { open: openPalette } = useCommandPaletteStore();
  const {
    isOpen: isNotifOpen,
    setOpen: setNotifOpen,
    unreadCount,
  } = useNotificationPanelStore();
  const { isOpen: isSuggestOpen, setOpen: setSuggestOpen } =
    useSuggestionStore();
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);

  // Load premium data
  useNotifications();
  useShortcuts();
  usePreferences();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Register keyboard shortcuts
  useKeyboardShortcutListener({
    open_command_palette: openPalette,
    toggle_theme: handleThemeToggle,
    go_dashboard: () => navigate("/dashboard"),
    go_datasets: () => navigate("/dashboard/datasets"),
    go_ml: () => navigate("/dashboard/ml"),
    go_analytics: () => navigate("/dashboard/analytics"),
    go_projects: () => navigate("/dashboard/projects"),
    go_reports: () => navigate("/dashboard/reports"),
    go_settings: () => navigate("/dashboard/settings"),
    upload_dataset: () => navigate("/dashboard/datasets/upload"),
    open_notifications: () => setNotifOpen(!isNotifOpen),
    show_help: () => setShortcutsOpen(true),
  });

  // Cmd+K global listener
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        openPalette();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openPalette]);

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
    <>
      {/* Accessibility — skip nav */}
      <SkipNavigation />

      {/* Global Overlays */}
      <CommandPalette
        onThemeToggle={handleThemeToggle}
        onOpenNotifications={() => setNotifOpen(true)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
      />
      <NotificationCenter
        isOpen={isNotifOpen}
        onClose={() => setNotifOpen(false)}
      />
      <KeyboardShortcutDialog
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-20 flex flex-col border-r bg-card text-card-foreground transition-all duration-300 md:static ${
            isSidebarOpen ? "w-64" : "w-20"
          } ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
          aria-label="Sidebar navigation"
        >
          <div className="flex h-16 items-center justify-between px-6 border-b">
            <Link
              to="/dashboard"
              className="flex items-center space-x-2"
              aria-label="Studio.ai home"
            >
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
              aria-label="Close sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <nav
            className="flex-grow space-y-1 p-4 overflow-y-auto custom-scrollbar"
            aria-label="Main navigation"
          >
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
                aria-current={undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
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
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
              {isSidebarOpen && <span>Sign Out</span>}
            </Button>
          </div>
        </aside>

        {/* Main Panel */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top Navbar */}
          <header
            className="flex h-16 items-center justify-between border-b px-6 bg-card text-card-foreground"
            role="banner"
          >
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="hidden md:flex"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* NLQ Bar */}
              <NaturalLanguageQueryBar />
            </div>

            <div className="flex items-center space-x-2">
              {/* Suggestions toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSuggestOpen(!isSuggestOpen)}
                className={`rounded-full ${isSuggestOpen ? "bg-amber-500/10 text-amber-500" : ""}`}
                aria-label="Toggle suggestions panel"
                title="AI Suggestions"
              >
                <Lightbulb className="h-4 w-4" />
              </Button>

              {/* Shortcuts help */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShortcutsOpen(true)}
                className="rounded-full"
                aria-label="Keyboard shortcuts"
                title="Keyboard shortcuts (?)"
              >
                <Keyboard className="h-4 w-4" />
              </Button>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleThemeToggle}
                className="rounded-full"
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Moon className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full"
                onClick={() => setNotifOpen(!isNotifOpen)}
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span
                    className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground"
                    aria-hidden="true"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>

              {/* User Dropdown */}
              <Dropdown
                trigger={
                  <button
                    className="flex items-center gap-2 hover:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all duration-200"
                    aria-label="User menu"
                  >
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
                  <UserIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>Profile</span>
                </DropdownItem>
                <DropdownItem onClick={() => navigate("/dashboard/settings")}>
                  <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>Settings</span>
                </DropdownItem>
                <DropdownSeparator />
                <DropdownItem
                  onClick={handleLogout}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>Sign Out</span>
                </DropdownItem>
              </Dropdown>
            </div>
          </header>

          {/* Content Viewport */}
          <div className="flex flex-1 overflow-hidden">
            {/* Suggestion Panel (left) */}
            <SuggestionPanel
              isOpen={isSuggestOpen}
              onClose={() => setSuggestOpen(false)}
            />

            <main
              id="main-content"
              className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-background"
              tabIndex={-1}
            >
              <div className="mx-auto max-w-7xl">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
};
export default DashboardLayout;
