import ProformaPreviewFlyout from "../../proforma-invoice/components/ProformaPreviewFlyout";
import { getProductionNotePdf, getProductionNotePreview } from "../data/booking.service";

export default function ProductionNotePreview({ order, onClose }) {
  return <ProformaPreviewFlyout
    isOpen={Boolean(order)} onClose={onClose}
    pi={order ? { pi_id: order.order_id, pi_no: order.order_code } : null}
    title="Production Note Preview"
    loadDocument={getProductionNotePreview} downloadDocument={getProductionNotePdf}
  />;
}
