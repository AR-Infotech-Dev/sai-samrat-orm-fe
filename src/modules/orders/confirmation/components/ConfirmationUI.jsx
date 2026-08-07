import { formatCurrency, formatNumber } from "@/utils/common";
import { CheckCircle2, Clock3, Eye, PauseCircle, RotateCcw, Search, Send, X } from "lucide-react";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const StatusChip = ({ children, tone = "orange" }) => {
  const tones = {
    orange: "bg-orange-50 text-orange-600 ring-orange-100",
    green: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    red: "bg-red-50 text-red-600 ring-red-100",
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
    slate: "bg-slate-50 text-slate-500 ring-slate-100",
  };

  return <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ${tones[tone] || tones.orange}`}>{children}</span>;
};

const KpiCard = ({ icon: Icon, label, value, hint, tone = "orange" }) => {
  const iconTones = {
    orange: "bg-orange-50 text-orange-500",
    green: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-500",
    amber: "bg-amber-50 text-amber-500",
    blue: "bg-blue-50 text-blue-500",
  };

  return (
    <div className="rounded-sm border border-slate-100 bg-white py-1 px-3 shadow-xs">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconTones[tone] || iconTones.orange}`}>
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] mb-0.5 font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="text-[12px] mb-0.5 font-bold text-zinc-800">{value}</p>
          {hint ? <p className="text-[9px] text-slate-400">{hint}</p> : null}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ loading }) => (
  <div className="flex h-60 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-center">
    <Clock3 className="mb-2 text-slate-300" size={30} />
    <p className="text-sm font-semibold text-slate-600">{loading ? "Loading orders..." : "No waiting orders found"}</p>
    <p className="text-xs text-slate-400">Waiting orders will appear here for confirmation.</p>
  </div>
);

const ConfirmationTable = ({ rows, loading, selectedOrderId, onView, onQuickAction }) => {
  if (!rows.length) return <EmptyState loading={loading} />;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
            <tr>
              <th className="w-8 px-3 py-3">#</th>
              <th className="px-3 py-3">Order No</th>
              <th className="px-3 py-3">Customer</th>
              <th className="px-3 py-3">Order Date</th>
              <th className="px-3 py-3">Sales Person</th>
              <th className="px-3 py-3 text-right">Items</th>
              <th className="px-3 py-3 text-right">Qty</th>
              <th className="px-3 py-3 text-right">Grand Total</th>
              <th className="px-3 py-3">Priority</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, index) => {
              const isSelected = String(row.order_id) === String(selectedOrderId);
              return (
                <tr key={row.order_id || index} className={isSelected ? "bg-orange-50/50" : "hover:bg-slate-50/60"}>
                  <td className="px-3 py-3 text-slate-400">{index + 1}</td>
                  <td className="px-3 py-3 font-semibold text-orange-600">{row.order_no || "-"}</td>
                  <td className="px-3 py-3">
                    <div className="font-semibold text-slate-700">{row.customer_name || row.customer_id || "-"}</div>
                    <div className="text-[11px] text-slate-400">{row.customer_mobile || row.customer_email || ""}</div>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{formatDate(row.order_date)}</td>
                  <td className="px-3 py-3 text-slate-600">{row.sales_person_name || row.sales_person_id || "-"}</td>
                  <td className="px-3 py-3 text-right font-semibold text-slate-700">{formatNumber(row.total_items)}</td>
                  <td className="px-3 py-3 text-right font-semibold text-slate-700">{formatNumber(row.total_order_qty)}</td>
                  <td className="px-3 py-3 text-right font-bold text-slate-800">{formatCurrency(row.total_value_in_inr)}</td>
                  <td className="px-3 py-3"><StatusChip tone={row.priority === "high" || row.priority === "urgent" ? "red" : "blue"}>{row.priority || "normal"}</StatusChip></td>
                  <td className="px-3 py-3"><StatusChip tone={row.order_status === "hold" ? "amber" : "orange"}>{row.order_status || "waiting"}</StatusChip></td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button type="button" onClick={() => onView(row)} className="inline-flex h-8 items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-2 text-xs font-semibold text-blue-600 hover:bg-blue-100">
                        <Eye size={13} /> View
                      </button>
                      <button type="button" onClick={() => onQuickAction(row, "confirm")} className="inline-flex h-8 items-center rounded-md border border-emerald-100 bg-emerald-50 px-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-100">Confirm</button>
                      <button type="button" onClick={() => onQuickAction(row, "hold")} className="inline-flex h-8 items-center rounded-md border border-amber-100 bg-amber-50 px-2 text-xs font-semibold text-amber-600 hover:bg-amber-100">Hold</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DetailCell = ({ label, value, highlight }) => (
  <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-2.5">
    <p className="text-[11px] font-semibold text-slate-400">{label}</p>
    <p className={`mt-1 text-sm font-semibold ${highlight ? "text-orange-600" : "text-slate-700"}`}>{value || "-"}</p>
  </div>
);

const RiskChecklist = () => {
  const items = ["Customer confirmation", "Price verified", "Stock availability", "Delivery feasibility"];
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800">Risk Checklist</h3>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-center justify-between text-sm">
            <span className="text-slate-500">{item}</span>
            <StatusChip tone="green">OK</StatusChip>
          </div>
        ))}
      </div>
    </div>
  );
};

