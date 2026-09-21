import { z } from "zod";
import { buildFallbackColumnsFromKeys } from "../../../utils/moduleStructure";
const FIXED_TABLE_COLUMNS = [
  { key: "select", className: "check-col", checkbox: true, width: 42, minWidth: 42, resizable: false },
];

const optionalEmailSchema = z.preprocess(
  (value) => value ?? "",
  z.union([z.literal(""), z.string().trim().email("Invalid email address")])
);

const customerContactSchema = z.object({
  contact_id: z.union([z.literal(null), z.coerce.number(), z.string()]).optional(),
  customer_id: z.union([z.literal(null), z.coerce.number(), z.string()]).optional(),
  name: z.string().trim().min(1, "Contact name is required"),
  designation: z.string().optional(),
  mobile_no: z.string().trim().min(1, "Mobile number is required").refine((value) => { const cleaned = value.replace(/[\s\-().]/g, ""); return /^\+[1-9]\d{7,14}$/.test(cleaned); }, "Enter a valid mobile number with country code"),
  email: z.preprocess((value) => value ?? "", z.string().trim().min(1, "Email is required").email("Invalid email address")),
  department: z.string().optional(),
  is_primary: z.enum(["y", "n"]).optional(),
});

export const customerModuleSchema = {
  title: "Customer",
  description: "Manage customer profile, contacts, company mapping, and billing details from one place.",
  menu_id: null,
  primaryKey: "customer_id",
  api: {
    list: "/customers",
    delete: "/customers/delete",
    create: "/customers/create",
    edit: "/customers",
    definitions: "/system/getDefinations",
    downloadExcel: "/customers/download-excel",
    importTemplate: "/customers/import-template",
    import: "/customers/import",
    definitionsFallback: "/system/getstructure",
  },
  definitionRequest: {
    menuIDField: "menu_id",
    modelNameField: "model_name",
    modelName: "customer",
  },
  staticJoined: [],
  tableCellConfig: [
    { column_name: "name", type: "person" },
    { column_name: "email", type: "clip" },
    { column_name: "company_name", type: "tag" },
    { column_name: "billing_name", type: "tag" },
    { column_name: "customer_type", type: "dotText" },
  ],
  defaultColumns: ["name", "email", "mobile_no", "pan_number", "gst_no"],
  filterFieldOptions: {
    company_id: {
      type: "select",
      optionsSource: {
        apiUrl: "/system/searchList",
        body: {
          tableName: "company_master",
          list: "company_id,company_name",
          wherec: "company_name",
        },
        rowsPath: ["data"],
        valueKey: "company_id",
        labelKey: "company_name",
      },
    },
  },
  skipFields: ['responsible_person', 'exp_call_count', 'wa_no', 'birth_date', 'mailing_address', "company_id", "company_name", 'billing_name', 'billing_address', 'is_amc', 'amc_term_period', 'amc_end_date', 'amc_start_date', 'customer_products'],
  columnMappings: [],
  savedFilters: [],
  form: {
    initialValues: {
      customer_id: null,
      name: "",
      gst_no: null,
      address: null,
      pan_number: null,
      contact_person: null,
      customer_type: 'domestic',
      mobile_no: null,
      email: null,
      status: 'active',
      created_by: null,
      created_date: null,
      modified_by: null,
    },
    sections: [
      {
        columns: 1,
        fields: [
          { name: "name", label: "Customer Name", type: "text", required: true, placeholder: "Enter customer name", gridSpan: 12 },
        ],
      },
      {
        columns: 3,
        fields: [
          { name: "pan_number", label: "PAN Number", type: "text", placeholder: "Enter PAN number", gridSpan: 6 },
          { name: "gst_number", label: "GST Number", type: "text", placeholder: "Enter GST number", gridSpan: 6 },
        ],
      },
      {
        columns: 1,
        fields: [
          { name: "address", label: "Address", type: "textarea", rows: 3, placeholder: "Enter primary address", gridSpan: 12 },
        ],
      },
      {
        columns: 1,
        fields: [
          {
            name: "customer_type",
            label: "Customer Type",
            type: "radio",
            gridSpan: 8,
            options: [
              { value: "domestic", label: "Domestic" },
              { value: "export", label: "Export" },
              { value: "merchant_export", label: "Merchant Export" },
            ],
          },
        ],
      },
    ],
  },
  validationSchema: z.object({
    name: z.string().trim().min(1, "Customer name is required"),
    pan_number: z.union([
      z.literal(null),
      z.string().trim().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Invalid PAN number"),
    ]).optional(),
    customer_contacts: z
      .array(customerContactSchema)
      .refine(
        (contacts) => contacts.filter((contact) => contact.is_primary === "y").length <= 1,
        "Only one primary contact is allowed"
      )
  }),
};

export const customerFallbackColumns = [
  ...FIXED_TABLE_COLUMNS,
  ...buildFallbackColumnsFromKeys(customerModuleSchema.defaultColumns, {
    columnMappings: customerModuleSchema.columnMappings,
    tableCellConfig: customerModuleSchema.tableCellConfig,
  }),
];
