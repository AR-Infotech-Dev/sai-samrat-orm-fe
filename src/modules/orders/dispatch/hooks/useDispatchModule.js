import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { clearDispatchSelection, fetchDispatches, selectDispatchLoading, selectDispatchPage, selectDispatchPagination, selectDispatchRows, selectDispatchSelectedRowIds, setDispatchPage, setDispatchSelection } from "../data/dispatch.slice";

export const useDispatchModule = ({ filterState }) => {
  const dispatch = useAppDispatch();
  const selectedRowIds = useAppSelector(selectDispatchSelectedRowIds);
  const pagination = useAppSelector(selectDispatchPagination);
  const loading = useAppSelector(selectDispatchLoading);
  const page = useAppSelector(selectDispatchPage);
  const rows = useAppSelector(selectDispatchRows);

  const getDispatchList = async () => {
    const action = await dispatch(fetchDispatches({ filterState, page }));
    if (fetchDispatches.rejected.match(action)) toast.error(action.payload || "Error while fetching dispatches");
  };

  const handlePageChange = (pageNumber) => dispatch(setDispatchPage(pageNumber));
  const handleToggleRow = (rowId, checked) => dispatch(setDispatchSelection(checked ? [...new Set([...(selectedRowIds || []), rowId])] : (selectedRowIds || []).filter((item) => item !== rowId)));
  const handleToggleAllRows = (checked) => dispatch(checked ? setDispatchSelection(rows.map((row) => row?.dispatch_id).filter(Boolean)) : clearDispatchSelection());

  return { pagination, page, loading, selectedRowIds, getDispatchList, handlePageChange, handleToggleRow, handleToggleAllRows };
};