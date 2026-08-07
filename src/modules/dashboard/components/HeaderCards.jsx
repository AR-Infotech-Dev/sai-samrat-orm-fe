import { ShoppingCart } from "lucide-react";

const toneClasses = {
  orange: "border-orange-100 bg-orange-50 text-orange-600",
  green: "border-emerald-100 bg-emerald-50 text-emerald-600",
  amber: "border-amber-100 bg-amber-50 text-amber-600",
  purple: "border-violet-100 bg-violet-50 text-violet-600",
  red: "border-red-100 bg-red-50 text-red-500",
};

function HeaderCards({ title = "-", icon: Icon = ShoppingCart, value = "-", tone = "orange", delta, trend, loading = false }) {
  if (loading) {
    return (
      <div className="h-[66px] animate-pulse rounded-sm border border-orange-100 bg-white p-2 shadow-xs">
        <div className="flex h-full items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-orange-50" />
          <div className="flex-1 space-y-2">
            <div className="h-2 w-16 rounded bg-slate-100" />
            <div className="h-4 w-12 rounded bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  const down = trend === "down";

  return (
    <div className="h-[66px] rounded-sm border border-orange-100 bg-white p-2 shadow-xs transition hover:border-orange-200 hover:shadow-sm">
      <div className="flex h-full items-center gap-2">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border ${toneClasses[tone] || toneClasses.orange}`}>
          <Icon size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold text-slate-400">{title}</p>
          <p className="text-lg font-black leading-tight text-slate-800">{value}</p>
          {delta != null ? (
            <p className={`truncate text-[9px] font-bold ${down ? "text-red-500" : "text-emerald-600"}`}>
              {down ? "▼" : "▲"} {delta}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default HeaderCards;