import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import {
  clearOrderPlanningSelection,
  fetchOrderPlannings,
  selectOrderPlanningLoading,
  selectOrderPlanningPage,
  selectOrderPlanningPagination,
  selectOrderPlanningRows,
  selectOrderPlanningSelectedRowIds,
  setOrderPlanningPage,
  setOrderPlanningSelection,
} from "../data/planning.slice";

export const useOrderPlanningModule = ({ filterState }) => {
  const dispatch = useAppDispatch();
  const selectedRowIds = useAppSelector(selectOrderPlanningSelectedRowIds);
  const pagination = useAppSelector(selectOrderPlanningPagination);
  const loading = useAppSelector(selectOrderPlanningLoading);
  const page = useAppSelector(selectOrderPlanningPage);
  const orderList = useAppSelector(selectOrderPlanningRows);

  const getOrderList = async () => {
    const action = await dispatch(fetchOrderPlannings({ filterState, page }));
    if (fetchOrderPlannings.rejected.match(action)) toast.error(action.payload || "Error while fetching order plannings");
  };

  const handlePageChange = (pageNumber) => dispatch(setOrderPlanningPage(pageNumber));

  const handleToggleRow = (rowId, checked) => {
    const currentSelectedRowIds = Array.isArray(selectedRowIds) ? selectedRowIds : [];
    const nextSelectedRowIds = checked
      ? [...new Set([...currentSelectedRowIds, rowId])]
      : currentSelectedRowIds.filter((item) => item !== rowId);
    dispatch(setOrderPlanningSelection(nextSelectedRowIds));
  };

  const handleToggleAllRows = (checked) => {
    if (!checked) { dispatch(clearOrderPlanningSelection()); return; }
    dispatch(setOrderPlanningSelection(orderList.map((row) => row?.order_id).filter(Boolean)));
  };

  return { pagination, page, loading, selectedRowIds, handlePageChange, getOrderList, handleToggleRow, handleToggleAllRows };
};
