import { getDefaultValidUntilDate, proformaModuleSchema } from "../data/module.schema";

export const toNumber = (value, fallback = 0) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

export const roundMoney = (value) => Math.round(toNumber(value));

export const getGstRateByOrderType = (orderType = "domestic") => {
  if (orderType === "export") return 0;
  if (orderType === "merchant_export") return 0.1;
  return 18;
};

export const getCurrencyByOrderType = (orderType = "domestic") => (
  orderType === "domestic" ? "INR" : "USD"
);

export const getCurrencySymbol = (currency = "INR") => {
  const normalized = String(currency || "INR").toUpperCase();
  const currencyMap = { INR: "₹", USD: "$", EUR: "€", GBP: "£", JPY: "¥", "₹": "₹", "$": "$", "€": "€", "£": "£", "¥": "¥" };
  return currencyMap[normalized] || currency || "₹";
};

export const formatNumber = (value) => toNumber(value).toLocaleString("en-IN", { maximumFractionDigits: 2 });
export const formatCurrency = (value, currency = "INR") => `${getCurrencySymbol(currency)} ${formatNumber(value)}`;

export const convertInrToCurrency = (amount, exchangeRate = 1) => roundMoney(toNumber(amount) * (toNumber(exchangeRate, 1) || 1));

export const createBlankPiItem = (gstRate = 18) => ({
  id: `pi-row-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  product_id: null,
  product: "",
  product_code: "",
  brand: "",
  model: "",
  weight: 0,
  qty: 0,
  unit_rate: 0,
  unit_rate_in_inr: 0,
  gst_rate: gstRate,
  product_marking: "",
  line_value: 0,
});

export const calculatePiItem = (item = {}, gstRate = 18) => {
  const qty = roundMoney(item.qty);
  const weight = roundMoney(item.weight);
  const unitRate = roundMoney(item.unit_rate ?? item.unitRate);
  const lineGst = toNumber(item.gst_rate ?? item.gst, gstRate);
  const taxable = qty * unitRate;
  const gstAmount = taxable * (lineGst / 100);
  return {
    ...item,
    qty,
    weight,
    unit_rate: unitRate,
    gst_rate: lineGst,
    line_value: roundMoney(taxable + gstAmount),
  };
};

export const buildPiSummary = (items = []) => items.reduce((summary, item) => {
  const qty = roundMoney(item.qty);
  const rate = roundMoney(item.unit_rate);
  const gstRate = toNumber(item.gst_rate);
  const taxable = qty * rate;
  const gstAmount = taxable * (gstRate / 100);
  summary.total_qty += qty;
  summary.subtotal += taxable;
  summary.gst_amount += roundMoney(gstAmount);
  summary.total_value += roundMoney(taxable + gstAmount);
  return summary;
}, { total_qty: 0, subtotal: 0, gst_amount: 0, total_value: 0 });

export const normalizePiData = (data = {}) => {
  const orderType = data.order_type || proformaModuleSchema.initialValues.order_type;
  const gstRate = data.gst_rate ?? getGstRateByOrderType(orderType);
  const currency = data.currency || getCurrencyByOrderType(orderType);
  return {
    ...proformaModuleSchema.initialValues,
    ...data,
    order_type: orderType,
    currency,
    gst_rate: toNumber(gstRate),
    pi_date: data.pi_date ? String(data.pi_date).slice(0, 10) : proformaModuleSchema.initialValues.pi_date,
    valid_until: data.valid_until ? String(data.valid_until).slice(0, 10) : getDefaultValidUntilDate(data.pi_date || proformaModuleSchema.initialValues.pi_date),
    exchange_rate: toNumber(data.exchange_rate, 1) || 1,
  };
};

export const normalizePiItems = (items = [], gstRate = 18) => {
  const rows = Array.isArray(items) && items.length ? items : [createBlankPiItem(gstRate)];
  return rows.map((item, index) => calculatePiItem({
    id: item.pi_item_id || item.id || `pi-row-${index}`,
    pi_item_id: item.pi_item_id || null,
    product_id: item.product_id || null,
    product: item.product_name_snapshot || item.product_name || item.product || "",
    product_code: item.product_code_snapshot || item.product_code || item.productCode || "",
    brand: item.brand || item.brand_snapshot || "",
    model: item.model || "",
    product_marking: item.product_marking || item.product_marking_snapshot || item.marking || "",
    weight: toNumber(item.weight),
    qty: toNumber(item.qty),
    unit_rate: toNumber(item.unit_rate ?? item.unitRate),
    unit_rate_in_inr: toNumber(item.unit_rate_in_inr ?? item.unitRateInInr ?? item.standard_rate),
    gst_rate: item.gst_rate ?? item.gst ?? gstRate,
    line_value: toNumber(item.line_value),
  }, gstRate));
};
