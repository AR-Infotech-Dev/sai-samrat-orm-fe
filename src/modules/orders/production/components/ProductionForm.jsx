import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { CalendarDays, CheckCircle2, Factory, PackageCheck, Save, ShoppingBag, X } from "lucide-react";
import ActionButton from "@components/ui/ActionButton";
import FlyoutPanel from "@components/ui/FlyoutPanel";
import Spinner from "@components/ui/Spinner";
import { getProductionOrderDetails, saveOrderProduction, startProductionOrder } from "../data/production.service";

const productionGrid = "grid-cols-[24px_minmax(130px,1fr)_48px_54px_54px_58px_58px_58px_54px_58px_66px_84px]";

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const statusOptions = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "partially_ready", label: "Partially Ready" },
  { value: "ready", label: "Ready" },
  { value: "hold", label: "Hold" },
];

const toNumber = (value, fallback = 0) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const formatNumber = (value) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(toNumber(value));
const formatCurrency = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(toNumber(value));
const dateValue = (value) => (value ? String(value).slice(0, 10) : "");

const calculateReadyQty = (item = {}) => toNumber(item.available_stock_qty) + toNumber(item.qc_passed_qty) + toNumber(item.procured_qty);
const calculatePendingQty = (item = {}) => Math.max(toNumber(item.order_qty) - calculateReadyQty(item), 0);
const calculateProductionStatus = (item = {}) => {
  if (item.production_status === "hold") return "hold";
  const orderQty = toNumber(item.order_qty);
  const readyQty = calculateReadyQty(item);
  if (orderQty > 0 && readyQty >= orderQty) return "ready";
  if (readyQty > 0) return "partially_ready";
  if (toNumber(item.produced_qty) > 0 || toNumber(item.procured_qty) > 0 || toNumber(item.qc_passed_qty) > 0) return "in_progress";
  return "not_started";
};

const getStatusClass = (status) => {
  switch (status) {
    case "ready": return "border-emerald-200 bg-emerald-50 text-emerald-600";
    case "partially_ready": return "border-teal-200 bg-teal-50 text-teal-600";
    case "in_progress": return "border-amber-200 bg-amber-50 text-amber-600";
    case "hold": return "border-red-200 bg-red-50 text-red-600";
    default: return "border-slate-200 bg-slate-50 text-slate-500";
  }
};

const getPriorityClass = (priority) => {
  switch (priority) {
    case "urgent": return "border-red-300 bg-red-50 text-red-600";
    case "high": return "border-orange-200 bg-orange-50 text-orange-600";
    case "normal": return "border-blue-200 bg-blue-50 text-blue-600";
    case "low": return "border-emerald-200 bg-emerald-50 text-emerald-600";
    default: return "border-slate-200 bg-slate-50 text-slate-500";
  }
};

const normalizeItem = (item = {}) => {
  const normalized = {
    order_item_id: item.order_item_id,
    product_name: item.product_name || item.product_name_snapshot || "-",
    product_code: item.product_code || item.product_code_snapshot || "-",
    series: item.series || item.brand_snapshot || item.brand || "-",
    weight: item.weight ?? "-",
    order_qty: toNumber(item.order_qty),
    available_stock_qty: toNumber(item.available_stock_qty),
    saipl_mfg_qty: toNumber(item.saipl_mfg_qty),
    pmk_procure_qty: toNumber(item.pmk_procure_qty),
    produced_qty: toNumber(item.produced_qty),
    procured_qty: toNumber(item.procured_qty),
    qc_passed_qty: toNumber(item.qc_passed_qty),
    rework_qty: toNumber(item.rework_qty),
    ready_qty: toNumber(item.ready_qty),
    pending_qty: toNumber(item.pending_qty),
    expected_ready_date: dateValue(item.expected_ready_date),
    production_status: item.production_status || "not_started",
    priority: item.priority || "normal",
    remarks: item.remarks || "",
  };
  normalized.ready_qty = calculateReadyQty(normalized);
  normalized.pending_qty = calculatePendingQty(normalized);
  normalized.production_status = calculateProductionStatus(normalized);
  return normalized;
};

