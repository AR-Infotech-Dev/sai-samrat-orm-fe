import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";

import { ordersModuleSchema } from "./data/module.schema";
import { useOrderConfirmationTableConfig } from "./hooks/useConfirmationTableConfig";
import { useOrderConfirmationModule } from "./hooks/useConfirmationModule";
import { getNextSortConfig } from "@utils/sorting";
import { useModuleFilters, useAppSelector } from "@store/hooks";
import { selectOrderConfirmationRows } from "./data/confirmation.slice";
import { confirmOrder } from "./data/confirmation.service";

import ModuleControls from "@shared/ModuleControls";
import ModulePageLayout from "@shared/ModulePageLayout";
import ModulePagination from "@shared/ModulePagination";
import DynamicFilter from "@components/dynamic-filter";
import ResizableTable from "@components/table/ResizableTable";
import useMenuPermissions from "@auth/utils/useMenuPermissions";
import OrderForm from "./components/OrderForm";
import OrderTableRow from "./components/OrderTableRow";
import { CheckCircle2, Clock3, PauseCircle, RotateCcw } from "lucide-react";
import { KpiCard } from "./components/ConfirmationUI";
import { formatCurrency } from "@/utils/common";

const normalizeCurrencyCode = (currency = "INR") => {
  const normalized = String(currency || "INR").trim().toUpperCase();
  const currencyMap = { "₹": "INR", INR: "INR", "$": "USD", USD: "USD", "€": "EUR", EUR: "EUR", "£": "GBP", GBP: "GBP", "¥": "JPY", JPY: "JPY" };
  return currencyMap[normalized] || currencyMap[currency] || normalized || "INR";
};

const getOrderDisplayValue = (row = {}) => Number(row.total_value_in_inr ?? row.total_order_value ?? 0) || 0;
const getOrderBaseInrValue = (row = {}) => {
  const currency = normalizeCurrencyCode(row.currency || "INR");
  const value = getOrderDisplayValue(row);
  const exchangeRate = Number(row.exchange_rate || 1) || 1;
  return currency === "INR" ? value : value / exchangeRate;
};

function OrdersConfirmationPage({ menu_id }) {
  const location = useLocation();
  const resolvedMenuID = menu_id || ordersModuleSchema.menu_id || null;
  const permissions = useMenuPermissions(resolvedMenuID);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const [quickActionLoadingId, setQuickActionLoadingId] = useState(null);
  const orderList = useAppSelector(selectOrderConfirmationRows);
  const { filterState, setSearchText, applyFilterPayload, setSort, clearFilters } = useModuleFilters("order-confirmation", orderList);
  const { pagination, page, loading, selectedRowIds, getOrderList, handlePageChange, handleToggleRow, handleToggleAllRows } = useOrderConfirmationModule({ filterState });
  const { sortConfig, resolvedColumns, defaultVisibleColumnKeys, resolvedFilterFields } = useOrderConfirmationTableConfig({ resolvedMenuID, filterState });

  const handleSortChange = (columnKey) => {
    const nextSort = getNextSortConfig(sortConfig, columnKey);
    if (page !== 1) handlePageChange(1);
    setSort({ order_by: nextSort.key, order: nextSort.direction.toUpperCase() });
  };

  const openReview = (order) => {
    setSelectedOrder(order);
    setIsFlyoutOpen(true);
  };

  const handleQuickAction = async (order, action) => {
    if (!order?.order_id) {
      toast.error("Order id not found");
      return;
    }

    if (action === "confirm") {
      const allowed = window.confirm(`Confirm order ${order.order_no || ""}?`);
      if (!allowed) return;

      try {
        setQuickActionLoadingId(order.order_id);
        const res = await confirmOrder({ orderId: order.order_id, remarks: "" });
        if (!res?.success) {
          toast.error(res?.message || "Unable to confirm order");
          return;
        }
        toast.success(res?.message || "Order confirmed successfully");
        await getOrderList();
      } catch (error) {
        toast.error(error.message || "Unable to confirm order");
      } finally {
        setQuickActionLoadingId(null);
      }
      return;
    }

    openReview(order);
  };

  const totals = useMemo(() => {
    return orderList.reduce(
      (acc, row) => {
        acc.waiting += ["waiting", "Waiting"].includes(row.order_status) ? 1 : 0;
        acc.hold += ["hold", "Hold"].includes(row.order_status) ? 1 : 0;
        acc.high += ["high","High", "urgent"].includes(row.priority) ? 1 : 0;
        acc.qty += Number(row.total_order_qty || 0);
        acc.value += getOrderDisplayValue(row);
        acc.baseInrValue += getOrderBaseInrValue(row);
        acc.currencies.add(normalizeCurrencyCode(row.currency || "INR"));
        return acc;
      },
      { waiting: 0, hold: 0, high: 0, qty: 0, value: 0, baseInrValue: 0, currencies: new Set() }
    );
  }, [orderList]);

  const pendingValueLabel = totals.currencies.size === 1
    ? formatCurrency(totals.value, [...totals.currencies][0] || "INR")
    : formatCurrency(totals.baseInrValue, "INR");
  const pendingValueHint = totals.currencies.size > 1 ? "mixed currency base INR" : "visible queue";

  useEffect(() => {
    getOrderList();
  }, [page, filterState.searchText, filterState.order, filterState.order_by, JSON.stringify(filterState.filters)]);

  useEffect(() => {
    if (page !== 1) handlePageChange(1);
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
            canCreate={false}
            canDelete={false}
            loading={loading}
            onRefresh={getOrderList}
            onCreate={() => { }}
            onDeleteSelected={() => { }}
            showDelete={false}
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
            storageKey="order-confirmation-column-widths"
            defaultVisibleColumnKeys={defaultVisibleColumnKeys}
            sortConfig={sortConfig}
            onSortChange={handleSortChange}
            editRow={permissions.canEdit ? openReview : undefined}
            onDeleteRow={undefined}
            allowSelection={false}
            selectedRowIds={selectedRowIds}
            onToggleRow={handleToggleRow}
            onToggleAllRows={handleToggleAllRows}
            renderRow={(row, index, columns, table) => (
              <OrderTableRow
                row={row}
                index={index}
                columns={columns}
                table={table}
                onView={openReview}
                onQuickAction={handleQuickAction}
                quickActionLoadingId={quickActionLoadingId}
              />
            )}
          />
        }
        footer={<ModulePagination pagination={pagination} onPageChange={handlePageChange} />}
      >
        <div className="my-1.5 mt-2 grid w-full gap-2 md:grid-cols-2 xl:grid-cols-5">
          <KpiCard icon={Clock3} label="Waiting Orders" value={totals.waiting} hint="confirmation pending" />
          <KpiCard icon={PauseCircle} label="Hold Orders" value={totals.hold} hint="needs reason" tone="amber" />
          <KpiCard icon={RotateCcw} label="High Priority" value={totals.high} hint="quick review" tone="red" />
          <KpiCard icon={CheckCircle2} label="Total Qty" value={totals.qty.toLocaleString("en-IN")} hint="visible queue" tone="green" />
          <KpiCard icon={CheckCircle2} label="Pending Value" value={pendingValueLabel} hint={pendingValueHint} tone="blue" />
        </div>
      </ModulePageLayout>

      <OrderForm
        isOpen={isFlyoutOpen}
        onClose={() => setIsFlyoutOpen(false)}
        selectedOrder={selectedOrder}
        onAfterSave={getOrderList}
        menu_id={resolvedMenuID}
      />
    </>
  );
}

export default OrdersConfirmationPage;
