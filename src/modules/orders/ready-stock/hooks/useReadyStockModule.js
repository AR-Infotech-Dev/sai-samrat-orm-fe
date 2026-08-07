import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import {
  clearReadyStockSelection,
  fetchReadyStockOrders,
  selectReadyStockLoading,
  selectReadyStockPage,
  selectReadyStockPagination,
  selectReadyStockRows,
  selectReadyStockSelectedRowIds,
  setReadyStockPage,
  setReadyStockSelection,
} from "../data/readyStock.slice";

export const useReadyStockModule = ({ filterState }) => {
  const dispatch = useAppDispatch();
  const selectedRowIds = useAppSelector(selectReadyStockSelectedRowIds);
  const pagination = useAppSelector(selectReadyStockPagination);
  const loading = useAppSelector(selectReadyStockLoading);
  const page = useAppSelector(selectReadyStockPage);
  const orderList = useAppSelector(selectReadyStockRows);

  const getOrderList = async () => {
    const action = await dispatch(fetchReadyStockOrders({ filterState, page }));
    if (fetchReadyStockOrders.rejected.match(action)) toast.error(action.payload || "Error while fetching ready stock orders");
  };

  const handlePageChange = (pageNumber) => dispatch(setReadyStockPage(pageNumber));

  const handleToggleRow = (rowId, checked) => {
    const current = Array.isArray(selectedRowIds) ? selectedRowIds : [];
    dispatch(setReadyStockSelection(checked ? [...new Set([...current, rowId])] : current.filter((item) => item !== rowId)));
  };

  const handleToggleAllRows = (checked) => {
    if (!checked) { dispatch(clearReadyStockSelection()); return; }
    dispatch(setReadyStockSelection(orderList.map((row) => row?.order_id).filter(Boolean)));
  };

  return { pagination, page, loading, selectedRowIds, handlePageChange, getOrderList, handleToggleRow, handleToggleAllRows };
};