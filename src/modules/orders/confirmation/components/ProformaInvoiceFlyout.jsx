import { useEffect, useRef, useState } from "react";
import { FileText, Printer, RefreshCcw, X } from "lucide-react";
import { toast } from "react-toastify";
import ActionButton from "@components/ui/ActionButton";
import FlyoutPanel from "@components/ui/FlyoutPanel";
import Spinner from "@components/ui/Spinner";
import { getProformaInvoicePreview } from "../data/confirmation.service";
import "./proforma-invoice.css";

function ProformaInvoiceFlyout({ isOpen, onClose, order }) {
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [invoice, setInvoice] = useState(null);

  const orderId = order?.order_id;

  const loadPreview = async () => {
    if (!orderId) return;
    setLoading(true);
    const res = await getProformaInvoicePreview(orderId);
    setLoading(false);

    if (!res?.success) {
      toast.error(res?.message || "Unable to load proforma invoice preview.");
      return;
    }

    setPreviewHtml(res?.data?.html || "");
    setInvoice(res?.data?.invoice || null);
  };

  useEffect(() => {
    if (!isOpen) return;
    loadPreview();
  }, [isOpen, orderId]);

  const handlePrint = () => {
    const printWindow = iframeRef.current?.contentWindow;
    if (!printWindow || !previewHtml) {
      toast.error("Preview not ready.");
      return;
    }

    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  if (!isOpen) return null;

  return (
    <FlyoutPanel
      isOpen={isOpen}
      onClose={onClose}
      title="Proforma Invoice Preview"
      subtitle={invoice?.pi_no || order?.order_no || "Preview generated from backend template"}
      panelClassName="pi-preview-flyout"
      closeButton={
        <button className="flyout-close" onClick={onClose} aria-label="Close proforma invoice preview">
          <X size={18} />
        </button>
      }
      footer={
        <div className="flex w-full items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <FileText size={14} />
            Backend rendered preview
          </span>
          <div className="flex items-center gap-2">
            <ActionButton type="button" variant="flyoutSecondary" disabled={loading} onClick={loadPreview}>
              {loading ? <Spinner /> : <RefreshCcw size={15} />}
              Refresh
            </ActionButton>
            <ActionButton type="button" variant="flyoutPrimary" disabled={loading || !previewHtml} onClick={handlePrint}>
              <Printer size={15} />
              Print / Save PDF
            </ActionButton>
          </div>
        </div>
      }
    >
      <div className="pi-preview-shell">
        {loading ? (
          <div className="pi-preview-loader">
            <Spinner />
            <span>Loading proforma invoice...</span>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            className="pi-preview-frame"
            title="Proforma Invoice Preview"
            srcDoc={previewHtml}
          />
        )}
      </div>
    </FlyoutPanel>
  );
}

export default ProformaInvoiceFlyout;
