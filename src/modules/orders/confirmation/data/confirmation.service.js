import { makeRequest } from "@/api/httpClient";

const BASE_URL = "/orders/confirmation";

export const getConfirmationOrders = async ({ page = 1, searchText = "", filters = {}, status = "waiting", orderBy = "created_date", order = "DESC" } = {}) => {
  return makeRequest(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: { page, searchText, filters, status, orderBy, order },
  });
};

export const getConfirmationOrderDetails = async (orderId) => {
  return makeRequest(`${BASE_URL}/${orderId}`, { method: "GET" });
};

export const getProformaInvoicePreview = async (orderId) => {
  return makeRequest(`${BASE_URL}/${orderId}/proforma-invoice/preview`, { method: "GET" });
};

export const confirmOrder = async ({ orderId, remarks = "" }) => {
  return makeRequest(`${BASE_URL}/${orderId}/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: { remarks },
  });
};

export const holdOrder = async ({ orderId, remarks = "" }) => {
  return makeRequest(`${BASE_URL}/${orderId}/hold`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: { remarks },
  });
};

export const sendBackOrder = async ({ orderId, remarks = "" }) => {
  return makeRequest(`${BASE_URL}/${orderId}/send-back`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: { remarks },
  });
};
