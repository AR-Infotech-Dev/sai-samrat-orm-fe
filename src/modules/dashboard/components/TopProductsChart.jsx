import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";
import EmptyPanel from "./EmptyPanel";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const shortNumber = (value) => {
  const number = Number(value || 0);
  if (Math.abs(number) >= 100000) return `${Math.round((number / 100000) * 10) / 10}L`;
  if (Math.abs(number) >= 1000) return `${Math.round((number / 1000) * 10) / 10}k`;
  return number.toLocaleString("en-IN", { maximumFractionDigits: 2 });
};

function TopProductsChart({ products = [] }) {
  const data = {
    labels: products.map((item) => item.name),
    datasets: [
      {
        label: "Qty",
        data: products.map((item) => Number(item.qty || 0)),
        borderRadius: 8,
        maxBarThickness: 12,
        backgroundColor: "rgba(255, 141, 75, 0.82)",
        hoverBackgroundColor: "rgba(236, 106, 6, 0.95)",
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { displayColors: false, callbacks: { label: (ctx) => `Qty: ${shortNumber(ctx.raw)}` } },
    },
    scales: {
      x: { beginAtZero: true, border: { display: false }, grid: { color: "rgba(226,232,240,.6)" }, ticks: { color: "#94a3b8", font: { size: 10 }, callback: shortNumber } },
      y: { grid: { display: false }, ticks: { color: "#334155", font: { size: 10, weight: 700 } } },
    },
  };

  return (
    <section className="rounded-sm border border-orange-100 bg-white p-2 shadow-xs">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Top Products</h3>
        <span className="text-[10px] font-bold uppercase text-slate-400">By Qty</span>
      </div>
      <div className="h-[190px]">
        {products.length ? <Bar data={data} options={options} /> : <EmptyPanel title="No product data found." />}
      </div>
    </section>
  );
}

export default TopProductsChart;