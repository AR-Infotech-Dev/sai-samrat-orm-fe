import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { CalendarDays, CheckCircle2, PackageCheck, ShoppingBag, X } from "lucide-react";
import ActionButton from "@components/ui/ActionButton";
import FlyoutPanel from "@components/ui/FlyoutPanel";
import Spinner from "@components/ui/Spinner";
import { getReadyStockOrderDetails } from "../data/readyStock.service";

const readyGrid = "grid-cols-[20px_minmax(0,3fr)_repeat(8,minmax(0,0.8fr))_minmax(0,1fr)]";

const toNumber = (value, fallback = 0) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const formatNumber = (value) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(toNumber(value));
const getCurrencySymbol = (currency = "INR") => {
  const normalized = String(currency || "INR").toUpperCase();
  const currencyMap = { INR: "₹", USD: "$", EUR: "€", GBP: "£", JPY: "¥", "₹": "₹", "$": "$", "€": "€", "£": "£", "¥": "¥" };
  return currencyMap[normalized] || currencyMap[currency] || currency || "₹";
};

const formatCurrency = (value, currency = "INR") => `${getCurrencySymbol(currency)} ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(toNumber(value))}`;
const dateValue = (value) => (value ? String(value).slice(0, 10) : "");

const getStatusClass = (status) => {
  switch (status) {
    case "ready": return "border-emerald-200 bg-emerald-50 text-emerald-600";
    case "partially_ready": return "border-teal-200 bg-teal-50 text-teal-600";
    case "not_ready": return "border-slate-200 bg-slate-50 text-slate-500";
    case "hold": return "border-red-200 bg-red-50 text-red-600";
    default: return "border-slate-200 bg-slate-50 text-slate-500";
  }
};

const normalizeItem = (item = {}) => ({
  production_note_item_id: item.production_note_item_id,
  product_name: item.product_name || item.product_name_snapshot || "-",
  product_code: item.product_code || item.product_code_snapshot || "-",
  series: item.series || item.brand_snapshot || item.brand || "-",
  weight: item.weight ?? "-",
  production_note_qty: toNumber(item.production_note_qty),
  planning_ready_qty: toNumber(item.planning_ready_qty),
  produced_qty: toNumber(item.produced_qty),
  procured_qty: toNumber(item.procured_qty),
  total_ready_qty: toNumber(item.total_ready_qty),
  dispatched_qty: toNumber(item.dispatched_qty),
  available_dispatch_qty: toNumber(item.available_dispatch_qty),
  pending_qty: toNumber(item.pending_qty),
  ready_stock_status: item.ready_stock_status || "not_ready",
  ready_date: dateValue(item.ready_date),
  priority: item.priority || "normal",
});

