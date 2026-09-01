import { ordersModuleSchema } from "../data/module.schema";

export function buildJoinedOptions(joinConfig, selectedValue, selectedLabel) {
  const configuredOptions = (joinConfig?.options || []).map((option) => ({
    value: option.value ?? option[joinConfig.primaryKey],
    label: option.label ?? option[joinConfig.labelKey],
  }));

  if (selectedValue && !configuredOptions.some((option) => String(option.value) === String(selectedValue))) {
    return [
      ...configuredOptions,
      {
        value: selectedValue,
        label: selectedLabel || selectedValue,
      },
    ];
  }

  return configuredOptions;
}
export function getSelectedLabel(field, value, selectedOrder) {
  if (!value) {
    return "";
  }

  if (field.name === "roleID") {
    return selectedOrder?.roleName || selectedOrder?.role_name || selectedOrder?.roleID || value;
  }

  if (field.name === "default_company") {
    return selectedOrder?.company_name || selectedOrder?.default_company_name || selectedOrder?.default_company || value;
  }

  return value;
}
export function getOrderIdentifier(order = {}) {
  return order?.order_id;
}
export function normalizeOrderData(selectedOrder = {}) {
  return {
    ...ordersModuleSchema.form.initialValues,
    ...selectedOrder,
    orderName: selectedOrder?.orderName || selectedOrder?.order_name || "",
    contactNo: selectedOrder?.contactNo || selectedOrder?.contactno || "",
    whatsappNo: selectedOrder?.whatsappNo || selectedOrder?.whatsappno || "",
    // dateOfBirth: selectedOrder?.dateOfBirth || selectedOrder?.dateofbirth || "",
    roleID: selectedOrder?.roleID || selectedOrder?.roleid || selectedOrder?.roleId || "",
    default_company: selectedOrder?.default_company || selectedOrder?.company_id || "",
    is_approver: selectedOrder?.is_approver || "no",
    time_zone: selectedOrder?.time_zone || "Asia/Kolkata",
    google_location: selectedOrder?.google_location || "",
    address: selectedOrder?.address || "",
    status: selectedOrder?.status || "active",
    dateOfBirth: selectedOrder?.dateOfBirth
      ? new Date(selectedOrder.dateOfBirth).toISOString().split("T")[0]
      : "",
  };
}
export const productCatalog = [
  {
    product_id: 1,
    product: "SF Sonic Power",
    productCode: "SS-AUTO-60",
    model: "Auto",
    weight: 60,
    unitRate: 1200,
    gst: 5,
    readyStock: 1800,
    pendingStock: 1400,
    category: "Automotive",
  },
  {
    product_id: 2,
    product: "Amaron Batteries",
    productCode: "AM-S220-66",
    model: "Smart 220 66Kg",
    weight: 66,
    unitRate: 1650,
    gst: 18,
    readyStock: 1900,
    pendingStock: 600,
    category: "Smart Series",
  },
  {
    product_id: 3,
    product: "Eastman Batteries",
    productCode: "ES-CL200-64",
    model: "CL 200 64Kg",
    weight: 64,
    unitRate: 1100,
    gst: 18,
    readyStock: 2600,
    pendingStock: 1400,
    category: "CL Series",
  },
  {
    product_id: 4,
    product: "Luminous Power",
    productCode: "LU-LI12100-32",
    model: "LI12100",
    weight: 32,
    unitRate: 1700,
    gst: 18,
    readyStock: 1000,
    pendingStock: 800,
    category: "LI Series",
  },
];

export const productOptions = productCatalog.map((item) => item.product);
export const modelOptions = [...new Set(productCatalog.map((item) => item.model))];
export const gstOptions = [0, 5, 12, 18, 28];
export const formatCurrency = (amount, currency = "INR") => `${getCurrencySymbol(currency)} ${new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(Number(amount) || 0)}`;
export const formatNumber = (value) => new Intl.NumberFormat("en-IN").format(value);

export const formatIndianCurrency = (value) => new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(Number(value) || 0);

export const getCurrencySymbol = (currency = "INR") => {
  const normalized = String(currency || "INR").trim().toUpperCase();
  const currencyMap = {
    INR: "₹",
    "₹": "₹",
    USD: "$",
    "$": "$",
    EUR: "€",
    "€": "€",
    GBP: "£",
    "£": "£",
    JPY: "¥",
    "¥": "¥",
  };

  return currencyMap[normalized] || currencyMap[currency] || currency || "₹";
};

export const getLineValue = (row) => {
  const qty = Number(row.qty) || 0;
  const unitRate = Number(row.unitRate) || 0;
  const gst = Number(row.gst) || 0;
  const taxableAmount = qty * unitRate;

  return taxableAmount + taxableAmount * (gst / 100);
};
export function buildOrderSummary(items = [], orderHeader = {}) {
  return items.reduce(
    (summary, item) => {
      const qty = Number(item.qty) || 0;
      const rate = Number(item.unitRate) || 0;
      const gst = Number(item.gst) || 0;
      const readyStock = Number(item.readyStock) || 0;
      const taxableValue = qty * rate;
      const gstValue = taxableValue * (gst / 100);
      const readyQty = Math.min(qty, readyStock);
      const pendingQty = Math.max(qty - readyStock, 0);

      summary.orderNo = orderHeader.order_no || 'Auto Generated';
      summary.totalItems += item.product_id || item.product ? 1 : 0;
      summary.totalQty += qty;
      summary.readyQty += readyQty;
      summary.pendingQty += pendingQty;
      summary.subtotal += taxableValue;
      summary.gstAmount += gstValue;
      summary.grandTotal += taxableValue + gstValue;

      return summary;
    },
    {
      totalItems: 0,
      totalQty: 0,
      readyQty: 0,
      pendingQty: 0,
      subtotal: 0,
      gstAmount: 0,
      grandTotal: 0,
    }
  );
}


