import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";
import Sidebar from "@components/Sidebar";
import TopBar from "@components/TopBar";
import AppShell from "@components/layout/AppShell";
import { useAuth } from "@auth/components/AuthProvider";

const isDashboardPath = (pathname = "") => pathname === "/" || pathname === "/dashboard" || pathname.endsWith("/dashboard");

function AppLayout() {
  const { logout } = useAuth();
  const location = useLocation();
  const dashboardRoute = useMemo(() => isDashboardPath(location.pathname), [location.pathname]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDashboardSidebarOpen, setIsDashboardSidebarOpen] = useState(false);

  const isSidebarCollapsed = dashboardRoute && !isDashboardSidebarOpen;

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDashboardSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        if (dashboardRoute) setIsDashboardSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [dashboardRoute]);

  return (
    <AppShell
      isSidebarCollapsed={isSidebarCollapsed}
      topbar={(
        <TopBar
          onLogout={logout}
          onMenuToggle={() => {
            if (dashboardRoute) {
              setIsDashboardSidebarOpen((current) => !current);
              return;
            }
            setIsMobileMenuOpen((current) => !current);
          }}
          isMenuOpen={isMobileMenuOpen || isDashboardSidebarOpen}
        />
      )}
      sidebar={(
        <>
          <Sidebar
            isMobileOpen={isMobileMenuOpen || isDashboardSidebarOpen}
            isDashboardCollapsed={isSidebarCollapsed}
            onClose={() => {
              setIsMobileMenuOpen(false);
              setIsDashboardSidebarOpen(false);
            }}
            onSelectModule={() => {
              setIsMobileMenuOpen(false);
              setIsDashboardSidebarOpen(false);
            }}
          />

          {dashboardRoute && (
            <button
              type="button"
              className={`dashboard-sidebar-toggle ${isSidebarCollapsed ? "" : "is-open"}`}
              onClick={() => setIsDashboardSidebarOpen((current) => !current)}
              aria-label={isSidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
              title={isSidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
            >
              {!isSidebarCollapsed ? (
                <PanelLeftClose size={13} className="text-orange-500" />
              ) : (
                <PanelLeftOpen size={13} className="text-orange-500" />
              )}
            </button>
          )}
        </>
      )}
    >
      <Outlet />
    </AppShell>
  );
}

export default AppLayout;