const SummaryMetric = ({ index, icon: Icon, label, value, tone = "slate" }) => {
  const toneClass = { orange: "bg-orange-50 text-orange-600", green: "bg-emerald-50 text-emerald-600", red: "bg-red-50 text-red-600", blue: "bg-blue-50 text-blue-600", slate: "bg-slate-50 text-slate-500" }[tone];
  return <div className={`flex items-center gap-2 rounded-lg ${ index != 1 ? 'border-l' : ''} border-slate-200 bg-white px-3 py-2`}><span className={`grid h-8 w-8 place-items-center rounded-full ${toneClass}`}><Icon size={15} /></span><span className="min-w-0"><span className="block text-[11px] font-medium text-slate-400">{label}</span><span className="block truncate text-sm font-bold text-slate-800">{value}</span></span></div>;
};


const ProductionSummaryStrip = ({ totals }) => {
  const metrics = [
    { label: "Total Items", value: totals.totalItems, tone: "text-slate-800" },
    { label: "Order Qty", value: formatNumber(totals.orderQty), tone: "text-slate-800" },
    { label: "Stock Qty", value: formatNumber(totals.stockQty), tone: "text-emerald-600" },
    { label: "Produced", value: formatNumber(totals.producedQty), tone: "text-blue-600" },
    { label: "Procured", value: formatNumber(totals.procuredQty), tone: "text-amber-600" },
    { label: "Ready Qty", value: formatNumber(totals.readyQty), tone: "text-emerald-600" },
    { label: "Pending Qty", value: formatNumber(totals.pendingQty), tone: "text-red-500" },
  ];

  return (
    <div className="mt-2 grid shrink-0 grid-cols-2 overflow-hidden rounded-sm border border-slate-100 bg-white sm:grid-cols-4 lg:grid-cols-7 shadow-sm">
      {metrics.map((metric, index) => (
        <div key={metric.label} className={`px-3 py-2.5 text-center ${index ? "border-l border-slate-200" : ""}`}>
          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{metric.label}</div>
          <div className={`mt-0.5 text-base font-black ${metric.tone}`}>{metric.value}</div>
        </div>
      ))}
    </div>
  );
};

