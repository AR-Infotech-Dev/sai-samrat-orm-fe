import { Eye } from "lucide-react";

function OrderTableRow({ row, index, columns, table, onView, onQuickAction, quickActionLoadingId }) {
  const rowKey = table.getRowIdentifier(row) ?? row?.name ?? index;
  const isActionLoading = String(quickActionLoadingId || "") === String(row?.order_id || "");

  return (
    <tr key={rowKey} className="group">
      {columns.map((column) => (
        <td
          key={column.key}
          className={`${column.className || ""} ${column.isActionsColumn ? "table-actions-cell" : ""}`.trim()}
          style={table.getCellStyle(column)}
          onClick={table.getRowClick(column, row)}
        >
          {column.isActionsColumn ? (
            <div className="flex h-8 items-center justify-end gap-1.5">
              <button type="button" disabled={isActionLoading} onClick={() => onView(row)} className="inline-flex h-6 items-center gap-1 rounded-sm border border-blue-200 bg-blue-50 px-2 text-xs font-semibold text-blue-600 hover:bg-blue-100 disabled:opacity-60">
                <Eye size={13} /> View
              </button>
              <button type="button" disabled={isActionLoading} onClick={() => onQuickAction(row, "confirm")} className="inline-flex h-6 items-center rounded-sm border border-emerald-200 bg-emerald-50 px-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-100 disabled:opacity-60">
                {isActionLoading ? "..." : "Confirm"}
              </button>
              <button type="button" disabled={isActionLoading} onClick={() => onQuickAction(row, "hold")} className="inline-flex h-6 items-center rounded-sm border border-amber-200 bg-amber-50 px-2 text-xs font-semibold text-amber-600 hover:bg-amber-100 disabled:opacity-60">
                Hold
              </button>
            </div>
          ) : table.renderCell(column, row, index)}
        </td>
      ))}
      <td></td>
    </tr>
  );
}

export default OrderTableRow;
