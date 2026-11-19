import { buildFallbackColumnsFromKeys } from "../../../../utils/moduleStructure";
import { z } from "zod";

const FIXED_TABLE_COLUMNS = [
  { key: "select", className: "check-col", checkbox: true, width: 42, minWidth: 42, resizable: false },
  // { key: "favorite", className: "icon-col", width: 42, minWidth: 42, resizable: false },
];
export const dispatchFormSchema = {
  sections: [{ columns: 2, fields: [
    { name: "dispatch_no", label: "Dispatch No", readOnly: true, gridSpan: 12 },
    { name: "production_code", label: "Production Code", readOnly: true, gridSpan: 6 },
    { name: "pi_number", label: "PI Number", readOnly: true, gridSpan: 6 },
    { name: "dispatch_date", label: "Dispatch Date", type: "date", gridSpan: 12 },
    { name: "vehicle_capacity_kg", label: "Vehicle Capacity (kg)", type: "number", min: 0, step: "0.01", gridSpan: 6 },
    { name: "total_consignment_weight_kg", label: "Consignment Weight (kg)", type: "number", readOnly: true, gridSpan: 6 },
    { name: "transporter_name", label: "Transporter", gridSpan: 12 },
    { name: "vehicle_no", label: "Vehicle No", gridSpan: 6 },
    { name: "driver_name", label: "Driver Name", gridSpan: 6 },
    { name: "driver_mobile", label: "Driver Mobile", type: "tel", gridSpan: 6 },
    { name: "invoice_no", label: "Invoice No", gridSpan: 6 },
  ].map((field) => ({ type: "text", alwaysVisible: true, alwaysEditable: true, disabledWhen: (values) => values.__readOnly, ...field })) }],
};
export const ordersModuleSchema = {
  title: "Dispatch",
  description: "View and track dispatch entries created from ready stock.",
  table: "dispatches",
  menu_id: 20,
  primaryKey: 'production_note_id',
  api: {
    list: "/production-notes/dispatch"
  },
  definitionRequest: {
    menuIDField: "menu_id",
    modelNameField: "model_name",
    modelName: "order",
  },
  staticJoined: [],
  defaultColumns: ["dispatch_no","production_note_status", "production_note_id", "customer_id", "dispatch_date", "total_items", "total_dispatch_qty", "transporter_name", "vehicle_no", "invoice_no", "dispatch_status"],
  skipFields: ["created_by", "created_date", "modified_by", "modified_date", "status", "remarks"],
  tableCellConfig: [
    { key: "customer_id", type: "person" },
    { key: "dispatch_status", type: "badge", colorField: "dispatch_status_color" },
  ],
  columnMappings: [
    { dispatch_no: "Dispatch No" },
    { production_note_id: "Order No" },
    { customer_id: "Customer" },
    { dispatch_date: "Dispatch Date" },
    { total_items: "Items" },
    { total_dispatch_qty: "Dispatch Qty" },
    { transporter_name: "Transporter" },
    { vehicle_no: "Vehicle No" },
    { invoice_no: "Invoice No" },
    { dispatch_status: "Dispatch Status" },
  ],
  savedFilters: [],
  form: {
    initialValues: {
      production_note_id: null,
      production_note_no: "",
      company_id: null,
      customer_id: null,
      brand: "",
      production_note_date: "",
      production_note_month: "",
      production_note_week: "",
      expected_delivery_date: "",

      production_note_status: "draft",
      priority: "normal",

      total_production_note_qty: 0,
      total_production_note_value: 0,
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
            readOnlyWhen: (values) => Boolean(values.production_note_id),
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
          { name: "production_note_date", label: "Order Date", type: "date", required: true, placeholder: "Order date", gridSpan: 12 },
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
      //     { name: "production_note_week", label: "Order Week", type: "date", required: true, placeholder: "Order week", gridSpan: 12 },
      //   ],
      // },
      // {
      //   columns: 3,
      //   fields: [
      //     { name: "production_note_month", label: "Order Week", type: "date", required: true, placeholder: "Order month", gridSpan: 12 },
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
            name: "production_note_status",
            label: "Order Status",
            type: "smartSelect",
            id: "production_note_status",
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
          { gridSpan: 12, name: "remarks", label: "Remark", type: "textarea", placeholder: "Provide remark about the order...", rows: 1 },
        ]
      },
    ],
  },
  validationSchema: z.object({
    customer_id: z.coerce.number({ required_error: "Customer is required", invalid_type_error: "Customer is required", }).int("Invalid customer").positive("Customer is required"),
    production_note_date: z.coerce.date().nullable()
      .refine((val) => val !== null, {
        message: "Order date is required",
      })
      .refine((val) => val && val <= new Date(), {
        message: "Order date cannot be in the future",
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

