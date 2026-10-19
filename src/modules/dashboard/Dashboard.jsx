import { useEffect, useState } from "react";
import ModulePageLayout from "@shared/ModulePageLayout";
import { RefreshCw, RotateCcw, Search } from "lucide-react";
import SmartSelectInput from "@/components/form-inputs/smartSelectInput";
import { useAuth } from "@auth/components/AuthProvider";
import ColumnArranger from "@/components/table/ColumnArranger";
import LifecycleOrderTable, {
  getDashboardColumnStorageKey,
  getStoredVisibleColumnKeys,
  normalizeVisibleColumnKeys,
  setStoredVisibleColumnKeys,
  tableColumns,
} from "./components/LifecycleOrderTable";
import { getDashboard } from "./data/dashboard.service";
import { customerSmartSelectConfig, orderSmartSelectConfig, productSmartSelectConfig } from "./utils/dashboard.utils";
import "./styles/dashboard.css";

const initialFilters = {
  customer_id: "",
  product_id: "",
  production_code: "",
  from_date: "",
  to_date: "",
  stage: "all",
};

const cleanFilters = (filters = {}) => Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== "" && value !== null && value !== undefined && value !== "all"));

function Dashboard() {
  const { authSession } = useAuth();
  const roleSlug = authSession?.user?.role_slug || "user";
  const columnStorageKey = getDashboardColumnStorageKey(roleSlug);
  const [dashboardData, setDashboardData] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleColumnKeys, setVisibleColumnKeys] = useState(() => {
    const storedKeys = getStoredVisibleColumnKeys(getDashboardColumnStorageKey(roleSlug));
    return normalizeVisibleColumnKeys(storedKeys, roleSlug);
  });
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value || "" }));

  const loadDashboard = async (nextFilters = filters) => {
    setLoading(true);
    setError("");
    const res = await getDashboard(cleanFilters(nextFilters));
    if (res?.success) {
      setDashboardData(res.data?.data || res.data || {});
    } else {
      setDashboardData({});
      setError(res?.message || "Unable to load dashboard data");
    }
    setLoading(false);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    loadDashboard(initialFilters);
  };

  const handleTabChange = (stage) => {
    const nextFilters = { ...filters, stage };
    setFilters(nextFilters);
    loadDashboard(nextFilters);
  };


  useEffect(() => {
    loadDashboard(initialFilters);
  }, []);

  useEffect(() => {
    const storedKeys = getStoredVisibleColumnKeys(columnStorageKey);
    setVisibleColumnKeys(normalizeVisibleColumnKeys(storedKeys, roleSlug));
  }, [columnStorageKey, roleSlug]);

  const handleApplyColumnKeys = (nextColumnKeys = []) => {
    const normalizedKeys = normalizeVisibleColumnKeys(nextColumnKeys, roleSlug);
    setVisibleColumnKeys(normalizedKeys);
    setStoredVisibleColumnKeys(columnStorageKey, normalizedKeys);
  };

  return (
    <ModulePageLayout controlsCardClassName="dashboard-module-card">
      <div className="dashboard-page-content relative flex h-full min-h-0 flex-col gap-0.5">
        <ColumnArranger
          setIsColumnMenuOpen={setIsColumnMenuOpen}
          isColumnMenuOpen={isColumnMenuOpen}
          columns={tableColumns}
          visibleColumnKeys={visibleColumnKeys}
          onApplyColumnKeys={handleApplyColumnKeys}
        />
        <div className="dashboard-filters rounded-sm border border-slate-100 bg-white p-2 shadow-xs mb-0.5">
          <SmartSelectInput id="production_note_id" value={filters.production_code} config={orderSmartSelectConfig} onSelect={(value) => updateFilter("production_note_id", value)} />
          <SmartSelectInput id="customer_id" value={filters.customer_id} config={customerSmartSelectConfig} onSelect={(value) => updateFilter("customer_id", value)} />
          <SmartSelectInput id="product_id" value={filters.product_id} config={productSmartSelectConfig} onSelect={(value) => updateFilter("product_id", value)} />
          <label>
            {/* <span>From Date</span> */}
            <input type={filters.from_date ? "date" : "text"} placeholder="From Date" aria-label="From Date" onFocus={(event) => { event.currentTarget.type = "date"; }} onClick={(event) => { event.currentTarget.type = "date"; event.currentTarget.showPicker?.(); }} onBlur={(event) => { if (!event.currentTarget.value) event.currentTarget.type = "text"; }} value={filters.from_date} onChange={(event) => updateFilter("from_date", event.target.value)} />
          </label>
          <label>
            {/* <span>To Date</span> */}
            <input type={filters.to_date ? "date" : "text"} placeholder="To Date" aria-label="To Date" onFocus={(event) => { event.currentTarget.type = "date"; }} onClick={(event) => { event.currentTarget.type = "date"; event.currentTarget.showPicker?.(); }} onBlur={(event) => { if (!event.currentTarget.value) event.currentTarget.type = "text"; }} value={filters.to_date} onChange={(event) => updateFilter("to_date", event.target.value)} />
          </label>
          <label>
            {/* <span>Stage</span> */}
            <select value={filters.stage} onChange={(event) => handleTabChange(event.target.value)}>
              <option value="">Stage</option>
              <option value="all">All Stages</option>
              <option value="confirmation">Confirmation</option>
              <option value="planning">Planning</option>
              <option value="production">Production</option>
              <option value="ready_stock">Ready Stock</option>
              <option value="dispatch">Dispatch</option>
            </select>
          </label>
          <div className="dashboard-filter-actions">
            <button type="button" className="primary" disabled={loading} onClick={() => loadDashboard(filters)}>
              <Search size={13} /> {loading ? "Loading" : "Apply"}
            </button>
            <button type="button" disabled={loading} onClick={handleReset}>
              <RotateCcw size={13} /> Reset
            </button>
            <button type="button" onClick={() => loadDashboard(filters)} disabled={loading} title="Refresh dashboard">
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            {/* <button type="button" className="hidden" disabled={loading} title="Export coming soon">
              <Download size={13} /> Export
            </button> */}
          </div>
        </div>
        {error ? <div className="rounded-sm border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-500">{error}</div> : null}
        {dashboardData?.meta?.usesDispatchTables === false ? <div className="rounded-sm border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-600">Dispatch tables not found, dispatch qty is shown as 0.</div> : null}
        <LifecycleOrderTable
          data={dashboardData}
          loading={loading}
          activeTab={filters.stage || "all"}
          onTabChange={handleTabChange}
          roleSlug={roleSlug}
          visibleColumnKeys={visibleColumnKeys}
          onToggleColumnMenu={() => setIsColumnMenuOpen((current) => !current)}
        />
      </div>
    </ModulePageLayout>
  );
}

export default Dashboard;

