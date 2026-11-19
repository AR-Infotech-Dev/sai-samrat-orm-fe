import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { compactSwal as Swal } from "@utils/confirmAction";
import { getDispatchDetails, getReadyOrderForDispatch, saveDispatch } from "../data/dispatch.service";
const toNumber = (value, fallback = 0) => { const numericValue = Number(value); return Number.isFinite(numericValue) ? numericValue : fallback; };
const formatNumber = (value) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(toNumber(value));
const dateValue = (value) => (value ? String(value).slice(0, 10) : "");
const todayValue = () => new Date().toISOString().slice(0, 10);

const normalizeCreateItem = (item = {}) => ({
  production_note_item_id: item.production_note_item_id,
  product_id: item.product_id,
  product_name: item.product_name || "-",
  product_code: item.product_code || "-",
  weight: item.weight ?? "-",
  production_note_qty: toNumber(item.production_note_qty),
  ready_qty: toNumber(item.total_ready_qty),
  already_dispatched_qty: toNumber(item.dispatched_qty),
  available_qty: toNumber(item.available_dispatch_qty),
  dispatch_qty: 0,
  pending_after_dispatch_qty: toNumber(item.available_dispatch_qty),
});

const normalizeViewItem = (item = {}) => ({
  production_note_item_id: item.production_note_item_id,
  product_id: item.product_id,
  product_name: item.product_name || "-",
  product_code: item.product_code || "-",
  weight: item.weight ?? "-",
  production_note_qty: toNumber(item.production_note_qty),
  ready_qty: toNumber(item.ready_qty),
  already_dispatched_qty: toNumber(item.already_dispatched_qty),
  available_qty: toNumber(item.available_qty),
  dispatch_qty: toNumber(item.dispatch_qty),
  pending_after_dispatch_qty: toNumber(item.pending_after_dispatch_qty),
});


export const useDispatchForm = ({ isOpen, onClose, sourceOrder, selectedDispatch, onAfterSave }) => {
  const isCreateMode = Boolean(sourceOrder?.production_note_id) && !selectedDispatch?.dispatch_id;
  const [header, setHeader] = useState({ dispatch_date: todayValue(), dispatch_status: "dispatched" });
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rowErrors, setRowErrors] = useState({});

  const totals = useMemo(() => items.reduce((acc, item) => {
    acc.totalItems += 1;
    acc.orderQty += toNumber(item.production_note_qty);
    acc.readyQty += toNumber(item.ready_qty);
    acc.alreadyDispatchedQty += toNumber(item.already_dispatched_qty);
    acc.availableQty += toNumber(item.available_qty);
    acc.dispatchQty += toNumber(item.dispatch_qty);
    acc.consignmentWeight += toNumber(item.dispatch_qty) * toNumber(item.weight);
    return acc;
  }, { totalItems: 0, orderQty: 0, readyQty: 0, alreadyDispatchedQty: 0, availableQty: 0, dispatchQty: 0, consignmentWeight: 0 }), [items]);

  const fetchData = async () => {
    try {
      setFetching(true);
      setRowErrors({});
      if (isCreateMode) {
        const res = await getReadyOrderForDispatch(sourceOrder.production_note_id);
        if (!res.success) { toast.error(res.message || "Unable to fetch ready stock for dispatch"); return; }
        const data = res.data?.data || res.data || {};
        setOrder(data);
        setHeader({ dispatch_date: todayValue(), dispatch_status: "dispatched", dispatch_no: "Auto Generated", production_note_id: data.production_note_id, customer_id: data.customer_id });
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
  }, [isOpen, sourceOrder?.production_note_id, selectedDispatch?.dispatch_id]);

  const updateHeader = (field, value) => setHeader((current) => ({ ...current, [field]: value }));
  const updateItem = (index, value) => {
    setRowErrors((current) => { const next = { ...current }; delete next[index]; return next; });
    setItems((current) => current.map((item, itemIndex) => {
      if (itemIndex !== index) return item;
      const numericDispatchQty = toNumber(value);
      return { ...item, dispatch_qty: value === "" ? "" : numericDispatchQty, pending_after_dispatch_qty: Math.max(toNumber(item.available_qty) - numericDispatchQty, 0) };
    }));
  };

  const validate = () => {
    const errors = {};
    items.forEach((item, index) => {
      if (toNumber(item.dispatch_qty) < 0) errors[index] = "Dispatch qty cannot be negative.";
      else if (toNumber(item.dispatch_qty) > toNumber(item.available_qty)) errors[index] = "Dispatch qty cannot be greater than available qty.";
    });
    return errors;
  };

  const handleSave = async () => {
    const errors = validate();
    setRowErrors(errors);
    const firstError = Object.values(errors)[0];
    if (firstError) { toast.error(firstError); return; }
    if (totals.dispatchQty <= 0) { toast.error("At least one dispatch qty should be greater than 0"); return; }
    if (header.vehicle_capacity_kg != null && header.vehicle_capacity_kg !== "" && Math.round(toNumber(header.vehicle_capacity_kg) * 100) !== Math.round(totals.consignmentWeight * 100)) {
      await Swal.fire({ icon: "warning", title: "Vehicle capacity differs from consignment weight", text: `Vehicle capacity: ${formatNumber(header.vehicle_capacity_kg)} kg. </br>Consignment weight: ${formatNumber(totals.consignmentWeight)} kg. </br>A loading buffer may apply; saving is still allowed.`, confirmButtonText: "Continue saving", allowOutsideClick: false, allowEscapeKey: false });
    }

    try {
      setSaving(true);
      const payload = { ...header, total_consignment_weight_kg: Math.round(totals.consignmentWeight * 100) / 100, production_note_id: order?.production_note_id || sourceOrder?.production_note_id, customer_id: order?.customer_id, items };
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

  return { isCreateMode, header, order, items, fetching, saving, rowErrors, totals, updateHeader, updateItem, handleSave };
};

