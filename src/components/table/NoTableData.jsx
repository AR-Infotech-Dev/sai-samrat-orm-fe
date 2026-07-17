import { Database, SearchX } from "lucide-react";

function NoTableData({ colSpan = 1 }) {
  return (
    <tr className="w-full" style={{ width: '100%' }} >
      <td colSpan={colSpan} className="table-empty-cell">
        <div className="table-empty-state">
          <div className="table-empty-visual">
            <span className="table-empty-orb table-empty-orb-left" />
            <span className="table-empty-orb table-empty-orb-right" />
            <div className="table-empty-icon-shell">
              <Database size={22} />
              <span className="table-empty-search-badge">
                <SearchX size={12} />
              </span>
            </div>
          </div>
          <div className="table-empty-copy">
            <h3>No Data Found</h3>
            <p>No records match the current view. Try adjusting filters, search, or visible columns.</p>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default NoTableData;
