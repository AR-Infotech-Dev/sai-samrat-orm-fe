import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ordersModuleSchema } from "./data/module.schema";
import { useOrdersTableConfig } from "./hooks/useOrdersTableConfig";
import { useOrderProductionModule } from "./hooks/useProductionModule";
import { getNextSortConfig } from "@utils/sorting";
import { useModuleFilters, useAppSelector } from "@store/hooks";
import { selectOrderProductionRows } from "./data/production.slice";

import ModuleControls from "@shared/ModuleControls";
import ModulePageLayout from "@shared/ModulePageLayout";
import ModulePagination from "@shared/ModulePagination";
import DynamicFilter from "@components/dynamic-filter";
import ResizableTable from "@components/table/ResizableTable";
import useMenuPermissions from "@auth/utils/useMenuPermissions";
import ProductionForm from "./components/ProductionForm";
import OrderTableRow from "./components/OrderTableRow";

function OrdersModulePage({ menu_id }) {
  const location = useLocation();
  const resolvedMenuID = menu_id || ordersModuleSchema.menu_id || null;
  const permissions = useMenuPermissions(resolvedMenuID);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const orderList = useAppSelector(selectOrderProductionRows);
  const { filterState, setSearchText, applyFilterPayload, setSort, clearFilters } = useModuleFilters("order-production", orderList);
  const { pagination, page, loading, selectedRowIds, getOrderList, handlePageChange, handleToggleRow, handleToggleAllRows } = useOrderProductionModule({ filterState });
  const { sortConfig, resolvedColumns, defaultVisibleColumnKeys, resolvedFilterFields } = useOrdersTableConfig({ resolvedMenuID, filterState });

  const handleSortChange = (columnKey) => {
    const nextSort = getNextSortConfig(sortConfig, columnKey);
    if (page !== 1) handlePageChange(1);
    setSort({ order_by: nextSort.key, order: nextSort.direction.toUpperCase() });
  };

  useEffect(() => { getOrderList(); }, [page, filterState.searchText, filterState.order, filterState.order_by, JSON.stringify(filterState.filters)]);
  useEffect(() => { if (page !== 1) handlePageChange(1); }, [filterState.searchText, filterState.order, filterState.order_by, JSON.stringify(filterState.filters)]);

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
            canCreate={false}
            canDelete={false}
            loading={loading}
            onRefresh={getOrderList}
            showDelete={false}
            filter={<DynamicFilter filterState={filterState} fields={resolvedFilterFields} savedFilters={ordersModuleSchema.savedFilters} onSearch={setSearchText} onApplyFilters={applyFilterPayload} onSaveFilter={() => {}} onDeleteFilter={() => {}} onSelectSavedFilter={() => {}} onClearFilters={clearFilters} />}
          />
        }
        table={
          <ResizableTable
            loading={loading}
            menuId={resolvedMenuID}
            columns={resolvedColumns}
            rows={orderList}
            storageKey="order-production-column-widths"
            defaultVisibleColumnKeys={defaultVisibleColumnKeys}
            sortConfig={sortConfig}
            onSortChange={handleSortChange}
            editRow={permissions.canEdit ? (order) => { setSelectedOrder(order); setIsFlyoutOpen(true); } : undefined}
            allowSelection={false}
            selectedRowIds={selectedRowIds}
            onToggleRow={handleToggleRow}
            onToggleAllRows={handleToggleAllRows}
            renderRow={(row, index, columns, table) => <OrderTableRow row={row} index={index} columns={columns} table={table} />}
          />
        }
        footer={<ModulePagination pagination={pagination} onPageChange={handlePageChange} />}
      />
      <ProductionForm isOpen={isFlyoutOpen} onClose={() => setIsFlyoutOpen(false)} selectedOrder={selectedOrder} onAfterSave={getOrderList} />
    </>
  );
}

export default OrdersModulePage;
