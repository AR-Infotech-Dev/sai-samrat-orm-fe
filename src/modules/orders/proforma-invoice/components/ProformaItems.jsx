import { Plus, Trash2 } from "lucide-react";
import ProductSmartSelect from "@components/form-inputs/ProductSmartSelect";
import { formatCurrency, getCurrencySymbol } from "../utils/proforma.utils";

const inputClass = "h-8 w-full min-w-0 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-medium text-slate-700 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-400/15";
const gridClass = "grid grid-cols-[28px_minmax(130px,1.7fr)_minmax(96px,1.05fr)_58px_64px_82px_58px_96px_34px]";

const HeaderCell = ({ children, className = "" }) => (
  <div className={`text-[8px] font-semibold uppercase tracking-wide text-slate-400 ${className}`}>
    {children}
  </div>
);

function NumberInput({ value, onChange, disabled = false, prefix = "" }) {
  return (
    <div className="relative min-w-0">
      {prefix ? <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">{prefix}</span> : null}
      <input
        type="number"
        min="0"
        disabled={disabled}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} ${prefix ? "pl-5" : ""}`}
      />
    </div>
  );
}

function ProformaItems({ items = [], currency = "INR", onAdd, onDelete, onFieldChange, onProductSelect, error }) {
  const currencySymbol = getCurrencySymbol(currency);
  return (
    <section className="flex h-full min-h-0 flex-col overflow-visible border border-slate-100 bg-white px-2.5 py-2 shadow-sm">
      <div className="mb-1 flex shrink-0 flex-wrap items-center justify-between gap-2 pb-2">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-800">PI Items</h2>
          {error ? <p className="mt-0.5 text-[11px] font-semibold text-red-500">{error}</p> : null}
        </div>
        <button type="button" onClick={onAdd} className="inline-flex h-6 items-center justify-center gap-1.5 rounded-md border border-orange-200 bg-orange-50 px-2.5 text-xs font-semibold text-orange-600 transition hover:border-orange-400 hover:bg-orange-100">
          <Plus size={12} strokeWidth={2.5} /> Add Product Line
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:thin]">
        <div className="min-w-0 border border-gray-200">
          <div className={`sticky top-0 z-10 items-center gap-2 border-b border-slate-100 bg-gray-100 px-2.5 py-2 ${gridClass}`}>
            <HeaderCell>#</HeaderCell>
            <HeaderCell>Product / Model *</HeaderCell>
            <HeaderCell>Brand *</HeaderCell>
            <HeaderCell>Weight</HeaderCell>
            <HeaderCell>Qty *</HeaderCell>
            <HeaderCell>Rate ({currencySymbol}) *</HeaderCell>
            <HeaderCell>GST</HeaderCell>
            <HeaderCell>Line Value ({currencySymbol})</HeaderCell>
            <HeaderCell className="text-center">Action</HeaderCell>
          </div>
          <div className="divide-y divide-slate-100">
            {items.map((item, index) => (
              <div key={item.id} className="px-2.5 py-2 transition hover:bg-orange-50/30">
                <div className={`${gridClass} items-center gap-2`}>
                  <span className="text-xs font-semibold text-slate-500">{index + 1}</span>
                  <ProductSmartSelect value={item.product} onSelect={(product) => onProductSelect?.(item.id, product)} />
                  <input value={item.brand || ""} onChange={(event) => onFieldChange(item.id, "brand", event.target.value)} className={inputClass} placeholder="Brand" />
                  <NumberInput value={item.weight} onChange={(value) => onFieldChange(item.id, "weight", value)} />
                  <NumberInput value={item.qty} onChange={(value) => onFieldChange(item.id, "qty", value)} />
                  <NumberInput value={item.unit_rate} onChange={(value) => onFieldChange(item.id, "unit_rate", value)} prefix={currencySymbol} />
                  <NumberInput value={item.gst_rate} onChange={(value) => onFieldChange(item.id, "gst_rate", value)} disabled />
                  <p className="truncate text-xs font-bold text-slate-700">{formatCurrency(item.line_value, currency)}</p>
                  <button type="button" onClick={() => onDelete(item.id)} title="Remove PI item" className="flex h-7 w-7 items-center justify-center rounded-md border border-red-100 bg-red-50 text-red-500 transition hover:border-red-200 hover:bg-red-100 hover:text-red-600">
                    <Trash2 size={13} strokeWidth={2} />
                  </button>
                </div>
                <div className="mt-2 min-w-0 pl-[36px] pr-[42px]">
                  <textarea
                    value={item.product_marking || ""}
                    onChange={(event) => onFieldChange(item.id, "product_marking", event.target.value)}
                    rows={1}
                    className={`${inputClass} h-8 w-full resize-none py-1.5`}
                    placeholder="Product marking on battery as per customer requirement"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* <div className="mt-2 flex justify-end text-[11px] font-bold text-slate-500">
        Total Qty: <span className="ml-1 text-slate-800">{formatNumber(items.reduce((sum, item) => sum + Number(item.qty || 0), 0))}</span>
      </div> */}
    </section>
  );
}

export default ProformaItems;
