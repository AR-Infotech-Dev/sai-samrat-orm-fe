import EmptyPanel from "./EmptyPanel";

const toneText = {
  amber: "text-amber-600",
  blue: "text-blue-600",
  purple: "text-violet-600",
  green: "text-emerald-600",
  cyan: "text-cyan-600",
  red: "text-red-500",
};

const toneBtn = {
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  purple: "bg-violet-50 text-violet-700 ring-violet-100",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  cyan: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  red: "bg-red-50 text-red-600 ring-red-100",
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

const Row = ({ children, className = "" }) => (
  <div className={`grid grid-cols-[minmax(112px,1fr)_44px_54px_56px_76px] items-center gap-1 ${className}`}>
    {children}
  </div>
);

function BottleneckBoard({ rows = [], onAction }) {
  return (
    <section className="overflow-hidden rounded-md border border-orange-100 bg-white shadow-xs">
      <div className="flex h-9 items-center justify-between border-b border-orange-100 px-3">
        <h3 className="text-sm font-black text-slate-800">Bottleneck Board</h3>
        <span className="text-[10px] font-black uppercase text-orange-500">Action</span>
      </div>

      <Row className="bg-orange-50/60 px-3 py-2 text-[10px] font-black uppercase text-slate-500">
        <span>Stage</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Orders</span>
        <span className="text-center">Due</span>
        <span className="text-center">Action</span>
      </Row>

      <div className="divide-y divide-orange-50">
        {rows.map((row) => (
          <Row key={row.stage} className="px-3 py-1.5 transition hover:bg-orange-50/40">
            <span className={`truncate text-xs font-black ${toneText[row.tone] || "text-slate-700"}`} title={row.stage}>
              {row.stage}
            </span>
            <span className="text-right text-xs font-black text-slate-800">{row.displayQty || row.qty || 0}</span>
            <span className="text-right text-xs font-bold text-slate-600">{row.orders || 0}</span>
            <span className={`text-center text-[10px] font-bold ${row.tone === "red" ? "text-red-500" : "text-slate-500"}`}>
              {formatDate(row.oldestDue)}
            </span>
            <span className="text-center">
              <button type="button" onClick={() => onAction?.(row)} className={`h-5 w-[70px] text-xs truncate rounded-md px-2 font-black ring-1 transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-200 ${toneBtn[row.tone] || toneBtn.amber}`} title={row.action}>
                {row.action || "View"}
              </button>
            </span>
          </Row>
        ))}
        {!rows.length ? <EmptyPanel title="No bottleneck data." /> : null}
      </div>
    </section>
  );
}

export default BottleneckBoard;
