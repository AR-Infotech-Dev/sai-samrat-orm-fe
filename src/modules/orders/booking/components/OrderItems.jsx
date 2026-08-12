import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import OrderItemsHeader from "./order-items/OrderItemsHeader";
import OrderItemRow from "./order-items/OrderItemRow";

const createBlankRow = () => ({
  id: Date.now(),
  product_id: null,
  product: null,
  productCode: null,
  model: null,
  weight: null,
  qty: 0,
  unitRate: 0,
  gst: 0,
  readyStock: 0,
  pendingStock: 0,
});

const normalizeRows = (rows = []) => (Array.isArray(rows) && rows.length ? rows : [createBlankRow()]);

const rowGridClass = "grid grid-cols-[28px_minmax(160px,1.8fr)_minmax(96px,1fr)_58px_64px_82px_58px_96px_34px]";

const OrderItems = ({ defaultItems = [], onItemsChange }) => {
  const [items, setItems] = useState(() => normalizeRows());
  const defaultItemsSignatureRef = useRef("");

  const updateItems = (updatedItems) => {
    setItems(updatedItems);
    onItemsChange?.(updatedItems);
  };

  const handleFieldChange = (rowId, field, value) => {
    const numericFields = ["weight", "qty", "unitRate", "gst"];
    updateItems(
      items.map((item) =>
        item.id === rowId
          ? { ...item, [field]: numericFields.includes(field) ? (value === "" ? "" : Number(value)) : value }
          : item
      )
    );
  };

  const handleProductSelect = (rowId, product) => {
    updateItems(
      items.map((item) =>
        item.id === rowId
          ? {
            ...item,
            product_id: product.product_id,
            product: product.product,
            productCode: product.productCode,
            model: product.model,
            weight: product.weight,
            unitRate: product.unitRate,
            gst: product.gst,
            readyStock: product.readyStock,
            pendingStock: product.pendingStock,
          }
          : item
      )
    );
  };

  const handleAddRow = () => {
    updateItems([...items, createBlankRow()]);
  };

  const handleDeleteRow = (rowId) => {
    updateItems(items.filter((item) => item.id !== rowId));
  };

  useEffect(() => {
    const defaultItemsSignature = JSON.stringify(defaultItems || []);
    if (defaultItemsSignatureRef.current === defaultItemsSignature) return;
    defaultItemsSignatureRef.current = defaultItemsSignature;
    const nextItems = normalizeRows(defaultItems);
    updateItems(nextItems);
  }, [defaultItems]);

  useEffect(() => {
    if (!items.length) {
      updateItems([createBlankRow()]);
    }
  }, [items]);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-visible border border-slate-100 bg-white px-2.5 py-2 shadow-sm">
      <div className="mb-1 flex shrink-0 flex-wrap items-center justify-between gap-2 pb-2">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-800">Order Items</h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-md bg-slate-50 px-2 py-1 text-[9px] font-semibold text-slate-500">
            {items.length} Lines
          </span>
          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex h-6 items-center justify-center gap-1.5 rounded-md border border-orange-200 bg-orange-50 px-2.5 text-xs font-semibold text-orange-600 transition hover:border-orange-400 hover:bg-orange-100"
          >
            <Plus size={12} strokeWidth={2.5} />
            Add Product Line
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:thin]">
        <div className="min-w-0">
          <OrderItemsHeader className={rowGridClass} />

          <div className="divide-y divide-slate-100">
            {items.map((item, index) => (
              <OrderItemRow
                key={item.id}
                index={index}
                item={item}
                className={rowGridClass}
                handleDeleteRow={handleDeleteRow}
                handleFieldChange={handleFieldChange}
                handleProductSelect={handleProductSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderItems;
