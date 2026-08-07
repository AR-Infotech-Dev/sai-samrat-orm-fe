import EmptyPanel from "./EmptyPanel";

const fmt = (value) => Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const date = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "-";

const Row = ({ children, className = "" }) => (
  <div className={`grid grid-cols-[minmax(120px,1.2fr)_minmax(82px,0.9fr)_52px_46px_78px] items-center gap-1 ${className}`}>
    {children}
  </div>
);

function DispatchDueTable({ rows = [] }) {
  return (
    <section className="overflow-hidden rounded-md border border-orange-100 bg-white shadow-xs">
      <div className="flex h-9 items-center justify-between border-b border-orange-100 px-3">
        <h3 className="text-sm font-black text-slate-800">Dispatch Due</h3>
        <span className="text-[10px] font-black uppercase text-slate-400">Next Action</span>
      </div>

      <Row className="bg-orange-50/60 px-3 py-2 text-[10px] font-black uppercase text-slate-500">
        <span>Order</span>
        <span>Customer</span>
        <span className="text-center">Due</span>
        <span className="text-right">Qty</span>
        <span className="text-center">Action</span>
      </Row>

      <div className="divide-y divide-orange-50">
        {rows.map((row) => (
          <Row key={row.dispatchId || row.orderId || row.orderNo} className="px-3 py-1.5 transition hover:bg-orange-50/40">
            <span className="truncate text-xs font-black text-slate-700" title={row.orderNo}>{row.orderNo || "-"}</span>
            <span className="truncate text-xs font-semibold text-slate-600" title={row.customer}>{row.customer || "-"}</span>
            <span className="text-center text-[11px] font-bold text-slate-500">{date(row.dueDate)}</span>
            <span className="text-right text-xs font-black text-orange-600">{fmt(row.qty)}</span>
            <span className="text-center">
              <button className="h-5 w-[70px] text-xs truncate rounded-md bg-orange-50 px-2 text-[10px] font-black text-orange-600 ring-1 ring-orange-100 hover:bg-orange-100" title={row.status || "Dispatch"}>
                {row.status ? row.status : "Dispatch"}
              </button>
            </span>
          </Row>
        ))}
        {!rows.length ? <EmptyPanel title="No dispatch due." /> : null}
      </div>
    </section>
  );
}

export default DispatchDueTable;
