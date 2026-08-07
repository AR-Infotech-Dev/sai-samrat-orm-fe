import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { deleteOrder, getOrdersList } from "./orders.service";

const initialState = {
    rows: [],           // -> list
    pagination: {},     // -> API pagination info
    page: 1,            // -> current page
    loading: false,     // -> orders fetch चालू आहे का
    deleting: false,    // -> delete चालू आहे का
    selectedRowIds: [], // -> selected order ids
    error: "",          // -> API error message
}

export const fetchOrders = createAsyncThunk(
    "orders/fetchOrders",
    async ({ filterState, page }, { rejectWithValue }) => {
        const res = await getOrdersList({ filterState, page });

        if (!res.success) {
            return rejectWithValue(res?.message || "Error while fetching orders");
        }

        return {
            rows: res.data || [],
            pagination: res.pagination || {},
        };
    }
);
export const deleteOrders = createAsyncThunk(
    "orders/deleteOrders",
    async (selectedRowIds, { rejectWithValue }) => {
        const res = await deleteOrder(selectedRowIds);

        if (!res.success) {
            return rejectWithValue(res?.message || "Error while deleting orders");
        }

        return {
            message: res?.message || "Orders deleted successfully",
            deletedIds: selectedRowIds,
        };
    }
);

const ordersSlice = createSlice({
    name: "orders",
    initialState,
    reducers: {
        setOrdersPage(state, action) {
            state.page = action.payload || 1;
        },
        setOrdersRows(state, action) {
            state.rows = action.payload || [];
        },
        setOrdersLoading(state, action) {
            state.loading = action.payload;
        },
        setOrdersDeleting(state, action) {
            state.deleting = action.payload;
        },
        setOrdersPagination(state, action) {
            state.pagination = action.payload;
        },
        setOrdersSelection(state, action) {
            state.selectedRowIds = Array.isArray(action.payload) ? action.payload : [];
        },
        clearOrdersSelection(state) {
            state.selectedRowIds = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true;
                state.error = "";
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.rows = action.payload.rows;
                state.pagination = action.payload.pagination;
                state.selectedRowIds = [];
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Error while fetching orders";
            })
            .addCase(deleteOrders.pending, (state) => {
                state.deleting = true;
                state.error = "";
            })
            .addCase(deleteOrders.fulfilled, (state, action) => {
                state.deleting = false;
                state.selectedRowIds = [];
            })
            .addCase(deleteOrders.rejected, (state, action) => {
                state.deleting = false;
                state.error = action.payload || "Error while deleting orders";
            });
    }
});

export const {
    setOrdersPage,
    setOrdersRows,
    setOrdersLoading,
    setOrdersDeleting,
    setOrdersPagination,
    setOrdersSelection,
    clearOrdersSelection,
} = ordersSlice.actions;

export default ordersSlice.reducer;

export const selectOrdersRows = (state) => state.orders.rows;
export const selectOrdersPagination = (state) => state.orders.pagination;
export const selectOrdersPage = (state) => state.orders.page;
export const selectOrdersLoading = (state) => state.orders.loading;
export const selectOrdersDeleting = (state) => state.orders.deleting;
export const selectOrdersSelectedRowIds = (state) => state.orders.selectedRowIds;
export const selectOrdersError = (state) => state.orders.error;