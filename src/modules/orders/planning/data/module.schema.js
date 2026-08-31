import { buildFallbackColumnsFromKeys } from "../../../../utils/moduleStructure";
import { z } from "zod";

const FIXED_TABLE_COLUMNS = [
  { key: "select", className: "check-col", checkbox: true, width: 42, minWidth: 42, resizable: false },
  // { key: "select", className: "check-col", checkbox: true, width: 42, minWidth: 42, resizable: false },
  // { key: "favorite", className: "icon-col", width: 42, minWidth: 42, resizable: false },
];
export const ordersModuleSchema = {
  title: "Order Planning",
  description: "Plan confirmed orders row-wise by product item.",
  menu_id: 20,
  primaryKey: 'order_id',
  api: {
    list: "/orders/planning",
    delete: "/orders/delete",
    create: "/orders/create",
    edit: "/orders",
    definitions: "/system/getDefinations",
    definitionsFallback: "/system/getstructure",
  },
  definitionRequest: {
    menuIDField: "menu_id",
    modelNameField: "model_name",
    modelName: "order",
  },
  staticJoined: [
    {
      field: "roleID",
      fieldtype: "joined",
      joinedTable: "order_role_master",
      select: "roleID,roleName",
      primaryKey: "roleID",
      labelKey: "roleName",
      slug: "",
      options: [],
    },
    {
      field: "default_company",
      fieldtype: "company",
      joinedTable: "company_master",
      select: "company_id,company_name",
      primaryKey: "company_id",
      labelKey: "company_name",
      slug: "",
      options: [],
    },
  ],
  defaultColumns: ["order_no", "order_status", "customer_name", "order_date", "expected_delivery_date", "total_items", "item_total_qty", "saipl_qty", "pmk_qty", "ready_qty", "pending_qty", "planning_status", "priority"],
  externalColumns: [
    {
      key: "planning_status",
      label: "Planning Status",
      width: 130,
      minWidth: 110,
      cellType: "badge",
    },
    {
      key: "pending_qty",
      label: "Pending QTY",
      width: 130,
      minWidth: 110,
    },
    {
      key: "item_total_qty",
      label: "Items Total QTY",
      width: 130,
      minWidth: 110,
    },
    {
      key: "total_items",
      label: "Total Items",
      width: 130,
      minWidth: 110,
    },
    {
      key: "saipl_qty",
      label: "SAIPL QTY",
      width: 130,
      minWidth: 110,
    },
    {
      key: "pmk_qty",
      label: "PMK QTY",
      width: 130,
      minWidth: 110,
    },
  ],
  skipFields: [],
  tableCellConfig: [
    { column_name: "name", type: "person" },
    { column_name: "orderName", type: "person" },
    { column_name: "roleID", type: "tag" },
    { column_name: "order_status", type: "badge", color_field: "order_status_color" },
    { column_name: "planning_status", type: "badge" },
    { column_name: "priority", type: "badge", color_field: "priority_color" },
    { column_name: "status", type: "badge", color_field: "status_color" },
  ],
  columnMappings: [
    { is_sys_order: "System Order" },
    { isEmailSend: "Verification Email Sent" },
    { contactNo: "Contact No" },
    { whatsappNo: "Whatsapp No" },
    { dateOfBirth: "Date Of Birth" },
    { lastLogin: "Last Login" },
    { company_id: "Assigned Company" },
    { orderName: "Order Name" },
    { order_no: "Order No" },
    { customer_name: "Customer" },
    { expected_delivery_date: "Expected Date" },
    { total_items: "Items" },
    { total_order_qty: "Order Qty" },
    { saipl_qty: "SAIPL Qty" },
    { pmk_qty: "PMK Qty" },
    { ready_qty: "Ready Qty" },
    { pending_qty: "Pending Qty" },
    { planning_status: "Planning Status" },
    { roleID: "Order Role" },
    { is_approver: "Approval Privileges" },
    { otp: "OTP" },
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
  })
};

export const ordersFallbackColumns = [
  ...FIXED_TABLE_COLUMNS,
  ...buildFallbackColumnsFromKeys(ordersModuleSchema.defaultColumns, {
    columnMappings: ordersModuleSchema.columnMappings,
    tableCellConfig: ordersModuleSchema.tableCellConfig,
    externalColumns: ordersModuleSchema.externalColumns,
  }),
];




