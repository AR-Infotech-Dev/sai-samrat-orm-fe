import LinearProgress from "../ui/LinearProgress";

function AppShell({ topbar, sidebar, toolbar, children, overlay, isSidebarCollapsed = false }) {
  return (
    <div className="app-shell">
      <LinearProgress />
      <div className={`app-frame ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        {sidebar}
        <div className="main-frame">
          {topbar}
          <main className="content-area">
            {toolbar}
            {children}
          </main>
        </div>
        {overlay}
      </div>
    </div>
  );
}

export default AppShell;
