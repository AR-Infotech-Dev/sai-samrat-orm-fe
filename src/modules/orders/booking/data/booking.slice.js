import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { deleteOrderBookings, getOrderBookings } from "./booking.service";

const initialState = {
    rows: [],
    pagination: {},
    page: 1,
    loading: false,
    deleting: false,
    selectedRowIds: [],
    error: "",
};

export const fetchOrderBookings = createAsyncThunk(
    "orderBooking/fetchOrderBookings",
    async ({ filterState, page }, { rejectWithValue }) => {
        const res = await getOrderBookings({ filterState, page });
        if (!res.success) return rejectWithValue(res?.message || "Error while fetching order bookings");
        return { rows: res.data || [], pagination: res.pagination || {} };
    }
);

export const deleteOrderBookingRows = createAsyncThunk(
    "orderBooking/deleteOrderBookingRows",
    async (selectedRowIds, { rejectWithValue }) => {
        const res = await deleteOrderBookings(selectedRowIds);
        if (!res.success) return rejectWithValue(res?.message || "Error while deleting order bookings");
        return { message: res?.message || "Orders deleted successfully", deletedIds: selectedRowIds };
    }
);

const orderBookingSlice = createSlice({
    name: "orderBooking",
    initialState,
    reducers: {
        setOrderBookingPage(state, action) { state.page = action.payload || 1; },
        setOrderBookingRows(state, action) { state.rows = action.payload || []; },
        setOrderBookingLoading(state, action) { state.loading = action.payload; },
        setOrderBookingDeleting(state, action) { state.deleting = action.payload; },
        setOrderBookingPagination(state, action) { state.pagination = action.payload; },
        setOrderBookingSelection(state, action) { state.selectedRowIds = Array.isArray(action.payload) ? action.payload : []; },
        clearOrderBookingSelection(state) { state.selectedRowIds = []; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrderBookings.pending, (state) => { state.loading = true; state.error = ""; })
            .addCase(fetchOrderBookings.fulfilled, (state, action) => {
                state.loading = false;
                state.rows = action.payload.rows;
                state.pagination = action.payload.pagination;
                state.selectedRowIds = [];
            })
            .addCase(fetchOrderBookings.rejected, (state, action) => { state.loading = false; state.error = action.payload || "Error while fetching order bookings"; })
            .addCase(deleteOrderBookingRows.pending, (state) => { state.deleting = true; state.error = ""; })
            .addCase(deleteOrderBookingRows.fulfilled, (state, action) => {
                state.deleting = false;
                state.selectedRowIds = [];
                const deletedIds = action.payload.deletedIds || [];
                state.rows = state.rows.filter((row) => !deletedIds.includes(row.order_id));
            })
            .addCase(deleteOrderBookingRows.rejected, (state, action) => { state.deleting = false; state.error = action.payload || "Error while deleting order bookings"; });
    },
});

export const {
    setOrderBookingPage,
    setOrderBookingRows,
    setOrderBookingLoading,
    setOrderBookingDeleting,
    setOrderBookingPagination,
    setOrderBookingSelection,
    clearOrderBookingSelection,
} = orderBookingSlice.actions;

export default orderBookingSlice.reducer;

export const selectOrderBookingRows = (state) => state.orderBooking.rows;
export const selectOrderBookingPagination = (state) => state.orderBooking.pagination;
export const selectOrderBookingPage = (state) => state.orderBooking.page;
export const selectOrderBookingLoading = (state) => state.orderBooking.loading;
export const selectOrderBookingDeleting = (state) => state.orderBooking.deleting;
export const selectOrderBookingSelectedRowIds = (state) => state.orderBooking.selectedRowIds;
export const selectOrderBookingError = (state) => state.orderBooking.error;
