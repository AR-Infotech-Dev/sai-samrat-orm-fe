import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { CalendarDays, PackageCheck, Save, ShoppingBag, Truck, X } from "lucide-react";
import ActionButton from "@components/ui/ActionButton";
import FlyoutPanel from "@components/ui/FlyoutPanel";
import Spinner from "@components/ui/Spinner";
import { getDispatchDetails, getReadyOrderForDispatch, saveDispatch } from "../data/dispatch.service";

const dispatchGrid = "grid-cols-[26px_minmax(150px,1.2fr)_70px_76px_76px_86px_86px_92px]";
const toNumber = (value, fallback = 0) => { const numericValue = Number(value); return Number.isFinite(numericValue) ? numericValue : fallback; };
const formatNumber = (value) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(toNumber(value));
const dateValue = (value) => (value ? String(value).slice(0, 10) : "");
const todayValue = () => new Date().toISOString().slice(0, 10);

const normalizeCreateItem = (item = {}) => ({
  order_item_id: item.order_item_id,
  product_id: item.product_id,
  product_name: item.product_name || "-",
  product_code: item.product_code || "-",
  weight: item.weight ?? "-",
  order_qty: toNumber(item.order_qty),
  ready_qty: toNumber(item.total_ready_qty),
  already_dispatched_qty: toNumber(item.dispatched_qty),
  available_qty: toNumber(item.available_dispatch_qty),
  dispatch_qty: 0,
  pending_after_dispatch_qty: toNumber(item.available_dispatch_qty),
});

const normalizeViewItem = (item = {}) => ({
  order_item_id: item.order_item_id,
  product_id: item.product_id,
  product_name: item.product_name || "-",
  product_code: item.product_code || "-",
  weight: item.weight ?? "-",
  order_qty: toNumber(item.order_qty),
  ready_qty: toNumber(item.ready_qty),
  already_dispatched_qty: toNumber(item.already_dispatched_qty),
  available_qty: toNumber(item.available_qty),
  dispatch_qty: toNumber(item.dispatch_qty),
  pending_after_dispatch_qty: toNumber(item.pending_after_dispatch_qty),
});

