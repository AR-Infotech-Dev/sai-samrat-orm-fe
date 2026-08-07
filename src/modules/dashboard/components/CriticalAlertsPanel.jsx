import { AlertTriangle, ArrowRight, CalendarClock, PackageCheck, Truck } from "lucide-react";

const icons = { overdue: AlertTriangle, planning_delay: CalendarClock, pmk_pending: PackageCheck, dispatch_due: Truck };
const tones = {
  red: "border-red-200 bg-red-50/90 text-red-500",
  blue: "border-blue-200 bg-blue-50/90 text-blue-600",
  amber: "border-amber-200 bg-amber-50/90 text-amber-600",
  green: "border-emerald-200 bg-emerald-50/90 text-emerald-600",
};
const fmt = (value) => Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

function CriticalAlertsPanel({ alerts = [] }) {
  return (
    <section className="rounded-md border border-orange-100 bg-white px-3 pb-3 shadow-xs">
      <div className=" flex h-9 items-center justify-between">
        <h3 className="text-sm font-black text-slate-800">Critical Alerts</h3>
        <span className="text-[10px] font-black uppercase text-orange-500">Live</span>
      </div>
      <div className="space-y-2">
        {alerts.map((alert) => {
          const Icon = icons[alert.key] || AlertTriangle;
          return (
            <div key={alert.key} className={`rounded-md border px-3 py-2 ${tones[alert.tone] || tones.amber}`}>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/80 shadow-xs"><Icon size={18} /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-black text-slate-700">{alert.title}: {fmt(alert.value)}</p>
                    <span className="inline-flex items-center gap-1 whitespace-nowrap text-[10px] font-black text-orange-600">{alert.action}<ArrowRight size={11} /></span>
                  </div>
                  <p className="truncate text-[10px] font-semibold text-slate-500">{alert.description}</p>
                </div>
              </div>
            </div>
          );
        })}
        {!alerts.length ? <div className="rounded-md border border-slate-100 bg-slate-50 p-4 text-center text-xs font-semibold text-slate-400">No critical alerts.</div> : null}
      </div>
    </section>
  );
}

export default CriticalAlertsPanel;
