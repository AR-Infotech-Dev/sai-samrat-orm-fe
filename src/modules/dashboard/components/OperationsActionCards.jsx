import { AlertTriangle, ArrowRight, Boxes, CalendarClock, Factory, Hourglass, PackageCheck } from "lucide-react";

const icons = {
  waiting_confirmation: Hourglass,
  planning_pending: CalendarClock,
  production_pending: Factory,
  ready_pending_dispatch: PackageCheck,
  pmk_pending: Boxes,
  overdue_orders: AlertTriangle,
};

const tones = {
  amber: { card: "from-amber-50 to-white border-amber-100", icon: "bg-amber-500 text-white shadow-amber-100", link: "text-amber-600" },
  blue: { card: "from-blue-50 to-white border-blue-100", icon: "bg-blue-600 text-white shadow-blue-100", link: "text-blue-600" },
  purple: { card: "from-violet-50 to-white border-violet-100", icon: "bg-violet-600 text-white shadow-violet-100", link: "text-violet-600" },
  green: { card: "from-emerald-50 to-white border-emerald-100", icon: "bg-emerald-600 text-white shadow-emerald-100", link: "text-emerald-700" },
  cyan: { card: "from-cyan-50 to-white border-cyan-100", icon: "bg-cyan-600 text-white shadow-cyan-100", link: "text-cyan-700" },
  red: { card: "from-red-50 to-white border-red-100", icon: "bg-red-500 text-white shadow-red-100", link: "text-red-500" },
};

const formatValue = (value) => Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const getSubText = (card) => card.subValue || (card.key === "ready_pending_dispatch" ? "Qty ready, not dispatched" : "Orders pending");

function OperationsActionCards({ cards = [], onAction }) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = icons[card.key] || Hourglass;
        const tone = tones[card.tone] || tones.amber;
        return (
          <button type="button" key={card.key} onClick={() => onAction?.(card)} className={`min-h-[82px] w-full rounded-md border bg-gradient-to-br text-left ${tone.card} px-3 py-2 shadow-xs transition hover:-translate-y-0.5 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-200`}>
            <div className="flex h-full items-center gap-3">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg shadow-lg ${tone.icon}`}>
                <Icon size={18} strokeWidth={1.2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[9px] font-extrabold text-slate-600">{card.label}</p>
                <p className="text-lg font-black leading-none text-slate-900">{formatValue(card.value)}</p>
                <div className="mt-1 flex items-center justify-between gap-2 border-t border-white/70 pt-1">
                  <span className="truncate text-[10px] font-bold text-slate-500">{getSubText(card)}</span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black ${tone.link}`}>View <ArrowRight size={11} /></span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default OperationsActionCards;
