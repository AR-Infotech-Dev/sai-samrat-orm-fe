const equalFilter = (field, value, type) => ({
  field,
  condition: "equal_to",
  value,
  ...(type ? { type } : {}),
});

export const dashboardActions = {
  waiting_confirmation: {
    path: "/order-confirmation",
    filters: [equalFilter("order_status", "waiting")],
  },
  planning_pending: {
    path: "/order-planning",
    filters: [equalFilter("planning_status", "not_planned")],
  },
  production_pending: {
    path: "/production",
    filters: [equalFilter("production_status", "not_started")],
  },
  ready_pending_dispatch: {
    path: "/ready-stock",
    filters: [equalFilter("ready_stock_status", "ready")],
  },
  pmk_pending: {
    path: "/order-planning",
    filters: [],
  },
  overdue_orders: {
    path: "/order-booking",
    filters: [],
  },
};

export const bottleneckActionByStage = {
  "Waiting Confirmation": dashboardActions.waiting_confirmation,
  "Planning Pending": dashboardActions.planning_pending,
  "Production Pending": dashboardActions.production_pending,
  "Ready Pending Dispatch": dashboardActions.ready_pending_dispatch,
  "PMK Pending": dashboardActions.pmk_pending,
  "Overdue Orders": dashboardActions.overdue_orders,
};

export const getDashboardAction = (key) => dashboardActions[key] || null;
export const getBottleneckAction = (stage) => bottleneckActionByStage[stage] || null;

export const buildDashboardNavigationState = ({ source, title, filters = [] } = {}) => ({
  dashboardFilters: filters,
  dashboardSource: source || "dashboard",
  dashboardTitle: title || "Dashboard Filter",
});
