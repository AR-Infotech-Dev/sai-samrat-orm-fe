import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getReadyStockOrders } from "./readyStock.service";

const initialState = {
  rows: [],
  pagination: {},
  page: 1,
  loading: false,
  selectedRowIds: [],
  error: "",
};

export const fetchReadyStockOrders = createAsyncThunk(
  "readyStock/fetchReadyStockOrders",
  async ({ filterState, page }, { rejectWithValue }) => {
    const res = await getReadyStockOrders({ filterState, page });
    if (!res.success) return rejectWithValue(res?.message || "Error while fetching ready stock orders");
    return { rows: res.data || [], pagination: res.pagination || {} };
  }
);

const readyStockSlice = createSlice({
  name: "readyStock",
  initialState,
  reducers: {
    setReadyStockPage(state, action) { state.page = action.payload || 1; },
    setReadyStockRows(state, action) { state.rows = action.payload || []; },
    setReadyStockSelection(state, action) { state.selectedRowIds = Array.isArray(action.payload) ? action.payload : []; },
    clearReadyStockSelection(state) { state.selectedRowIds = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReadyStockOrders.pending, (state) => { state.loading = true; state.error = ""; })
      .addCase(fetchReadyStockOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.rows = action.payload.rows;
        state.pagination = action.payload.pagination;
        state.selectedRowIds = [];
      })
      .addCase(fetchReadyStockOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload || "Error while fetching ready stock orders"; });
  },
});

export const { setReadyStockPage, setReadyStockRows, setReadyStockSelection, clearReadyStockSelection } = readyStockSlice.actions;
export default readyStockSlice.reducer;

export const selectReadyStockRows = (state) => state.readyStock.rows;
export const selectReadyStockPagination = (state) => state.readyStock.pagination;
export const selectReadyStockPage = (state) => state.readyStock.page;
export const selectReadyStockLoading = (state) => state.readyStock.loading;
export const selectReadyStockSelectedRowIds = (state) => state.readyStock.selectedRowIds;
export const selectReadyStockError = (state) => state.readyStock.error;