import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ordersModuleSchema } from "./data/module.schema";
import { useOrderBookingTableConfig } from "./hooks/useBookingTableConfig";
import { useOrderBookingModule } from "./hooks/useBookingModule";
import { getNextSortConfig } from "@utils/sorting";
import { useModuleFilters, useAppSelector } from "@store/hooks";
import { selectOrderBookingRows } from "./data/booking.slice";

import { Download } from "lucide-react";

import ModuleControls from "@shared/ModuleControls";
import ModulePageLayout from "@shared/ModulePageLayout";
import ModulePagination from "@shared/ModulePagination";
import DynamicFilter from "@components/dynamic-filter";
import ResizableTable from "@components/table/ResizableTable";
import useMenuPermissions from "@auth/utils/useMenuPermissions";
import OrderForm from "./components/OrderForm";
import OrderTableRow from "./components/OrderTableRow";

import PreviewFile from "./components/PreviewFile";

function OrdersBookingPage({ menu_id }) {

  const location = useLocation();
  const resolvedMenuID = menu_id || ordersModuleSchema.menu_id || null;
  const permissions = useMenuPermissions(resolvedMenuID);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);

  const [previewOrder, setPreviewOrder] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const orderList = useAppSelector(selectOrderBookingRows);
  const { filterState, setSearchText, applyFilterPayload, setSort, clearFilters, } = useModuleFilters("order-master", orderList);
  const { pagination, page, loading, deleting, selectedRowIds, getOrderList, handlePageChange, handleToggleRow, handleToggleAllRows, handleDeleteSelected, handleDeleteRow, } = useOrderBookingModule({ filterState });
  const { sortConfig, resolvedColumns, defaultVisibleColumnKeys, resolvedFilterFields, } = useOrderBookingTableConfig({ resolvedMenuID, filterState });

  const handleSortChange = (columnKey) => {
    const nextSort = getNextSortConfig(sortConfig, columnKey);

    if (page !== 1) {
      handlePageChange(1);
    }

    setSort({
      order_by: nextSort.key,
      order: nextSort.direction.toUpperCase(),
    });
  };

  const handleReport = (order) => {
    setPreviewOrder(order);
    setIsPreviewOpen(true);
  };

  useEffect(() => {
    getOrderList();
  }, [page, filterState.searchText, filterState.order, filterState.order_by, JSON.stringify(filterState.filters)]);

  useEffect(() => {
    if (page !== 1) {
      handlePageChange(1)
    }
  }, [filterState.searchText, filterState.order, filterState.order_by, JSON.stringify(filterState.filters)]);

  useEffect(() => {
    const dashboardFilters = location.state?.dashboardFilters;
    if (!Array.isArray(dashboardFilters) || !dashboardFilters.length) return;
    applyFilterPayload({ filters: dashboardFilters, selectedFilterId: "", searchText: "" });
    if (page !== 1) handlePageChange(1);
  }, [location.key]);

  return (
    <>
      <ModulePageLayout
        title={ordersModuleSchema.title}
        description={ordersModuleSchema.description}
        controls={
          <ModuleControls
            canCreate={permissions.canAdd}
            canDelete={permissions.canDelete}
            loading={loading}
            onRefresh={getOrderList}
            onCreate={() => {
              setSelectedOrder(null);
              setIsFlyoutOpen(true);
            }}
            onDeleteSelected={handleDeleteSelected}
            showDelete={selectedRowIds.length !== 0}
            deleteDisabled={deleting || loading || selectedRowIds.length === 0}
            deleteLabel={`Delete Selected${selectedRowIds.length ? ` (${selectedRowIds.length})` : ""}`}
            deleting={deleting}
            filter={
              <DynamicFilter
                filterState={filterState}
                fields={resolvedFilterFields}
                savedFilters={ordersModuleSchema.savedFilters}
                onSearch={setSearchText}
                onApplyFilters={applyFilterPayload}
                onSaveFilter={() => { }}
                onDeleteFilter={() => { }}
                onSelectSavedFilter={() => { }}
                onClearFilters={clearFilters}
              />
            }
          />
        }
         table={
          <ResizableTable
            loading={loading}
            menuId={resolvedMenuID}
            columns={resolvedColumns}
            rows={orderList}
            storageKey="orders-module-column-widths"
            defaultVisibleColumnKeys={defaultVisibleColumnKeys}
            sortConfig={sortConfig}
            onSortChange={handleSortChange}
            editRow={permissions.canEdit ? (order) => {
              setSelectedOrder(order);
              setIsFlyoutOpen(true);
            } : undefined}
            onDeleteRow={permissions.canDelete ? handleDeleteRow : undefined}
            allowSelection={permissions.canDelete}
            selectedRowIds={selectedRowIds}
            onToggleRow={handleToggleRow}
            onToggleAllRows={handleToggleAllRows}
            renderRow={(row, index, columns, table) => (
              <OrderTableRow
                row={row}
                index={index}
                columns={columns}
                table={table}
              />
            )}
            rowActions={[
              {
                key: "download",
                label: "Download",
                icon: Download,
                className: "table-action-edit",
                onClick: handleReport,
              },
            ]}
          />
        }
        footer={<ModulePagination pagination={pagination} onPageChange={handlePageChange} />}
      />
      <OrderForm
        isOpen={isFlyoutOpen}
        onClose={() => setIsFlyoutOpen(false)}
        selectedOrder={selectedOrder}
        onAfterSave={getOrderList}
        menu_id={resolvedMenuID}
      />
      <PreviewFile
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewOrder(null);
        }}
        selectedOrder={previewOrder}
        onAfterSave={getOrderList}
        menu_id={resolvedMenuID}
      />
    </>
  );
}

export default OrdersBookingPage;

