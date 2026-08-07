import { CheckCircle2, Clock3, Factory, Warehouse } from "lucide-react";

const planningItems = [
  {
    label: "SAIPL MFG Qty",
    value: "550",
    icon: Factory,
    tone: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "PMK Procure Qty",
    value: "350",
    icon: Warehouse,
    tone: "bg-orange-50 text-orange-500",
  },
  {
    label: "Ready Qty",
    value: "300",
    icon: CheckCircle2,
    tone: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Pending Qty",
    value: "950",
    icon: Clock3,
    tone: "bg-red-50 text-red-500",
    valueClassName: "text-red-500",
  },
];

function OrderPlanningSplit() {
  return (
    <section className="shrink-0 rounded-sm border border-slate-100 bg-white px-3 py-2.5 shadow-sm">
      <div className="mb-2 flex items-center gap-1.5">
        <h2 className="text-sm font-semibold text-slate-500">Planning Split</h2>
        <span className="text-[11px] text-slate-400">(Auto calculated)</span>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {planningItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${item.tone}`}>
                <Icon size={18} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-400">{item.label}</p>
                <p className={`text-lg font-bold text-slate-700 ${item.valueClassName || ""}`}>{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default OrderPlanningSplit;
