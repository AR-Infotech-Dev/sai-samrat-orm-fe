import { isAmcActive } from "@utils/amc";

function OrderTableRow({ row, index, columns, table }) {
  const rowKey = table.getRowIdentifier(row) ?? row?.name ?? index;
  return (
    <tr key={rowKey} className={`group`}>
      {columns.map((column) => (
        <td
          key={column.key}
          className={`${column.className || ""} ${column.isActionsColumn ? "table-actions-cell" : ""}`.trim()}
          style={table.getCellStyle(column)}
          onClick={table.getRowClick(column, row)}
        >
          {column.isActionsColumn
            ? table.renderActionCell(row, index)
            : table.renderCell(column, row, index)}
        </td>
      ))}
      <td></td>
    </tr>
  );
}

export default OrderTableRow;
