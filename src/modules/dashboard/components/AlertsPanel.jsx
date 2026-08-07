import { AlertTriangle, Clock3, Hourglass, Truck } from "lucide-react";
import EmptyPanel from "./EmptyPanel";

const iconByKey = {
  high_priority: AlertTriangle,
  hold_orders: Clock3,
  waiting_customer: Hourglass,
  dispatch_due: Truck,
};

const toneClass = {
  red: "border-red-100 bg-red-50 text-red-500",
  orange: "border-orange-100 bg-orange-50 text-orange-600",
  amber: "border-amber-100 bg-amber-50 text-amber-600",
};

const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

function AlertsPanel({ alerts = [] }) {
  return (
    <section className="rounded-sm border border-orange-100 bg-white p-2 shadow-xs">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Priority & Delay</h3>
        <span className="text-[10px] font-bold uppercase text-orange-400">Live</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {alerts.map((item) => {
          const Icon = iconByKey[item.key] || AlertTriangle;
          return (
            <div key={item.key} className={`rounded-sm border p-2 ${toneClass[item.tone] || toneClass.orange}`}>
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white/70">
                  <Icon size={14} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-bold text-slate-500">{item.label}</p>
                  <p className="text-lg font-black text-slate-800">{formatNumber(item.value)}</p>
                </div>
              </div>
              <p className="mt-1 truncate text-[10px] font-medium text-slate-400">{item.note}</p>
            </div>
          );
        })}
        {!alerts.length && <div className="col-span-2"><EmptyPanel title="No alerts found." /></div>}
      </div>
    </section>
  );
}

export default AlertsPanel;