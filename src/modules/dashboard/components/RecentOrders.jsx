import { ArrowRight, Eye } from "lucide-react";

const statusStyles = {
  production: "border-orange-200 bg-orange-50 text-orange-600",
  planning: "border-amber-200 bg-amber-50 text-amber-600",
  planned: "border-amber-200 bg-amber-50 text-amber-600",
  confirmed: "border-emerald-200 bg-emerald-50 text-emerald-600",
  booked: "border-blue-200 bg-blue-50 text-blue-600",
  waiting: "border-slate-200 bg-slate-50 text-slate-600",
  ready: "border-emerald-200 bg-emerald-50 text-emerald-600",
  dispatch: "border-red-200 bg-red-50 text-red-500",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-600",
};

const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const RecentOrders = ({ orders = [], onViewAll, onViewOrder }) => {
  const headersClass = "px-3 py-2 text-[10px] font-bold uppercase text-slate-400";

  return (
    <section className="overflow-hidden rounded-sm border border-orange-100 bg-white shadow-xs">
      <div className="flex h-8 items-center justify-between border-b border-orange-100 px-3">
        <h2 className="text-sm font-semibold text-slate-800">Recent Orders</h2>
        <button type="button" onClick={onViewAll} className="flex items-center gap-1 text-xs font-bold text-orange-500 transition hover:text-orange-600">
          View all
          <ArrowRight size={13} strokeWidth={2.2} />
        </button>
      </div>

      <div className="overflow-x-auto [scrollbar-width:thin]">
        <table className="w-full min-w-[760px] table-fixed border-collapse">
          <thead>
            <tr className="bg-orange-50/70 text-left" style={{width : "100%"}}>
              <th className={`${headersClass} w-[130px]`}>Order No</th>
              <th className={`${headersClass} w-[160px]`}>Customer</th>
              <th className={`${headersClass} w-[80px]`}>Series</th>
              <th className={`${headersClass} w-[90px] text-right`}>Order Qty</th>
              <th className={`${headersClass} w-[80px] text-right`}>Ready</th>
              <th className={`${headersClass} w-[80px] text-right`}>Pending</th>
              <th className={`${headersClass} w-[90px] text-center`}>Status</th>
              <th className={`${headersClass} w-[100px] text-center`}>Expected</th>
              <th className={`${headersClass} w-[60px] text-center`}>Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => {
              const statusKey = String(order.status || "").toLowerCase();
              return (
                <tr key={order.id} className="border-t border-orange-50 transition hover:bg-orange-50/60" style={{width : "100%"}}>
                  <td className="w-[130px] truncate px-3 py-2 text-[11px] font-bold text-slate-700">{order.orderNo}</td>
                  <td className="w-[160px] truncate px-3 py-2 text-[11px] text-slate-600">{order.customer}</td>
                  <td className="w-[80px] truncate px-3 py-2 text-[11px] text-slate-600">{order.series}</td>
                  <td className="w-[90px] px-3 py-2 text-right text-[11px] font-semibold text-slate-700">{formatNumber(order.orderQty)}</td>
                  <td className="w-[80px] px-3 py-2 text-right text-[11px] font-bold text-emerald-500">{formatNumber(order.ready)}</td>
                  <td className="w-[80px] px-3 py-2 text-right text-[11px] font-bold text-orange-500">{formatNumber(order.pending)}</td>
                  <td className="w-[90px] px-3 py-2 text-center">
                    <span className={`inline-flex min-w-[68px] items-center justify-center rounded border px-2 py-0.5 text-[9px] font-bold capitalize ${statusStyles[statusKey] || "border-slate-200 bg-slate-50 text-slate-600"}`}>{order.status}</span>
                  </td>
                  <td className="w-[100px] px-3 py-2 text-center text-[11px] text-slate-600">{order.expectedDate}</td>
                  <td className="w-[60px] px-3 py-2 text-center">
                    <button type="button" onClick={() => onViewOrder?.(order)} className="inline-flex h-6 w-7 items-center justify-center rounded-md border border-orange-100 bg-orange-50 text-orange-400 transition hover:border-orange-200 hover:bg-orange-100 hover:text-orange-600" aria-label={`View ${order.orderNo}`}>
                      <Eye size={12} strokeWidth={2} />
                    </button>
                  </td>
                </tr>
              );
            })}

            {!orders.length && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-xs text-slate-400">No recent orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default RecentOrders;