import { makeRequest } from "@/api/httpClient";

const BASE_URL = "/orders/ready-stock";

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