const SummaryMetric = ({ index, icon: Icon, label, value, tone = "slate" }) => {
  const toneClass = {
    orange: "bg-orange-50 text-orange-600",
    green: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    slate: "bg-slate-50 text-slate-500",
  }[tone];

  return (
    <div className={`flex min-w-0 items-center gap-2 ${index != 1 ? 'border-l border-slate-200' : ''} bg-white px-3 py-2`}>
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${toneClass}`}><Icon size={15} /></span>
      <span className="min-w-0">
        <span className="block text-[11px] font-medium text-slate-400">{label}</span>
        <span className="block truncate text-sm font-bold text-slate-800">{value}</span>
      </span>
    </div>
  );
};

const ReadySummaryStrip = ({ totals, productionCode }) => {
  const metrics = [
    { label: "Order Qty", value: formatNumber(totals.orderQty), tone: "text-slate-800" },
    { label: "Stock Qty", value: formatNumber(totals.planningReadyQty), tone: "text-emerald-600" },
    { label: "Produced", value: formatNumber(totals.producedQty), tone: "text-blue-600" },
    { label: "Procured", value: formatNumber(totals.procuredQty), tone: "text-amber-600" },
    { label: "Total Ready", value: formatNumber(totals.totalReadyQty), tone: "text-emerald-600" },
    { label: "Dispatched", value: formatNumber(totals.dispatchedQty), tone: "text-slate-600" },
    { label: "Available", value: formatNumber(totals.availableQty), tone: "text-orange-600" },
    { label: "Pending", value: formatNumber(totals.pendingQty), tone: "text-red-500" },
  ];

  return (
    <>
    <div className={`grid ${readyGrid} items-stretch gap-1.5  bg-white px-2`}>
      <div className="col-span-2 self-center py-2 text-[10px] text-slate-500">Total Items <span className="ml-1 font-semibold text-slate-800">{totals.totalItems}</span></div>
      {metrics.map((metric) => (
        <div key={metric.label} title={`${metric.label}: ${metric.value}`} aria-label={`${metric.label}: ${metric.value}`} className="min-w-0 border-l border-slate-100 px-1 py-3 text-center">
          <div className={`truncate text-sm font-semibold tabular-nums ${metric.tone}`}>{metric.value}</div>
        </div>
      ))}
      <span />
    </div>
    <section className=" bg-slate-50/60 px-3 py-2.5 text-xs leading-relaxed text-slate-600">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-800">Ready stock summary for {productionCode || "-"}</h3>
        <span className="rounded-sm bg-orange-50 px-2 py-1 font-medium text-orange-600">{formatNumber(totals.availableQty)} available for dispatch</span>
      </div>
      <ul className="grid list-disc grid-cols-1 gap-x-6 gap-y-1 pl-4 md:grid-cols-2">
        <li>Total quantity: <span className="font-semibold text-slate-800">{formatNumber(totals.orderQty)} batteries</span> across {totals.totalItems} item lines.</li>
        <li>Allocated stock: {formatNumber(totals.planningReadyQty)} batteries; produced: {formatNumber(totals.producedQty)}; procured: {formatNumber(totals.procuredQty)}.</li>
        <li>Total ready: <span className="font-semibold text-emerald-600">{formatNumber(totals.totalReadyQty)} batteries</span>, including allocated stock, production and procurement.</li>
        <li>Already dispatched: <span className="font-semibold text-slate-800">{formatNumber(totals.dispatchedQty)} batteries</span>.</li>
        <li>Available for dispatch: <span className="font-semibold text-orange-600">{formatNumber(totals.availableQty)} batteries</span> (total ready minus dispatched).</li>
        <li>{totals.pendingQty > 0 ? <><span className="font-semibold text-red-500">{formatNumber(totals.pendingQty)} batteries</span> are not yet ready.</> : "All quantities are ready."}</li>
      </ul>
    </section>
    </>
  );
};

function ReadyStockForm({ isOpen, onClose, selectedOrder, onCreateDispatch }) {
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [fetching, setFetching] = useState(false);

  const currency = order?.currency || selectedOrder?.currency || "INR";

  const totals = useMemo(() => items.reduce((acc, item) => {
    acc.totalItems += 1;
    acc.orderQty += toNumber(item.production_note_qty);
    acc.planningReadyQty += toNumber(item.planning_ready_qty);
    acc.producedQty += toNumber(item.produced_qty);
    acc.procuredQty += toNumber(item.procured_qty);
    acc.totalReadyQty += toNumber(item.total_ready_qty);
    acc.dispatchedQty += toNumber(item.dispatched_qty);
    acc.availableQty += toNumber(item.available_dispatch_qty);
    acc.pendingQty += toNumber(item.pending_qty);
    return acc;
  }, { totalItems: 0, orderQty: 0, planningReadyQty: 0, producedQty: 0, procuredQty: 0, totalReadyQty: 0, dispatchedQty: 0, availableQty: 0, pendingQty: 0 }), [items]);

  const fetchOrder = async () => {
    if (!selectedOrder?.production_note_id) return;
    try {
      setFetching(true);
      const res = await getReadyStockOrderDetails(selectedOrder.production_note_id);
      if (!res.success) {
        toast.error(res.message || "Unable to fetch ready stock details");
        return;
      }
      const data = res.data?.data || res.data || {};
      setOrder(data);
      setItems((data.items || []).map(normalizeItem));
    } catch (error) {
      toast.error(error.message || "Unable to fetch ready stock details");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchOrder();
    if (!isOpen) {
      setOrder(null);
      setItems([]);
    }
  }, [isOpen, selectedOrder?.production_note_id]);

  if (!isOpen) return null;

  return (
    <FlyoutPanel
      isOpen={isOpen}
      onClose={onClose}
      title="Ready Stock"
      subtitle={order?.pi_number ? `${order.pi_number} • ${order.customer_name || "Customer"}` : "Dispatch-ready stock view"}
      panelClassName="!w-[1000px] max-w-full"
      closeButton={<button className="flyout-close" onClick={onClose} aria-label="Close panel"><X size={18} /></button>}
      footer={(
        <div className="flex w-full items-center justify-between gap-2  bg-white px-4 py-2">
          <span className="text-xs text-slate-400">Available Qty = Total Ready - Dispatched</span>
          <div className="flex items-center gap-2">
            <ActionButton type="button" variant="flyoutSecondary" onClick={onClose}>Close</ActionButton>
            <ActionButton type="button" variant="flyoutPrimary" disabled={totals.availableQty <= 0} onClick={() => onCreateDispatch?.(order || selectedOrder)}>Create Dispatch</ActionButton>
          </div>
        </div>
      )}
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50/60 px-3 py-2">
        {fetching ? (
          <div className="grid h-full place-items-center"><Spinner /></div>
        ) : (
          <>
            <section className="mb-2 shrink-0 rounded-sm bg-white p-1.5">
              <div className="grid gap-3 lg:grid-cols-4">
                <SummaryMetric index={1} icon={ShoppingBag} label="Production Code" value={order?.production_code || "-"} tone="orange" />
                <SummaryMetric index={2} icon={PackageCheck} label="Customer" value={order?.customer_name || "-"} tone="slate" />
                <SummaryMetric index={3} icon={CalendarDays} label="Expected Date" value={dateValue(order?.expected_delivery_date) || "-"} tone="blue" />
                <SummaryMetric index={4} icon={CheckCircle2} label="Production Note Status" value={order?.production_note_status || "ready"} tone="green" />
              </div>
            </section>

            <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-sm bg-white p-2">
              <div className="mb-2 flex shrink-0 items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Item-wise Ready Stock</h3>
                  <p className="text-xs text-slate-400">Readonly dispatch-ready quantities calculated from planning and production.</p>
                </div>
                <span className="rounded-md bg-orange-50 px-2.5 py-1.5 text-[11px] font-bold text-orange-600">{items.length} Lines</span>
              </div>


              <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:thin]">
                <div className={`sticky top-0 z-10 grid ${readyGrid} items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-2 py-2 text-[9px] font-bold uppercase leading-tight tracking-wide text-slate-500`}>
                  <span>#</span>
                  <span>Product / Model</span>
                  <span className="text-center">Order</span>
                  <span className="text-center">Stock</span>
                  <span className="text-center">Produced</span>
                  <span className="text-center">Procured</span>
                  <span className="text-center">Total Ready</span>
                  <span className="text-center">Dispatched</span>
                  <span className="text-center">Available</span>
                  <span className="text-center">Pending</span>
                  <span>Status</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <div key={item.production_note_item_id ?? index} className={`grid ${readyGrid} items-center gap-1.5 px-2 py-1.5 text-[11px] text-slate-700 transition hover:bg-slate-50/70`}>
                      <span className="font-semibold text-slate-500">{index + 1}</span>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-slate-800">{item.product_name}</div>
                        <div className="truncate text-[9px] text-slate-400">{item.product_code} • {item.weight || 0}Kg</div>
                      </div>
                      <span className="rounded-md bg-blue-50 px-1 py-1.5 text-center font-semibold text-blue-600">{formatNumber(item.production_note_qty)}</span>
                      <span className="rounded-md bg-emerald-50 px-1 py-1.5 text-center font-semibold text-emerald-600">{formatNumber(item.planning_ready_qty)}</span>
                      <span className="rounded-md bg-blue-50 px-1 py-1.5 text-center font-semibold text-blue-600">{formatNumber(item.produced_qty)}</span>
                      <span className="rounded-md bg-amber-50 px-1 py-1.5 text-center font-semibold text-amber-600">{formatNumber(item.procured_qty)}</span>
                      <span className="rounded-md bg-emerald-50 px-1 py-1.5 text-center font-bold text-emerald-700">{formatNumber(item.total_ready_qty)}</span>
                      <span className="rounded-md bg-slate-50 px-1 py-1.5 text-center font-semibold text-slate-500">{formatNumber(item.dispatched_qty)}</span>
                      <span className="rounded-sm bg-orange-50 px-1 py-1.5 text-center font-semibold text-orange-600">{formatNumber(item.available_dispatch_qty)}</span>
                      <span className="rounded-md bg-red-50 px-1 py-1.5 text-center font-bold text-red-500">{formatNumber(item.pending_qty)}</span>
                      <span className={`rounded-md border px-1.5 py-1 text-center text-[10px] font-semibold ${getStatusClass(item.ready_stock_status)}`}>{String(item.ready_stock_status || "not_ready").replaceAll("_", " ")}</span>
                    </div>
                  ))}
                </div>
                <ReadySummaryStrip totals={totals} productionCode={order?.production_code} />
              </div>
            </section>
          </>
        )}
      </div>
    </FlyoutPanel>
  );
}

export default ReadyStockForm;
