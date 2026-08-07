import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getPlanningItems } from "./planning.service";

const initialState = {
  rows: [],
  pagination: {},
  page: 1,
  loading: false,
  selectedRowIds: [],
  error: "",
};

export const fetchOrderPlannings = createAsyncThunk(
  "orderPlanning/fetchOrderPlannings",
  async ({ filterState, page }, { rejectWithValue }) => {
    const res = await getPlanningItems({
      page,
      searchText: filterState.searchText,
      status: "all",
      order: filterState.order,
      orderBy: filterState.order_by,
    });
    if (!res.success) return rejectWithValue(res?.message || "Error while fetching order plannings");
    return { rows: res.data || [], pagination: res.pagination || {} };
  }
);

const orderPlanningSlice = createSlice({
  name: "orderPlanning",
  initialState,
  reducers: {
    setOrderPlanningPage(state, action) { state.page = action.payload || 1; },
    setOrderPlanningRows(state, action) { state.rows = action.payload || []; },
    setOrderPlanningLoading(state, action) { state.loading = action.payload; },
    setOrderPlanningPagination(state, action) { state.pagination = action.payload; },
    setOrderPlanningSelection(state, action) { state.selectedRowIds = Array.isArray(action.payload) ? action.payload : []; },
    clearOrderPlanningSelection(state) { state.selectedRowIds = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderPlannings.pending, (state) => { state.loading = true; state.error = ""; })
      .addCase(fetchOrderPlannings.fulfilled, (state, action) => {
        state.loading = false;
        state.rows = action.payload.rows;
        state.pagination = action.payload.pagination;
        state.selectedRowIds = [];
      })
      .addCase(fetchOrderPlannings.rejected, (state, action) => { state.loading = false; state.error = action.payload || "Error while fetching order plannings"; });
  },
});

export const {
  setOrderPlanningPage,
  setOrderPlanningRows,
  setOrderPlanningLoading,
  setOrderPlanningPagination,
  setOrderPlanningSelection,
  clearOrderPlanningSelection,
} = orderPlanningSlice.actions;

export default orderPlanningSlice.reducer;

export const selectOrderPlanningRows = (state) => state.orderPlanning.rows;
export const selectOrderPlanningPagination = (state) => state.orderPlanning.pagination;
export const selectOrderPlanningPage = (state) => state.orderPlanning.page;
export const selectOrderPlanningLoading = (state) => state.orderPlanning.loading;
export const selectOrderPlanningSelectedRowIds = (state) => state.orderPlanning.selectedRowIds;
export const selectOrderPlanningError = (state) => state.orderPlanning.error;
