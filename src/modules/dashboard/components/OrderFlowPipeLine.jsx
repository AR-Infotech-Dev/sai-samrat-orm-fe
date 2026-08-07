import React from "react";
import { ArrowRight, CalendarDays, CheckCircle2, Factory, PackageCheck, ShoppingCart, Truck } from "lucide-react";

const defaultSteps = [
  { title: "Booked", value: "0 Qty", subLabel: "0 Orders", icon: ShoppingCart, tone: "orange" },
  { title: "Confirmed", value: "0 Qty", subLabel: "0 Orders", icon: CheckCircle2, tone: "amber" },
  { title: "Planning", value: "0 Qty", subLabel: "0 Orders", icon: CalendarDays, tone: "blue" },
  { title: "Production", value: "0 Qty", subLabel: "0 Orders", icon: Factory, tone: "purple" },
  { title: "Ready", value: "0 Qty", subLabel: "0 Orders", icon: PackageCheck, tone: "green" },
  { title: "Dispatch", value: "0 Qty", subLabel: "0 Orders", icon: Truck, tone: "cyan" },
];

const toneClasses = {
  orange: "border-orange-100 bg-orange-50 text-orange-600",
  amber: "border-amber-100 bg-amber-50 text-amber-600",
  blue: "border-blue-100 bg-blue-50 text-blue-600",
  purple: "border-violet-100 bg-violet-50 text-violet-600",
  green: "border-emerald-100 bg-emerald-50 text-emerald-600",
  cyan: "border-cyan-100 bg-cyan-50 text-cyan-600",
};

const PipelineArrow = ({ delay = 0 }) => (
  <div className="relative hidden h-[54px] min-w-10 flex-1 items-center md:flex">
    <div className="relative h-[2px] w-full overflow-hidden bg-slate-300">
      <span className="pipeline-runner absolute left-0 top-1/2 h-full w-10 -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-orange-500 to-transparent" style={{ animationDelay: `${delay}s` }} />
    </div>
    <ArrowRight className="absolute right-[-2px] top-1/2 -translate-y-1/2 text-slate-600" size={16} strokeWidth={2.4} />
  </div>
);

const PipeCard = ({ title, value, subLabel, icon: Icon = ShoppingCart, tone = "orange" }) => (
  <div className="relative z-10 flex min-w-[140px] shrink-0 items-center gap-2 px-1 py-1 transition hover:-translate-y-0.5">
    <div className={`grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full border shadow-inner ${toneClasses[tone] || toneClasses.orange}`}>
      <Icon size={24} strokeWidth={2.25} />
    </div>
    <div className="min-w-0">
      <span className="block truncate text-[10px] font-extrabold text-slate-600">{title || "-"}</span>
      <span className="block text-[16px] font-black leading-none text-slate-900">{value ?? "0 Qty"}</span>
      <span className="block truncate text-[10px] font-semibold text-slate-500">{subLabel || "0 Orders"}</span>
    </div>
  </div>
);

function OrderFlowPipeLine({ steps = [], loading = false }) {
  const rows = steps.length ? steps : defaultSteps;
  const delayGap = 1.4;

  return (
    <div className="w-full rounded-md border border-orange-100 bg-gradient-to-br from-cyan-50 to-white border-cyan-100 px-3 py-2 shadow-xs">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-sm font-black capitalize text-slate-800">Order Flow Pipeline</p>
        <span className="text-[8px] font-bold uppercase text-slate-400">Qty + Orders</span>
      </div>
      <div className="flex min-h-[74px] items-center overflow-x-auto px-2 pb-1 [scrollbar-width:thin]">
        {rows.map((step, index) => (
          <React.Fragment key={`${step.title}-${index}`}>
            <PipeCard {...step} active={!loading} />
            {index !== rows.length - 1 && <PipelineArrow delay={index * delayGap} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default OrderFlowPipeLine;
