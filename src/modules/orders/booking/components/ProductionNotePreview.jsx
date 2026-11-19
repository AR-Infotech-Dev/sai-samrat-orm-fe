import ProformaPreviewFlyout from "../../proforma-invoice/components/ProformaPreviewFlyout";
import { getProductionNotePdf, getProductionNotePreview } from "../data/booking.service";

export default function ProductionNotePreview({ order, onClose }) {
  return <ProformaPreviewFlyout
    isOpen={Boolean(order)} onClose={onClose}
    pi={order ? { pi_id: order.production_note_id, pi_no: order.production_code } : null}
    title="Production Note Preview"
    headerSubtitle={(document) => `${document?.production_note_no || order?.production_note_no || "-"} | ${document?.production_code || order?.production_code || "-"} | ${document?.pi_number || order?.pi_number || "-"}`}
    loadDocument={getProductionNotePreview} downloadDocument={getProductionNotePdf}
  />;
}
