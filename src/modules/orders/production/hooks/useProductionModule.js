import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import {
  clearOrderProductionSelection,
  fetchOrderProductions,
  selectOrderProductionLoading,
  selectOrderProductionPage,
  selectOrderProductionPagination,
  selectOrderProductionRows,
  selectOrderProductionSelectedRowIds,
  setOrderProductionPage,
  setOrderProductionSelection,
} from "../data/production.slice";

export const useOrderProductionModule = ({ filterState }) => {
  const dispatch = useAppDispatch();
  const selectedRowIds = useAppSelector(selectOrderProductionSelectedRowIds);
  const pagination = useAppSelector(selectOrderProductionPagination);
  const loading = useAppSelector(selectOrderProductionLoading);
  const page = useAppSelector(selectOrderProductionPage);
  const orderList = useAppSelector(selectOrderProductionRows);

  const getOrderList = async () => {
    const action = await dispatch(fetchOrderProductions({ filterState, page }));
    if (fetchOrderProductions.rejected.match(action)) toast.error(action.payload || "Error while fetching production orders");
  };

  const handlePageChange = (pageNumber) => dispatch(setOrderProductionPage(pageNumber));

  const handleToggleRow = (rowId, checked) => {
    const current = Array.isArray(selectedRowIds) ? selectedRowIds : [];
    dispatch(setOrderProductionSelection(checked ? [...new Set([...current, rowId])] : current.filter((item) => item !== rowId)));
  };

  const handleToggleAllRows = (checked) => {
    if (!checked) { dispatch(clearOrderProductionSelection()); return; }
    dispatch(setOrderProductionSelection(orderList.map((row) => row?.order_id).filter(Boolean)));
  };

  return { pagination, page, loading, selectedRowIds, handlePageChange, getOrderList, handleToggleRow, handleToggleAllRows };
};
