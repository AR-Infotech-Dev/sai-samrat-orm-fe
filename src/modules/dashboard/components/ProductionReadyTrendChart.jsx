import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Tooltip } from "chart.js";
import { Chart } from "react-chartjs-2";
import EmptyPanel from "./EmptyPanel";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

const short = (value) => {
  const n = Number(value || 0);
  if (Math.abs(n) >= 1000) return `${Math.round((n / 1000) * 10) / 10}k`;
  return n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
};

function ProductionReadyTrendChart({ rows = [] }) {
  const data = {
    labels: rows.map((r) => r.label),
    datasets: [
      { type: "bar", label: "Produced Qty", data: rows.map((r) => Number(r.producedQty || 0)), backgroundColor: "rgba(59, 130, 246, .65)", borderRadius: 6, maxBarThickness: 18 },
      { type: "line", label: "Ready Qty", data: rows.map((r) => Number(r.readyQty || 0)), borderColor: "#ff6b00", backgroundColor: "#ff6b00", tension: .35, pointRadius: 2 },
    ],
  };
  const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { boxWidth: 8, font: { size: 10 } } }, tooltip: { displayColors: false } }, scales: { x: { grid: { display: false }, ticks: { font: { size: 9 }, color: "#64748b" } }, y: { beginAtZero: true, border: { display: false }, grid: { color: "rgba(226,232,240,.7)" }, ticks: { font: { size: 9 }, callback: short } } } };
  return <section className="rounded-sm border border-orange-100 bg-white p-2 shadow-xs"><h3 className="mb-2 text-sm font-black text-slate-800">Production vs Ready</h3><div className="h-[175px]">{rows.length ? <Chart type="bar" data={data} options={options} /> : <EmptyPanel title="No trend data." />}</div></section>;
}

export default ProductionReadyTrendChart;
