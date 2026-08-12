import { buildFallbackColumnsFromKeys } from "../../../../utils/moduleStructure";
import { z } from "zod";

const FIXED_TABLE_COLUMNS = [
  { key: "select", className: "check-col", checkbox: true, width: 42, minWidth: 42, resizable: false },
  // { key: "favorite", className: "icon-col", width: 42, minWidth: 42, resizable: false },
];
export const ordersModuleSchema = {
  title: "Ready Stock",
  description: "View dispatch-ready stock calculated from planning and production.",
  table: "orders",
  menu_id: 20,
  primaryKey: 'order_id',
  api: {
    list: "/orders/ready-stock"
  },
  definitionRequest: {
    menuIDField: "menu_id",
    modelNameField: "model_name",
    modelName: "order",
  },
  staticJoined: [],
  defaultColumns: ["order_no", "customer_id", "ready_stock_status", "expected_delivery_date", "total_items", "item_total_qty", "planning_ready_qty", "qc_passed_qty", "procured_qty", "total_ready_qty", "dispatched_qty", "available_dispatch_qty", "pending_qty", "priority",],
  skipFields: ["created_by", "created_date", "modified_by", "modified_date", "status", "remarks", "excel_row_no", "source"],
  tableCellConfig: [
    { column_name: "customer_id", type: "person" },
    { column_name: "ready_stock_status", type: "badge", color_field: "ready_stock_status_color" },
    { column_name: "order_status", type: "badge", color_field: "order_status_color" },
    { column_name: "priority", type: "badge", color_field: "priority_color" },
  ],
  columnMappings: [
    { order_no: "Order No" },
    { customer_id: "Customer" },
    { customer_name: "Customer" },
    { expected_delivery_date: "Expected Date" },
    { total_items: "Items" },
    { item_total_qty: "Order Qty" },
    { planning_ready_qty: "Stock Qty" },
    { qc_passed_qty: "QC Pass" },
    { procured_qty: "Procured" },
    { total_ready_qty: "Total Ready" },
    { dispatched_qty: "Dispatched" },
    { available_dispatch_qty: "Available" },
    { pending_qty: "Pending" },
    { ready_stock_status: "Ready Status" },
    { priority: "Priority" },
    { order_status: "Order Status" },
    { customer_id: "Customer Name" },
    { sales_person_id: "Sales Person" },
    { total_order_qty: "Order Qty " },
    { total_order_value: "Order Value " },
  ],
  savedFilters: [],
  form: {
    initialValues: {
      order_id: null,
      order_no: "",
      company_id: null,
      customer_id: null,
      brand: "",
      order_date: "",
      order_month: "",
      order_week: "",
      sales_person_id: null,
      expected_delivery_date: "",

      order_status: "draft",
      priority: "normal",

      total_order_qty: 0,
      total_order_value: 0,
      currency: "INR",
      exchange_rate: 1,
      total_value_in_inr: 0,

      source: "manual",
      excel_row_no: null,
      remarks: null,

      created_by: null,
      created_date: null,
      modified_by: null,
      modified_date: null,

      status: "active",
    },
    sections: [
      // `columns` decides the grid and each field controls label/type/required state.
      {
        columns: 3,
        fields: [
          {
            name: "customer_id",
            label: "Customer Name",
            type: "smartSelectInput",
            required: true,
            id: "customer_id",
            gridSpan: 12,
            readOnlyWhen: (values) => Boolean(values.order_id),
            config: {
              type: "customer",
              source: "customer",
              list: "customer_id,name,created_date,mobile_no,email,contact_person",
              placeholder: "Select Customer ",
              allowAddNew: true,
              multi: false,
              getValue: (item) => item.customer_id,
              getLabel: (item) => {
                const serialNumbers =
                  item.customer_products?.length
                    ? item.customer_products
                      .map(product => product.serial_number)
                      .filter(Boolean)
                      .join(", ")
                    : "";

                return serialNumbers
                  ? `${item.name} (${serialNumbers})`
                  : (item.name || "Unnamed Customer");
              }
            },
          },
        ]
      },
      {
        columns: 3,
        fields: [
          { name: "order_date", label: "Order Date", type: "date", required: true, placeholder: "Order date", gridSpan: 12 },
        ]
      },
      {
        columns: 3,
        fields: [
          { name: "expected_delivery_date", label: "Expected delivery Date", type: "date", required: true, placeholder: "Expected delivery date", gridSpan: 12 },
        ]
      },
      // {
      //   columns: 3,
      //   fields: [
      //     { name: "order_week", label: "Order Week", type: "date", required: true, placeholder: "Order week", gridSpan: 12 },
      //   ],
      // },
      // {
      //   columns: 3,
      //   fields: [
      //     { name: "order_month", label: "Order Week", type: "date", required: true, placeholder: "Order month", gridSpan: 12 },
      //   ],
      // },
      {
        columns: 3,
        fields: [
          {
            name: "priority",
            label: "Order Priority",
            type: "smartSelect",
            id: "priority",
            gridSpan: 12,
            config: {
              apiUrl: "/system/searchSlugList",
              tableName: "categories",
              selectFields: "category_id,categoryName,slug",
              searchField: "categoryName",
              labelKey: "categoryName",
              slug: 'order-priority',
              isCompanyWise: true,
              status: 'active',
              valueKey: "slug",
              placeholder: "Select Order Priority",
              multi: false,
            },
          },
        ],
      },
      {
        columns: 3,
        fields: [
          {
            name: "order_status",
            label: "Order Status",
            type: "smartSelect",
            id: "order_status",
            gridSpan: 12,
            config: {
              apiUrl: "/system/searchSlugList",
              tableName: "categories",
              selectFields: "category_id,categoryName,slug",
              searchField: "categoryName",
              labelKey: "categoryName",
              slug: 'order-status',
              isCompanyWise: true,
              status: 'active',
              valueKey: "slug",
              placeholder: "Select order status",
              multi: false,
            },
          },
        ],
      },
      {
        columns: 1,
        fields: [
          {
            name: "sales_person_id",
            label: "Sales Person",
            type: "smartSelectInput",
            required: true,
            id: "sales_person_id",
            gridSpan: 12,
            config: {
              apiUrl: "/system/searchAssignee",
              type: "sales_person_id",
              source: "admin",
              list: "adminID,name,status",
              check: "name",
              getValue: (item) => item.adminID,
              getLabel: (item) => item.name || "Unnamed Sales Person",
              placeholder: "Select SalesPerson",
              multi: false
            }
          },
        ]
      },
      {
        columns: 1,
        fields: [
          { gridSpan: 12, name: "remarks", label: "Remark", type: "textarea", placeholder: "Provide remark about the order...", rows: 1 },
        ]
      },
    ],
  },
  validationSchema: z.object({
    customer_id: z.coerce.number({ required_error: "Customer is required", invalid_type_error: "Customer is required", }).int("Invalid customer").positive("Customer is required"),
    order_date: z.coerce.date().nullable()
      .refine((val) => val !== null, {
        message: "Order date is required",
      })
      .refine((val) => val && val <= new Date(), {
        message: "Order date cannot be in the future",
      }),
    sales_person_id: z.any().refine((value) => value !== "" && value !== null && value !== undefined, {
      message: "Role is required",
    }),
  })
};

export const ordersFallbackColumns = [
  ...FIXED_TABLE_COLUMNS,
  ...buildFallbackColumnsFromKeys(ordersModuleSchema.defaultColumns, {
    columnMappings: ordersModuleSchema.columnMappings,
    tableCellConfig: ordersModuleSchema.tableCellConfig,
  }),
];

