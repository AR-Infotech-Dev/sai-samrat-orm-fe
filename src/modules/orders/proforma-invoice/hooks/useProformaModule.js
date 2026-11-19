import { toast } from "react-toastify";
import { submitProformaInvoice, approveProformaInvoice } from "../data/proforma.service";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import {
  clearProformaSelection,
  deleteProformaInvoiceRows,
  fetchProformaInvoices,
  selectProformaDeleting,
  selectProformaLoading,
  selectProformaPage,
  selectProformaPagination,
  selectProformaRows,
  selectProformaSelectedRowIds,
  setProformaPage,
  setProformaSelection,
} from "../data/proforma.slice";

export const useProformaModule = ({ filterState }) => {
  const dispatch = useAppDispatch();
  const selectedRowIds = useAppSelector(selectProformaSelectedRowIds);
  const pagination = useAppSelector(selectProformaPagination);
  const loading = useAppSelector(selectProformaLoading);
  const deleting = useAppSelector(selectProformaDeleting);
  const page = useAppSelector(selectProformaPage);
  const rows = useAppSelector(selectProformaRows);

  const getProformaList = async () => {
    const action = await dispatch(fetchProformaInvoices({ filterState, page }));
    if (fetchProformaInvoices.rejected.match(action)) toast.error(action.payload || "Error while fetching Proforma Invoices");
  };

  const handlePageChange = (pageNumber) => dispatch(setProformaPage(pageNumber));

  const handleToggleRow = (rowId, checked) => {
    const current = Array.isArray(selectedRowIds) ? selectedRowIds : [];
    const next = checked ? [...new Set([...current, rowId])] : current.filter((item) => item !== rowId);
    dispatch(setProformaSelection(next));
  };

  const handleToggleAllRows = (checked) => {
    if (!checked) { dispatch(clearProformaSelection()); return; }
    dispatch(setProformaSelection(rows.map((row) => row?.pi_id).filter(Boolean)));
  };

  const handleDeleteSelected = async () => {
    if (!selectedRowIds.length) { toast.error("Please select at least one Proforma Invoice."); return; }
    const action = await dispatch(deleteProformaInvoiceRows(selectedRowIds));
    if (deleteProformaInvoiceRows.fulfilled.match(action)) { toast.success(action.payload.message); await getProformaList(); }
    if (deleteProformaInvoiceRows.rejected.match(action)) toast.error(action.payload);
  };

  const handleDeleteRow = async (row) => {
    const rowId = row.pi_id;
    if (!rowId) { toast.error("PI id not found."); return; }
    if (!await confirmAction("Delete this Proforma Invoice?")) return;
    const action = await dispatch(deleteProformaInvoiceRows([rowId]));
    if (deleteProformaInvoiceRows.fulfilled.match(action)) { toast.success(action.payload.message); await getProformaList(); }
    if (deleteProformaInvoiceRows.rejected.match(action)) toast.error(action.payload);
  };

  const handleLifecycle = async (row, action) => {
    if (!await confirmAction(action === "approve" ? "Approve this PI? It cannot be edited after approval." : "Submit this PI for approval? It cannot be edited after submission.")) return;
    const res = await (action === "approve" ? approveProformaInvoice(row.pi_id) : submitProformaInvoice(row.pi_id));
    if (!res.success) { toast.error(res.message || "Unable to update PI status"); return; }
    toast.success(res.message);
    await getProformaList();
  };
  return { pagination, page, loading, deleting, selectedRowIds, handlePageChange, getProformaList, handleToggleRow, handleToggleAllRows, handleDeleteSelected, handleDeleteRow, handleLifecycle };
};
import { confirmAction } from "@utils/confirmAction";
