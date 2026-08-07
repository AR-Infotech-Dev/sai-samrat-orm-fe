import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModulePageLayout from "@shared/ModulePageLayout";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Factory,
  Hourglass,
  PackageCheck,
  RefreshCw,
  RotateCcw,
  Search,
  ShoppingCart,
  Truck,
  Wrench,
} from "lucide-react";
import SmartSelectInput from "@/components/form-inputs/smartSelectInput";
import BottleneckBoard from "./components/BottleneckBoard";
import CriticalAlertsPanel from "./components/CriticalAlertsPanel";
import DispatchDueTable from "./components/DispatchDueTable";
import OperationsActionCards from "./components/OperationsActionCards";
import OrderFlowPipeLine from "./components/OrderFlowPipeLine";
import PmkPendingChart from "./components/PmkPendingChart";
import ProductLoadTable from "./components/ProductLoadTable";
import ProductionReadyTrendChart from "./components/ProductionReadyTrendChart";
import { getDashboard } from "./data/dashboard.service";
import { customerSmartSelectConfig, orderSmartSelectConfig, productSmartSelectConfig } from "./utils/dashboard.utils";
import { buildDashboardNavigationState, getBottleneckAction, getDashboardAction } from "./utils/dashboardActions";
import "./styles/dashboard.css";

const initialFilters = {
  customer_id: "",
  product_id: "",
  order_id: "",
  from_date: "",
  to_date: "",
  stage: "",
};

const iconByKey = {
  total_orders: ShoppingCart,
  total_order_qty: PackageCheck,
  ready_qty: CheckCircle2,
  dispatched_qty: Truck,
  ready_pending_dispatch_qty: Clock3,
  pending_qty: Hourglass,
  pmk_procure_qty: Factory,
  saipl_mfg_qty: Wrench,
  booked: ShoppingCart,
  confirmed: CheckCircle2,
  planning: CalendarDays,
  production: Factory,
  ready: PackageCheck,
  dispatch: Truck,
  high_priority: AlertTriangle,
  hold_orders: Clock3,
  waiting_customer: Hourglass,
  dispatch_due: Truck,
};

const shortNumber = (value) => {
  const number = Number(value || 0);
  if (Math.abs(number) >= 100000) return `${Math.round((number / 100000) * 10) / 10}L`;
  if (Math.abs(number) >= 1000) return `${Math.round((number / 1000) * 10) / 10}k`;
  return number.toLocaleString("en-IN", { maximumFractionDigits: 2 });
};

const cleanFilters = (filters = {}) => Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== "" && value !== null && value !== undefined));

