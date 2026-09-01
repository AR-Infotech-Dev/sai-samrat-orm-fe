import { useMemo, useState } from "react";
import { X } from "lucide-react";
import ActionButton from "@components/ui/ActionButton";
import FlyoutPanel from "@components/ui/FlyoutPanel";
import Spinner from "@components/ui/Spinner";
import { useOrderBookingForm } from "../hooks/useBookingForm";
import { ordersModuleSchema } from "../data/module.schema";
import OrderSummary from "./OrderSummary";
import OrderItems from "./OrderItems";
import OrderHeaderForm from "./OrderHeaderForm";
import { buildOrderSummary } from "../utils/booking.utils";
import { Badge } from "@/components/ui/badge";

function OrderForm({ isOpen, onClose, selectedOrder, onAfterSave, menu_id }) {
  const [orderItems, setOrderItems] = useState([]);
  const { loading, fetchingOrder, formData, initialOrderItems, errors, currencyRateLoading, handleClose, handleChange, handleSave } = useOrderBookingForm({ isOpen, onClose, selectedOrder, onAfterSave });
  const orderSummary = useMemo(() => buildOrderSummary(orderItems, formData), [orderItems, formData]);
  const saveContext = { items: orderItems, summary: orderSummary };

  if (!isOpen) {
    return null;
  }

  return (
    <FlyoutPanel
      isOpen={isOpen}
      onClose={handleClose}
      title={selectedOrder ? "Edit Order" : "Create Order"}
      subtitle={
        <div className="flex gap-1.5">
          {formData.order_status &&
            <Badge
              variant="outline"
              className="rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize"
              style={{
                color: formData.order_status_color || "#FF8D4B",
                borderColor: `${formData.order_status_color || "#FF8D4B"}33`,
                backgroundColor: `${formData.order_status_color || "#FF8D4B"}14`,
              }}
            >{formData.order_status.charAt(0).toUpperCase() + formData.order_status.slice(1)}</Badge>}
        </div>
      }
      panelClassName="!w-[1080px] max-w-full"
      closeButton={
        <button className="flyout-close" onClick={handleClose} aria-label="Close panel">
          <X size={18} />
        </button>
      }
      footer={
        <div className="flex w-full items-center justify-end gap-2 border-t border-slate-100 bg-white px-4 py-2">
          {formData.order_status == "draft" &&
            <>
              <ActionButton
                type="button"
                variant="flyoutSecondary"
                disabled={loading}
                onClick={() => handleSave({ ...saveContext, statusOverride: "draft" })}
              >
                {loading ? <Spinner size="sm" /> : "Save Draft"}
              </ActionButton>
              <ActionButton
                type="button"
                variant="flyoutPrimary"
                disabled={loading}
                onClick={() => handleSave({ ...saveContext, statusOverride: "waiting" })}
              >
                {loading ? <Spinner size="sm" /> : selectedOrder ? "Update Order" : "Book Order"}
              </ActionButton>
              </>
          }
        </div>
      }
    >
      <div className="flyout-form-shell h-full min-h-0 overflow-hidden bg-slate-50/70">
        <div className="ws-main-container h-full min-h-0 overflow-hidden !p-0">
          <div className="grid h-full min-h-0 grid-cols-1 gap-1 overflow-hidden p-0 lg:grid-cols-[280px_minmax(0,1fr)]">
            <section className="min-h-0 overflow-y-auto bg-white p-3 shadow-xs [scrollbar-width:thin]">
              <h2 className="mb-1.5 text-sm font-bold text-[#373B41FF]"> Order Details </h2>
              {fetchingOrder ? (
                <div className="flex h-32 items-center justify-center"><Spinner /></div>
              ) : (
                <OrderHeaderForm
                  sections={ordersModuleSchema.form.sections}
                  values={formData}
                  onChange={handleChange}
                  errors={errors}
                  menuId={menu_id}
                />
              )}
            </section>

            <div className="grid min-h-0 min-w-0 grid-rows-[minmax(0,1fr)_auto] gap-0 overflow-hidden">
              <div className="min-h-0 overflow-hidden">
                <OrderItems
                  currency={formData.currency}
                  exchangeRate={formData.exchange_rate}
                  defaultItems={initialOrderItems}
                  onItemsChange={setOrderItems}
                />
              </div>

              <section className="shrink-0 border border-slate-100 bg-white shadow-sm">
                {currencyRateLoading ? <p className="px-3 pt-2 text-[10px] font-semibold text-orange-500">Updating live exchange rate...</p> : null}
                <OrderSummary layout="horizontal" {...orderSummary} currency={formData.currency} gstPercentage={18} />
              </section>
            </div>
          </div>
        </div>
      </div>
    </FlyoutPanel>
  );
}

export default OrderForm;
