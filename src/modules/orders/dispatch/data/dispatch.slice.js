import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getDispatches } from "./dispatch.service";

const initialState = { rows: [], pagination: {}, page: 1, loading: false, selectedRowIds: [], error: "" };

export const fetchDispatches = createAsyncThunk("dispatch/fetchDispatches", async ({ filterState, page }, { rejectWithValue }) => {
  const res = await getDispatches({ filterState, page });
  if (!res.success) return rejectWithValue(res?.message || "Error while fetching dispatches");
  return { rows: res.data || [], pagination: res.pagination || {} };
});

const dispatchSlice = createSlice({
  name: "dispatch",
  initialState,
  reducers: {
    setDispatchPage(state, action) { state.page = action.payload || 1; },
    setDispatchSelection(state, action) { state.selectedRowIds = Array.isArray(action.payload) ? action.payload : []; },
    clearDispatchSelection(state) { state.selectedRowIds = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDispatches.pending, (state) => { state.loading = true; state.error = ""; })
      .addCase(fetchDispatches.fulfilled, (state, action) => { state.loading = false; state.rows = action.payload.rows; state.pagination = action.payload.pagination; state.selectedRowIds = []; })
      .addCase(fetchDispatches.rejected, (state, action) => { state.loading = false; state.error = action.payload || "Error while fetching dispatches"; });
  },
});

export const { setDispatchPage, setDispatchSelection, clearDispatchSelection } = dispatchSlice.actions;
export default dispatchSlice.reducer;

export const selectDispatchRows = (state) => state.dispatch.rows;
export const selectDispatchPagination = (state) => state.dispatch.pagination;
export const selectDispatchPage = (state) => state.dispatch.page;
export const selectDispatchLoading = (state) => state.dispatch.loading;
export const selectDispatchSelectedRowIds = (state) => state.dispatch.selectedRowIds;