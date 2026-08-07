import { makeRequest } from "@/api/httpClient";

const BASE_URL = "/orders/planning";

export const getPlanningItems = async ({ page = 1, searchText = "", status = "all", priority = "all", orderBy = "expected_delivery_date", order = "ASC" } = {}) => {
  return makeRequest(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: { page, searchText, status, priority, orderBy, order },
  });
};

export const getPlanningItemDetails = async (orderItemId) => {
  return makeRequest(`${BASE_URL}/${orderItemId}`, { method: "GET" });
};

export const savePlanningItem = async ({ orderItemId, payload }) => {
  return makeRequest(`${BASE_URL}/${orderItemId}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
  });
};

export const getPlanningOrderDetails = async (orderId) => {
  return makeRequest(`${BASE_URL}/order/${orderId}`, { method: "GET" });
};

export const saveOrderPlanning = async ({ orderId, items }) => {
  return makeRequest(`${BASE_URL}/order/${orderId}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: { items },
  });
};
