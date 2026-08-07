import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import EmptyPanel from "./EmptyPanel";

ChartJS.register(ArcElement, Tooltip, Legend);

const shortNumber = (value) => {
  const number = Number(value || 0);
  if (Math.abs(number) >= 100000) return `${Math.round((number / 100000) * 10) / 10}L`;
  if (Math.abs(number) >= 1000) return `${Math.round((number / 1000) * 10) / 10}k`;
  return number.toLocaleString("en-IN", { maximumFractionDigits: 2 });
};

function SeriesMixChart({ series = [] }) {
  const total = series.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  const data = {
    labels: series.map((item) => item.label),
    datasets: [
      {
        data: series.map((item) => Number(item.qty || 0)),
        backgroundColor: series.map((item) => item.color || "#ff8d4b"),
        borderColor: "#ffffff",
        borderWidth: 3,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "66%",
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${shortNumber(ctx.raw)}` } },
    },
  };

  return (
    <section className="rounded-sm border border-orange-100 bg-white p-2 shadow-xs">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Series Mix</h3>
        <span className="text-[10px] font-bold uppercase text-slate-400">{shortNumber(total)} qty</span>
      </div>

      {series.length ? (
        <div className="grid grid-cols-[105px_1fr] items-center gap-3">
          <div className="relative h-[105px]">
            <Doughnut data={data} options={options} />
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <span className="text-xs font-black text-slate-700">{shortNumber(total)}</span>
            </div>
          </div>
          <div className="min-w-0 space-y-2">
            {series.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-[11px]">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color || "#ff8d4b" }} />
                <span className="flex-1 truncate font-medium text-slate-500">{item.label}</span>
                <span className="font-bold text-slate-700">{item.displayQty || shortNumber(item.qty)}</span>
                <span className="w-8 text-right text-slate-400">{item.pct || 0}%</span>
              </div>
            ))}
          </div>
        </div>
      ) : <EmptyPanel title="No series data." />}
    </section>
  );
}

export default SeriesMixChart;