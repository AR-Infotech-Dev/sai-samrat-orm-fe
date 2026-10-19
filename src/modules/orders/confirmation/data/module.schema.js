import { buildFallbackColumnsFromKeys } from "../../../../utils/moduleStructure";
import { z } from "zod";

const FIXED_TABLE_COLUMNS = [
  { key: "select", className: "check-col", checkbox: true, width: 42, minWidth: 42, resizable: false },
  // { key: "favorite", className: "icon-col", width: 42, minWidth: 42, resizable: false },
];
export const ordersModuleSchema = {
  title: "Production Note Confirmation",
  description: "Review waiting production notes before sending them to planning.",
  menu_id: 20,
  primaryKey: 'production_note_id',
  api: {
    list: "/production-notes",
    delete: "/production-notes/delete",
    create: "/production-notes/create",
    edit: "/production-notes",
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
  defaultColumns: ["production_note_no", "production_note_status", "customer_id", "brand", "production_note_date", "priority", "total_production_note_value", "total_production_note_qty"],
  skipFields: [],
  tableCellConfig: [
    { column_name: "name", type: "person" },
    { column_name: "customer_id", type: "person" },
    { column_name: "total_production_note_value", type: "currency" },
    { column_name: "total_value_in_inr", type: "currency" },
    { column_name: "production_note_status", type: "badge", color_field: "production_note_status_color" },
    { column_name: "priority", type: "badge", color_field: "priority_color" },
    { column_name: "status", type: "badge", color_field: "status_color" },
  ],
  columnMappings: [
    { customer_id: "Customer Name" },
    { total_production_note_qty: "Order Qty " },
    { total_production_note_value: "Order Value " },
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
          { name: "production_note_date", label: "Production Note Date", type: "date", required: true, placeholder: "Production Note date", gridSpan: 12 },
        ]
      },
      {
        columns: 3,
        fields: [
          { name: "expected_delivery_date", label: "Expected delivery Date", type: "date", required: true, placeholder: "Expected delivery date", gridSpan: 12 },
        ]
      },
      {
        columns: 3,
        fields: [
          { name: "brand", label: "Brand", type: "text", required: true, placeholder: "Brand", gridSpan: 12 },
        ],
      },
      {
        columns: 3,
        fields: [
          { name: "production_code", label: "Order Code", type: "text", required: true, placeholder: "Order Code", gridSpan: 12 },
        ],
      },
      {
        columns: 3,
        fields: [
          {
            name: "currency",
            label: "Currency",
            type: "smartSelect",
            id: "currency",
            gridSpan: 12,
            config: {
              apiUrl: "/system/searchSlugList",
              tableName: "categories",
              selectFields: "category_id,categoryName,slug",
              searchField: "categoryName",
              labelKey: "currency",
              slug: 'currencies',
              isCompanyWise: true,
              status: 'active',
              valueKey: "slug",
              placeholder: "Select Currencies",
              multi: false,
            },
          },
        ],
      },
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
      // {
      //   columns: 3,
      //   fields: [
      //     {
      //       name: "production_note_status",
      //       label: "Order Status",
      //       type: "smartSelect",
      //       id: "production_note_status",
      //       gridSpan: 12,
      //       config: {
      //         apiUrl: "/system/searchSlugList",
      //         tableName: "categories",
      //         selectFields: "category_id,categoryName,slug",
      //         searchField: "categoryName",
      //         labelKey: "categoryName",
      //         slug: 'order-status',
      //         isCompanyWise: true,
      //         status: 'active',
      //         valueKey: "slug",
      //         placeholder: "Select order status",
      //         multi: false,
      //       },
      //     },
      //   ],
      // },
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
        message: "Production note date is required",
      })
      .refine((val) => val && val <= new Date(), {
        message: "Production note date cannot be in the future",
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
