import { makeRequest } from "@/api/httpClient";

const BASE_URL = "/production-notes/ready-stock";

export const getModuleDefinitions = (menuId) => makeRequest("/system/getDefinations", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: { menu_id: menuId, table: "production_notes" },
});

export const getReadyStockOrders = async ({ filterState, page }) => {
  return makeRequest(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: {
      page,
      searchText: filterState.searchText,
      filters: filterState.filters,
      order: filterState.order,
      orderBy: filterState.order_by,
    },
  });
};

export const getReadyStockOrderDetails = async (orderId) => makeRequest(`${BASE_URL}/order/${orderId}`, { method: "GET" });
