import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import {
  clearOrderConfirmationSelection,
  fetchOrderConfirmations,
  selectOrderConfirmationLoading,
  selectOrderConfirmationPage,
  selectOrderConfirmationPagination,
  selectOrderConfirmationRows,
  selectOrderConfirmationSelectedRowIds,
  setOrderConfirmationPage,
  setOrderConfirmationSelection,
} from "../data/confirmation.slice";

export const useOrderConfirmationModule = ({ filterState }) => {
  const dispatch = useAppDispatch();
  const selectedRowIds = useAppSelector(selectOrderConfirmationSelectedRowIds);
  const pagination = useAppSelector(selectOrderConfirmationPagination);
  const loading = useAppSelector(selectOrderConfirmationLoading);
  const page = useAppSelector(selectOrderConfirmationPage);
  const orderList = useAppSelector(selectOrderConfirmationRows);

  const getOrderList = async () => {
    const action = await dispatch(fetchOrderConfirmations({ filterState, page }));
    if (fetchOrderConfirmations.rejected.match(action)) toast.error(action.payload || "Error while fetching order confirmations");
  };

  const handlePageChange = (pageNumber) => dispatch(setOrderConfirmationPage(pageNumber));

  const handleToggleRow = (rowId, checked) => {
    const currentSelectedRowIds = Array.isArray(selectedRowIds) ? selectedRowIds : [];
    const nextSelectedRowIds = checked
      ? [...new Set([...currentSelectedRowIds, rowId])]
      : currentSelectedRowIds.filter((item) => item !== rowId);
    dispatch(setOrderConfirmationSelection(nextSelectedRowIds));
  };

  const handleToggleAllRows = (checked) => {
    if (!checked) { dispatch(clearOrderConfirmationSelection()); return; }
    dispatch(setOrderConfirmationSelection(orderList.map((row) => row?.order_id).filter(Boolean)));
  };

  return {
    pagination,
    page,
    loading,
    deleting: false,
    selectedRowIds,
    handlePageChange,
    getOrderList,
    handleToggleRow,
    handleToggleAllRows,
    handleDeleteSelected: () => toast.info("Confirmation screen वर delete action नाही."),
    handleDeleteRow: () => toast.info("Confirmation screen वर delete action नाही."),
  };
};
