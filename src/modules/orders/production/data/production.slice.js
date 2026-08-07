import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getProductionOrders } from "./production.service";

const initialState = {
  rows: [],
  pagination: {},
  page: 1,
  loading: false,
  selectedRowIds: [],
  error: "",
};

export const fetchOrderProductions = createAsyncThunk(
  "orderProduction/fetchOrderProductions",
  async ({ filterState, page }, { rejectWithValue }) => {
    const res = await getProductionOrders({ filterState, page });
    if (!res.success) return rejectWithValue(res?.message || "Error while fetching production orders");
    return { rows: res.data || [], pagination: res.pagination || {} };
  }
);

const orderProductionSlice = createSlice({
  name: "orderProduction",
  initialState,
  reducers: {
    setOrderProductionPage(state, action) { state.page = action.payload || 1; },
    setOrderProductionRows(state, action) { state.rows = action.payload || []; },
    setOrderProductionSelection(state, action) { state.selectedRowIds = Array.isArray(action.payload) ? action.payload : []; },
    clearOrderProductionSelection(state) { state.selectedRowIds = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderProductions.pending, (state) => { state.loading = true; state.error = ""; })
      .addCase(fetchOrderProductions.fulfilled, (state, action) => {
        state.loading = false;
        state.rows = action.payload.rows;
        state.pagination = action.payload.pagination;
        state.selectedRowIds = [];
      })
      .addCase(fetchOrderProductions.rejected, (state, action) => { state.loading = false; state.error = action.payload || "Error while fetching production orders"; });
  },
});

export const { setOrderProductionPage, setOrderProductionRows, setOrderProductionSelection, clearOrderProductionSelection } = orderProductionSlice.actions;
export default orderProductionSlice.reducer;

export const selectOrderProductionRows = (state) => state.orderProduction.rows;
export const selectOrderProductionPagination = (state) => state.orderProduction.pagination;
export const selectOrderProductionPage = (state) => state.orderProduction.page;
export const selectOrderProductionLoading = (state) => state.orderProduction.loading;
export const selectOrderProductionSelectedRowIds = (state) => state.orderProduction.selectedRowIds;
export const selectOrderProductionError = (state) => state.orderProduction.error;
