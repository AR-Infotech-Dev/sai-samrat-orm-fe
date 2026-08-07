import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { getAuthRoutes } from "./AuthRoutes";
import { useAuth } from "@auth/components/AuthProvider";
import { getCurrentSession, getStoredMenuList, getStoredPermissions, saveMenuList } from "@auth/utils/authStorage";
import { fetchMenuList, flattenMenus, getFirstAllowedPath, getMenuId, getMenuLink, normalizePath } from "@auth/utils/permissions";
import ProtectedRoute from "./ProtectedRoute";
import PermissionRoute from "./PermissionRoute";
import FlowupSLoader from "../components/ui/FlowupsLoader";

const AppLayout = lazy(() => import("@layouts/AppLayout"));
const Dashboard = lazy(() => import("@modules/dashboard/Dashboard"));
const UsersModulePage = lazy(() => import("@modules/users/UsersModulePage"));
const MenuMasterModulePage = lazy(() => import("@modules/menu-master/MenuMasterModulePage"));
const CustomerModulePage = lazy(() => import("@modules/customer/CustomerModulePage"));
const CategoryModulePage = lazy(() => import("@modules/category/CategoryModulePage"));
const ProductModulePage = lazy(() => import("@modules/products/ProductModulePage"));
const AccessControlModulePage = lazy(() => import("@modules/access-control/AccessControlModulePage"));
const UserProfilePage = lazy(() => import("@modules/profile/UserProfilePage"));
const OrdersBookingPage = lazy(() => import("@modules/orders/booking/OrdersBookingPage"));
const OrderConfirmationPage = lazy(() => import("@/modules/orders/confirmation/OrdersConfirmationPage"));
const OrderPlanningPage = lazy(() => import("@modules/orders/planning/OrderPlanningPage"));
const ProductionPage = lazy(() => import("@modules/orders/production/OrdersModulePage"));
const ReadyStockPage = lazy(() => import("@modules/orders/ready-stock/OrdersModulePage"));
const DispatchPage = lazy(() => import("@/modules/orders/dispatch/DispatchModulePage"));

const withPermission = (menuId, element) => (
  <PermissionRoute menuId={menuId}>{element}</PermissionRoute>
);

// Frontend needs to know which component should open for each menuLink.
// The route path and menu_id still come from the API menu list.
const menuRouteComponents = {
  "/dashboard": Dashboard,
  "/users": UsersModulePage,
  "/menus": MenuMasterModulePage,
  "/customers": CustomerModulePage,
  "/products": ProductModulePage,
  "/product": ProductModulePage,
  "/categories": CategoryModulePage,
  "/category": CategoryModulePage,
  "/access-control": AccessControlModulePage,

  "/order-booking": OrdersBookingPage,
  "/booking": OrdersBookingPage,
  "/order-confirmation": OrderConfirmationPage,
  "/confirmation": OrderConfirmationPage,
  "/order-planning": OrderPlanningPage,
  "/planning": OrderPlanningPage,
  "/production": ProductionPage,
  "/ready-stock": ReadyStockPage,
  "/dispatch": DispatchPage,
};

function DefaultMenuRedirect() {
  const { authSession } = useAuth();
  const fallbackPath = getFirstAllowedPath({ user: authSession?.user });

  if (fallbackPath) {
    return <Navigate to={fallbackPath} replace />;
  }

  if (!authSession) {
    return <Navigate to="/login" replace />;
  }

  return <NoMenuPermission />;
}

function RouteFallback({ loading }) {
  if (loading) {
    return <div className="p-6 text-sm text-slate-500">Loading menu...</div>;
  }
  return <DefaultMenuRedirect />;
}

function PageLoader() {
  return <FlowupSLoader/>;
}

function NoMenuPermission() {
  return (
    <div className="flex min-h-105 items-center justify-center p-6">
      <div className="max-w-sm rounded-md border border-slate-200 bg-white p-6 text-center">
        <h2 className="text-base font-semibold text-slate-900">No Menu Permission</h2>
        <p className="mt-2 text-sm text-slate-500">
          You are logged in, but no menu view permission is available for this user.
        </p>
      </div>
    </div>
  );
}

function MainRoutes() {
  const location = useLocation();
  const storedMenus = getStoredMenuList();
  const [menus, setMenus] = useState(() => storedMenus);
  const [loadingMenus, setLoadingMenus] = useState(!storedMenus.length);
  const { authSession } = useAuth();

  useEffect(() => {
    const syncMenus = (event) => {
      const nextMenus = event?.detail || getStoredMenuList();
      setMenus(nextMenus);
      setLoadingMenus(false);
    };

    window.addEventListener("crm:menus-updated", syncMenus);
    return () => window.removeEventListener("crm:menus-updated", syncMenus);
  }, []);

  useEffect(() => {
    const loadMenus = async () => {
      if (location.pathname === "/login" || location.pathname.startsWith("/feedback/") || location.pathname.startsWith("/mark_visit/")) {
        setLoadingMenus(false);
        return;
      }

      if (!getCurrentSession()) {
        setMenus([]);
        setLoadingMenus(false);
        return;
      }

      try {
        setLoadingMenus(true);
        const stored = getStoredMenuList();
        if (stored.length) {
          setMenus(stored);
          return;
        }
        const nextMenus = await fetchMenuList("ithech mainroutes madhe", {
          fallbackPermissions: getStoredPermissions(),
        });
        saveMenuList(nextMenus);
        setMenus(nextMenus);
      } finally {
        setLoadingMenus(false);
      }
    };

    loadMenus();
  }, [authSession, location.pathname]);

  const dynamicRoutes = useMemo(
    () =>
      flattenMenus(menus)
        .map((menu) => {
          const path = normalizePath(getMenuLink(menu));
          const menuId = getMenuId(menu);
          const PageComponent = menuRouteComponents[path];

          if (!path || !menuId || !PageComponent) return null;

          return {
            path,
            menuId,
            element: withPermission(menuId, <PageComponent menu_id={menuId} />),
          };
        })
        .filter(Boolean),
    [menus]
  );

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<DefaultMenuRedirect />} />
        {getAuthRoutes()}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/profile" element={<UserProfilePage />} />
            {dynamicRoutes.map((route) => (
              <Route key={`${route.path}-${route.menuId}`} path={route.path} element={route.element} />
            ))}
            <Route path="*" element={<RouteFallback loading={loadingMenus} />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}

export default MainRoutes;



