import { makeRequest } from "@/api/httpClient";

const BASE_URL = "/production-notes/production";

export const getProductionDefinitions = (menuId) => makeRequest("/system/getDefinations", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: { menu_id: menuId, table: "production_notes" },
});

export const getProductionOrders = async ({ filterState, page }) => {
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

export const getProductionOrderDetails = async (orderId) => makeRequest(`${BASE_URL}/order/${orderId}`, { method: "GET" });

export const startProductionOrder = async (orderId) => makeRequest(`${BASE_URL}/order/${orderId}/start`, { method: "GET" });

export const saveOrderProduction = async ({ orderId, items }) => makeRequest(`${BASE_URL}/order/${orderId}/save`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: { items },
});
