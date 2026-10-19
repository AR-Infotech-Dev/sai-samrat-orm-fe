import { ChevronDown, ChevronRight, Clock3, Columns3, Package, PackageCheck, Truck, Workflow } from "lucide-react";
import { Fragment, useMemo, useState } from "react";

const tabKeys = ["all", "confirmation", "planning", "production", "ready_stock", "dispatch"];

export const tableColumns = [
  { key: "sr", label: "#", width: "3%", align: "left" },
  { key: "production_code", label: "Production Note", width: "11%", align: "left", isAlwaysVisible: true },
  { key: "pi_number", label: "PI Number", width: "11%", align: "left", isAlwaysVisible: true },
  { key: "customer", label: "Customer", width: "12%", align: "left" },
  { key: "product", label: "Product / Model", width: "15%", align: "left" },
  { key: "production_note_qty", label: "Order", width: "5.5%", align: "right" },
  { key: "planned", label: "Plan", width: "5%", align: "right" },
  { key: "pmk", label: "Out S.", width: "5%", align: "right" },
  { key: "produced", label: "Prod.", width: "5.5%", align: "right" },
  { key: "ready", label: "Ready", width: "5%", align: "right" },
  { key: "pending", label: "Pend.", width: "5%", align: "right" },
  { key: "dispatch", label: "Disp.", width: "5%", align: "right" },
  { key: "value", label: "Value", width: "8%", align: "right" },
  { key: "expected", label: "Expected", width: "6.5%", align: "left" },
  { key: "stage", label: "Stage", width: "8%", align: "center" },
];

export const dashboardLifecycleRoleColumns = {
  super_admin: tableColumns.map((column) => column.key),
  admin: tableColumns.map((column) => column.key),
  employee: ["sr", "production_code", "pi_number", "customer", "product", "production_note_qty", "planned", "pmk", "produced", "ready", "pending", "dispatch", "value", "expected", "stage"],
  default: ["sr", "production_code", "pi_number", "customer", "product", "production_note_qty", "planned", "produced", "ready", "pending", "dispatch", "stage"],
};

const VISIBLE_COLUMNS_STORAGE_SUFFIX = "-visible-columns";

export const getDashboardColumnStorageKey = (roleSlug = "default") => `dashboard-lifecycle-${roleSlug || "default"}`;

const getDefaultVisibleColumnKeys = (roleSlug = "default") => {
  const defaultKeys = dashboardLifecycleRoleColumns[roleSlug] || dashboardLifecycleRoleColumns.default;
  const availableKeys = new Set(tableColumns.map((column) => column.key));
  const alwaysVisibleKeySet = new Set(tableColumns.filter((column) => column.isAlwaysVisible).map((column) => column.key));
  const selectedKeySet = new Set(defaultKeys);

  return tableColumns
    .map((column) => column.key)
    .filter((key) => availableKeys.has(key) && (selectedKeySet.has(key) || alwaysVisibleKeySet.has(key)));
};

export const getStoredVisibleColumnKeys = (storageKey) => {
  if (!storageKey || typeof window === "undefined") return null;

  try {
    const parsedValue = JSON.parse(window.localStorage.getItem(`${storageKey}${VISIBLE_COLUMNS_STORAGE_SUFFIX}`) || "null");
    return Array.isArray(parsedValue) ? parsedValue : null;
  } catch {
    return null;
  }
};

export const setStoredVisibleColumnKeys = (storageKey, columnKeys = []) => {
  if (!storageKey || typeof window === "undefined") return;
  window.localStorage.setItem(`${storageKey}${VISIBLE_COLUMNS_STORAGE_SUFFIX}`, JSON.stringify(columnKeys));
};

