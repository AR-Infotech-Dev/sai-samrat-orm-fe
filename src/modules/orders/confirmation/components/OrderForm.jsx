import { useState } from "react";
import { toast } from "react-toastify";
import { FileText, X } from "lucide-react";
import ActionButton from "@components/ui/ActionButton";
import FlyoutPanel from "@components/ui/FlyoutPanel";
import Spinner from "@components/ui/Spinner";
import { useConfirmationOrderForm } from "../hooks/useConfirmationOrderForm";
import { confirmOrder, holdOrder, sendBackOrder } from "../data/confirmation.service";
import OrderReviewHeader from "./OrderReviewHeader";
import { Badge } from "@/components/ui/badge";
import ProductionNotePreview from "../../booking/components/ProductionNotePreview";

function OrderForm({ isOpen, onClose, selectedOrder, onAfterSave }) {
  const [remarks, setRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [isProformaOpen, setIsProformaOpen] = useState(false);
  const { fetchingOrder, formData, initialOrderItems, handleClose } = useConfirmationOrderForm({ isOpen, onClose, selectedOrder });

  const closePanel = () => {
    setRemarks("");
    handleClose();
  };

  const runAction = async (action) => {
    const orderId = formData?.production_note_id || selectedOrder?.production_note_id;
    if (!orderId) {
      toast.error("Order id not found");
      return;
    }

    if (["hold", "send-back"].includes(action) && !remarks.trim()) {
      toast.error("Reason is required for Hold / Send Back");
      return;
    }

    if (action === "confirm") {
      const allowed = await confirmAction(`Confirm production note ${formData?.production_note_no || ""}?`);
      if (!allowed) return;
    }

    if (action === "send-back") {
      const allowed = await confirmAction(`Send back production note ${formData?.production_note_no || ""}?`);
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

      toast.success(res?.message || "Production note updated successfully");
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
    <>
      <FlyoutPanel
        isOpen={isOpen}
        onClose={closePanel}
        title="Order Review"
        subtitle={
          <div className="flex gap-1.5 justify-between items-center">
            <>
              <p className="pr-3 mr-3 border-r border-gray-300">
                {formData.production_note_no || "Auto Generated"} | {formData.production_code || "-"} | {formData.pi_number || "-"}
              </p>
              {formData.production_note_status &&
                <Badge
                  variant="outline"
                  className="rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize"
                  style={{
                    color: formData.production_note_status_color || "#FF8D4B",
                    borderColor: `${formData.production_note_status_color || "#FF8D4B"}33`,
                    backgroundColor: `${formData.production_note_status_color || "#FF8D4B"}14`,
                  }}
                >
                  {formData.production_note_status.charAt(0).toUpperCase() + formData.production_note_status.slice(1)}
                </Badge>
              }
            </>
          </div>
        }
        panelClassName="!w-[900px] max-w-full"
        closeButton={
          <button className="flyout-close" onClick={closePanel} aria-label="Close panel">
            <X size={18} />
          </button>
        }
        footer={
          <div className="flex w-full flex-wrap items-center justify-between gap-2  bg-white px-3 py-2">
            <button type="button" disabled={fetchingOrder || actionLoading} onClick={() => setIsProformaOpen(true)} className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-orange-200 bg-orange-50 px-3 text-xs font-bold text-orange-600 shadow-xs hover:bg-orange-100 disabled:opacity-60">
              <FileText size={14} />
              Preview Production Note
            </button>
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
      <ProductionNotePreview
        onClose={() => setIsProformaOpen(false)}
        order={isProformaOpen ? { ...selectedOrder, ...formData } : null}
      />
    </>
  );
}

export default OrderForm;
import { confirmAction } from "@utils/confirmAction";
