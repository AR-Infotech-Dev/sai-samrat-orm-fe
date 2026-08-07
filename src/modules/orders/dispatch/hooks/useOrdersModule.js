import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import {
    fetchOrders,
    deleteOrders,
    selectOrdersPagination,
    selectOrdersPage,
    selectOrdersLoading,
    selectOrdersDeleting,
    selectOrdersSelectedRowIds,
    selectOrdersRows,
} from "../data/orders.slice";
import * as OrdersActions from "../data/orders.slice";

export const useOrdersModule = ({ filterState }) => {
    const dispatch = useAppDispatch();

    const selectedRowIds = useAppSelector(selectOrdersSelectedRowIds);
    const pagination = useAppSelector(selectOrdersPagination);
    const loading = useAppSelector(selectOrdersLoading);
    const deleting = useAppSelector(selectOrdersDeleting);
    const page = useAppSelector(selectOrdersPage);
    const OrderList = useAppSelector(selectOrdersRows);

    const getOrderList = async () => {
        const action = await dispatch(fetchOrders({ filterState, page }));

        if (fetchOrders.rejected.match(action)) {
            toast.error(action.payload || "Error while fetching Orders");
        }
    };

    const handlePageChange = (pageNumber) => {
        dispatch(OrdersActions.setOrdersPage(pageNumber));
    }

    const handleToggleRow = (rowId, checked) => {
        const currentSelectedRowIds = Array.isArray(selectedRowIds) ? selectedRowIds : [];
        const nextSelectedRowIds = checked
            ? [...new Set([...currentSelectedRowIds, rowId])]
            : currentSelectedRowIds.filter((item) => item !== rowId);
        dispatch(OrdersActions.setOrdersSelection(nextSelectedRowIds));
    };

    const handleToggleAllRows = (checked) => {
        if (!checked) {
            dispatch(OrdersActions.clearOrdersSelection());
            return;
        }

        dispatch(OrdersActions.setOrdersSelection(
            OrderList.map((row) => row?._id ?? row?.id ?? row?.adminID).filter(Boolean)
        ))
    };

    const handleDeleteSelected = async () => {
        if (!selectedRowIds.length) {
            toast.error("Please select at least one Order to delete.");
            return;
        }
        const action = await dispatch(deleteOrders(selectedRowIds));

        if (deleteOrders.fulfilled.match(action)) {
            toast.success(action.payload.message);
            await getOrderList();
        }
        if (deleteOrders.rejected.match(action)) {
            toast.error(action.payload);
        }
    };

    const handleDeleteRow = async (row) => {
        const rowId = row.order_id;
        if (!rowId) { toast.error("Order id not found."); return; }
        if (!window.confirm("Delete this Order?")) return;

        const action = await dispatch(deleteOrders([rowId]));

        if (deleteOrders.fulfilled.match(action)) {
            toast.success(action.payload.message);
            await getOrderList();
        }
        if (deleteOrders.rejected.match(action)) {
            toast.error(action.payload);
        }
    };

    return {
        pagination,
        page,
        loading,
        deleting,
        selectedRowIds,
        handlePageChange,
        getOrderList,
        handleToggleRow,
        handleToggleAllRows,
        handleDeleteSelected,
        handleDeleteRow,
    }
}