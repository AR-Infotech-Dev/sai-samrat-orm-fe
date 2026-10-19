function ProformaTableRow({ row, index, columns, table, onEdit }) {
  const rowKey = table.getRowIdentifier(row) ?? row?.pi_no ?? index;
  return (
    <tr key={rowKey} className="group">
      {columns.map((column) => (
        <td
          key={column.key}
          className={`${column.className || ""} ${column.isActionsColumn ? "table-actions-cell" : ""}`.trim()}
          style={table.getCellStyle(column)}
          onClick={!column.isActionsColumn && !column.checkbox ? onEdit : undefined}
        >
          {column.isActionsColumn
            ? table.renderActionCell(row, index)
            : table.renderCell(column, row, index)}
        </td>
      ))}
      <td />
    </tr>
  );
}

export default ProformaTableRow;
