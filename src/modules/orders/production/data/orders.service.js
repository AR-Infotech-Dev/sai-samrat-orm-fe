import { makeRequest } from "@/api/httpClient";
import { ordersModuleSchema } from "./module.schema";

export const getOrdersList = async ({ filterState, page }) => {
    return await makeRequest(ordersModuleSchema.api.list, {
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
}
export const deleteOrder = async (selectedRowIds) => {
    return await makeRequest(ordersModuleSchema.api.delete, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: {
            action: 'delete',
            ids: selectedRowIds,
        },
    });
}
export const getOrderDetails = async (orderID) => {
    return await makeRequest(
        `${ordersModuleSchema.api.edit}/${orderID}`,
        {
            method: "GET",
        }
    );
}
export const saveOrder = async ({ mode, orderID, payload }) => {
    const saveUrl = mode === "create" ? ordersModuleSchema.api.create : `${ordersModuleSchema.api.edit}/${orderID}`;
    const method = mode === "create" ? "PUT" : "POST";

    return makeRequest(saveUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: payload,
    });
};

