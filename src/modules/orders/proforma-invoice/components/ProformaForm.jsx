import { X } from "lucide-react";
import ActionButton from "@components/ui/ActionButton";
import FlyoutPanel from "@components/ui/FlyoutPanel";
import Spinner from "@components/ui/Spinner";
import OrderHeaderForm from "@modules/orders/booking/components/OrderHeaderForm";
import ProformaItems from "./ProformaItems";
import ProformaSummary from "./ProformaSummary";
import { useProformaForm } from "../hooks/useProformaForm";
import { proformaModuleSchema } from "../data/module.schema";
import { formatCurrency } from "../utils/proforma.utils";

function ProformaForm({ isOpen, onClose, selectedPi, onAfterSave }) {
  const {
    formData,
    items,
    summary,
    errors,
    loading,
    fetching,
    currencyRateLoading,
    handleChange,
    handleCustomerSelect,
    updateItem,
    handleProductSelect,
    addItem,
    deleteItem,
    handleSave,
  } = useProformaForm({ isOpen, onClose, selectedPi, onAfterSave });

  return (
    <FlyoutPanel
      isOpen={isOpen}
      onClose={onClose}
      title={selectedPi ? "Edit Proforma Invoice" : "Create Proforma Invoice"}
      subtitle={formData.pi_no || "Draft PI"}
      panelClassName="!w-[1080px] max-w-full"
      closeButton={<button className="flyout-close" onClick={onClose} aria-label="Close panel"><X size={18} /></button>}
      footer={
        <div className="flex w-full items-center justify-between gap-3  bg-white px-4 py-2">
          <div className="text-[11px] font-semibold text-slate-500">
            {currencyRateLoading ? "Updating live exchange rate..." : `Grand Total: ${formatCurrency(summary.total_value, formData.currency)}`}
          </div>
          <div className="flex items-center gap-2">
            <ActionButton type="button" variant="flyoutSecondary" disabled={loading} onClick={onClose}>Cancel</ActionButton>
            <ActionButton type="button" variant="flyoutSecondary" disabled={loading || fetching} onClick={() => handleSave("draft")}>
              Save Draft
            </ActionButton>
            <ActionButton type="button" variant="flyoutPrimary" disabled={loading || fetching} onClick={() => handleSave("waiting")}>
              {loading ? <Spinner size="sm" /> : "Create PI"}
            </ActionButton>
          </div>
        </div>
      }
    >
      <div className="flyout-form-shell h-full min-h-0 overflow-hidden bg-slate-50/70">
        {fetching ? (
          <div className="flex h-full items-center justify-center"><Spinner /></div>
        ) : (
          <div className="grid h-full min-h-0 grid-cols-1 gap-1 overflow-hidden p-0 lg:grid-cols-[300px_minmax(0,1fr)]">
            <section className="min-h-0 overflow-y-auto bg-white p-3 shadow-xs [scrollbar-width:none]">
              <h2 className="mb-2 text-sm font-bold text-slate-800">PI Details</h2>
              <OrderHeaderForm
                sections={proformaModuleSchema.form.sections}
                values={formData}
                onChange={handleChange}
                onObjectSelect={(field, item) => {
                  if (field?.name === "customer_id") handleCustomerSelect(item);
                }}
                errors={errors}
                menuId={proformaModuleSchema.menu_id}
              />
            </section>

            <div className="grid min-h-0 min-w-0 grid-rows-[minmax(0,1fr)_auto] gap-0 overflow-hidden">
              <ProformaItems
                items={items}
                currency={formData.currency}
                onAdd={addItem}
                onDelete={deleteItem}
                onFieldChange={updateItem}
                onProductSelect={handleProductSelect}
                error={errors.items}
              />
              <section className="shrink-0 border border-slate-100 bg-white shadow-sm">
                <ProformaSummary
                  piNo={formData.pi_no || "-"}
                  totalItems={items.length}
                  totalQty={summary.total_qty}
                  subtotal={summary.subtotal}
                  gstPercentage={formData.gst_rate}
                  gstAmount={summary.gst_amount}
                  grandTotal={summary.total_value}
                  currency={formData.currency}
                />
              </section>
            </div>
          </div>
        )}
      </div>
    </FlyoutPanel>
  );
}

export default ProformaForm;
