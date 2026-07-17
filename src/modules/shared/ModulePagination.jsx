
function buildPages(page, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 3) {
    return [1, 2, 3, 4, "...", totalPages];
  }

  if (page >= totalPages - 2) {
    return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", page - 1, page, page + 1, "...", totalPages];
}

function ModulePagination({ pagination = {}, onPageChange }) {
  const { page = 1, totalPages = 1, start = 0, end = 0, total = 0 } = pagination;

  // if (totalPages <= 1) return null;

  const pages = buildPages(page, totalPages);

  return (
    <div className="module-pagination">
      <div className="module-pagination-summary transition-opacity duration-300">Showing {start} to {end} of {total} entries</div>
      {totalPages >= 1 &&
        <div className="module-pagination-controls">
          <button className={`pagination-button ${page <= 1 && "muted"}`} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Prev</button>
          {pages.map((item, index) =>
            item === "..." ? (
              <span key={`ellipsis-${index}`} className="px-2 text-muted">
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={`pagination-button  ${item === page ? "active" : "btn-light"}`}
                onClick={() => onPageChange(item)}
              >
                {item}
              </button>
            )
          )}
          <button className={`pagination-button ${page >= totalPages && "muted"}`} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</button>
        </div>
      }
    </div>
  );
}
export default ModulePagination;