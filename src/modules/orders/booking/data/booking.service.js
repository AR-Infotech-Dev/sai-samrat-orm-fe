import { makeRequest } from "@/api/httpClient";
import { ordersModuleSchema } from "./module.schema";

export const getOrderBookings = async ({ filterState, page }) => {
  return makeRequest(ordersModuleSchema.api.list, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: {
      status: "active",
      page,
      searchText: filterState.searchText,
      filters: filterState.filters,
      order: filterState.order,
      order_by: filterState.order_by,
    },
  });
};

export const deleteOrderBookings = async (selectedRowIds) => {
  return makeRequest(ordersModuleSchema.api.delete, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: {
      action: "delete",
      ids: selectedRowIds,
    },
  });
};

export const getOrderBookingDetails = async (orderID) => {
  return makeRequest(`${ordersModuleSchema.api.edit}/${orderID}`, { method: "GET" });
};

export const saveOrderBooking = async ({ mode, orderID, payload }) => {
  const saveUrl = mode === "create" ? ordersModuleSchema.api.create : `${ordersModuleSchema.api.edit}/${orderID}`;
  const method = mode === "create" ? "PUT" : "POST";

  return makeRequest(saveUrl, {
    method,
    headers: { "Content-Type": "application/json" },
    body: payload,
  });
};

export const getCurrencyExchangeRates = async (currencies = []) => {
  const query = currencies.length ? `?currencies=${encodeURIComponent(currencies.join(","))}` : "";
  return makeRequest(`/system/exchange-rates${query}`, { method: "GET" });
};
