import EmptyPanel from "./EmptyPanel";

const fmt = (value) => Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const Row = ({ children, className = "" }) => (
  <div className={`grid grid-cols-[minmax(96px,1fr)_48px_48px_56px_48px_44px] items-center gap-1 ${className}`}>
    {children}
  </div>
);

function ProductLoadTable({ rows = [] }) {
  const total = rows.reduce((acc, row) => ({
    orderQty: acc.orderQty + Number(row.orderQty || 0),
    readyQty: acc.readyQty + Number(row.readyQty || 0),
    pendingQty: acc.pendingQty + Number(row.pendingQty || 0),
    saiplQty: acc.saiplQty + Number(row.saiplQty || 0),
    pmkQty: acc.pmkQty + Number(row.pmkQty || 0),
  }), { orderQty: 0, readyQty: 0, pendingQty: 0, saiplQty: 0, pmkQty: 0 });

  return (
    <section className="overflow-hidden rounded-md border border-orange-100 bg-white shadow-xs">
      <div className="flex h-9 items-center justify-between border-b border-orange-100 px-3">
        <h3 className="text-sm font-black text-slate-800">Product-wise Load</h3>
        <span className="text-[10px] font-black uppercase text-slate-400">Top 7</span>
      </div>

      <Row className="bg-orange-50/60 px-3 py-2 text-[10px] font-black uppercase text-slate-500">
        <span>Product</span>
        <span className="text-right">Order</span>
        <span className="text-right">Ready</span>
        <span className="text-right">Pending</span>
        <span className="text-right text-blue-600">SAIPL</span>
        <span className="text-right text-cyan-600">PMK</span>
      </Row>

      <div className="divide-y divide-orange-50">
        {rows.map((row, index) => (
          <Row key={`${row.product}-${index}`} className="px-3 py-1.5 transition hover:bg-orange-50/40">
            <span className="truncate text-xs font-black text-slate-700" title={row.product}>{row.product}</span>
            <span className="text-right text-xs font-black text-slate-700">{fmt(row.orderQty)}</span>
            <span className="text-right text-xs font-black text-emerald-600">{fmt(row.readyQty)}</span>
            <span className="text-right text-xs font-black text-orange-600">{fmt(row.pendingQty)}</span>
            <span className="text-right text-xs font-bold text-blue-600">{fmt(row.saiplQty)}</span>
            <span className="text-right text-xs font-bold text-cyan-600">{fmt(row.pmkQty)}</span>
          </Row>
        ))}

        {rows.length ? (
          <Row className="border-t border-orange-100 bg-orange-50/40 px-3 py-2">
            <span className="truncate text-xs font-black text-slate-800">Total</span>
            <span className="text-right text-xs font-black text-slate-800">{fmt(total.orderQty)}</span>
            <span className="text-right text-xs font-black text-emerald-600">{fmt(total.readyQty)}</span>
            <span className="text-right text-xs font-black text-orange-600">{fmt(total.pendingQty)}</span>
            <span className="text-right text-xs font-black text-blue-600">{fmt(total.saiplQty)}</span>
            <span className="text-right text-xs font-black text-cyan-600">{fmt(total.pmkQty)}</span>
          </Row>
        ) : null}

        {!rows.length ? <EmptyPanel title="No product load found." /> : null}
      </div>
    </section>
  );
}

export default ProductLoadTable;
