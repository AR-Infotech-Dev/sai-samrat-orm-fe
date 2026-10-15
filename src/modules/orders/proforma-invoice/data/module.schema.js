import { buildFallbackColumnsFromKeys } from "../../../../utils/moduleStructure";
import CustomerRowTemplate from "@modules/orders/shared/components/CustomerRowTemplate";

const FIXED_TABLE_COLUMNS = [
  { key: "select", className: "check-col", checkbox: true, width: 42, minWidth: 42, resizable: false },
];

const proformaCurrencyOptions = [
  { value: "INR", label: "Indian Rupee (₹)" },
  { value: "USD", label: "US Dollar ($)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "GBP", label: "British Pound (£)" },
  { value: "JPY", label: "Japanese Yen (¥)" },
];

const toDateInputValue = (date) => date.toISOString().slice(0, 10);

export const getDefaultValidUntilDate = (piDate = new Date()) => {
  const date = piDate ? new Date(piDate) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  date.setDate(date.getDate() + 7);
  return toDateInputValue(date);
};

const initialValues = {
  pi_id: null,
  pi_no: "",
  customer_id: null,
  customer_name: "",
  customer_email: "",
  customer_mobile: "",
  brand: "",
  pi_date: toDateInputValue(new Date()),
  valid_until: getDefaultValidUntilDate(),
  order_type: "domestic",
  pi_status: "draft",
  priority: "normal",
  total_qty: 0,
  total_value: 0,
  gst_rate: 18,
  currency: "INR",
  exchange_rate: 1,
  total_value_in_inr: 0,
  payment_terms: "30% Advance along with PI & Balance against proof of BL",
  delivery_terms: "Within 30 Days from date of Advance",
  packing: "20' Container, 20 Pallets, 20 Batteries in Each Pallet",
  validity_of_offer: "7 Days from the date of generation of this PI",
  other_term: "",
  country_of_origin: "INDIA",
  port_of_loading: "NHAVA SHEVA",
  country_of_export: "",
  port_of_discharge: "",
  final_destination: "",
  remarks: "",
};

export const proformaModuleSchema = {
  title: "Proforma Invoice",
  description: "Create and manage proforma invoices before order booking.",
  menu_id: 20,
  primaryKey: "pi_id",
  api: {
    list: "/orders/proforma-invoice",
    create: "/orders/proforma-invoice/create",
    edit: "/orders/proforma-invoice",
    delete: "/orders/proforma-invoice/delete",
    definitions: "/system/getDefinations",
  },
  defaultColumns: [
    "pi_no",
    "customer_id",
    "order_type",
    "pi_date",
    "total_qty",
    "total_value",
    "currency",
    "pi_status",
  ],
  skipFields: ["created_by", "created_date", "modified_by", "modified_date", "status", "remarks"],
  tableCellConfig: [
    { column_name: "customer_id", type: "person" },
    { column_name: "pi_status", type: "badge", color_field: "pi_status_color" },
    { column_name: "order_type", type: "tag" },
  ],
  columnMappings: [
    { pi_no: "PI No" },
    { customer_id: "Customer" },
    { customer_name: "Customer" },
    { order_type: "Order Type" },
    { pi_date: "PI Date" },
    { valid_until: "Valid Until" },
    { total_qty: "Qty" },
    { total_value: "PI Value" },
    { currency: "Currency" },
    { pi_status: "PI Status" },
  ],
  savedFilters: [],
  initialValues,
  form: {
    initialValues,
    sections: [
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
            options: [
              { value: "domestic", label: "Domestic" },
              { value: "export", label: "Export" },
              { value: "merchant_export", label: "Merchant Export" },
            ],
          },
        ],
      },
      {
        columns: 3,
        fields: [
          {
            name: "customer_id",
            label: "Customer",
            type: "smartSelectInput",
            required: true,
            id: "customer_id",
            gridSpan: 12,
            config: {
              type: "customer",
              source: "customer",
              list: "customer_id,name,customer_type,email,mobile_no,address,gst_number,country,postal_code,vat_no",
              placeholder: "Select Customer",
              getExtraParams: (values) => ({ customer_type: values.order_type }),
              preload: true,
              RowTemp: CustomerRowTemplate,
              getValue: (item) => item.customer_id,
              getLabel: (item) => item.name,
              selectedOption: (value, values) => value ? {
                value,
                label: values.customer_name || `Customer #${value}`,
                original: {
                  customer_id: value,
                  name: values.customer_name || `Customer #${value}`,
                  customer_type: values.order_type,
                  email: values.customer_email,
                  mobile_no: values.customer_mobile,
                },
              } : null,
            },
          },
        ],
      },
      {
        columns: 3,
        fields: [
          { name: "pi_date", label: "PI Date", type: "date", required: true, placeholder: "PI Date", gridSpan: 12, alwaysVisible: true, alwaysEditable: true },
        ],
      },
      {
        columns: 3,
        fields: [
          { name: "valid_until", label: "Valid Until", type: "date", placeholder: "Valid until", gridSpan: 12, alwaysVisible: true, alwaysEditable: true },
        ],
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
            options: proformaCurrencyOptions,
          },
        ],
      },
      {
        columns: 3,
        fields: [
          { name: "gst_rate", label: "GST Rate", type: "number", gridSpan: 12, alwaysVisible: true, alwaysEditable: false, readOnlyWhen: () => true },
        ],
      },
      {
        columns: 1,
        fields: [
          { name: "payment_terms", label: "Payment Terms", type: "textarea", rows: 2, placeholder: "Payment terms", gridSpan: 12, alwaysVisible: true, alwaysEditable: true },
        ],
      },
      {
        columns: 1,
        fields: [
          { name: "delivery_terms", label: "Delivery Terms", type: "textarea", rows: 2, placeholder: "Delivery terms", gridSpan: 12, alwaysVisible: true, alwaysEditable: true },
        ],
      },
      {
        columns: 1,
        fields: [
          { name: "packing", label: "Packing", type: "textarea", rows: 2, placeholder: "Packing details", gridSpan: 12, alwaysVisible: true, alwaysEditable: true },
        ],
      },
      {
        columns: 1,
        fields: [
          { name: "validity_of_offer", label: "Validity of Offer", type: "textarea", rows: 2, placeholder: "Validity of offer", gridSpan: 12, alwaysVisible: true, alwaysEditable: true },
        ],
      },
      {
        columns: 1,
        fields: [
          { name: "other_term", label: "Other Term", type: "textarea", rows: 2, placeholder: "Other term", gridSpan: 12, alwaysVisible: true, alwaysEditable: true },
        ],
      },
      {
        columns: 3,
        fields: [
          { name: "country_of_origin", label: "Country of Origin", type: "text", placeholder: "Country of origin", gridSpan: 6, alwaysVisible: true, alwaysEditable: true },
          { name: "port_of_loading", label: "Port of Loading", type: "text", placeholder: "Port of loading", gridSpan: 6, alwaysVisible: true, alwaysEditable: true },
          { name: "country_of_export", label: "Country of Export", type: "text", placeholder: "Country of export", gridSpan: 6, alwaysVisible: true, alwaysEditable: true },
          { name: "port_of_discharge", label: "Port of Discharge", type: "text", placeholder: "Port of discharge", gridSpan: 6, alwaysVisible: true, alwaysEditable: true },
          { name: "final_destination", label: "Final Destination", type: "text", placeholder: "Final destination", gridSpan: 6, alwaysVisible: true, alwaysEditable: true },
        ],
      },
      {
        columns: 1,
        fields: [
          { name: "remarks", label: "Remark", type: "textarea", rows: 2, placeholder: "Provide remark about the PI...", gridSpan: 12, alwaysVisible: true, alwaysEditable: true },
        ],
      },
    ],
  },
};

export const proformaFallbackColumns = [
  ...FIXED_TABLE_COLUMNS,
  ...buildFallbackColumnsFromKeys(proformaModuleSchema.defaultColumns, {
    columnMappings: proformaModuleSchema.columnMappings,
    tableCellConfig: proformaModuleSchema.tableCellConfig,
  }),
];
