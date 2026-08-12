import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { CalendarDays, CheckCircle2, Clock3, Factory, PackageCheck, Save, ShoppingBag, X } from "lucide-react";
import ActionButton from "@components/ui/ActionButton";
import FlyoutPanel from "@components/ui/FlyoutPanel";
import Spinner from "@components/ui/Spinner";
import { getPlanningOrderDetails, saveOrderPlanning } from "../data/planning.service";
import { MessageSquareText } from "lucide-react";

// const planningGrid = "grid-cols-[24px_minmax(120px,1fr)_42px_56px_56px_56px_58px_94px_64px_28px_84px]";
const planningGrid = "grid-cols-[24px_minmax(120px,1fr)_60px_60px_60px_60px_60px_100px_64px_84px]";
const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];
const getPriorityClass = (priority) => {
  switch (priority) {
    case "high": return "border-red-200 bg-red-50 text-red-600";
    case "medium": return "border-amber-200 bg-amber-50 text-amber-600";
    case "low": return "border-emerald-200 bg-emerald-50 text-emerald-600";
    default: return "border-slate-200 bg-slate-50 text-slate-500";
  }
};
const getStatusClass = (status) => {
  switch (status) {
    case "planned": return "border-blue-200 bg-blue-50 text-blue-600";
    case "in_progress": return "border-amber-200 bg-amber-50 text-amber-600";
    case "ready": return "border-emerald-200 bg-emerald-50 text-emerald-600";
    case "partially_ready": return "border-teal-200 bg-teal-50 text-teal-600";
    case "hold": return "border-red-200 bg-red-50 text-red-600";
    case "not_planned": return "border-slate-200 bg-slate-50 text-slate-500";
    case "action_required": return "border-red-200 bg-red-50 text-red-600";
    default: return "border-slate-200 bg-slate-50 text-slate-500";
  }
};
const toNumber = (value, fallback = 0) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const calculatePlanningStatus = (item = {}) => {
  const orderQty = toNumber(item.order_qty);
  const saiplQty = toNumber(item.saipl_qty);
  const pmkQty = toNumber(item.pmk_qty);
  const readyQty = toNumber(item.ready_qty);
  const plannedQty = saiplQty + pmkQty + readyQty;

  if (item.planning_status === "hold") return "hold";
  if (orderQty > 0 && readyQty >= orderQty) return "ready";
  if (readyQty > 0) return "partially_ready";
  if (orderQty > 0 && plannedQty >= orderQty) return "planned";
  if (saiplQty > 0 || pmkQty > 0) return "in_progress";
  return "not_planned";
};

const calculatePlanningPendingQty = (item = {}) => {
  const orderQty = toNumber(item.order_qty);
  const plannedQty = toNumber(item.saipl_qty) + toNumber(item.pmk_qty) + toNumber(item.ready_qty);
  return Math.max(orderQty - plannedQty, 0);
};
const formatCurrency = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(toNumber(value));
const formatNumber = (value) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(toNumber(value));
const dateValue = (value) => (value ? String(value).slice(0, 10) : "");
const normalizeItem = (item = {}) => {
  const orderQty = toNumber(item.order_qty);
  const readyQty = toNumber(item.ready_qty);
  const dispatchedQty = toNumber(item.dispatched_qty);

  return {
    order_item_id: item.order_item_id,
    product_name: item.product_name || item.product_name_snapshot || "-",
    product_code: item.product_code || item.product_code_snapshot || "-",
    series: item.series || item.brand_snapshot || item.brand || "-",
    weight: item.weight ?? "-",
    order_qty: orderQty,
    unit_rate: toNumber(item.unit_rate),
    line_value: toNumber(item.line_value),
    gst_rate: toNumber(item.gst_rate, 18),
    saipl_qty: toNumber(item.saipl_qty),
    pmk_qty: toNumber(item.pmk_qty),
    ready_qty: readyQty,
    dispatched_qty: dispatchedQty,
    pending_qty: calculatePlanningPendingQty(item),
    expected_ready_date: dateValue(item.expected_ready_date),
    planning_status: calculatePlanningStatus({ ...item, order_qty: orderQty, ready_qty: readyQty, dispatched_qty: dispatchedQty }),
    priority: item.priority || "normal",
    planning_note: item.planning_note || "",
  };
};
const statusOptions = [
  { label: "Not Planned", value: "not_planned" },
  { label: "Planned", value: "planned" },
  { label: "In Progress", value: "in_progress" },
  { label: "Partially Ready", value: "partially_ready" },
  { label: "Ready", value: "ready" },
  { label: "Hold", value: "hold" },
];

