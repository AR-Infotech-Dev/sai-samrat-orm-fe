import { makeRequest } from "@/api/httpClient";

const BASE_URL = "/orders/dispatch";

export const getDispatches = async ({ filterState, page }) => makeRequest(BASE_URL, {
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

export const getReadyOrderForDispatch = async (orderId) => makeRequest(`${BASE_URL}/ready-order/${orderId}`, { method: "GET" });
export const getDispatchDetails = async (dispatchId) => makeRequest(`${BASE_URL}/${dispatchId}`, { method: "GET" });

export const saveDispatch = async ({ dispatchId, payload }) => makeRequest(dispatchId ? `${BASE_URL}/${dispatchId}` : `${BASE_URL}/create`, {
  method: dispatchId ? "POST" : "PUT",
  headers: { "Content-Type": "application/json" },
  body: payload,
});