export const normalizeVisibleColumnKeys = (columnKeys = [], roleSlug = "default") => {
  const availableKeys = new Set(tableColumns.map((column) => column.key));
  const sourceKeys = Array.isArray(columnKeys) && columnKeys.length ? columnKeys : getDefaultVisibleColumnKeys(roleSlug);
  const normalizedKeys = sourceKeys.filter((key) => availableKeys.has(key));
  const normalizedKeySet = new Set(normalizedKeys);
  const missingAlwaysVisibleKeys = tableColumns
    .filter((column) => column.isAlwaysVisible)
    .map((column) => column.key)
    .filter((key) => !normalizedKeySet.has(key));

  const repairPrimaryOrder = (keys = []) => {
    const nextKeys = [...new Set(keys)];
    const srIndex = nextKeys.indexOf("sr");
    const orderCodeIndex = nextKeys.indexOf("production_code");

    if (srIndex !== -1 && orderCodeIndex !== -1 && orderCodeIndex < srIndex) {
      nextKeys.splice(srIndex, 1);
      nextKeys.splice(orderCodeIndex, 0, "sr");
    }

    return nextKeys;
  };

  if (!missingAlwaysVisibleKeys.length) {
    return repairPrimaryOrder(normalizedKeys);
  }

  const nextKeySet = new Set([...normalizedKeys, ...missingAlwaysVisibleKeys]);
  return repairPrimaryOrder(tableColumns.map((column) => column.key).filter((key) => nextKeySet.has(key)));
};

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
const formatCurrency = (value) => `₹ ${Math.round(Number(value || 0)).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const getPiNumber = (row = {}) => row.pi_number || row.pi_no || row.proforma_pi_no || row.proforma_invoice_no || "-";
const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const sumBy = (rows = [], key) => rows.reduce((total, row) => total + Number(row?.[key] || 0), 0);

const getOrderGroupKey = (row = {}) => row.production_note_id || row.production_code || row.production_note_no || row.production_note_item_id;

const getGroupedOrders = (rows = []) => {
  const groupMap = new Map();

  rows.forEach((row) => {
    const key = getOrderGroupKey(row);
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        key,
        first: row,
        items: [],
      });
    }
    groupMap.get(key).items.push(row);
  });

  return Array.from(groupMap.values()).map((group) => {
    const { first, items } = group;
    const stages = new Set(items.map((item) => String(item.current_stage || item.production_note_status || "").trim()).filter(Boolean));

    return {
      ...first,
      group_key: group.key,
      item_count: items.length,
      items,
      production_note_qty: sumBy(items, "production_note_qty"),
      planned_qty: sumBy(items, "planned_qty"),
      pmk_qty: sumBy(items, "pmk_qty"),
      produced_qty: sumBy(items, "produced_qty"),
      ready_qty: sumBy(items, "ready_qty"),
      pending_qty: sumBy(items, "pending_qty"),
      dispatched_qty: sumBy(items, "dispatched_qty"),
      line_value: sumBy(items, "line_value"),
      current_stage: stages.size > 1 ? "mixed" : (first.current_stage || first.production_note_status),
    };
  });
};

const summaryItems = [
  // { qtyKey: "total_orders", qtyLabel: "Total Orders", valueKey: "avg_order_value", valueLabel: "Avg Order Value", icon: ShoppingCart, accent: "#3B82F6" },
  { qtyKey: "total_production_note_qty", qtyLabel: "Total Booking Qty", valueKey: "total_value", valueLabel: "Booking Value", icon: Package, accent: "#8B5CF6" },
  { qtyKey: "ready_qty", qtyLabel: "Ready Qty", valueKey: "ready_value", valueLabel: "Ready Value", icon: PackageCheck, accent: "#10B981" },
  { qtyKey: "pending_qty", qtyLabel: "Pending Production", valueKey: "pending_value", valueLabel: "Pending Value", icon: Clock3, accent: "#EF4444" },
  { qtyKey: "pmk_qty", qtyLabel: "Outsourcing", valueKey: "pmk_value", valueLabel: "Outsource Value", icon: Workflow, accent: "#7C3AED" },
  { qtyKey: "dispatched_qty", qtyLabel: "Dispatched Qty", valueKey: "dispatched_value", valueLabel: "Dispatched Value", icon: Truck, accent: "#06B6D4" },
  { qtyKey: "ready_pending_dispatch_qty", qtyLabel: "Pending Dispatch", valueKey: "ready_pending_dispatch_value", valueLabel: "Pending Dispatch Value", icon: Truck, accent: "#F59E0B" },
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

function LifecycleOrderTable({ data = {}, loading = false, activeTab = "all", onTabChange, roleSlug = "default", visibleColumnKeys: selectedVisibleColumnKeys, onToggleColumnMenu }) {
  const [expandedOrders, setExpandedOrders] = useState(() => new Set());
  const lifecycle = data?.lifecycle || {};
  const summary = lifecycle.summary || {};
  const rows = Array.isArray(lifecycle.rows) ? lifecycle.rows : [];
  const groupedRows = useMemo(() => getGroupedOrders(rows), [rows]);
  const visibleColumnKeys = useMemo(
    () => normalizeVisibleColumnKeys(selectedVisibleColumnKeys, roleSlug),
    [roleSlug, selectedVisibleColumnKeys]
  );
  const visibleColumns = useMemo(
    () => visibleColumnKeys.map((key) => tableColumns.find((column) => column.key === key)).filter(Boolean),
    [visibleColumnKeys]
  );
  const tabs = Array.isArray(lifecycle.tabs) ? lifecycle.tabs : [];
  const tabMap = Object.fromEntries(tabs.map((tab) => [tab.key, tab]));

  const toggleOrder = (groupKey) => {
    setExpandedOrders((current) => {
      const next = new Set(current);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  };

  const renderParentCell = (column, row, index, isExpanded) => {
    const ToggleIcon = isExpanded ? ChevronDown : ChevronRight;

    switch (column.key) {
      case "sr":
        return <td key={column.key} className="text-slate-500 tabular-nums" style={getCellStyle("sr")}>{index + 1}</td>;
      case "production_code":
        return (
          <td key={column.key} style={getCellStyle("production_code")}>
            <div className="flex min-w-0 items-center gap-1.5">
              <ToggleIcon size={13} className="shrink-0 text-slate-400" />
              <TruncateCol title={row.production_code} className="font-bold text-orange-600">{row.production_code || "-"}</TruncateCol>
            </div>
          </td>
        );
      case "pi_number":
        return <td key={column.key} style={getCellStyle("pi_number")}><TruncateCol title={getPiNumber(row)} className="font-semibold text-slate-600">{getPiNumber(row)}</TruncateCol></td>;
      case "customer":
        return <td key={column.key} style={getCellStyle("customer")}><TruncateCol title={row.customer_name} className="font-semibold text-slate-700">{row.customer_name || "-"}</TruncateCol></td>;
      case "product":
        return (
          <td key={column.key} style={{ ...getCellStyle("product"), whiteSpace: "normal" }}>
            <TruncateCol title={`${row.item_count} item lines`} className="font-bold leading-[1.1] text-slate-800">{row.item_count} Item Lines</TruncateCol>
            <TruncateCol title={row.items.map((item) => item.product_name).filter(Boolean).join(", ")} className="mt-0.5 text-[10px] font-medium leading-[1.05] text-slate-400" lines={1}>
              {row.items.map((item) => item.product_name).filter(Boolean).slice(0, 2).join(", ") || "-"}
            </TruncateCol>
          </td>
        );
      case "production_note_qty":
        return <td key={column.key} className="text-right tabular-nums" style={getCellStyle("production_note_qty")}><span className="lifecycle-qty lifecycle-qty-order">{formatNumber(row.production_note_qty)}</span></td>;
      case "planned":
        return <td key={column.key} className="text-right tabular-nums" style={getCellStyle("planned")}><span className="lifecycle-qty lifecycle-qty-plan">{formatNumber(row.planned_qty)}</span></td>;
      case "pmk":
        return <td key={column.key} className="text-right tabular-nums" style={getCellStyle("pmk")}><span className="lifecycle-qty lifecycle-qty-pmk">{formatNumber(row.pmk_qty)}</span></td>;
      case "produced":
        return <td key={column.key} className="text-right tabular-nums" style={getCellStyle("produced")}><span className="lifecycle-qty lifecycle-qty-prod">{formatNumber(row.produced_qty)}</span></td>;
      case "ready":
        return <td key={column.key} className="text-right tabular-nums" style={getCellStyle("ready")}><span className="lifecycle-qty lifecycle-qty-ready">{formatNumber(row.ready_qty)}</span></td>;
      case "pending":
        return <td key={column.key} className="text-right tabular-nums" style={getCellStyle("pending")}><span className="lifecycle-qty lifecycle-qty-pending">{formatNumber(row.pending_qty)}</span></td>;
      case "dispatch":
        return <td key={column.key} className="text-right tabular-nums" style={getCellStyle("dispatch")}><span className="lifecycle-qty lifecycle-qty-dispatch">{formatNumber(row.dispatched_qty)}</span></td>;
      case "value":
        return <td key={column.key} className="text-right font-bold text-slate-800 tabular-nums" style={getCellStyle("value")}>{formatCurrency(row.line_value)}</td>;
      case "expected":
        return <td key={column.key} className="text-slate-600" style={getCellStyle("expected")}>{formatDate(row.expected_delivery_date || row.expected_ready_date)}</td>;
      case "stage":
        return (
          <td key={column.key} className="text-center" style={getCellStyle("stage")}>
            <span className={`lifecycle-stage-badge ${statusClass(row.current_stage)}`} title={String(row.current_stage || row.production_note_status || "-").replace(/_/g, " ")}>
              {String(row.current_stage || row.production_note_status || "-").replace(/_/g, " ")}
            </span>
          </td>
        );
      default:
        return null;
    }
  };

  const renderChildCell = (column, item, index, itemIndex) => {
    switch (column.key) {
      case "sr":
        return <td key={column.key} className="text-slate-400 tabular-nums" style={getCellStyle("sr")}>{`${index + 1}.${itemIndex + 1}`}</td>;
      case "production_code":
        return <td key={column.key} style={getCellStyle("production_code")}><span className="pl-5 text-[10px] font-bold uppercase text-slate-400">Item Line</span></td>;
      case "customer":
        return <td key={column.key} style={getCellStyle("customer")}><TruncateCol title={item.customer_name} className="font-semibold text-slate-500">{item.customer_name || "-"}</TruncateCol></td>;
      case "pi_number":
        return <td key={column.key} style={getCellStyle("pi_number")}><TruncateCol title={getPiNumber(item)} className="font-semibold text-slate-500">{getPiNumber(item)}</TruncateCol></td>;
      case "product":
        return (
          <td key={column.key} style={{ ...getCellStyle("product"), whiteSpace: "normal" }}>
            <TruncateCol title={item.product_name} className="font-bold leading-[1.1] text-slate-700">{item.product_name || "-"}</TruncateCol>
            <TruncateCol title={`${item.product_code || "-"} • ${item.model || "-"}`} className="mt-0.5 text-[10px] font-medium leading-[1.05] text-slate-400">{item.product_code || "-"} • {item.model || "-"}</TruncateCol>
          </td>
        );
      case "production_note_qty":
        return <td key={column.key} className="text-right tabular-nums" style={getCellStyle("production_note_qty")}><span className="lifecycle-qty lifecycle-qty-order">{formatNumber(item.production_note_qty)}</span></td>;
      case "planned":
        return <td key={column.key} className="text-right tabular-nums" style={getCellStyle("planned")}><span className="lifecycle-qty lifecycle-qty-plan">{formatNumber(item.planned_qty)}</span></td>;
      case "pmk":
        return <td key={column.key} className="text-right tabular-nums" style={getCellStyle("pmk")}><span className="lifecycle-qty lifecycle-qty-pmk">{formatNumber(item.pmk_qty)}</span></td>;
      case "produced":
        return <td key={column.key} className="text-right tabular-nums" style={getCellStyle("produced")}><span className="lifecycle-qty lifecycle-qty-prod">{formatNumber(item.produced_qty)}</span></td>;
      case "ready":
        return <td key={column.key} className="text-right tabular-nums" style={getCellStyle("ready")}><span className="lifecycle-qty lifecycle-qty-ready">{formatNumber(item.ready_qty)}</span></td>;
      case "pending":
        return <td key={column.key} className="text-right tabular-nums" style={getCellStyle("pending")}><span className="lifecycle-qty lifecycle-qty-pending">{formatNumber(item.pending_qty)}</span></td>;
      case "dispatch":
        return <td key={column.key} className="text-right tabular-nums" style={getCellStyle("dispatch")}><span className="lifecycle-qty lifecycle-qty-dispatch">{formatNumber(item.dispatched_qty)}</span></td>;
      case "value":
        return <td key={column.key} className="text-right font-bold text-slate-700 tabular-nums" style={getCellStyle("value")}>{formatCurrency(item.line_value)}</td>;
      case "expected":
        return <td key={column.key} className="text-slate-500" style={getCellStyle("expected")}>{formatDate(item.expected_delivery_date || item.expected_ready_date)}</td>;
      case "stage":
        return (
          <td key={column.key} className="text-center" style={getCellStyle("stage")}>
            <span className={`lifecycle-stage-badge ${statusClass(item.current_stage)}`} title={String(item.current_stage || item.production_note_status || "-").replace(/_/g, " ")}>
              {String(item.current_stage || item.production_note_status || "-").replace(/_/g, " ")}
            </span>
          </td>
        );
      default:
        return null;
    }
  };

  return (
    <section className="dashboard-lifecycle-table relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="dashboard-kpi-grid mb-1">
        {summaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.qtyKey} className="dashboard-kpi-card" style={{ "--kpi-accent": item.accent, "--kpi-soft": `${item.accent}14`, }} >
              <div className="mb-0.5 flex items-start justify-between gap-1">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-slate-700">{item.qtyLabel}</h3>
                  <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
                    <span className="truncate text-xs text-slate-400">{item.valueLabel}</span>
                  </div>
                </div>
                <div className="dashboard-kpi-icon">
                  <Icon size={18} strokeWidth={1.8} />
                </div>
              </div>
              <div className="flex flex-wrap items-end justify-between gap-x-1 gap-y-1">
                <h2 className="dashboard-kpi-value">{formatNumber(summary[item.qtyKey])}</h2>
                <div className="min-w-0 text-right">
                  <span className="dashboard-kpi-secondary">{formatCurrency(summary[item.valueKey])}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="dashboard-lifecycle-tabs flex justify-between overflow-x-auto bg-white px-3 py-0.5 items-center [scrollbar-width:thin]">
        <div>
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
        <button
          type="button"
          className="dashboard-column-trigger"
          onClick={(event) => {
            event.stopPropagation();
            onToggleColumnMenu?.();
          }}
          title="Show / hide columns"
        >
          <Columns3 size={13} />
          Columns
        </button>
      </div>
      <div className="lifecycle-table-scroll relative">
        <table className="lifecycle-table" style={{ width: "100%", minWidth: "100%", tableLayout: "fixed", borderCollapse: "collapse", fontSize: 12, lineHeight: 1.15 }}>
          <colgroup>
            {visibleColumns.map((column) => <col key={column.key} style={{ width: column.width }} />)}
          </colgroup>

          <thead className="lifecycle-table-head" style={{ position: "sticky", top: 0, zIndex: 19 }}>
            <tr style={{ height: 34 }} className="bg-white!">
              {visibleColumns.map((column) => (
                <th key={column.key} className={`shadow-sm ${alignClass(column.align)} ${column.sticky ? "lifecycle-action-head" : ""}`} style={{ ...getCellStyle(column.key), height: 34, maxHeight: 34, borderBottom: "1px solid #eef2f7", color: "#475569", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {groupedRows.map((row, index) => {
              const isExpanded = expandedOrders.has(row.group_key);

              return (
                <Fragment key={`group-${row.group_key}`}>
                  <tr
                    key={`order-${row.group_key}`}
                    className={`lifecycle-table-row lifecycle-parent-row ${isExpanded ? "is-expanded" : ""}`}
                    style={{ height: 42, maxHeight: 42, borderBottom: "1px solid #f1f5f9" }}
                    onClick={() => toggleOrder(row.group_key)}
                  >
                    {visibleColumns.map((column) => renderParentCell(column, row, index, isExpanded))}
                  </tr>

                  {isExpanded ? row.items.map((item, itemIndex) => (
                    <tr key={`item-${item.production_note_id}-${item.production_note_item_id}`} className="lifecycle-table-row lifecycle-child-row" style={{ height: 42, maxHeight: 42, borderBottom: "1px solid #f1f5f9" }}>
                      {visibleColumns.map((column) => renderChildCell(column, item, index, itemIndex))}
                    </tr>
                  )) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>

        {!groupedRows.length && (
          <div className="pointer-events-none sticky left-0 flex h-[180px] w-full items-center justify-center">
            <div className="rounded-md border border-slate-100 bg-white px-5 py-3 text-center text-xs font-semibold text-slate-400 shadow-xs">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-200 border-t-orange-500" />
                  Loading dashboard...
                </span>
              ) : (
                "No production notes found for selected filters."
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default LifecycleOrderTable;
