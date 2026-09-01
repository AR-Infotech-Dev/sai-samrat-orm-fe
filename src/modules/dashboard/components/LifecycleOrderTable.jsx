const tabKeys = ["all", "confirmation", "planning", "production", "ready_stock", "dispatch"];

const tableColumns = [
  { key: "sr", label: "#", width: "3%", align: "left" },
  { key: "order_no", label: "Order No", width: "11%", align: "left" },
  { key: "customer", label: "Customer", width: "12%", align: "left" },
  { key: "product", label: "Product / Model", width: "15%", align: "left" },
  { key: "order_qty", label: "Order", width: "5.5%", align: "right" },
  { key: "planned", label: "Plan", width: "5%", align: "right" },
  { key: "pmk", label: "PMK", width: "5%", align: "right" },
  { key: "produced", label: "Prod.", width: "5.5%", align: "right" },
  { key: "ready", label: "Ready", width: "5%", align: "right" },
  { key: "pending", label: "Pend.", width: "5%", align: "right" },
  { key: "dispatch", label: "Disp.", width: "5%", align: "right" },
  { key: "value", label: "Value", width: "8%", align: "right" },
  { key: "expected", label: "Expected", width: "6.5%", align: "left" },
  { key: "stage", label: "Stage", width: "8%", align: "center" },
];

const statusClass = (status = "") => {
  const key = String(status || "").toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
  if (["ready", "ready_stock", "completed", "dispatched"].includes(key)) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (["partial_dispatch", "partially_dispatch", "partially_dispatched"].includes(key)) return "border-cyan-200 bg-cyan-50 text-cyan-700";
  if (["production", "in_progress", "partially_ready"].includes(key)) return "border-orange-200 bg-orange-50 text-orange-700";
  if (["planning", "planned", "partial_planned"].includes(key)) return "border-violet-200 bg-violet-50 text-violet-700";
  if (["waiting", "confirmation", "not_planned", "not_started", "confirmed"].includes(key)) return "border-blue-200 bg-blue-50 text-blue-700";
  if (["hold", "pending"].includes(key)) return "border-amber-200 bg-amber-50 text-amber-700";
  if (["critical", "cancelled", "overdue", "rework"].includes(key)) return "border-red-200 bg-red-50 text-red-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
};

const alignClass = (align) => {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return "text-left";
};