const OrderReviewDrawer = ({ isOpen, order, remarks, actionLoading, onClose, onRemarksChange, onAction }) => {
  if (!isOpen) return null;

  const items = order?.items || [];
  const totalItems = items.length || Number(order?.total_items || 0);

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-slate-900/35 backdrop-blur-[1px]">
      <aside className="flex h-full w-full max-w-[880px] flex-col overflow-hidden bg-slate-50 shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-orange-100 bg-orange-50/70 px-5 py-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Order Review</h2>
              <StatusChip tone="orange">Read Only Review</StatusChip>
            </div>
            <p className="text-xs text-orange-600">No order editing allowed here. Only confirm, hold or send back.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-white hover:text-slate-700"><X size={18} /></button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 [scrollbar-width:thin]">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-slate-800">Order Header</h3>
              <div className="grid grid-cols-2 gap-2">
                <DetailCell label="Order No" value={order?.order_no} highlight />
                <DetailCell label="Status" value={order?.order_status || "waiting"} />
                <DetailCell label="Priority" value={order?.priority || "normal"} />
                <DetailCell label="Order Date" value={formatDate(order?.order_date)} />
                <DetailCell label="Expected Delivery" value={formatDate(order?.expected_delivery_date)} />
                <DetailCell label="Sales Person" value={order?.sales_person_name || order?.sales_person_id} />
              </div>
            </section>

            <section className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-slate-800">Customer Details</h3>
              <div className="grid grid-cols-2 gap-2">
                <DetailCell label="Customer" value={order?.customer_name || order?.customer_id} />
                <DetailCell label="Contact" value={order?.customer_mobile || "-"} />
                <DetailCell label="Email" value={order?.customer_email || "-"} />
                <DetailCell label="Location" value={order?.customer_address || "-"} />
              </div>
            </section>
          </div>

          <section className="mt-3 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
              <h3 className="text-sm font-bold text-slate-800">Order Items</h3>
              <p className="text-xs text-slate-400">All values in INR</p>
            </div>
            <div className="w-full overflow-hidden text-left text-sm">
              <div className="grid w-full grid-cols-[42px_minmax(180px,2fr)_minmax(110px,1fr)_90px_80px_110px_80px_140px] items-center bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <div className="px-3 py-2">#</div>
                <div className="px-3 py-2">Product / Model</div>
                <div className="px-3 py-2">Series</div>
                <div className="px-3 py-2 text-right">Weight</div>
                <div className="px-3 py-2 text-right">Qty</div>
                <div className="px-3 py-2 text-right">Rate</div>
                <div className="px-3 py-2 text-right">GST</div>
                <div className="px-3 py-2 text-right">Line Value</div>
              </div>
              <div className="divide-y divide-slate-100">
                {items.map((item, index) => (
                  <div className="grid w-full grid-cols-[42px_minmax(180px,2fr)_minmax(110px,1fr)_90px_80px_110px_80px_140px] items-center" key={item.order_item_id || index}>
                    <div className="px-3 py-2 text-slate-400">{index + 1}</div>
                    <div className="truncate px-3 py-2 font-semibold text-slate-700">{item.product_name_snapshot || item.product_name || "-"}</div>
                    <div className="truncate px-3 py-2 text-slate-500">{item.brand_snapshot || item.brand || "-"}</div>
                    <div className="px-3 py-2 text-right text-slate-500">{formatNumber(item.weight)}</div>
                    <div className="px-3 py-2 text-right font-semibold text-slate-700">{formatNumber(item.order_qty)}</div>
                    <div className="px-3 py-2 text-right text-slate-600">{formatCurrency(item.unit_rate)}</div>
                    <div className="px-3 py-2 text-right text-slate-600">{Number(item.gst_rate || 0)}%</div>
                    <div className="px-3 py-2 text-right font-bold text-slate-800">{formatCurrency(item.line_value)}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr_1.2fr]">
            <section className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800">Order Summary</h3>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Total Items</span><strong>{formatNumber(totalItems)}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Total Qty</span><strong>{formatNumber(order?.total_order_qty)}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><strong>{formatCurrency(order?.total_order_value)}</strong></div>
                <div className="border-t border-dashed border-slate-200 pt-2 flex justify-between"><span className="font-semibold text-slate-700">Grand Total</span><strong className="text-lg text-orange-600">{formatCurrency(order?.total_value_in_inr)}</strong></div>
              </div>
            </section>
            <RiskChecklist />
            <section className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800">Sales Remarks</h3>
              <p className="mt-3 min-h-20 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-500">{order?.remarks || "No remarks added."}</p>
            </section>
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-white p-4">
          <label className="text-xs font-semibold text-slate-500">Remarks / Reason <span className="text-red-500">required for Hold or Send Back</span></label>
          <div className="mt-2 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <textarea
              value={remarks}
              onChange={(event) => onRemarksChange(event.target.value)}
              rows={2}
              className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100"
              placeholder="Enter reason for holding/sending back this order..."
            />
            <div className="flex flex-wrap items-end gap-2">
              <button disabled={actionLoading} onClick={() => onAction("confirm")} className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"><CheckCircle2 size={16} /> Confirm</button>
              <button disabled={actionLoading} onClick={() => onAction("hold")} className="inline-flex h-10 items-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-bold text-white shadow-sm hover:bg-amber-600 disabled:opacity-60"><PauseCircle size={16} /> Hold</button>
              <button disabled={actionLoading} onClick={() => onAction("send-back")} className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-500 px-4 text-sm font-bold text-white shadow-sm hover:bg-red-600 disabled:opacity-60"><RotateCcw size={16} /> Send Back</button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export { ConfirmationTable, KpiCard, OrderReviewDrawer, StatusChip, formatCurrency, formatDate, formatNumber };



