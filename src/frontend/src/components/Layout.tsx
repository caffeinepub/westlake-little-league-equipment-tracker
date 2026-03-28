import { Button } from "@/components/ui/button";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowUpFromLine,
  BarChart3,
  Bell,
  ChevronDown,
  LayoutDashboard,
  Menu,
  Package,
  RotateCcw,
  Settings,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/inventory", label: "Inventory", icon: Package },
  { path: "/issue", label: "Issue", icon: ArrowUpFromLine },
  { path: "/returns", label: "Returns", icon: RotateCcw },
  { path: "/reports", label: "Reports", icon: BarChart3 },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function isActive(path: string) {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  }

  // Close sidebar on route change (mobile)
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally re-run on path change
  useEffect(() => {
    setSidebarOpen(false);
  }, [currentPath]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "oklch(0.965 0.006 250)" }}
    >
      {/* Top Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 gap-4"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.055 247) 0%, oklch(0.29 0.065 245) 100%)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white/70 hover:text-white transition-colors p-1 md:hidden"
          aria-label="Toggle sidebar"
          data-ocid="nav.menu.button"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        {/* Desktop hamburger */}
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white/70 hover:text-white transition-colors p-1 hidden md:block"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <div className="flex items-center gap-2 mr-4">
          <img
            src="/assets/uploads/gemini_generated_image_5j6l4b5j6l4b5j6l-019d3531-a5fa-75ff-8e99-4828ec3a6f02-1.png"
            alt="Westlake Little League"
            className="h-8 w-8 rounded-full object-cover"
          />
          <span className="font-bold text-white text-sm hidden sm:block">
            Westlake Little League
          </span>
        </div>

        {/* Top nav links - desktop */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              data-ocid={`nav.${item.label.toLowerCase().replace(/ /g, "_")}.link`}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                isActive(item.path)
                  ? "text-white border-b-2"
                  : "text-white/65 hover:text-white"
              }`}
              style={
                isActive(item.path)
                  ? { borderBottomColor: "oklch(0.55 0.17 25)" }
                  : {}
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="text-white/70 hover:text-white p-1.5 rounded transition-colors"
            aria-label="Notifications"
          >
            <Bell size={16} />
          </button>
          <div className="flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded hover:bg-white/10 transition-colors">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-white/20 text-white">
              A
            </div>
            <span className="text-white text-xs hidden sm:block">Admin</span>
            <ChevronDown size={12} className="text-white/60" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-14">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-14 bottom-0 z-40 flex flex-col transition-all duration-200 ${
            sidebarOpen ? "w-52" : "w-0 overflow-hidden"
          }`}
          style={{
            background: "oklch(0.22 0.055 247)",
            borderRight: "1px solid oklch(0.28 0.04 247)",
          }}
        >
          <div className="px-3 py-4 flex-1">
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3 px-2"
              style={{ color: "oklch(0.6 0.025 250)" }}
            >
              Equipment
            </p>
            <nav className="space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    data-ocid={`sidebar.${item.label.toLowerCase().replace(/ /g, "_")}.link`}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded text-sm font-medium transition-colors ${
                      active
                        ? "text-white"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                    style={active ? { background: "oklch(0.55 0.17 25)" } : {}}
                  >
                    <Icon size={16} className="shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div
            className="p-3 border-t"
            style={{ borderColor: "oklch(0.28 0.04 247)" }}
          >
            <p
              className="text-xs text-center"
              style={{ color: "oklch(0.55 0.02 250)" }}
            >
              Equipment Tracker v1.0
            </p>
          </div>
        </aside>

        {/* Main content — on desktop shifts with sidebar, on mobile never shifts */}
        <main
          className={`flex-1 transition-all duration-200 flex flex-col min-h-0 pb-16 md:pb-0 ${
            sidebarOpen ? "md:ml-52" : "ml-0"
          }`}
        >
          <div className="flex-1 p-4 md:p-5">{children}</div>

          {/* Footer */}
          <footer
            className="mt-auto"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.22 0.055 247) 0%, oklch(0.29 0.065 245) 100%)",
            }}
          >
            <div className="px-6 py-5 flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <p className="font-bold text-white text-sm">
                  Westlake Little League
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "oklch(0.65 0.02 250)" }}
                >
                  Equipment tracking & inventory management
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="text-xs hover:text-white transition-colors"
                    style={{ color: "oklch(0.65 0.02 250)" }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div
              className="border-t px-6 py-3 flex flex-col sm:flex-row justify-between items-center gap-2"
              style={{ borderColor: "oklch(0.28 0.04 247)" }}
            >
              <p className="text-xs" style={{ color: "oklch(0.55 0.02 250)" }}>
                © {new Date().getFullYear()} Westlake Little League. All rights
                reserved.
              </p>
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs hover:text-white transition-colors"
                style={{ color: "oklch(0.55 0.02 250)" }}
              >
                Built with ❤️ using caffeine.ai
              </a>
            </div>
          </footer>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.055 247) 0%, oklch(0.29 0.065 245) 100%)",
          borderTop: "1px solid oklch(0.28 0.04 247)",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              data-ocid={`bottom_nav.${item.label.toLowerCase().replace(/ /g, "_")}.link`}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors"
              style={{
                color: active ? "oklch(0.85 0.08 25)" : "oklch(0.65 0.02 250)",
              }}
            >
              <Icon size={18} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
