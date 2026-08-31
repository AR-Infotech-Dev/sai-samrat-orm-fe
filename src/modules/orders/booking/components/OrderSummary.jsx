import {
    AlertCircle,
    CircleDot,
    Clock3,
    Info,
    Package,
    ShoppingCart,
} from "lucide-react";
import { formatCurrency, formatNumber } from "../utils/booking.utils";

const SummaryRow = ({ icon: Icon, label, value, valueClassName = "text-slate-600", }) => {
    return (
        <div className="flex items-center justify-between gap-4 py-1">
            <div className="flex min-w-0 items-center align-middle gap-1.5">
                <Icon
                    size={13}
                    strokeWidth={2}
                    className="shrink-0 text-[#929395FF]"
                />
                <span className="truncate leading-4.5 font-normal text-sm text-slate-600">
                    {label}
                </span>
            </div>
            <span className={`shrink-0 leading-4.5  text-sm font-semibold ${valueClassName}`} >
                {value}
            </span>
        </div>
    );
};

const PriceRow = ({ label, value, currency = "INR" }) => {
    return (
        <div className={`flex items-center justify-between gap-4 py-1`} >
            <span className={"leading-4.5 font-normal text-sm text-slate-600"}>
                {label}
            </span>
            <span className={"leading-4.5 font-bold  text-sm text-orange-400"} >
                {formatCurrency(value, currency)}
            </span>
        </div>
    );
};

const OrderSummary = ({
    orderNo = "Auto Generated",
    totalItems = 4,
    totalQty = 1250,
    readyQty = 300,
    pendingQty = 950,
    subtotal = 1845000,
    gstPercentage = 18,
    gstAmount = 332100,
    grandTotal = 2177100,
    currency = "INR",
    planningStatus = "Pending Planning",
    isSaving = false,
    isConfirming = false,
    disableDraft = false,
    disableConfirm = false,
    onSaveDraft,
    onConfirmOrder,
    layout = "vertical",
}) => {
    if (layout === "horizontal") {
        return (
            <aside className="w-full min-h-0 px-3 py-2">
                <div className="mb-1.5 flex items-center justify-between gap-3">
                    <h2 className="text-sm font-bold text-[#373B41FF]"> Order Summary </h2>
                </div>

                <div className="grid items-start gap-6 md:grid-cols-3 md:divide-x md:divide-gray-200">
                    {/* Column 1 */}
                    <div className="md:pr-6">
                        <SummaryRow icon={CircleDot} label="Order No" value={orderNo} valueClassName="text-blue-500" />
                        <SummaryRow icon={ShoppingCart} label="Total Qty" value={formatNumber(totalQty)} />
                        <SummaryRow icon={Package} label="Total Items" value={formatNumber(totalItems)} />
                    </div>

                    {/* Column 2 */}
                    <div className="md:px-6">
                        <SummaryRow icon={Clock3} label="Pending Qty" value={formatNumber(pendingQty)} valueClassName="text-red-500" />
                        <SummaryRow icon={Clock3} label="Ready Qty" value={formatNumber(readyQty)} valueClassName="text-emerald-500" />
                    </div>

                    {/* Column 3 */}
                    <div className="flex flex-col gap-1 md:pl-6">
                        <div>
                            <PriceRow label="Subtotal" value={subtotal} currency={currency} />
                            <PriceRow label={`GST (${gstPercentage}%)`} value={gstAmount} currency={currency} />
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

    return (
        <aside className="w-full min-h-0  max-w-[390px] px-5 py-3 shadow-black/30 sm:w-full md:w-full sm:px-6">
            <h2 className="mb-2.5 text-md font-bold text-[#373B41FF]"> Order Summary </h2>
            <div>
                <SummaryRow icon={CircleDot} label="Order No" value={orderNo} valueClassName="text-blue-500" />
                <SummaryRow icon={Package} label="Total Items" value={formatNumber(totalItems)} />
                <SummaryRow icon={ShoppingCart} label="Total Qty" value={formatNumber(totalQty)} />
                <SummaryRow icon={Clock3} label="Ready Qty" value={formatNumber(readyQty)} valueClassName="text-emerald-500" />
                <SummaryRow icon={Clock3} label="Pending Qty" value={formatNumber(pendingQty)} valueClassName="text-red-500" />
            </div>

            <div className="my-3.5 border-t border-gray-200" />
            <div className="">
                <PriceRow label="Subtotal" value={subtotal} currency={currency} />
                <PriceRow label={`GST (${gstPercentage}%)`} value={gstAmount} currency={currency} />
                <PriceRow label="Grand Total" value={grandTotal} currency={currency} highlighted />
            </div>

            {/* <div className="my-3.5 flex items-center justify-between gap-1">
                <span className="text-xs text-zinc-500"> Planning Status </span>
                <span className="rounded-md bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-orange-400"> {planningStatus} </span>
            </div> */}

            {/* <div className="mt-2 flex items-start gap-2 rounded-xl bg-[#fff9f7] px-2 py-3 border border-orange-200">
                <AlertCircle size={20} strokeWidth={2} className="mt-0.5 shrink-0 text-orange-400" />
                <p className="text-xs leading-5 text-orange-400">
                    Confirm only after product quantities are verified.
                </p>
            </div>
            <div className="mt-2 flex items-start gap-2 rounded-xl bg-blue-50 px-2 py-3 border border-blue-200">
                <Info size={20} strokeWidth={2} className="mt-0.5 shrink-0 text-blue-500" />
                <p className="text-xs leading-5 text-slate-500"> Order will be saved as draft until you confirm. You can edit draft orders anytime. </p>
            </div> */}
        </aside>
    );
};

export default OrderSummary;
