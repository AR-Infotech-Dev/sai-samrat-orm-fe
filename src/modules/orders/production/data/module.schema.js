import { buildFallbackColumnsFromKeys } from "../../../../utils/moduleStructure";

const FIXED_TABLE_COLUMNS = [
  { key: "select", className: "check-col", checkbox: true, width: 42, minWidth: 42, resizable: false },
];

export const ordersModuleSchema = {
  title: "Production",
  description: "Track planned orders through production, procurement, QC and ready quantity.",
  menu_id: 20,
  primaryKey: "order_id",
  api: {
    list: "/orders/production",
    definitions: "/system/getDefinations",
    definitionsFallback: "/system/getstructure",
  },
  defaultColumns: [
    "order_no",
    "customer_id",
    "production_status",
    "production_pending_qty",
    "expected_delivery_date",
    "total_items",
    "item_total_qty",
    "available_stock_qty",
    "saipl_mfg_qty",
    "pmk_procure_qty",
    "produced_qty",
    "procured_qty",
    "production_ready_qty",
    "priority",
  ],
  skipFields: [
    'company_id',
    'source',
    'order_week',
  ],
  tableCellConfig: [
    { column_name: "customer_id", type: "person" },
    { column_name: "order_status", type: "badge", color_field: "order_status_color" },
    { column_name: "production_status", type: "badge" },
    { column_name: "priority", type: "badge", color_field: "priority_color" },
  ],
  columnMappings: [
    { order_no: "Order No" },
    { customer_id: "Customer Name" },
    { expected_delivery_date: "Expected Date" },
    { total_items: "Items" },
    { item_total_qty: "Order Qty" },
    { available_stock_qty: "Stock Qty" },
    { saipl_mfg_qty: "SAIPL MFG" },
    { pmk_procure_qty: "PMK Procure" },
    { produced_qty: "Produced" },
    { procured_qty: "Procured" },
    { qc_passed_qty: "QC Passed" },
    { rework_qty: "Rework" },
    { production_ready_qty: "Ready Qty" },
    { production_pending_qty: "Pending Qty" },
    { production_status: "Production Status" },
    { sales_person_id: "Sales Person" },
  ],
  savedFilters: [],
};

export const ordersFallbackColumns = [
  ...FIXED_TABLE_COLUMNS,
  ...buildFallbackColumnsFromKeys(ordersModuleSchema.defaultColumns, {
    columnMappings: ordersModuleSchema.columnMappings,
    tableCellConfig: ordersModuleSchema.tableCellConfig,
  }),
];
