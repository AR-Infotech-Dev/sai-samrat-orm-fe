import { FileText } from "lucide-react";
import { formatCurrency, formatNumber } from "../../booking/utils/booking.utils";

function ProformaInvoiceRowTemplate({ item, isSelected, onClick, style }) {
  const pi = item.original || {};

  return (
    <div
      onClick={onClick}
      style={style}
      className={`cursor-pointer px-3 py-2 text-xs transition hover:bg-orange-50 ${isSelected ? "bg-orange-50" : ""}`}
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-orange-100 text-orange-600">
          <FileText size={14} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="font-black text-slate-800">{pi.pi_no || item.label}</span>
            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">
              {pi.pi_status || "draft"}
            </span>
          </span>
          <span className="mt-1 block truncate font-semibold text-slate-600">
            {pi.customer_name || "No customer"}
          </span>
          <span className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] font-semibold text-slate-400">
            <span>Date: {pi.pi_date ? String(pi.pi_date).slice(0, 10) : "-"}</span>
            <span>Type: {pi.order_type || "-"}</span>
            <span>Qty: {formatNumber(Number(pi.total_qty || 0))}</span>
            <span>Value: {formatCurrency(Number(pi.total_value || 0), pi.currency || "INR")}</span>
          </span>
        </span>
      </div>
    </div>
  );
}

export default ProformaInvoiceRowTemplate;