const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const formatCurrency = (value) => `₹ ${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const summaryItems = [
  ["total_orders", "Total Orders", "number"],
  ["total_order_qty", "Total Booking Qty", "number"],
  ["total_value", "Total Value", "currency"],
  ["ready_qty", "Ready Qty", "green"],
  ["pending_qty", "Pending Production", "red"],
  ["dispatched_qty", "Dispatched Qty", "teal"],
  ["pmk_qty", "PMK Outsourcing", "purple"],
];

const getCellStyle = (columnKey) => {
  const column = tableColumns.find((item) => item.key === columnKey);

  return {
    height: 38,
    maxHeight: 38,
    padding: "4px 6px",
    overflow: "hidden",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    boxSizing: "border-box",
    textAlign: column?.align || "left",
  };
};

const TruncateCol = ({ children, title, className = "", lines = 1 }) => {
  const lineClampStyle = lines > 1
    ? {
        display: "-webkit-box",
        WebkitLineClamp: lines,
        WebkitBoxOrient: "vertical",
        whiteSpace: "normal",
      }
    : {};

  return (
    <div
      className={`block w-full max-w-full overflow-hidden text-ellipsis ${lines > 1 ? "" : "whitespace-nowrap"} ${className}`}
      style={lineClampStyle}
      title={title || (typeof children === "string" ? children : "")}
    >
      {children}
    </div>
  );
};

function LifecycleOrderTable({ data = {}, loading = false, activeTab = "all", onTabChange }) {
  const lifecycle = data?.lifecycle || {};
  const summary = lifecycle.summary || {};
  const rows = Array.isArray(lifecycle.rows) ? lifecycle.rows : [];
  const tabs = Array.isArray(lifecycle.tabs) ? lifecycle.tabs : [];
  const tabMap = Object.fromEntries(tabs.map((tab) => [tab.key, tab]));

  return (
    <section className="overflow-hidden rounded-sm border border-orange-100 bg-white shadow-xs">
      <div className="grid grid-cols-7 border-b border-slate-200 bg-white">
        {summaryItems.map(([key, label, type]) => (
          <div key={key} className="min-h-[50px] min-w-0 border-r border-slate-200 px-3 py-2 last:border-r-0">
            <p className="truncate text-[10px] font-bold text-slate-500">{label}</p>
            <p className={`mt-1 truncate text-lg font-black tabular-nums ${type === "currency" ? "text-slate-900" : type === "green" ? "text-emerald-600" : type === "red" ? "text-red-600" : type === "teal" ? "text-cyan-700" : type === "purple" ? "text-violet-600" : "text-slate-900"}`}>
              {type === "currency" ? formatCurrency(summary[key]) : formatNumber(summary[key])}
            </p>
          </div>
        ))}
      </div>

      <div className="flex overflow-x-auto border-b border-slate-200 bg-white px-3 [scrollbar-width:thin]">
        {tabKeys.map((key) => {
          const tab = tabMap[key] || { key, label: key, count: 0, qty: 0 };
          const isActive = activeTab === key;
          return (
            <button key={key} type="button" onClick={() => onTabChange?.(key)} className={`relative shrink-0 px-4 py-2 text-xs font-bold transition ${isActive ? "text-orange-600" : "text-slate-600 hover:text-orange-500"}`}>
              <span>{tab.label} ({tab.count || 0})</span>
              <span className="ml-1 text-[10px] font-semibold text-slate-400">{formatNumber(tab.qty)} Qty</span>
              {isActive ? <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-orange-500" /> : null}
            </button>
          );
        })}
      </div>

      <div className="flex h-8 items-center justify-between border-b border-slate-100 px-3">
        <h3 className="text-sm font-black text-slate-800">Order Item Lifecycle</h3>
        <p className="text-[11px] font-semibold text-slate-400">Each row = one order item</p>
      </div>

      <div className="lifecycle-table-scroll relative" style={{ width: "100%", minHeight: 260, maxHeight: "calc(100vh - 360px)", overflowY: "auto", overflowX: "hidden" }}>
        <table className="lifecycle-table" style={{ width: "100%", minWidth: "100%", tableLayout: "fixed", borderCollapse: "collapse", fontSize: 12, lineHeight: 1.15 }}>
          <colgroup>
            {tableColumns.map((column) => <col key={column.key} style={{ width: column.width }} />)}
          </colgroup>

          <thead className="lifecycle-table-head" style={{ position: "sticky", top: 0, zIndex: 20, background: "#f8fafc" }}>
            <tr style={{ height: 34 }}>
              {tableColumns.map((column) => (
                <th key={column.key} className={`${alignClass(column.align)} ${column.sticky ? "lifecycle-action-head" : ""}`} style={{ ...getCellStyle(column.key), height: 34, maxHeight: 34, borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: 10, fontWeight: 900, textTransform: "uppercase", background: "#f8fafc" }}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.order_id}-${row.order_item_id}`} className="lifecycle-table-row" style={{ height: 42, maxHeight: 42, borderBottom: "1px solid #edf2f7" }}>
                <td className="text-slate-500 tabular-nums" style={getCellStyle("sr")}>{index + 1}</td>
                <td style={getCellStyle("order_no")}><TruncateCol title={row.order_no} className="font-extrabold text-orange-600">{row.order_no || "-"}</TruncateCol></td>
                <td style={getCellStyle("customer")}><TruncateCol title={row.customer_name} className="font-semibold text-slate-700">{row.customer_name || "-"}</TruncateCol></td>
                <td style={{ ...getCellStyle("product"), whiteSpace: "normal" }}>
                  <TruncateCol title={row.product_name} className="font-extrabold leading-[1.1] text-slate-800">{row.product_name || "-"}</TruncateCol>
                  <TruncateCol title={`${row.product_code || "-"} • ${row.model || "-"}`} className="mt-0.5 text-[10px] font-bold leading-[1.05] text-slate-400">{row.product_code || "-"} • {row.model || "-"}</TruncateCol>
                </td>
                <td className="text-right tabular-nums" style={getCellStyle("order_qty")}><span className="lifecycle-qty lifecycle-qty-order">{formatNumber(row.order_qty)}</span></td>
                <td className="text-right tabular-nums" style={getCellStyle("planned")}><span className="lifecycle-qty lifecycle-qty-plan">{formatNumber(row.planned_qty)}</span></td>
                <td className="text-right tabular-nums" style={getCellStyle("pmk")}><span className="lifecycle-qty lifecycle-qty-pmk">{formatNumber(row.pmk_qty)}</span></td>
                <td className="text-right tabular-nums" style={getCellStyle("produced")}><span className="lifecycle-qty lifecycle-qty-prod">{formatNumber(row.produced_qty)}</span></td>
                <td className="text-right tabular-nums" style={getCellStyle("ready")}><span className="lifecycle-qty lifecycle-qty-ready">{formatNumber(row.ready_qty)}</span></td>
                <td className="text-right tabular-nums" style={getCellStyle("pending")}><span className="lifecycle-qty lifecycle-qty-pending">{formatNumber(row.pending_qty)}</span></td>
                <td className="text-right tabular-nums" style={getCellStyle("dispatch")}><span className="lifecycle-qty lifecycle-qty-dispatch">{formatNumber(row.dispatched_qty)}</span></td>
                <td className="text-right font-extrabold text-slate-800 tabular-nums" style={getCellStyle("value")}>{formatCurrency(row.line_value)}</td>
                <td className="text-slate-600" style={getCellStyle("expected")}>{formatDate(row.expected_delivery_date || row.expected_ready_date)}</td>
                <td className="text-center" style={getCellStyle("stage")}> 
                  <span className={`lifecycle-stage-badge ${statusClass(row.current_stage)}`} title={String(row.current_stage || row.order_status || "-").replace(/_/g, " ")}>
                    {String(row.current_stage || row.order_status || "-").replace(/_/g, " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
                </table>

        {!rows.length && (
          <div className="pointer-events-none sticky left-0 flex h-[180px] w-full items-center justify-center">
            <div className="rounded-md border border-slate-100 bg-white px-5 py-3 text-center text-xs font-semibold text-slate-400 shadow-xs">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-200 border-t-orange-500" />
                  Loading dashboard...
                </span>
              ) : (
                "No order items found for selected filters."
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default LifecycleOrderTable;




