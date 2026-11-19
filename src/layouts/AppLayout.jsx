import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@components/Sidebar";
import TopBar from "@components/TopBar";
import AppShell from "@components/layout/AppShell";
import { useAuth } from "@auth/components/AuthProvider";


function AppLayout() {
  const { logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSidebarCollapsed(true);
  }, [location.pathname]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <AppShell
      isSidebarCollapsed={isSidebarCollapsed}
      topbar={(
        <TopBar
          onLogout={logout}
          showMenuButton={false}
          onMenuToggle={() => setIsMobileMenuOpen((current) => !current)}
          isMenuOpen={isMobileMenuOpen}
        />
      )}
      sidebar={(
        <>
          <Sidebar
            isMobileOpen={isMobileMenuOpen}
            isSidebarCollapsed={isSidebarCollapsed}
            onClose={() => {
              setIsMobileMenuOpen(false);
            }}
            onSelectModule={() => {
              setIsMobileMenuOpen(false);
            }}
          />
        </>
      )}
    >
      <Outlet />
    </AppShell>
  );
}

export default AppLayout;
