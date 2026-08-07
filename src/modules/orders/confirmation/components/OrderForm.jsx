import { useState } from "react";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import ActionButton from "@components/ui/ActionButton";
import FlyoutPanel from "@components/ui/FlyoutPanel";
import Spinner from "@components/ui/Spinner";
import { useConfirmationOrderForm } from "../hooks/useConfirmationOrderForm";
import { confirmOrder, holdOrder, sendBackOrder } from "../data/confirmation.service";
import OrderReviewHeader from "./OrderReviewHeader";

function OrderForm({ isOpen, onClose, selectedOrder, onAfterSave }) {
  const [remarks, setRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const { fetchingOrder, formData, initialOrderItems, handleClose } = useConfirmationOrderForm({ isOpen, onClose, selectedOrder });

  const closePanel = () => {
    setRemarks("");
    handleClose();
  };

  const runAction = async (action) => {
    const orderId = formData?.order_id || selectedOrder?.order_id;
    if (!orderId) {
      toast.error("Order id not found");
      return;
    }

    if (["hold", "send-back"].includes(action) && !remarks.trim()) {
      toast.error("Reason is required for Hold / Send Back");
      return;
    }

    if (action === "confirm") {
      const allowed = window.confirm(`Confirm order ${formData?.order_no || ""}?`);
      if (!allowed) return;
    }

    if (action === "send-back") {
      const allowed = window.confirm(`Send back order ${formData?.order_no || ""}?`);
      if (!allowed) return;
    }

    try {
      setActionLoading(true);
      const actionMap = {
        confirm: confirmOrder,
        hold: holdOrder,
        "send-back": sendBackOrder,
      };
      const res = await actionMap[action]({ orderId, remarks });
      if (!res?.success) {
        toast.error(res?.message || "Action failed");
        return;
      }

      toast.success(res?.message || "Order updated successfully");
      setRemarks("");
      onAfterSave?.();
      handleClose();
    } catch (error) {
      toast.error(error.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <FlyoutPanel
      isOpen={isOpen}
      onClose={closePanel}
      title="Order Review"
      subtitle="Read-only confirmation review"
      panelClassName="!w-[900px] max-w-full"
      closeButton={
        <button className="flyout-close" onClick={closePanel} aria-label="Close panel">
          <X size={18} />
        </button>
      }
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-white px-3 py-2">
          <span className="text-[11px] font-medium text-slate-400"></span>
          <div className="flex flex-wrap items-center gap-2">
            <ActionButton type="button" variant="flyoutSecondary" disabled={actionLoading} onClick={closePanel}>Cancel</ActionButton>
            <button type="button" disabled={actionLoading} onClick={() => runAction("hold")} className="inline-flex h-8 items-center rounded-sm bg-amber-500 px-3 text-xs font-bold text-white shadow-xs hover:bg-amber-600 disabled:opacity-60">
              {actionLoading ? <Spinner size="sm" /> : "Hold"}
            </button>
            <button type="button" disabled={actionLoading} onClick={() => runAction("send-back")} className="inline-flex h-8 items-center rounded-sm bg-red-500 px-3 text-xs font-bold text-white shadow-xs hover:bg-red-600 disabled:opacity-60">
              {actionLoading ? <Spinner size="sm" /> : "Send Back"}
            </button>
            <button type="button" disabled={actionLoading} onClick={() => runAction("confirm")} className="inline-flex h-8 items-center rounded-sm bg-emerald-600 px-3 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-60">
              {actionLoading ? <Spinner size="sm" /> : "Confirm"}
            </button>
          </div>
        </div>
      }
    >
      <div className="h-full min-h-0 overflow-hidden bg-slate-50/70">
        <div className="h-full min-h-0 overflow-y-auto px-0 py-2 [scrollbar-width:thin]">
          {fetchingOrder ? (
            <div className="flex h-40 items-center justify-center"><Spinner /></div>
          ) : (
            <OrderReviewHeader
              order={formData}
              items={initialOrderItems}
              remarks={remarks}
              actionLoading={actionLoading}
              onRemarksChange={setRemarks}
              onAction={runAction}
            />
          )}
        </div>
      </div>
    </FlyoutPanel>
  );
}

export default OrderForm;
