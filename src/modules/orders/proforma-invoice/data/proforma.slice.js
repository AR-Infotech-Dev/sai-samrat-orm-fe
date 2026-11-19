import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { deleteProformaInvoices, getProformaInvoices } from "./proforma.service";

const initialState = {
  rows: [],
  pagination: {},
  page: 1,
  loading: false,
  deleting: false,
  selectedRowIds: [],
  error: "",
};

export const fetchProformaInvoices = createAsyncThunk(
  "proformaInvoice/fetchProformaInvoices",
  async ({ filterState, page }, { rejectWithValue }) => {
    const res = await getProformaInvoices({ filterState, page });
    if (!res.success) return rejectWithValue(res?.message || "Error while fetching Proforma Invoices");
    return { rows: res.data || [], pagination: res.pagination || {} };
  }
);

export const deleteProformaInvoiceRows = createAsyncThunk(
  "proformaInvoice/deleteProformaInvoiceRows",
  async (selectedRowIds, { rejectWithValue }) => {
    const res = await deleteProformaInvoices(selectedRowIds);
    if (!res.success) return rejectWithValue(res?.message || "Error while deleting Proforma Invoices");
    return { message: res?.message || "Proforma Invoices deleted successfully", deletedIds: selectedRowIds };
  }
);

const proformaInvoiceSlice = createSlice({
  name: "proformaInvoice",
  initialState,
  reducers: {
    setProformaPage(state, action) { state.page = action.payload || 1; },
    setProformaRows(state, action) { state.rows = action.payload || []; },
    setProformaLoading(state, action) { state.loading = action.payload; },
    setProformaDeleting(state, action) { state.deleting = action.payload; },
    setProformaPagination(state, action) { state.pagination = action.payload; },
    setProformaSelection(state, action) { state.selectedRowIds = Array.isArray(action.payload) ? action.payload : []; },
    clearProformaSelection(state) { state.selectedRowIds = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProformaInvoices.pending, (state) => { state.loading = true; state.error = ""; })
      .addCase(fetchProformaInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.rows = action.payload.rows;
        state.pagination = action.payload.pagination;
        state.selectedRowIds = [];
      })
      .addCase(fetchProformaInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error while fetching Proforma Invoices";
      })
      .addCase(deleteProformaInvoiceRows.pending, (state) => { state.deleting = true; state.error = ""; })
      .addCase(deleteProformaInvoiceRows.fulfilled, (state, action) => {
        state.deleting = false;
        state.selectedRowIds = [];
        const deletedIds = action.payload.deletedIds || [];
        state.rows = state.rows.filter((row) => !deletedIds.includes(row.pi_id));
      })
      .addCase(deleteProformaInvoiceRows.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload || "Error while deleting Proforma Invoices";
      });
  },
});

export const {
  setProformaPage,
  setProformaRows,
  setProformaLoading,
  setProformaDeleting,
  setProformaPagination,
  setProformaSelection,
  clearProformaSelection,
} = proformaInvoiceSlice.actions;

export default proformaInvoiceSlice.reducer;

export const selectProformaRows = (state) => state.proformaInvoice?.rows || [];
export const selectProformaPagination = (state) => state.proformaInvoice?.pagination || {};
export const selectProformaPage = (state) => state.proformaInvoice?.page || 1;
export const selectProformaLoading = (state) => state.proformaInvoice?.loading || false;
export const selectProformaDeleting = (state) => state.proformaInvoice?.deleting || false;
export const selectProformaSelectedRowIds = (state) => state.proformaInvoice?.selectedRowIds || [];
export const selectProformaError = (state) => state.proformaInvoice?.error || "";