function ProductionForm({ isOpen, onClose, selectedOrder, onAfterSave }) {
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);
  const [rowErrors, setRowErrors] = useState({});

  const totals = useMemo(() => items.reduce((acc, item) => {
    acc.totalItems += 1;
    acc.orderQty += toNumber(item.order_qty);
    acc.stockQty += toNumber(item.available_stock_qty);
    acc.saiplQty += toNumber(item.saipl_mfg_qty);
    acc.pmkQty += toNumber(item.pmk_procure_qty);
    acc.producedQty += toNumber(item.produced_qty);
    acc.procuredQty += toNumber(item.procured_qty);
    acc.readyQty += calculateReadyQty(item);
    acc.pendingQty += calculatePendingQty(item);
    return acc;
  }, { totalItems: 0, orderQty: 0, stockQty: 0, saiplQty: 0, pmkQty: 0, producedQty: 0, procuredQty: 0, readyQty: 0, pendingQty: 0 }), [items]);

  const fetchOrder = async () => {
    if (!selectedOrder?.order_id) return;
    try {
      setFetching(true);
      const res = await getProductionOrderDetails(selectedOrder.order_id);
      if (!res.success) { toast.error(res.message || "Unable to fetch production details"); return; }
      const data = res.data?.data || res.data || {};
      setOrder(data);
      setItems((data.items || []).map(normalizeItem));
      setRowErrors({});
    } catch (error) {
      toast.error(error.message || "Unable to fetch production details");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchOrder();
    if (!isOpen) {
      setOrder(null); setItems([]);
      setRowErrors({});
    }
  }, [isOpen, selectedOrder?.order_id]);

  const updateItem = (index, field, value) => {
    setRowErrors((current) => {
      if (!current[index]) return current;
      const next = { ...current };
      delete next[index];
      return next;
    });
    setItems((current) => current.map((item, itemIndex) => {
      if (itemIndex !== index) return item;
      const numericFields = ["produced_qty", "procured_qty", "qc_passed_qty", "rework_qty"];
      const next = { ...item, [field]: numericFields.includes(field) ? (value === "" ? "" : toNumber(value)) : value };
      if (field === "production_status" && value !== "hold") next.production_status = calculateProductionStatus({ ...next, production_status: "" });
      if (numericFields.includes(field)) next.production_status = calculateProductionStatus(next);
      next.ready_qty = calculateReadyQty(next);
      next.pending_qty = calculatePendingQty(next);
      return next;
    }));
  };

  const validateItems = () => {
    for (const item of items) {
      if (toNumber(item.produced_qty) > toNumber(item.saipl_mfg_qty)) return `${item.product_name}: Produced qty cannot be greater than SAIPL MFG qty.`;
      if (toNumber(item.qc_passed_qty) + toNumber(item.rework_qty) > toNumber(item.produced_qty)) return `${item.product_name}: QC Passed + Rework cannot be greater than produced qty.`;
      if (toNumber(item.procured_qty) > toNumber(item.pmk_procure_qty)) return `${item.product_name}: Procured qty cannot be greater than PMK qty.`;
      if (calculateReadyQty(item) > toNumber(item.order_qty)) return `${item.product_name}: Ready qty cannot be greater than order qty.`;
    }
    return "";
  };

  const handleStart = async () => {
    try {
      setStarting(true);
      const res = await startProductionOrder(selectedOrder.order_id);
      if (!res.success) { toast.error(res.message || "Unable to start production"); return; }
      toast.success(res.message || "Production started");
      setOrder((current) => ({ ...current, order_status: "production" }));
      onAfterSave?.();
    } catch (error) {
      toast.error(error.message || "Unable to start production");
    } finally {
      setStarting(false);
    }
  };

  const handleSave = async () => {
    const validationErrors = validateItems();
    setRowErrors(validationErrors);
    const firstError = Object.values(validationErrors)[0]?.message;
    if (firstError) {
      toast.error(firstError);
      return;
    }
    try {
      setSaving(true);
      const productionItems = items.map((item) => ({ ...item, ready_qty: calculateReadyQty(item), pending_qty: calculatePendingQty(item), production_status: calculateProductionStatus(item) }));
      const res = await saveOrderProduction({ orderId: selectedOrder.order_id, items: productionItems });
      if (!res.success) { toast.error(res.message || "Unable to save production"); return; }
      toast.success(res.message || "Production updated successfully");
      onAfterSave?.();
      onClose?.();
    } catch (error) {
      toast.error(error.message || "Unable to save production");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <FlyoutPanel
      isOpen={isOpen}
      onClose={onClose}
      title="Production"
      subtitle={order?.order_no ? `${order.order_no} • ${order.customer_name || "Customer"}` : "Update production item rows"}
      panelClassName="!w-[1000px] max-w-full"
      closeButton={
        <button className="flyout-close" onClick={onClose} aria-label="Close panel">
          <X size={18} />
        </button>
      }
      footer={
        <div className="flex w-full items-center justify-between gap-2 bg-white px-4 py-2">
          <span className="text-xs text-slate-400">Ready Qty = Stock Qty + QC Passed + Procured</span>
          <div className="flex items-center gap-2">
            <ActionButton type="button" variant="flyoutSecondary" disabled={saving || starting} onClick={onClose}>Cancel</ActionButton>
            {order?.order_status === "planned" ?
              <ActionButton type="button" className="flex gap-1.5 items-center " variant="flyoutSecondary" disabled={saving || starting}
                onClick={handleStart}> {starting ? <Spinner size="sm" /> : <><Factory size={14} /> Start Production</>
                }
              </ActionButton> : null}
            <ActionButton type="button" variant="flyoutPrimary" disabled={saving || fetching} onClick={handleSave}>{saving ? <Spinner size="sm" /> : <><Save size={14} /> Save Update</>}</ActionButton></div></div>
      }
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50/70 px-3 py-1.5">
        {fetching ? <div className="grid h-full place-items-center"><Spinner /></div> : <>
          <section className="mb-1.5 shrink-0 rounded-sm border border-slate-100 bg-white p-3 shadow-sm">
            <div className="grid gap-3 lg:grid-cols-4">
              <SummaryMetric index={1} icon={ShoppingBag} label="Order No" value={order?.order_no || "-"} tone="orange" />
              <SummaryMetric index={2} icon={PackageCheck} label="Customer" value={order?.customer_name || "-"} tone="slate" />
              <SummaryMetric index={3} icon={CalendarDays} label="Expected Date" value={dateValue(order?.expected_delivery_date) || "-"} tone="blue" />
              <SummaryMetric index={4} icon={CheckCircle2} label="Order Status" value={order?.order_status || "planned"} tone="green" />
            </div>
          </section>
          <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)]">
            <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-sm border border-slate-100 bg-white shadow-sm">
              <div className="flex shrink-0 items-center justify-between px-3 py-2"><div><h3 className="text-sm font-bold text-slate-800">Item-wise Production</h3><p className="text-[11px] text-slate-400">Planning quantities are readonly. Update actual production/procurement.</p></div><span className="rounded-md bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-600">{items.length} Lines</span></div>
              <div className="px-3 min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-auto [scrollbar-width:thin]">
                <div className={`grid ${productionGrid} items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-2 py-2 text-[8px] font-bold uppercase leading-tight tracking-wide text-slate-500`}>
                  <span>#</span><span>Product / Model</span><span className="text-center">Order</span><span className="text-center">Stock</span><span className="text-center">SAIPL</span><span className="text-center">Produced</span><span className="text-center">QC Pass</span><span className="text-center">Rework</span><span className="text-center">PMK</span><span className="text-center">Procured</span><span className="text-center">Ready / Pending</span><span>Status</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <div key={item.order_item_id ?? index} className={`grid ${productionGrid} items-center gap-1.5 px-2 py-1.5 text-[10px] text-slate-700 transition hover:bg-slate-50/70`}>
                      <span className="font-semibold text-slate-500">{index + 1}</span>
                      <div className="min-w-0"><div className="truncate font-semibold text-slate-800">{item.product_name}</div><div className="truncate text-[8px] text-slate-400">{item.product_code} • {item.weight || 0}Kg</div></div>
                      <span className="rounded bg-blue-50 px-1 py-1 text-center font-semibold text-blue-600">{formatNumber(item.order_qty)}</span>
                      <span className="rounded bg-emerald-50 px-1 py-1 text-center font-semibold text-emerald-600">{formatNumber(item.available_stock_qty)}</span>
                      <span className="rounded bg-orange-50 px-1 py-1 text-center font-semibold text-orange-600">{formatNumber(item.saipl_mfg_qty)}</span>
                      <input type="number" min="0" value={item.produced_qty ?? ""} onChange={(event) => updateItem(index, "produced_qty", event.target.value)} className="h-6 min-w-0 w-full rounded-md border border-orange-200 bg-orange-50/40 px-1 text-center text-[10px] outline-none focus:border-orange-400 focus:bg-white" />
                      <input type="number" min="0" value={item.qc_passed_qty ?? ""} onChange={(event) => updateItem(index, "qc_passed_qty", event.target.value)} className="h-6 min-w-0 w-full rounded-md border border-emerald-200 bg-emerald-50/40 px-1 text-center text-[10px] outline-none focus:border-emerald-400 focus:bg-white" />
                      <input type="number" min="0" value={item.rework_qty ?? ""} onChange={(event) => updateItem(index, "rework_qty", event.target.value)} className="h-6 min-w-0 w-full rounded-md border border-red-200 bg-red-50/40 px-1 text-center text-[10px] outline-none focus:border-red-400 focus:bg-white" />
                      <span className="rounded bg-amber-50 px-1 py-1 text-center font-semibold text-amber-600">{formatNumber(item.pmk_procure_qty)}</span>
                      <input type="number" min="0" value={item.procured_qty ?? ""} onChange={(event) => updateItem(index, "procured_qty", event.target.value)} className="h-6 min-w-0 w-full rounded-md border border-amber-200 bg-amber-50/40 px-1 text-center text-[10px] outline-none focus:border-amber-400 focus:bg-white" />
                      <div className="text-center leading-tight"><div className="font-bold text-emerald-600">{formatNumber(item.ready_qty)}</div><div className="font-bold text-red-500">{formatNumber(item.pending_qty)}</div></div>
                      <select value={item.production_status ?? ""} onChange={(event) => updateItem(index, "production_status", event.target.value)} className={`h-6 min-w-0 w-full rounded-md border px-1 text-[8px] font-semibold outline-none ${getStatusClass(item.production_status)}`}>{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
          <div className="grid min-h-0 gap-3 lg:grid-cols-[minmax(0,1fr)]">
            <ProductionSummaryStrip totals={totals} />
          </div>
        </>}
      </div>
    </FlyoutPanel>
  );
}

export default ProductionForm;
