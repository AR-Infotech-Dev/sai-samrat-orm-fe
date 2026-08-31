import { useEffect, useState } from "react";
import ModulePageLayout from "@shared/ModulePageLayout";
import { Download, RefreshCw, RotateCcw, Search } from "lucide-react";
import SmartSelectInput from "@/components/form-inputs/smartSelectInput";
import LifecycleOrderTable from "./components/LifecycleOrderTable";
import { getDashboard } from "./data/dashboard.service";
import { customerSmartSelectConfig, orderSmartSelectConfig, productSmartSelectConfig } from "./utils/dashboard.utils";
import "./styles/dashboard.css";

const initialFilters = {
  customer_id: "",
  product_id: "",
  order_id: "",
  from_date: "",
  to_date: "",
  stage: "all",
};

const cleanFilters = (filters = {}) => Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== "" && value !== null && value !== undefined && value !== "all"));

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <ModulePageLayout title="Order Lifecycle Dashboard" description="Track confirmation, planning, production, ready stock and dispatch in one simple view.">
      <div className="space-y-2">
        <div className="dashboard-filters rounded-sm border border-orange-100 bg-white shadow-xs">
          <SmartSelectInput id="order_id" field={{ label: "Order" }} value={filters.order_id} config={orderSmartSelectConfig} onSelect={(value) => updateFilter("order_id", value)} />
          <SmartSelectInput id="customer_id" field={{ label: "Customer" }} value={filters.customer_id} config={customerSmartSelectConfig} onSelect={(value) => updateFilter("customer_id", value)} />
          <SmartSelectInput id="product_id" field={{ label: "Product / Model" }} value={filters.product_id} config={productSmartSelectConfig} onSelect={(value) => updateFilter("product_id", value)} />
          <label>
            <span>From Date</span>
            <input type="date" value={filters.from_date} onChange={(event) => updateFilter("from_date", event.target.value)} />
          </label>
          <label>
            <span>To Date</span>
            <input type="date" value={filters.to_date} onChange={(event) => updateFilter("to_date", event.target.value)} />
          </label>
          <label>
            <span>Stage</span>
            <select value={filters.stage} onChange={(event) => handleTabChange(event.target.value)}>
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

        <LifecycleOrderTable data={dashboardData} loading={loading} activeTab={filters.stage || "all"} onTabChange={handleTabChange} />
      </div>
    </ModulePageLayout>
  );
}

export default Dashboard;