const SummaryMetric = ({ index ,icon: Icon, label, value, tone = "slate" }) => {
  const toneClass = {
    orange: "bg-orange-50 text-orange-600",
    green: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
    slate: "bg-slate-50 text-slate-500",
  }[tone];

  return (
    <div className={`flex items-center gap-2 ${index != 1 ? 'border-l': '' } border-slate-200 bg-white px-3 py-2`}>
      <span className={`grid h-8 w-8 place-items-center rounded-full ${toneClass}`}><Icon size={15} /></span>
      <span className="min-w-0">
        <span className="block text-[11px] font-medium text-slate-400">{label}</span>
        <span className="block text-sm font-bold text-slate-800">{value}</span>
      </span>
    </div>
  );
};

const PlanningSummaryStrip = ({ totals }) => {
  const metrics = [
    { label: "Total Items", value: totals.totalItems, tone: "text-slate-800" },
    { label: "Order Qty", value: formatNumber(totals.orderQty), tone: "text-slate-800" },
    { label: "SAIPL Qty", value: formatNumber(totals.saiplQty), tone: "text-emerald-600" },
    { label: "PMK Qty", value: formatNumber(totals.pmkQty), tone: "text-blue-600" },
    { label: "Available Qty", value: formatNumber(totals.readyQty), tone: "text-amber-600" },
    { label: "Pending Qty", value: formatNumber(totals.pendingQty), tone: "text-red-500" },
  ];

  return (
    <div className="mt-1 grid shrink-0 grid-cols-2 overflow-hidden rounded-sm border border-slate-100 bg-white sm:grid-cols-4 lg:grid-cols-6 shadow-sm">
      {metrics.map((metric, index) => (
        <div key={metric.label} className={`px-3 py-2.5 text-center ${index ? "border-l border-slate-200" : ""}`}>
          <div className="text-[11px] font-medium text-slate-400">{metric.label}</div>
          <div className={`mt-0.5 text-sm font-bold ${metric.tone}`}>{metric.value}</div>
        </div>
      ))}
    </div>
  );
};


