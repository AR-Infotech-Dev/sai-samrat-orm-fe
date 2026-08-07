import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getConfirmationOrders } from "./confirmation.service";

const initialState = {
  rows: [],
  pagination: {},
  page: 1,
  loading: false,
  selectedRowIds: [],
  error: "",
};

export const fetchOrderConfirmations = createAsyncThunk(
  "orderConfirmation/fetchOrderConfirmations",
  async ({ filterState, page }, { rejectWithValue }) => {
    const res = await getConfirmationOrders({
      page,
      searchText: filterState.searchText,
      filters: filterState.filters,
      order: filterState.order,
      orderBy: filterState.order_by,
    });
    if (!res.success) return rejectWithValue(res?.message || "Error while fetching order confirmations");
    return { rows: res.data || [], pagination: res.pagination || {} };
  }
);

const orderConfirmationSlice = createSlice({
  name: "orderConfirmation",
  initialState,
  reducers: {
    setOrderConfirmationPage(state, action) { state.page = action.payload || 1; },
    setOrderConfirmationRows(state, action) { state.rows = action.payload || []; },
    setOrderConfirmationLoading(state, action) { state.loading = action.payload; },
    setOrderConfirmationPagination(state, action) { state.pagination = action.payload; },
    setOrderConfirmationSelection(state, action) { state.selectedRowIds = Array.isArray(action.payload) ? action.payload : []; },
    clearOrderConfirmationSelection(state) { state.selectedRowIds = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderConfirmations.pending, (state) => { state.loading = true; state.error = ""; })
      .addCase(fetchOrderConfirmations.fulfilled, (state, action) => {
        state.loading = false;
        state.rows = action.payload.rows;
        state.pagination = action.payload.pagination;
        state.selectedRowIds = [];
      })
      .addCase(fetchOrderConfirmations.rejected, (state, action) => { state.loading = false; state.error = action.payload || "Error while fetching order confirmations"; });
  },
});

export const {
  setOrderConfirmationPage,
  setOrderConfirmationRows,
  setOrderConfirmationLoading,
  setOrderConfirmationPagination,
  setOrderConfirmationSelection,
  clearOrderConfirmationSelection,
} = orderConfirmationSlice.actions;

export default orderConfirmationSlice.reducer;

export const selectOrderConfirmationRows = (state) => state.orderConfirmation.rows;
export const selectOrderConfirmationPagination = (state) => state.orderConfirmation.pagination;
export const selectOrderConfirmationPage = (state) => state.orderConfirmation.page;
export const selectOrderConfirmationLoading = (state) => state.orderConfirmation.loading;
export const selectOrderConfirmationSelectedRowIds = (state) => state.orderConfirmation.selectedRowIds;
export const selectOrderConfirmationError = (state) => state.orderConfirmation.error;
