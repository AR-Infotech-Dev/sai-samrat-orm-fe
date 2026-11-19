import { CircleDot, Package, ShoppingCart } from "lucide-react";
import { formatCurrency, formatNumber } from "../utils/proforma.utils";

const SummaryRow = ({ icon: Icon, label, value, valueClassName = "text-slate-600" }) => (
  <div className="flex items-center justify-between gap-4 py-1">
    <div className="flex min-w-0 items-center gap-1.5 align-middle">
      <Icon size={13} strokeWidth={2} className="shrink-0 text-[#929395FF]" />
      <span className="truncate text-sm font-normal leading-4.5 text-slate-600">{label}</span>
    </div>
    <span className={`shrink-0 text-sm font-semibold leading-4.5 ${valueClassName}`}>{value}</span>
  </div>
);

const PriceRow = ({ label, value, currency = "INR" }) => (
  <div className="flex items-center justify-between gap-4 py-1">
    <span className="text-sm font-normal leading-4.5 text-slate-600">{label}</span>
    <span className="text-sm font-bold leading-4.5 text-orange-400">{formatCurrency(value, currency)}</span>
  </div>
);

function ProformaSummary({ piNo = "-", totalItems = 0, totalQty = 0, subtotal = 0, gstPercentage = 0, gstAmount = 0, grandTotal = 0, currency = "INR" }) {
  const safeGstPercentage = Number.isFinite(Number(gstPercentage)) ? Number(gstPercentage) : 0;

  return (
    <aside className="w-full min-h-0 px-3 py-2">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-[#373B41FF]"> PI Summary </h2>
      </div>
      <div className="grid items-start gap-6 md:grid-cols-3 md:divide-x md:divide-gray-200">
        <div className="md:pr-6">
          <SummaryRow icon={CircleDot} label="PI No" value={piNo} valueClassName="text-blue-500" />
          <SummaryRow icon={ShoppingCart} label="Total Qty" value={formatNumber(totalQty)} />
          <SummaryRow icon={Package} label="Total Items" value={formatNumber(totalItems)} />
        </div>
        <div className="md:px-6">
          <SummaryRow icon={ShoppingCart} label="Subtotal Qty" value={formatNumber(totalQty)} />
          <SummaryRow icon={Package} label="Currency" value={currency} valueClassName="text-slate-700" />
        </div>
        <div className="flex flex-col gap-1 md:pl-6">
          <div>
            <PriceRow label="Subtotal" value={subtotal} currency={currency} />
            <PriceRow label={`GST (${safeGstPercentage}%)`} value={gstAmount} currency={currency} />
          </div>
          <div className="flex justify-between border-t border-gray-200 py-1">
            <span className="text-[13px] font-bold text-[#373B41]"> Grand Total </span>
            <span className="mt-0.5 text-[13px] font-bold text-orange-500"> {formatCurrency(grandTotal, currency)} </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default ProformaSummary;
