import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Download, FileText, RefreshCw, X } from "lucide-react";
import { downloadBlobResponse } from "@/utils/download.utils";
import { usePreviewScale } from "../hooks/usePreviewScale";
import ActionButton from "@components/ui/ActionButton";
import FlyoutPanel from "@components/ui/FlyoutPanel";
import Spinner from "@components/ui/Spinner";
import { getProformaInvoicePdf, getProformaInvoicePreview } from "../data/proforma.service";
import "@modules/orders/confirmation/components/proforma-invoice.css";

function ProformaPreviewFlyout({ isOpen, onClose, pi, title = "Proforma Invoice Preview", loadDocument = getProformaInvoicePreview, downloadDocument = getProformaInvoicePdf }) {
  const [previewHtml, setPreviewHtml] = useState("");
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef(null);
  usePreviewScale(previewRef, previewHtml);

  const loadPreview = async () => {
    if (!pi?.pi_id) return;
    try {
      setLoading(true);
      const res = await loadDocument(pi.pi_id);
      if (!res.success) {
        toast.error(res?.message || "Unable to load proforma invoice preview.");
        return;
      }
      setPreviewHtml(res?.data?.html || res?.html || "");
      setInvoice(res?.data?.invoice || res?.invoice || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) loadPreview();
    if (!isOpen) {
      setPreviewHtml("");
      setInvoice(null);
    }
  }, [isOpen, pi?.pi_id]);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const response = await downloadDocument(pi.pi_id);
      if (!response.success) throw new Error(response.message || "Unable to download PDF.");
      downloadBlobResponse(response, `${String(invoice?.pi_no || pi?.pi_no || "PI").replace(/\//g, "_")}.pdf`);
    } catch (error) {
      toast.error(error?.message || "Unable to download PDF.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <FlyoutPanel
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={invoice?.pi_no || pi?.pi_no || "Backend rendered preview"}
      panelClassName="!w-[680px] max-w-full"
      closeButton={<button className="flyout-close" onClick={onClose} aria-label="Close proforma invoice preview"><X size={18} /></button>}
      footer={
        <div className="flex w-full items-center justify-between gap-3 border-t border-slate-100 bg-white px-4 py-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <FileText size={13} /> Backend rendered preview
          </span>
          <div className="flex items-center gap-2">
            <ActionButton type="button" variant="flyoutSecondary" className="flex p-1! gap-1 w-auto" disabled={loading} onClick={loadPreview}>
              {loading ? <Spinner size="sm" /> : <RefreshCw size={14} />}
              <span>Refresh</span>
            </ActionButton>
            <ActionButton type="button" variant="flyoutPrimary" disabled={loading || downloading || !previewHtml} onClick={handleDownload}>
              {downloading ? <Spinner size="sm" /> : <Download size={14} />} {downloading ? "Downloading..." : "Download PDF"}
            </ActionButton>
          </div>
        </div>
      }
    >
      <div className="pi-preview-shell bg-slate-100">
        {loading && !previewHtml ? (
          <div className="pi-preview-loader">
            <Spinner />
            <span>Loading proforma invoice...</span>
          </div>
        ) : (
          <iframe ref={previewRef} className="pi-preview-frame" title={title} srcDoc={previewHtml} />
        )}
      </div>
    </FlyoutPanel>
  );
}

export default ProformaPreviewFlyout;