function Dashboard() {
  const navigate = useNavigate();
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

  const goToDashboardAction = (card) => {
    const action = getDashboardAction(card?.key);
    if (!action?.path) return;
    navigate(action.path, {
      state: buildDashboardNavigationState({
        source: `dashboard:${card.key}`,
        title: card.label,
        filters: action.filters,
      }),
    });
  };

  const goToBottleneckAction = (row) => {
    const action = getBottleneckAction(row?.stage);
    if (!action?.path) return;
    navigate(action.path, {
      state: buildDashboardNavigationState({
        source: `bottleneck:${row.stage}`,
        title: row.stage,
        filters: action.filters,
      }),
    });
  };

  useEffect(() => {
    loadDashboard(initialFilters);
  }, []);

  const pipeline = useMemo(() => (Array.isArray(dashboardData?.pipeline) ? dashboardData.pipeline : []), [dashboardData]);
  const actionKpis = useMemo(() => (Array.isArray(dashboardData?.actionKpis) ? dashboardData.actionKpis : []), [dashboardData]);
  const bottleneckBoard = useMemo(() => (Array.isArray(dashboardData?.bottleneckBoard) ? dashboardData.bottleneckBoard : []), [dashboardData]);
  const productLoad = useMemo(() => (Array.isArray(dashboardData?.productLoad) ? dashboardData.productLoad : []), [dashboardData]);
  const criticalAlerts = useMemo(() => (Array.isArray(dashboardData?.criticalAlerts) ? dashboardData.criticalAlerts : []), [dashboardData]);
  const productionReadyTrend = useMemo(() => (Array.isArray(dashboardData?.productionReadyTrend) ? dashboardData.productionReadyTrend : []), [dashboardData]);
  const pmkPending = useMemo(() => (Array.isArray(dashboardData?.pmkPending) ? dashboardData.pmkPending : []), [dashboardData]);
  const dispatchDue = useMemo(() => (Array.isArray(dashboardData?.dispatchDue) ? dashboardData.dispatchDue : []), [dashboardData]);

  return (
    <ModulePageLayout
      title="Operations Control Dashboard"
      description="Find bottlenecks across confirmation, planning, production, ready stock and dispatch."
    >
      <div className="space-y-3">
        <div className="dashboard-filters rounded-md ">
          <SmartSelectInput id="order_id" field={{ label: "Order" }} value={filters.order_id} config={orderSmartSelectConfig} onSelect={(value) => updateFilter("order_id", value)} />
          <SmartSelectInput id="customer_id" field={{ label: "Customer" }} value={filters.customer_id} config={customerSmartSelectConfig} onSelect={(value) => updateFilter("customer_id", value)} />
          <SmartSelectInput id="product_id" field={{ label: "Product" }} value={filters.product_id} config={productSmartSelectConfig} onSelect={(value) => updateFilter("product_id", value)} />
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
            <select value={filters.stage} onChange={(event) => updateFilter("stage", event.target.value)}>
              <option value="">All Stages</option>
              <option value="waiting">Waiting Confirmation</option>
              <option value="confirmed">Confirmed</option>
              <option value="planning">Planning</option>
              <option value="planned">Planned</option>
              <option value="production">Production</option>
              <option value="ready">Ready</option>
              <option value="dispatch">Dispatch</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </label>
          <div className="dashboard-filter-actions">
            <button type="button" className="primary" disabled={loading} onClick={() => loadDashboard(filters)}>
              <Search size={13} />
              {loading ? "Loading" : "Generate"}
            </button>
            <button type="button" disabled={loading} onClick={handleReset}>
              <RotateCcw size={13} />
              Reset
            </button>
            <button type="button" onClick={() => loadDashboard(filters)} disabled={loading} title="Refresh dashboard">
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span className="dashboard-action-text">Refresh</span>
            </button>
            <button type="button" disabled={loading} title="Export coming soon">
              <Download size={13} />
            </button>
          </div>
        </div>

        {error ? <div className="rounded-sm border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-500">{error}</div> : null}
        {dashboardData?.meta?.usesDispatchTables === false ? <div className="rounded-sm border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-600">Dispatch tables not found, dispatch qty is shown as 0.</div> : null}

        <OperationsActionCards cards={actionKpis} onAction={goToDashboardAction} />
        <OrderFlowPipeLine steps={pipeline.map((step) => ({ title: step.label, value: `${step.displayValue || shortNumber(step.value)} Qty`, subLabel: step.subLabel, orderCount: step.orderCount, icon: iconByKey[step.key], tone: step.tone }))} loading={loading} />

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_1fr_0.75fr]">
        {/* <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.05fr_1.05fr_0.95fr]"> */}
          <BottleneckBoard rows={bottleneckBoard} onAction={goToBottleneckAction} />
          <ProductLoadTable rows={productLoad} />
          <ProductionReadyTrendChart rows={productionReadyTrend} />

        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.50fr_1.05fr_1.05fr]">
          <DispatchDueTable rows={dispatchDue} />
          <PmkPendingChart rows={pmkPending} />
          <CriticalAlertsPanel alerts={criticalAlerts} />
        </div>
      </div>
    </ModulePageLayout>
  );
}

export default Dashboard;
