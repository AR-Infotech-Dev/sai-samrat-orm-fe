import { z } from "zod";
import { buildFallbackColumnsFromKeys } from "../../../utils/moduleStructure";

const FIXED_TABLE_COLUMNS = [
  { key: "select", className: "check-col", checkbox: true, width: 42, minWidth: 42, resizable: false },
];

export const productsModuleSchema = {
  title: "Products",
  description: "Manage product names, product types, and descriptions from one place.",
  menu_id: null,
  primaryKey: "product_id",
  api: {
    list: "/products",
    delete: "/products/delete",
    create: "/products/create",
    edit: "/products",
    importTemplate: "/products/import-template",
    import: "/products/import",
    export: "/products/export",
    definitions: "/system/getDefinations",
    definitionsFallback: "/system/getstructure",
  },
  definitionRequest: {
    menuIDField: "menu_id",
    modelNameField: "model_name",
    modelName: "products",
  },
  staticJoined: [],
  tableCellConfig: [
    { column_name: "product_name", type: "person" },
    { column_name: "product_type", type: "badge", color_field: "type_color" },
  ],
  defaultColumns: ["product_name", "product_type", "product_description"],
  skipFields: ["company_id", "created_by", "created_date", "modified_by", "modified_date"],
  columnMappings: [
    { standard_rate: "Rate" },
  ],
  savedFilters: [],
  form: {
    initialValues: {
      product_id: null,
      tally_item_id: null,
      product_code: null,
      product_name: null,
      category_id: null,
      unit: "Nos",
      standard_rate: null,
      gst_rate: null,
      is_tally_synced: null,
      company_id: null,
      weight: null,
      fg_code: null,
      product_desscription: null,
      ready_stock: null,
      last_tally_sync_at: null,
      created_by: null,
      modified_by: null,
      created_date: null,
      modified_date: null,
      status: 'active',
    },
    sections: [
      {
        columns: 3,
        fields: [
          { name: "product_name", label: "Product Name", type: "text", required: true, placeholder: "Enter product name", gridSpan: 12 },
        ],
      },
      {
        columns: 3,
        fields: [
          { name: "product_code", label: "Product Code", type: "text", required: true, placeholder: "Enter product code", gridSpan: 4 },
          {
            name: "product_type",
            label: "Product Type",
            type: "smartSelect",
            required: true,
            gridSpan: 4,
            config: {
              apiUrl: "/system/searchSlugList",
              tableName: "categories",
              selectFields: "category_id,categoryName",
              searchField: "categoryName",
              slug: 'product-types',
              status: 'active',
              isCompanyWise: false,
              labelKey: "categoryName",
              valueKey: "category_id",
              placeholder: "Select product type",
              multi: false,
            },
          },

          { name: "brand", label: "Brand", type: "text", placeholder: "Enter product brand", gridSpan: 4 },
        ],
      },
      {
        columns: 3,
        fields: [
          { name: "unit", label: "Unit", type: "text", placeholder: "Enter unit", gridSpan: 4 },
          { name: "standard_rate", label: "Rate", type: "text", placeholder: "Enter rate", gridSpan: 4 },
          { name: "weight", label: "Weight", type: "text", placeholder: "Enter weight (kg)", gridSpan: 4 },
        ],
      },
      {
        columns: 2,
        fields: [
          { name: "gst_rate", label: "Gst Rate", type: "text", placeholder: "Enter product brand", gridSpan: 4 },
          {
            name: "status", label: "Status", type: "radio", options: [
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "delete", label: "Delete" },
            ], gridSpan: 6
          },
        ],
      },
      {
        columns: 3,
        fields: [
          { name: "ready_stock", label: "Ready Stock", type: "number", placeholder: "Enter ready stock", gridSpan: 4 },
          { name: "fg_code", label: "FG Code", type: "text", placeholder: "Enter fg code", gridSpan: 4 },
        ],
      },
      {
        columns: 1,
        fields: [
          { name: "product_description", label: "Description", type: "textarea", rows: 3, placeholder: "Enter product description", gridSpan: 12 },
        ],
      },
    ],
  },
  validationSchema: z.object({
    product_name: z.string().nullable().refine((val) => val !== null && val.trim() !== "", { message: "Product name is required", }),
    product_type: z.coerce.number().min(1, "Product type required"),
    product_code: z.string().nullable().refine((val) => val !== null && val.trim() !== "", { message: "Product code required", }),
  }),
};

export const productsFallbackColumns = [
  ...FIXED_TABLE_COLUMNS,
  ...buildFallbackColumnsFromKeys(productsModuleSchema.defaultColumns, {
    columnMappings: productsModuleSchema.columnMappings,
    tableCellConfig: productsModuleSchema.tableCellConfig,
  }),
];