function PlanningForm({ isOpen, onClose, selectedOrder, onAfterSave }) {
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rowErrors, setRowErrors] = useState({});

  const totals = useMemo(() => items.reduce((acc, item) => {
    const readyQty = toNumber(item.ready_qty);
    const dispatchedQty = toNumber(item.dispatched_qty);
    acc.totalItems += 1;
    acc.orderQty += toNumber(item.order_qty);
    acc.saiplQty += toNumber(item.saipl_qty);
    acc.pmkQty += toNumber(item.pmk_qty);
    acc.readyQty += readyQty;
    acc.pendingQty += calculatePlanningPendingQty(item);
    acc.value += toNumber(item.line_value);
    return acc;
  }, { totalItems: 0, orderQty: 0, saiplQty: 0, pmkQty: 0, readyQty: 0, pendingQty: 0, value: 0 }), [items]);

  const fetchOrder = async () => {
    if (!selectedOrder?.order_id) return;
    try {
      setFetching(true);
      const res = await getPlanningOrderDetails(selectedOrder.order_id);
      if (!res.success) {
        toast.error(res.message || "Unable to fetch order planning details");
        return;
      }
      const data = res.data?.data || res.data || {};
      setOrder(data);
      setItems((data.items || []).map(normalizeItem));
      setRowErrors({});
    } catch (error) {
      toast.error(error.message || "Unable to fetch order planning details");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchOrder();
    if (!isOpen) {
      setOrder(null);
      setItems([]);
      setRowErrors({});
    }
  }, [isOpen, selectedOrder?.order_id]);

  const updateItem = (index, field, value) => {
    setRowErrors((current) => {
      if (!current[index]) return current;
      const nextErrors = { ...current };
      delete nextErrors[index];
      return nextErrors;
    });
    setItems((current) => current.map((item, itemIndex) => {
      if (itemIndex !== index) return item;
      const numericFields = ["saipl_qty", "pmk_qty", "ready_qty", "dispatched_qty"];
      const next = { ...item, [field]: numericFields.includes(field) ? (value === "" ? "" : toNumber(value)) : value };

      if (field === "planning_status" && value !== "hold") {
        next.planning_status = calculatePlanningStatus({ ...next, planning_status: "" });
      }

      if (numericFields.includes(field)) {
        next.planning_status = calculatePlanningStatus(next);
      }

      next.pending_qty = calculatePlanningPendingQty(next);
      return next;
    }));
  };

  const addRowError = (errors, index, fields, message) => {
    errors[index] = {
      ...(errors[index] || {}),
      message: errors[index]?.message || message,
    };
    fields.forEach((field) => {
      errors[index][field] = message;
    });
  };

  const validateItems = () => {
    const errors = {};

    items.forEach((item, index) => {
      const orderQty = toNumber(item.order_qty);
      const saiplQty = toNumber(item.saipl_qty);
      const pmkQty = toNumber(item.pmk_qty);
      const readyQty = toNumber(item.ready_qty);
      const plannedQty = saiplQty + pmkQty + readyQty;
      const status = calculatePlanningStatus(item);

      if (orderQty <= 0) addRowError(errors, index, ["order_qty"], "Order qty cannot be zero.");
      if (saiplQty < 0 || pmkQty < 0 || readyQty < 0) addRowError(errors, index, ["saipl_qty", "pmk_qty", "ready_qty"], "Qty cannot be negative.");
      if (plannedQty > orderQty) addRowError(errors, index, ["saipl_qty", "pmk_qty", "ready_qty"], "SAIPL + PMK + Available Stock cannot be greater than order qty.");
      if (readyQty > orderQty) addRowError(errors, index, ["ready_qty"], "Available Stock qty cannot be greater than order qty.");
      if (status === "ready" && readyQty < orderQty) addRowError(errors, index, ["planning_status", "ready_qty"], "Ready status requires Available Stock = Order Qty.");
      if (status === "planned" && plannedQty < orderQty) addRowError(errors, index, ["planning_status"], "Planned status requires full quantity split.");
      if (status === "not_planned" && plannedQty > 0) addRowError(errors, index, ["planning_status"], "Status cannot remain Not Planned when quantity is entered.");
      if ((status === "planned" || status === "in_progress") && !item.expected_ready_date) addRowError(errors, index, ["expected_ready_date"], "Ready Date is required when planning is in progress or complete.");
    });

    return errors;
  };

  const hasRowError = (index, field) => Boolean(rowErrors[index]?.[field]);
  const errorInputClass = (index, field) => hasRowError(index, field) ? " !border-red-400 !bg-red-50 focus:!border-red-500 focus:!ring-red-100" : "";

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
      const planningItems = items.map((item) => ({
        ...item,
        pending_qty: calculatePlanningPendingQty(item),
        planning_status: calculatePlanningStatus(item),
      }));
      const res = await saveOrderPlanning({ orderId: selectedOrder.order_id, items: planningItems });
      if (!res.success) {
        toast.error(res.message || "Unable to save planning");
        return;
      }
      toast.success(res.message || "Planning saved successfully");
      onAfterSave?.();
      onClose?.();
    } catch (error) {
      toast.error(error.message || "Unable to save planning");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <FlyoutPanel
      isOpen={isOpen}
      onClose={onClose}
      title="Order Planning"
      subtitle={order?.order_no ? `${order.order_no} • ${order.customer_name || "Customer"}` : "Plan order item rows"}
      panelClassName="!w-[1000px] max-w-full"
      closeButton={
        <button className="flyout-close" onClick={onClose} aria-label="Close panel">
          <X size={18} />
        </button>
      }
      footer={
        <div className="flex w-full items-center justify-between gap-2 bg-white px-4 py-2">
          <span className="text-xs text-slate-400"></span>
          <div className="flex items-center gap-2">
            <ActionButton type="button" variant="flyoutSecondary" disabled={saving} onClick={onClose}>Cancel</ActionButton>
            <ActionButton type="button" variant="flyoutPrimary" disabled={saving || fetching} onClick={handleSave}>
              {saving ? <Spinner size="sm" /> : <><Save size={14} /> Save Planning</>}
            </ActionButton>
          </div>
        </div>
      }
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50/70 px-3 py-1.5">
        {fetching ? (
          <div className="grid h-full place-items-center"><Spinner /></div>
        ) : (
          <>
            <section className="mb-1.5 shrink-0 rounded-sm border border-slate-100 bg-white p-3 shadow-sm">
              <div className="grid gap-3 lg:grid-cols-4">
                <SummaryMetric index={1} icon={ShoppingBag} label="Order No" value={order?.order_no || "-"} tone="orange" />
                <SummaryMetric index={2} icon={PackageCheck} label="Customer" value={order?.customer_name || "-"} tone="slate" />
                <SummaryMetric index={3} icon={CalendarDays} label="Expected Date" value={dateValue(order?.expected_delivery_date) || "-"} tone="blue" />
                <SummaryMetric index={4} icon={Clock3} label="Priority" value={order?.priority || "normal"} tone="red" />
              </div>
            </section>


            <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)]">
              <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-sm border border-slate-100 bg-white shadow-sm">
                <div className="flex shrink-0 items-center justify-between px-3 py-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Item-wise Planning</h3>
                    <p className="text-[11px] text-slate-400"></p>
                  </div>
                  <span className="rounded-md bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-600">{items.length} Lines</span>
                </div>

                <div className="px-2 min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:thin]">
                  {/* Header */}
                  <div className={`grid ${planningGrid} items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-2 py-2 text-[8px] font-bold uppercase leading-tight tracking-wide text-slate-500`} >
                    <span>#</span>
                    <span>Product / Model</span>
                    <span className="text-center"> Order <small className="block text-[7px] font-medium normal-case">Qty</small> </span>
                    <span className="text-center"> SAIPL <small className="block text-[7px] font-medium normal-case">MFG</small> </span>
                    <span className="text-center"> PMK <small className="block text-[7px] font-medium normal-case"> Procure </small> </span>
                    <span className="text-center"> Available Stock <small className="block text-[7px] font-medium normal-case">Qty</small> </span>
                    <span className="text-center"> Pending <small className="block text-[7px] font-medium normal-case">Qty</small> </span>
                    <span>Ready Date</span>
                    <span>Priority</span>
                    <span>Status</span>
                  </div>

                  {/* Rows */}
                  <div className="divide-y divide-slate-100">
                    {items.map((item, index) => (
                      <div key={item.order_item_id ?? index} className={`grid ${planningGrid} items-center gap-1.5 px-2 py-1.5 text-[10px] text-slate-700 transition hover:bg-slate-50/70`} >
                        {/* Serial number */}
                        <span className="font-semibold text-slate-500"> {index + 1} </span>
                        {/* Product */}
                        <div className="min-w-0"> <div className="truncate font-semibold text-slate-800"> {item.product_name || "-"} </div> <div className="truncate text-[8px] text-slate-400"> {item.product_code || "-"} • {item.weight || 0}Kg </div> {rowErrors[index]?.message ? <div className="mt-0.5 truncate text-[9px] font-semibold text-red-500" title={rowErrors[index].message}>{rowErrors[index].message}</div> : null} </div>
                        {/* Order quantity */}
                        <span className="rounded bg-blue-50 px-1 py-1 text-center font-semibold text-blue-600"> {formatNumber(item.order_qty)} </span>
                        {/* SAIPL quantity */}
                        <input type="number" min="0" value={item.saipl_qty ?? ""} onChange={(event) => updateItem(index, "saipl_qty", event.target.value)} className={`h-6 min-w-0 w-full rounded-md border border-emerald-200 bg-emerald-50/50 px-1 text-center text-[10px] outline-none focus:border-emerald-400 focus:bg-white focus:ring-1 focus:ring-emerald-100${errorInputClass(index, "saipl_qty")}`} />
                        {/* PMK quantity */}
                        <input type="number" min="0" value={item.pmk_qty ?? ""} onChange={(event) => updateItem(index, "pmk_qty", event.target.value)} className={`h-6 min-w-0 w-full rounded-md border border-amber-200 bg-amber-50/50 px-1 text-center text-[10px] outline-none focus:border-amber-400 focus:bg-white focus:ring-1 focus:ring-amber-100${errorInputClass(index, "pmk_qty")}`} />
                        {/* Ready quantity */}
                        <input type="number" min="0" value={item.ready_qty ?? ""} onChange={(event) => updateItem(index, "ready_qty", event.target.value)} className={`h-6 min-w-0 w-full rounded-md border border-slate-200 bg-slate-50 px-1 text-center text-[10px] outline-none focus:border-orange-300 focus:bg-white focus:ring-1 focus:ring-orange-100${errorInputClass(index, "ready_qty")}`} />
                        {/* Pending quantity */}
                        <div className="text-center"> {toNumber(item.pending_qty) > 0 ? (<span className="inline-block min-w-8 rounded bg-red-50 px-1 py-1 font-bold text-red-500"> {formatNumber(item.pending_qty)} </span>) : (<span className="font-semibold text-slate-400">-</span>)} </div>
                        {/* Ready date */}
                        <input type="date" value={item.expected_ready_date ?? ""} onChange={(event) => updateItem(index, "expected_ready_date", event.target.value)} className={`h-6 min-w-0 w-full rounded-md border border-slate-200 bg-white px-1 text-[8px] outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-100${errorInputClass(index, "expected_ready_date")}`} />
                        {/* Priority */}
                        <select value={item.priority ?? "medium"} onChange={(event) => updateItem(index, "priority", event.target.value)} className={`h-6 min-w-0 w-full rounded-md border px-1 text-[8px] font-semibold outline-none ${getPriorityClass(item.priority)}`} >
                          {priorityOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <select value={item.planning_status ?? ""} onChange={(event) => updateItem(index, "planning_status", event.target.value)} className={`h-6 min-w-0 w-full rounded-md border px-1 text-[8px] font-semibold outline-none ${getStatusClass(item.planning_status)}${errorInputClass(index, "planning_status")}`} >
                          <option value="">Select Status</option>
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}> {option.label} </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
            <div className="grid min-h-0 gap-3 lg:grid-cols-[minmax(0,1fr)]">
              <PlanningSummaryStrip totals={totals} />
            </div>
          </>
        )}
      </div>
    </FlyoutPanel>
  );
}

export default PlanningForm;

