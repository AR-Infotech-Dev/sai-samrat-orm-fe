function ProformaTableRow({ row, index, columns, table }) {
  const rowKey = table.getRowIdentifier(row) ?? row?.pi_no ?? index;
  return (
    <tr key={rowKey} className="group">
      {columns.map((column) => (
        <td
          key={column.key}
          className={`${column.className || ""}`.trim()}
          style={table.getCellStyle(column)}
          onClick={table.getRowClick(column, row)}
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