const SummaryMetric = ({ icon: Icon, label, value, tone = "slate" }) => {
  const toneClass = { orange: "bg-orange-50 text-orange-600", green: "bg-emerald-50 text-emerald-600", blue: "bg-blue-50 text-blue-600", slate: "bg-slate-50 text-slate-500" }[tone];
  return <div className="flex min-w-0 items-center gap-2 rounded-sm border border-slate-100 bg-white px-3 py-2 shadow-xs"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${toneClass}`}><Icon size={15} /></span><span className="min-w-0"><span className="block text-[11px] font-medium text-slate-400">{label}</span><span className="block truncate text-sm font-bold text-slate-800">{value}</span></span></div>;
};

function DispatchForm({ isOpen, onClose, sourceOrder, selectedDispatch, onAfterSave }) {
  const isCreateMode = Boolean(sourceOrder?.order_id) && !selectedDispatch?.dispatch_id;
  const [header, setHeader] = useState({ dispatch_date: todayValue(), dispatch_status: "dispatched" });
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rowErrors, setRowErrors] = useState({});

  const totals = useMemo(() => items.reduce((acc, item) => {
    acc.totalItems += 1;
    acc.orderQty += toNumber(item.order_qty);
    acc.readyQty += toNumber(item.ready_qty);
    acc.alreadyDispatchedQty += toNumber(item.already_dispatched_qty);
    acc.availableQty += toNumber(item.available_qty);
    acc.dispatchQty += toNumber(item.dispatch_qty);
    return acc;
  }, { totalItems: 0, orderQty: 0, readyQty: 0, alreadyDispatchedQty: 0, availableQty: 0, dispatchQty: 0 }), [items]);

  const fetchData = async () => {
    try {
      setFetching(true);
      setRowErrors({});
      if (isCreateMode) {
        const res = await getReadyOrderForDispatch(sourceOrder.order_id);
        if (!res.success) { toast.error(res.message || "Unable to fetch ready stock for dispatch"); return; }
        const data = res.data?.data || res.data || {};
        setOrder(data);
        setHeader({ dispatch_date: todayValue(), dispatch_status: "dispatched", dispatch_no: "Auto Generated", order_id: data.order_id, customer_id: data.customer_id });
        setItems((data.items || []).filter((item) => toNumber(item.available_dispatch_qty) > 0).map(normalizeCreateItem));
      } else if (selectedDispatch?.dispatch_id) {
        const res = await getDispatchDetails(selectedDispatch.dispatch_id);
        if (!res.success) { toast.error(res.message || "Unable to fetch dispatch details"); return; }
        const data = res.data?.data || res.data || {};
        setOrder(data);
        setHeader(data);
        setItems((data.items || []).map(normalizeViewItem));
      }
    } catch (error) {
      toast.error(error.message || "Unable to fetch dispatch details");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchData();
    if (!isOpen) { setHeader({ dispatch_date: todayValue(), dispatch_status: "dispatched" }); setOrder(null); setItems([]); setRowErrors({}); }
  }, [isOpen, sourceOrder?.order_id, selectedDispatch?.dispatch_id]);

  const updateHeader = (field, value) => setHeader((current) => ({ ...current, [field]: value }));
  const updateItem = (index, value) => {
    setRowErrors((current) => { const next = { ...current }; delete next[index]; return next; });
    setItems((current) => current.map((item, itemIndex) => {
      if (itemIndex !== index) return item;
      const dispatchQty = toNumber(value);
      return { ...item, dispatch_qty: dispatchQty, pending_after_dispatch_qty: Math.max(toNumber(item.available_qty) - dispatchQty, 0) };
    }));
  };

  const validate = () => {
    const errors = {};
    items.forEach((item, index) => {
      if (toNumber(item.dispatch_qty) < 0) errors[index] = "Dispatch qty negative असू शकत नाही.";
      else if (toNumber(item.dispatch_qty) > toNumber(item.available_qty)) errors[index] = "Dispatch qty available qty पेक्षा जास्त आहे.";
    });
    return errors;
  };

  const handleSave = async () => {
    const errors = validate();
    setRowErrors(errors);
    const firstError = Object.values(errors)[0];
    if (firstError) { toast.error(firstError); return; }
    if (totals.dispatchQty <= 0) { toast.error("At least one dispatch qty should be greater than 0"); return; }

    try {
      setSaving(true);
      const payload = { ...header, order_id: order?.order_id || sourceOrder?.order_id, customer_id: order?.customer_id, items };
      const res = await saveDispatch({ payload });
      if (!res.success) { toast.error(res.message || "Unable to save dispatch"); return; }
      toast.success(res.message || "Dispatch saved successfully");
      onAfterSave?.();
      onClose?.();
    } catch (error) {
      toast.error(error.message || "Unable to save dispatch");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <FlyoutPanel
      isOpen={isOpen}
      onClose={onClose}
      title={isCreateMode ? "Create Dispatch" : "Dispatch Details"}
      subtitle={order?.order_no ? `${order.order_no} • ${order.customer_name || "Customer"}` : "Dispatch ready stock"}
      panelClassName="!w-[1180px] max-w-full"
      closeButton={<button className="flyout-close" onClick={onClose} aria-label="Close panel"><X size={18} /></button>}
      footer={<div className="flex w-full items-center justify-between gap-2 border-t border-slate-100 bg-white px-4 py-2"><span className="text-xs text-slate-400">Dispatch Qty must be less than or equal to Available Qty</span><div className="flex items-center gap-2"><ActionButton type="button" variant="flyoutSecondary" disabled={saving} onClick={onClose}>{isCreateMode ? "Cancel" : "Close"}</ActionButton>{isCreateMode ? <ActionButton type="button" variant="flyoutPrimary" disabled={saving || fetching} onClick={handleSave}>{saving ? <Spinner size="sm" /> : <><Save size={14} /> Save Dispatch</>}</ActionButton> : null}</div></div>}
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50/60 px-3 py-2">
        {fetching ? <div className="grid h-full place-items-center"><Spinner /></div> : <>
          <section className="mb-2 shrink-0 rounded-sm border border-slate-100 bg-white p-3 shadow-xs">
            <div className="grid gap-3 lg:grid-cols-4">
              <SummaryMetric icon={ShoppingBag} label="Dispatch No" value={header.dispatch_no || "Auto Generated"} tone="orange" />
              <SummaryMetric icon={PackageCheck} label="Customer" value={order?.customer_name || "-"} tone="slate" />
              <SummaryMetric icon={CalendarDays} label="Dispatch Date" value={dateValue(header.dispatch_date) || "-"} tone="blue" />
              <SummaryMetric icon={Truck} label="Dispatch Qty" value={formatNumber(totals.dispatchQty)} tone="green" />
            </div>
          </section>

          <section className="mb-2 shrink-0 rounded-sm border border-slate-100 bg-white p-3 shadow-xs">
            <div className="grid gap-2 lg:grid-cols-6">
              <input disabled={!isCreateMode} type="date" value={dateValue(header.dispatch_date)} onChange={(e) => updateHeader("dispatch_date", e.target.value)} className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs outline-none focus:border-orange-300" />
              <input disabled={!isCreateMode} value={header.transporter_name || ""} onChange={(e) => updateHeader("transporter_name", e.target.value)} placeholder="Transporter" className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs outline-none focus:border-orange-300" />
              <input disabled={!isCreateMode} value={header.vehicle_no || ""} onChange={(e) => updateHeader("vehicle_no", e.target.value)} placeholder="Vehicle No" className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs outline-none focus:border-orange-300" />
              <input disabled={!isCreateMode} value={header.driver_name || ""} onChange={(e) => updateHeader("driver_name", e.target.value)} placeholder="Driver Name" className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs outline-none focus:border-orange-300" />
              <input disabled={!isCreateMode} value={header.driver_mobile || ""} onChange={(e) => updateHeader("driver_mobile", e.target.value)} placeholder="Driver Mobile" className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs outline-none focus:border-orange-300" />
              <input disabled={!isCreateMode} value={header.invoice_no || ""} onChange={(e) => updateHeader("invoice_no", e.target.value)} placeholder="Invoice No" className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs outline-none focus:border-orange-300" />
            </div>
          </section>

          <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-sm border border-slate-100 bg-white p-3 shadow-xs">
            <div className="mb-2 flex shrink-0 items-center justify-between"><div><h3 className="text-sm font-bold text-slate-800">Dispatch Items</h3><p className="text-xs text-slate-400">Ready stock rows selected for dispatch.</p></div><span className="rounded-md bg-orange-50 px-2.5 py-1.5 text-[11px] font-bold text-orange-600">{items.length} Lines</span></div>
            <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden rounded-lg border border-slate-100 [scrollbar-width:thin]">
              <div className={`sticky top-0 z-10 grid ${dispatchGrid} items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-2 py-2 text-[9px] font-bold uppercase leading-tight tracking-wide text-slate-500`}><span>#</span><span>Product / Model</span><span className="text-center">Order</span><span className="text-center">Ready</span><span className="text-center">Dispatched</span><span className="text-center">Available</span><span className="text-center">Dispatch Qty</span><span className="text-center">Pending After</span></div>
              <div className="divide-y divide-slate-100">
                {items.map((item, index) => <div key={item.order_item_id ?? index} className={`grid ${dispatchGrid} items-center gap-1.5 px-2 py-1.5 text-[11px] text-slate-700 transition hover:bg-slate-50/70`}>
                  <span className="font-semibold text-slate-500">{index + 1}</span>
                  <div className="min-w-0"><div className="truncate font-semibold text-slate-800">{item.product_name}</div><div className="truncate text-[9px] text-slate-400">{item.product_code} • {item.weight || 0}Kg</div>{rowErrors[index] ? <div className="mt-0.5 truncate text-[9px] font-semibold text-red-500">{rowErrors[index]}</div> : null}</div>
                  <span className="rounded-md bg-blue-50 px-1 py-1.5 text-center font-semibold text-blue-600">{formatNumber(item.order_qty)}</span>
                  <span className="rounded-md bg-emerald-50 px-1 py-1.5 text-center font-semibold text-emerald-600">{formatNumber(item.ready_qty)}</span>
                  <span className="rounded-md bg-slate-50 px-1 py-1.5 text-center font-semibold text-slate-500">{formatNumber(item.already_dispatched_qty)}</span>
                  <span className="rounded-md bg-orange-50 px-1 py-1.5 text-center font-bold text-orange-600">{formatNumber(item.available_qty)}</span>
                  {isCreateMode ? <input type="number" min="0" value={item.dispatch_qty ?? ""} onChange={(event) => updateItem(index, event.target.value)} className={`h-7 min-w-0 w-full rounded-md border border-orange-200 bg-orange-50/30 px-1 text-center text-[11px] outline-none focus:border-orange-400 focus:bg-white ${rowErrors[index] ? "!border-red-400 !bg-red-50" : ""}`} /> : <span className="rounded-md bg-orange-50 px-1 py-1.5 text-center font-bold text-orange-600">{formatNumber(item.dispatch_qty)}</span>}
                  <span className="rounded-md bg-red-50 px-1 py-1.5 text-center font-bold text-red-500">{formatNumber(item.pending_after_dispatch_qty)}</span>
                </div>)}
              </div>
            </div>
          </section>
        </>}
      </div>
    </FlyoutPanel>
  );
}

export default DispatchForm;