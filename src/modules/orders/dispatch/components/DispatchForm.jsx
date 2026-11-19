import { useDispatchForm } from "../hooks/useDispatchForm";
import { Save, X } from "lucide-react";
import ActionButton from "@components/ui/ActionButton";
import FlyoutPanel from "@components/ui/FlyoutPanel";
import Spinner from "@components/ui/Spinner";
import DynamicModuleForm from "@components/ui/DynamicModuleForm";
import { dispatchFormSchema, ordersModuleSchema } from "../data/module.schema";

const dispatchGrid = "grid-cols-[20px_minmax(0,2.4fr)_repeat(6,minmax(0,1fr))]";
const toNumber = (value, fallback = 0) => { const numericValue = Number(value); return Number.isFinite(numericValue) ? numericValue : fallback; };
const formatNumber = (value) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(toNumber(value));

function DispatchForm({ isOpen, onClose, sourceOrder, selectedDispatch, onAfterSave }) {
  const { isCreateMode, header, order, items, fetching, saving, rowErrors, totals, updateHeader, updateItem, handleSave } = useDispatchForm({ isOpen, onClose, sourceOrder, selectedDispatch, onAfterSave });

  if (!isOpen) return null;

  return (
    <FlyoutPanel
      isOpen={isOpen}
      onClose={onClose}
      title={isCreateMode ? "Create Dispatch" : "Dispatch Details"}
      subtitle={`Production Code: ${order?.production_code || "-"} • PI Number: ${order?.pi_number || "-"}`}
      panelClassName="!w-[1080px] max-w-full"
      closeButton={<button className="flyout-close" onClick={onClose} aria-label="Close panel"><X size={18} /></button>}
      footer={<div className="flex w-full items-center justify-between gap-2  bg-white px-4 py-2"><span className="text-xs text-slate-400">Dispatch Qty must be less than or equal to Available Qty</span><div className="flex items-center gap-2"><ActionButton type="button" variant="flyoutSecondary" disabled={saving} onClick={onClose}>{isCreateMode ? "Cancel" : "Close"}</ActionButton>{isCreateMode ? <ActionButton type="button" variant="flyoutPrimary" disabled={saving || fetching} onClick={handleSave}>{saving ? <Spinner size="sm" /> : <><Save size={14} /> Save Dispatch</>}</ActionButton> : null}</div></div>}
    >
      <div className="flyout-form-shell h-full min-h-0 overflow-y-auto bg-slate-50/70 lg:overflow-hidden">
        {fetching ? <div className="grid h-full place-items-center"><Spinner /></div> : <>
          <div className="grid min-h-full grid-cols-1 gap-1 lg:h-full lg:min-h-0 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="min-h-0 bg-white p-3">
            <h2 className="mb-2 text-sm font-semibold text-slate-800">Dispatch Details</h2>
            <div className="[&_.gap-y-5]:gap-y-1.5 [&_.gap-x-4]:gap-x-2 [&_input]:!h-8 [&_input]:!text-xs [&_label]:!text-[10px]">
              <DynamicModuleForm sections={dispatchFormSchema.sections} values={{ ...header, dispatch_no: header.dispatch_no || "Auto Generated", production_code: order?.production_code || "-", pi_number: order?.pi_number || "-", total_consignment_weight_kg: isCreateMode ? Math.round(totals.consignmentWeight * 100) / 100 : header.total_consignment_weight_kg ?? totals.consignmentWeight, __readOnly: !isCreateMode }} onChange={(event) => updateHeader(event.target.name, event.target.value)} menuId={ordersModuleSchema.menu_id} />
            </div>
          </aside>

          <section className="flex min-h-0 min-w-0 flex-col bg-white p-3 lg:overflow-hidden">
            <div className="mb-2 flex shrink-0 items-center justify-between"><div><h3 className="text-sm font-bold text-slate-800">Dispatch Items</h3><p className="text-xs text-slate-400">Ready stock rows selected for dispatch.</p></div><span className="rounded-md bg-orange-50 px-2.5 py-1.5 text-[11px] font-bold text-orange-600">{items.length} Lines</span></div>
            <div className="min-h-0 min-w-0 lg:flex-1 lg:overflow-y-auto [scrollbar-width:thin]">
              <div className={`sticky top-0 z-10 grid ${dispatchGrid} items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-2 py-2 text-[9px] font-bold uppercase leading-tight tracking-wide text-slate-500`}><span>#</span><span>Product / Model</span><span className="text-center">Order</span><span className="text-center">Ready</span><span className="text-center">Dispatched</span><span className="text-center">Available</span><span className="text-center">Dispatch Qty</span><span className="text-center">Pending After</span></div>
              <div className="divide-y divide-slate-100">
                {items.map((item, index) => <div key={item.production_note_item_id ?? index} className={`grid ${dispatchGrid} items-center gap-1.5 px-2 py-1.5 text-[11px] text-slate-700 transition hover:bg-slate-50/70`}>
                  <span className="font-semibold text-slate-500">{index + 1}</span>
                  <div className="min-w-0"><div className="truncate font-semibold text-slate-800">{item.product_name}</div><div className="truncate text-[9px] text-slate-400">{item.product_code} • {item.weight || 0}Kg</div>{rowErrors[index] ? <div className="mt-0.5 truncate text-[9px] font-semibold text-red-500">{rowErrors[index]}</div> : null}</div>
                  <span className="rounded-md bg-blue-50 px-1 py-1.5 text-center font-semibold text-blue-600">{formatNumber(item.production_note_qty)}</span>
                  <span className="rounded-md bg-emerald-50 px-1 py-1.5 text-center font-semibold text-emerald-600">{formatNumber(item.ready_qty)}</span>
                  <span className="rounded-md bg-slate-50 px-1 py-1.5 text-center font-semibold text-slate-500">{formatNumber(item.already_dispatched_qty)}</span>
                  <span className="rounded-md bg-orange-50 px-1 py-1.5 text-center font-bold text-orange-600">{formatNumber(item.available_qty)}</span>
                  {isCreateMode ? <input type="number" min="0" value={item.dispatch_qty ?? ""} onChange={(event) => updateItem(index, event.target.value)} className={`h-7 min-w-0 w-full rounded-md border border-orange-200 bg-orange-50/30 px-1 text-center text-[11px] outline-none focus:border-orange-400 focus:bg-white ${rowErrors[index] ? "!border-red-400 !bg-red-50" : ""}`} /> : <span className="rounded-md bg-orange-50 px-1 py-1.5 text-center font-bold text-orange-600">{formatNumber(item.dispatch_qty)}</span>}
                  <span className="rounded-md bg-red-50 px-1 py-1.5 text-center font-bold text-red-500">{formatNumber(item.pending_after_dispatch_qty)}</span>
                </div>)}
              </div>
            </div>
              <section className="shrink-0  px-2 py-3 text-xs leading-relaxed text-slate-600 lg:max-h-[40%] lg:overflow-y-auto [scrollbar-width:thin]" aria-live="polite">
                <h3 className="mb-2 font-semibold text-slate-800">Dispatch summary</h3>
                <ul className="list-disc space-y-1 pl-4">
                  <li>Vehicle capacity: <span className="font-semibold text-slate-800">{header.vehicle_capacity_kg == null || header.vehicle_capacity_kg === "" ? "Not specified" : `${formatNumber(header.vehicle_capacity_kg)} kg`}</span>.</li>
                  <li>Total consignment weight: <span className="font-semibold text-orange-600">{formatNumber(isCreateMode ? totals.consignmentWeight : header.total_consignment_weight_kg ?? totals.consignmentWeight)} kg</span> (dispatch quantity × unit weight).</li>
                  <li>Dispatch quantity: {formatNumber(totals.dispatchQty)} batteries across {items.filter((item) => toNumber(item.dispatch_qty) > 0).length} selected item lines.</li>
                  <li>Available after dispatch: {formatNumber(Math.max(totals.availableQty - totals.dispatchQty, 0))} batteries.</li>
                  <li className="text-slate-400">Capacity differences are advisory only; saving is allowed.</li>
                </ul>
              </section>
          </section>
          </div>
        </>}
      </div>
    </FlyoutPanel>
  );
}

export default DispatchForm;
