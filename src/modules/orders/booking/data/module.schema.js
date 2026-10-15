import { buildFallbackColumnsFromKeys } from "@utils/moduleStructure";
import { optional, readonly, z } from "zod";
import { currencyOptions } from "../utils/booking.utils";
import CustomerRowTemplate from "../../shared/components/CustomerRowTemplate";
import ProformaInvoiceRowTemplate from "../../shared/components/ProformaInvoiceRowTemplate";

const FIXED_TABLE_COLUMNS = [
  { key: "select", className: "check-col", checkbox: true, width: 42, minWidth: 42, resizable: false },
  // { key: "favorite", className: "icon-col", width: 42, minWidth: 42, resizable: false },
];
export const ordersModuleSchema = {
  title: "Orders",
  description: "Manage orders here.",
  menu_id: 20,
  primaryKey: 'order_id',
  api: {
    list: "/orders",
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
  defaultColumns: ["order_code", "order_status", "customer_id", "brand", "order_date", "currency", "total_order_value", "total_order_qty"],
  skipFields: ['order_no', 'company_id', 'excel_row_no'],
  tableCellConfig: [
    { column_name: "name", type: "person" },
    { column_name: "orderName", type: "person" },
    { column_name: "roleID", type: "tag" },
    { column_name: "order_status", type: "badge", color_field: "order_status_color" },
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
    { roleID: "Order Role" },
    { is_approver: "Approval Privileges" },
    { otp: "OTP" },
  ],
  savedFilters: [],
  form: {
    initialValues: {
      order_id: null,
      order_no: "",
      order_type: 'domestic',
      order_code: "",
      company_id: null,
      customer_id: null,
      customer_name: "",
      brand: "",
      pi_id: null,
      pi_number: "",
      order_date: "",
      order_month: "",
      order_week: "",
      expected_delivery_date: "",
      order_status: "draft",
      priority: "normal",
      total_order_qty: 0,
      total_order_value: 0,
      gst_rate: 18,
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
      {
        columns: 3,
        fields: [
          { name: "order_code", label: "Order Code", type: "text", placeholder: "Order Code", gridSpan: 12, required: true, readOnlyWhen: (values) => Boolean(values.order_status !== "draft"), },
        ],
      },
      {
        columns: 3,
        fields: [
          {
            name: "order_type",
            label: "Order Type",
            type: "select",
            required: true,
            gridSpan: 12,
            alwaysVisible: true,
            alwaysEditable: true,
            readOnlyWhen: (values) => Boolean(values.order_status !== "draft"),
            options: [
              { value: "domestic", label: "Domestic" },
              { value: "export", label: "Export" },
              { value: "merchant_export", label: "Merchant Export" },
            ]
          },
        ],
      },
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
            readOnlyWhen: (values) => Boolean(values.order_status !== "draft"),
            config: {
              type: "customer",
              source: "customer",
              list: "customer_id,name,customer_type",
              placeholder: "Select Customer ",
              getExtraParams: (values) => ({
                customer_type: values.order_type,
              }),
              allowAddNew: true,
              multi: false,
              RowTemp: CustomerRowTemplate,
              getValue: (item) => item.customer_id,
              getLabel: (item) => item.name
            },
          },
        ]
      },
      {
        columns: 3,
        fields: [
          {
            name: "pi_number",
            label: "PI No",
            type: "smartSelectInput",
            required: true,
            placeholder: "Select PI Number",
            gridSpan: 12,
            disabledWhen: (values) => !values.customer_id || Boolean(values.order_status !== "draft"),
            config: {
              type: "proforma_invoice",
              source: "proforma_invoices",
              apiUrl: "/system/searchList",
              placeholder: "Select Customer first, then PI",
              check: "pi_no,brand",
              list: "pi_id,pi_no,customer_id,brand,order_type,pi_date,currency,exchange_rate,total_qty,total_value,gst_rate,pi_status",
              valueKey: "pi_no",
              labelKey: "pi_no",
              preload: true,
              cache: false,
              getExtraParams: (values) => ({
                customer_id: values.customer_id,
              }),
              customParameters: {
                require_customer: true,
              },
              multi: false,
              RowTemp: ProformaInvoiceRowTemplate,
              getValue: (item) => item.pi_no,
              getLabel: (item) => item.pi_no,
              selectedOption: (value, values) => value ? {
                value,
                label: value,
                original: {
                  pi_id: values.pi_id,
                  pi_no: value,
                  customer_id: values.customer_id,
                  customer_name: values.customer_name,
                  brand: values.brand,
                  currency: values.currency,
                },
              } : null,
            },
          },
        ]
      },
      {
        columns: 3,
        fields: [
          {
            name: "brand", label: "Brand", type: "text", required: true, placeholder: "Brand", gridSpan: 12,
            readOnlyWhen: (values) => Boolean(values.order_status !== "draft"),
          },
        ],
      },
      {
        columns: 3,
        fields: [
          { name: "order_date", label: "Order Date", type: "date", required: true, placeholder: "Order date", gridSpan: 12, readOnlyWhen: (values) => Boolean(values.order_status !== "draft"), },
        ]
      },
      {
        columns: 3,
        fields: [
          { name: "expected_delivery_date", label: "Expected delivery Date", type: "date", required: true, placeholder: "Expected delivery date", gridSpan: 12, readOnlyWhen: (values) => Boolean(values.order_status !== "draft"), },
        ]
      },
      {
        columns: 3,
        fields: [
          {
            name: "currency",
            label: "Currency",
            type: "select",
            gridSpan: 12,
            alwaysVisible: true,
            alwaysEditable: false,
            readOnlyWhen: () => true,
            options: currencyOptions
          },
        ],
      },
      {
        columns: 1,
        fields: [
          {
            gridSpan: 12, name: "remarks", label: "Remark", type: "textarea", placeholder: "Provide remark about the order...", rows: 2,
            alwaysVisible: true,
            alwaysEditable: true,
            readOnlyWhen: (values) => Boolean(values.order_status !== "draft"),
          },
        ]
      },
    ],
  },
  validationSchema: z.object({
    order_type: z.string().nullable().refine((val) => val !== null && val.trim() !== "", { message: "Order type required", }),
    order_code: z.string().nullable().refine((val) => val !== null && val.trim() !== "", { message: "Order code required", }),
    pi_number: z.string().nullable().refine((val) => val !== null && val.trim() !== "", { message: "PI number required", }),
    brand: z.string().nullable().refine((val) => val !== null && val.trim() !== "", { message: "Brand required", }),
    customer_id: z.coerce.number({ required_error: "Customer is required", invalid_type_error: "Customer is required", }).int("Invalid customer").positive("Customer is required"),
    order_date: z.coerce.date().nullable()
      .refine((val) => val !== null, {
        message: "Order date is required",
      })
      .refine((val) => val && val <= new Date(), {
        message: "Order date cannot be in the future",
      }),
    expected_delivery_date: z.coerce.date().nullable()
      .refine((val) => val !== null, {
        message: "Expected delivery date is required",
      })
      .refine((val) => val && val >= new Date(), {
        message: "Expected delivery date cannot be in the past",
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
export const productSmartSelectConfig = {
  type: "product",
  source: "products",
  label: "product",
  placeholder: "Select products",
  apiUrl: "",
  check: "product_name",
  list: "product_id,product_name,product_code, ",
  preload: true,
  cache: true,
  showRecent: true,
  multi: false,
  statusCheck: true,
  allowAddNew: false,
  customParameters: {},
  getValue: (product) => product.product_id,
  getLabel: (product) => {
    return product.product_name || "Unnamed product";
  },
};
