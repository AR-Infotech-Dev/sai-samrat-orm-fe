import { formatCurrency, formatDate, formatNumber } from '@/utils/common';
import React from 'react';

const DetailCell = ({ label, value, highlight }) => (
  <div className="rounded-xs  bg-slate-50 px-2.5 py-1 gap">
    <p className="text-[8px] font-medium uppercase text-slate-400">{label}</p>
    <p className={`mt-0.5 truncate text-sm font-semibold ${highlight ? "text-orange-600" : "text-slate-700"}`}>{value || "-"}</p>
  </div>
);

const itemGridClass = "grid w-full grid-cols-[38px_minmax(170px,2fr)_minmax(100px,1fr)_80px_70px_100px_70px_130px] items-center";

function OrderReviewHeader({ order = {}, items = [], remarks = "", actionLoading = false, onRemarksChange, onAction }) {
  return (
    <div className="px-3">
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        <section className="rounded-sm border border-slate-100 bg-white p-2.5 shadow-xs">
          <h3 className="mb-1.5 text-sm font-bold text-slate-800">Order Header</h3>
          <div className="grid grid-cols-2 gap-0">
            <DetailCell label="Order No" value={order?.order_no} highlight />
            <DetailCell label="Status" value={order?.order_status || "waiting"} />
            <DetailCell label="Priority" value={order?.priority || "normal"} />
            <DetailCell label="Order Date" value={formatDate(order?.order_date)} />
            <DetailCell label="Expected Delivery" value={formatDate(order?.expected_delivery_date)} />
            <DetailCell label="Sales Person" value={order?.sales_person_name || order?.sales_person_id} />
          </div>
        </section>

        <section className="rounded-sm border border-slate-100 bg-white p-2.5 shadow-xs">
          <h3 className="mb-1.5 text-sm font-bold text-slate-800">Customer Details</h3>
          <div className="grid grid-cols-2 gap-0">
            <DetailCell label="Customer" value={order?.customer_name || order?.customer_id} />
            <DetailCell label="Contact" value={order?.customer_mobile || "-"} />
            <DetailCell label="Email" value={order?.customer_email || "-"} />
            <DetailCell label="Location" value={order?.customer_address || "-"} />
          </div>
        </section>
      </div>

      <section className="mt-2 overflow-hidden rounded-sm border border-slate-100 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 px-3 py-1.5">
          <h3 className="text-sm font-bold text-slate-800">Order Items</h3>
          <p className="text-xs text-slate-400">All values in INR</p>
        </div>

        <div className="w-full overflow-hidden text-left text-sm">
          <div className={`${itemGridClass} bg-slate-50 text-[10px] font-bold uppercase text-slate-500`}>
            <div className="px-2 py-2">#</div>
            <div className="px-2 py-2">Product / Model</div>
            <div className="px-2 py-2">Series</div>
            <div className="px-2 py-2 text-right">Weight</div>
            <div className="px-2 py-2 text-right">Qty</div>
            <div className="px-2 py-2 text-right">Rate</div>
            <div className="px-2 py-2 text-right">GST</div>
            <div className="px-2 py-2 text-right">Line Value</div>
          </div>

          <div className="divide-y divide-slate-100">
            {items.map((item, index) => (
              <div className={itemGridClass} key={item.order_item_id || index}>
                <div className="px-2 py-1.5 text-slate-400">{index + 1}</div>
                <div className="truncate px-2 py-1.5 font-semibold text-slate-700">{item.product_name_snapshot || item.product || item.product_name || "-"}</div>
                <div className="truncate px-2 py-1.5 text-slate-500">{item.brand_snapshot || item.brand || "-"}</div>
                <div className="px-2 py-1.5 text-right text-slate-500">{formatNumber(item.weight)}</div>
                <div className="px-2 py-1.5 text-right font-semibold text-slate-700">{formatNumber(item.order_qty)}</div>
                <div className="px-2 py-1.5 text-right text-slate-600">{formatCurrency(item.unit_rate)}</div>
                <div className="px-2 py-1.5 text-right text-slate-600">{Number(item.gst_rate || 0)}%</div>
                <div className="px-2 py-1.5 text-right font-bold text-slate-800">{formatCurrency(item.line_value)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-sm border border-slate-100 bg-white p-2.5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800">Order Summary</h3>
          <div className="mt-2 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Total Items</span><strong>{formatNumber(items.length)}</strong></div>
            <div className="flex justify-between"><span className="text-slate-500">Total Qty</span><strong>{formatNumber(order?.total_order_qty)}</strong></div>
            <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><strong>{formatCurrency(order?.total_order_value)}</strong></div>
            <div className="border-t border-dashed border-slate-200 pt-1.5 flex justify-between"><span className="font-semibold text-slate-700">Grand Total</span><strong className="text-md text-orange-600">{formatCurrency(order?.total_value_in_inr)}</strong></div>
          </div>
        </section>

        <section className="rounded-sm border border-slate-100 bg-white p-2.5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800">Sales Remarks</h3>
          <p className="mt-2 min-h-16 rounded-sm bg-slate-50 p-2 text-sm leading-5 text-slate-500">{order?.remarks || "No remarks added."}</p>
        </section>
      </div>

      <section className="mt-2 rounded-sm border border-slate-100 bg-white p-2.5 shadow-xs">
        <label className="text-xs font-semibold text-slate-500">Remarks / Reason <span className="text-red-500">required for Hold or Send Back</span></label>
        <div className="mt-2">
          <textarea
            value={remarks}
            onChange={(event) => onRemarksChange?.(event.target.value)}
            rows={2}
            className="w-full resize-none rounded-sm border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100"
            placeholder="Enter reason for holding/sending back this order..."
          />

        </div>
      </section>
    </div>
  );
}

export default OrderReviewHeader;

