import { makeRequest } from "@/api/httpClient";

const BASE_URL = "/orders/proforma-invoice";
export const submitProformaInvoice = (id) => makeRequest(`${BASE_URL}/${id}/submit`, { method: "POST", body: {} });
export const approveProformaInvoice = (id) => makeRequest(`${BASE_URL}/${id}/approve`, { method: "POST", body: {} });

export const getProformaInvoicePdf = (piId) => makeRequest(`${BASE_URL}/${piId}/pdf`, {
  method: "GET", responseType: "blob", timeout: 60000,
});

export const getProformaInvoices = async ({ filterState = {}, page = 1 } = {}) => {
  return makeRequest(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: {
      page,
      searchText: filterState.searchText || "",
      filters: filterState.filters || [],
      order: filterState.order || "DESC",
      order_by: filterState.order_by || "created_date",
    },
  });
};

export const deleteProformaInvoices = async (selectedRowIds = []) => {
  return makeRequest(`${BASE_URL}/delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: {
      action: "delete",
      ids: selectedRowIds,
    },
  });
};

export const getProformaInvoiceDetails = async (piId) => {
  return makeRequest(`${BASE_URL}/${piId}`, { method: "GET" });
};

export const saveProformaInvoice = async ({ mode = "create", piId = null, payload = {} }) => {
  const saveUrl = mode === "create" ? `${BASE_URL}/create` : `${BASE_URL}/${piId}`;
  const method = mode === "create" ? "PUT" : "POST";

  return makeRequest(saveUrl, {
    method,
    headers: { "Content-Type": "application/json" },
    body: payload,
  });
};

export const getActiveProformaInvoices = async (customerId = null) => {
  return makeRequest(`${BASE_URL}/active-list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: customerId ? { customer_id: Number(customerId) } : {},
  });
};

export const getProformaInvoiceItems = async (piId) => {
  return makeRequest(`${BASE_URL}/${piId}/items`, { method: "GET" });
};

export const getProformaInvoicePreview = async (piId) => {
  return makeRequest(`${BASE_URL}/${piId}/preview`, { method: "GET" });
};
