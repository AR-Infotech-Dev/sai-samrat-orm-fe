import { Bar } from "react-chartjs-2";
import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from "chart.js";
import EmptyPanel from "./EmptyPanel";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const shortNumber = (value) => {
  const number = Number(value || 0);
  if (Math.abs(number) >= 100000) return `${Math.round((number / 100000) * 10) / 10}L`;
  if (Math.abs(number) >= 1000) return `${Math.round((number / 1000) * 10) / 10}k`;
  return number.toLocaleString("en-IN", { maximumFractionDigits: 2 });
};

function MonthlyBookingChart({ rows = [] }) {
  const data = {
    labels: rows.map((row) => row.month),
    datasets: [
      {
        label: "Order Qty",
        data: rows.map((row) => Number(row.qty || 0)),
        borderRadius: 8,
        maxBarThickness: 28,
        backgroundColor: "rgba(255, 141, 75, 0.88)",
        hoverBackgroundColor: "rgba(236, 106, 6, 0.95)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        displayColors: false,
        callbacks: { label: (ctx) => `Qty: ${shortNumber(ctx.raw)}` },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#64748b", font: { size: 10, weight: 600 } } },
      y: { beginAtZero: true, border: { display: false }, grid: { color: "rgba(226,232,240,.7)" }, ticks: { color: "#94a3b8", font: { size: 10 }, callback: shortNumber } },
    },
  };

  return (
    <section className="rounded-sm border border-orange-100 bg-white p-2 shadow-xs">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Monthly Booking</h3>
        <span className="text-[10px] font-bold uppercase text-slate-400">Qty</span>
      </div>
      <div className="h-[150px]">
        {rows.length ? <Bar data={data} options={options} /> : <EmptyPanel title="No monthly data." />}
      </div>
    </section>
  );
}

export default MonthlyBookingChart;