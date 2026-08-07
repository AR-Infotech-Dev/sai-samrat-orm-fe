import { Check, Package } from "lucide-react";

const toNumber = (value) => {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
};

const formatCompactCurrency = (value) => {
  const number = toNumber(value);
  return number.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: number % 1 === 0 ? 0 : 2,
  });
};

export const normalizeOrderProduct = (item = {}) => {
  const productName = item.product_name || item.product || item.name || item.item_name || "Unnamed Product";
  const productId = item.product_id || item.id || item.tally_item_id || productName;
  const model = item.series || item.brand || item.model || item.product_type_name || item.product_type || item.categoryName || "-";
  const weight = toNumber(item.weight ?? item.weight_kg ?? item.standard_weight ?? item.item_weight);
  const rate = toNumber(item.standard_rate ?? item.unitRate ?? item.rate ?? item.sales_rate);
  const gst = toNumber(item.gst_rate ?? item.gst ?? item.tax_rate);

  return {
    ...item,
    product_id: productId,
    product: productName,
    productCode: item.product_code || item.productCode || item.item_code || item.code || "-",
    model,
    weight,
    unitRate: rate,
    gst,
    readyStock: toNumber(item.ready_stock ?? item.readyStock ?? item.stock_qty ?? item.stock ?? item.current_stock ?? item.available_stock),
    pendingStock: toNumber(item.pending_stock ?? item.pendingStock ?? item.pending_qty ?? item.pending),
  };
};

const ProductOption = ({ option = {}, isSelected = false }) => {
  const product = normalizeOrderProduct(option);

  return (
    <div className={`rounded-md border px-0.5 py-1 transition ${isSelected ? "border-orange-300 bg-orange-50" : "border-transparent bg-white hover:border-orange-100 hover:bg-orange-50/70"}`}>
      <div className="flex items-start gap-2">
        {/* <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
          <Package size={10} />
        </div> */}

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[8px] font-bold text-slate-800">{product.product}</p>
            {isSelected && <Check size={10} className="shrink-0 text-orange-500" />}
          </div>
          <p className="mt-0.5 truncate text-[8px] font-semibold text-slate-400">
            {product.productCode} {"\u2022"} {product.model} {"\u2022"} {product.weight || 0}Kg
          </p>
          {/* <div className="mt-1.5 flex flex-wrap gap-1.5 text-[8px] font-bold">
            <span className="rounded bg-emerald-50  px-1 py-1 text-emerald-600">Stock {product.readyStock}</span>
            <span className="rounded bg-red-50      px-1 py-1 text-red-500">Pend {product.pendingStock}</span>
            <span className="rounded bg-orange-50   px-1 py-1 text-orange-600">{"\u20B9"} {formatCompactCurrency(product.unitRate)}</span>
            <span className="rounded bg-slate-50    px-1 py-1 text-slate-500">GST {product.gst}%</span>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export const orderItemProductSmartSelectConfig = {
  type: "product",
  source: "products",
  label: "Product",
  placeholder: "Select Product",
  apiUrl: "",
  check: "product_name",
  list: "product_id,product_code,product_name,brand,weight,standard_rate,gst_rate",
  preload: true,
  cache: true,
  showRecent: true,
  multi: false,
  statusCheck: true,
  allowAddNew: false,
  customParameters: {},
  returnObjectOnSelect: true,
  optionItemSize: 86,
  getValue: (product) => normalizeOrderProduct(product).product_id,
  getLabel: (product) => {
    const normalized = normalizeOrderProduct(product);
    return [
      normalized.product,
      normalized.productCode,
      normalized.model,
      normalized.weight ? `${normalized.weight}Kg` : "",
      normalized.unitRate ? `${normalized.unitRate}` : "",
    ].filter(Boolean).join(" \u2022 ");
  },
  renderSelectedLabel: (product) => normalizeOrderProduct(product).product,
  renderOption: ({ option, isSelected }) => <ProductOption option={option} isSelected={isSelected} />,
};
