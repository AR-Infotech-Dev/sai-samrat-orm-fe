import { createContext, lazy, Suspense, useContext, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@auth/components/AuthProvider";
import { flattenMenus, getMenuId, getMenuLink, hasMenuActionPermission } from "@auth/utils/permissions";
import { getStoredMenuList } from "@auth/utils/authStorage";

const CategoryForm = lazy(() => import("@modules/category/components/CategoryForm"));
const CategoryQuickCreateContext = createContext(null);
export const useCategoryQuickCreate = () => useContext(CategoryQuickCreateContext);

export function CategoryQuickCreateProvider({ children }) {
  const [request, setRequest] = useState(null);
  const { authSession } = useAuth();
  const [menus, setMenus] = useState(getStoredMenuList);
  useEffect(() => {
    const syncMenus = () => setMenus(getStoredMenuList());
    window.addEventListener("crm:menus-updated", syncMenus);
    return () => window.removeEventListener("crm:menus-updated", syncMenus);
  }, []);
  const categoryMenu = flattenMenus(menus).find((menu) => {
    const keys = [getMenuLink(menu), menu.module_name, menu.moduleName, menu.slug];
    return keys.some((key) => ["categories", "category", "category-master"].includes(String(key || "").replace(/^\/+|\/+$/g, "")));
  });
  const menuId = getMenuId(categoryMenu);
  const canCreate = hasMenuActionPermission({ menuId, action: "add", user: authSession?.user });
  const open = (options) => { if (canCreate && options?.slug) setRequest(options); };
  return (
    <CategoryQuickCreateContext.Provider value={{ open, canCreate }}>
      {children}
      {request && createPortal(
        <Suspense fallback={null}>
          <CategoryForm isOpen onClose={() => setRequest(null)} parentSlug={request.slug}
            initialName={request.searchText || ""} menu_id={menuId}
            onAfterSave={request.onCreated} />
        </Suspense>, document.body)}
    </CategoryQuickCreateContext.Provider>
  );
}
