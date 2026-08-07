import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";
import EmptyPanel from "./EmptyPanel";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);
const short = (value) => Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

function PmkPendingChart({ rows = [] }) {
  const data = { labels: rows.map((r) => r.name), datasets: [{ label: "PMK Pending", data: rows.map((r) => Number(r.qty || 0)), borderRadius: 7, maxBarThickness: 12, backgroundColor: "rgba(255, 109, 0, .82)" }] };
  const options = { indexAxis: "y", responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { displayColors: false } }, scales: { x: { beginAtZero: true, grid: { color: "rgba(226,232,240,.7)" }, ticks: { font: { size: 9 }, callback: short } }, y: { grid: { display: false }, ticks: { font: { size: 10, weight: 700 }, color: "#334155" } } } };
  return <section className="rounded-sm border border-orange-100 bg-white p-2 shadow-xs"><h3 className="mb-2 text-sm font-black text-slate-800">PMK Pending</h3><div className="h-[175px]">{rows.length ? <Bar data={data} options={options} /> : <EmptyPanel title="No PMK pending." />}</div></section>;
}

export default PmkPendingChart;
