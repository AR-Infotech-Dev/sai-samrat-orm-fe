export function paginateRows(rows = [], page = 1, pageSize = 20) {
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);

  return {
    paginatedRows: rows.slice(startIndex, endIndex),
    pagination: {
      page: safePage,
      totalPages,
      total,
      start: total === 0 ? 0 : startIndex + 1,
      end: endIndex,
    },
  };
}
