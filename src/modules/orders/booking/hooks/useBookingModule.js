import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import {
  clearOrderBookingSelection,
  deleteOrderBookingRows,
  fetchOrderBookings,
  selectOrderBookingDeleting,
  selectOrderBookingLoading,
  selectOrderBookingPage,
  selectOrderBookingPagination,
  selectOrderBookingRows,
  selectOrderBookingSelectedRowIds,
  setOrderBookingPage,
  setOrderBookingSelection,
} from "../data/booking.slice";

export const useOrderBookingModule = ({ filterState }) => {
  const dispatch = useAppDispatch();
  const selectedRowIds = useAppSelector(selectOrderBookingSelectedRowIds);
  const pagination = useAppSelector(selectOrderBookingPagination);
  const loading = useAppSelector(selectOrderBookingLoading);
  const deleting = useAppSelector(selectOrderBookingDeleting);
  const page = useAppSelector(selectOrderBookingPage);
  const orderList = useAppSelector(selectOrderBookingRows);

  const getOrderList = async () => {
    const action = await dispatch(fetchOrderBookings({ filterState, page }));
    if (fetchOrderBookings.rejected.match(action)) toast.error(action.payload || "Error while fetching Orders");
  };

  const handlePageChange = (pageNumber) => dispatch(setOrderBookingPage(pageNumber));

  const handleToggleRow = (rowId, checked) => {
    const currentSelectedRowIds = Array.isArray(selectedRowIds) ? selectedRowIds : [];
    const nextSelectedRowIds = checked
      ? [...new Set([...currentSelectedRowIds, rowId])]
      : currentSelectedRowIds.filter((item) => item !== rowId);
    dispatch(setOrderBookingSelection(nextSelectedRowIds));
  };

  const handleToggleAllRows = (checked) => {
    if (!checked) { dispatch(clearOrderBookingSelection()); return; }
    dispatch(setOrderBookingSelection(orderList.map((row) => row?.order_id).filter(Boolean)));
  };

  const handleDeleteSelected = async () => {
    if (!selectedRowIds.length) { toast.error("Please select at least one Order to delete."); return; }
    const action = await dispatch(deleteOrderBookingRows(selectedRowIds));
    if (deleteOrderBookingRows.fulfilled.match(action)) { toast.success(action.payload.message); await getOrderList(); }
    if (deleteOrderBookingRows.rejected.match(action)) toast.error(action.payload);
  };

  const handleDeleteRow = async (row) => {
    const rowId = row.order_id;
    if (!rowId) { toast.error("Order id not found."); return; }
    if (!window.confirm("Delete this Order?")) return;
    const action = await dispatch(deleteOrderBookingRows([rowId]));
    if (deleteOrderBookingRows.fulfilled.match(action)) { toast.success(action.payload.message); await getOrderList(); }
    if (deleteOrderBookingRows.rejected.match(action)) toast.error(action.payload);
  };

  return { pagination, page, loading, deleting, selectedRowIds, handlePageChange, getOrderList, handleToggleRow, handleToggleAllRows, handleDeleteSelected, handleDeleteRow };
};
