import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import OrderItemsHeader from "./order-items/OrderItemsHeader";
import OrderItemRow from "./order-items/OrderItemRow";
import { convertInrToCurrency, getCurrencySymbol } from "../utils/booking.utils";

const getSafeGstRate = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const createBlankRow = (gstRate = 0) => ({
  id: Date.now(),
  product_id: null,
  pi_item_id: null,
  available_qty: 0,
  pi_qty: 0,
  booked_qty: 0,
  product: null,
  productCode: null,
  model: null,
  weight: null,
  qty: 0,
  unitRate: 0,
  unitRateInInr: 0,
  standard_rate: 0,
  gst: getSafeGstRate(gstRate),
  readyStock: 0,
  pendingStock: 0,
});

const normalizeRows = (rows = [], gstRate = 0) => {
  const normalizedGstRate = getSafeGstRate(gstRate);
  const sourceRows = Array.isArray(rows) && rows.length ? rows : [createBlankRow(normalizedGstRate)];
  return sourceRows.map((row) => ({
    ...row,
    gst: normalizedGstRate,
  }));
};

const rowGridClass = "grid grid-cols-[28px_minmax(160px,1.8fr)_minmax(96px,1fr)_58px_64px_82px_58px_96px_34px]";

const OrderItems = ({ currency = "INR", formData, exchangeRate = 1, defaultItems = [], piItems = [], onItemsChange }) => {
  const [items, setItems] = useState(() => normalizeRows());
  const defaultItemsSignatureRef = useRef("");
  const currencySignatureRef = useRef("");
  const bookingSourceKeyRef = useRef("");
  const currencySymbol = getCurrencySymbol(currency);
  const headerGstRate = getSafeGstRate(formData?.gst_rate);
  const piMode = Boolean(formData?.pi_id || formData?.pi_number);

  const updateItems = (updatedItems) => {
    setItems(updatedItems);
    onItemsChange?.(updatedItems);
  };
  useEffect(() => {
    setItems((currentItems) => {
      const nextItems = currentItems.map((item) => ({
        ...item,
        gst: headerGstRate,
      }));

      onItemsChange?.(nextItems);
      return nextItems;
    });
  }, [headerGstRate]);
  const handleFieldChange = (rowId, field, value) => {
    const numericFields = ["weight", "qty", "unitRate", "gst"];
    let numericValue = value === "" ? "" : Number(value);
    updateItems(
      items.map((item) =>
        item.id === rowId
          ? (() => {
            if (piMode && field === "qty" && numericValue !== "") {
              const availableQty = Number(item.available_qty || 0);
              if (availableQty > 0) numericValue = Math.min(Number(numericValue) || 0, availableQty);
            }
            return {
              ...item,
              [field]: numericFields.includes(field) ? numericValue : value,
              ...(field === "unitRate" && numericValue !== ""
                ? {
                  unitRateInInr: Number(exchangeRate) > 0 ? Math.round((numericValue / Number(exchangeRate)) * 100) / 100 : numericValue,
                  standard_rate: Number(exchangeRate) > 0 ? Math.round((numericValue / Number(exchangeRate)) * 100) / 100 : numericValue,
                }
                : {}),
            };
          })()
          : item
      )
    );
  };

  const handlePiItemSelect = (rowId, piItem) => {
    updateItems(
      items.map((item) =>
        item.id === rowId
          ? {
            ...item,
            pi_item_id: piItem.pi_item_id,
            pi_qty: Number(piItem.piQty ?? piItem.qty ?? 0),
            booked_qty: Number(piItem.bookedQty ?? piItem.booked_qty ?? 0),
            available_qty: Number(piItem.availableQty ?? piItem.available_qty ?? 0),
            product_id: piItem.product_id,
            product: piItem.product,
            productCode: piItem.productCode,
            model: piItem.model,
            weight: piItem.weight,
            qty: Number(piItem.availableQty ?? piItem.available_qty ?? 0),
            unitRate: Number(piItem.unitRate ?? piItem.unit_rate ?? 0),
            unitRateInInr: Number(piItem.unitRateInInr ?? piItem.unit_rate_in_inr ?? piItem.unit_rate ?? 0),
            standard_rate: Number(piItem.unitRateInInr ?? piItem.unit_rate_in_inr ?? piItem.unit_rate ?? 0),
            gst: getSafeGstRate(piItem.gst ?? piItem.gst_rate ?? headerGstRate),
            readyStock: piItem.readyStock || 0,
            pendingStock: piItem.pendingStock || 0,
          }
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
            model: product.product_type,
            weight: product.weight,
            unitRate: convertInrToCurrency(product.unitRate, exchangeRate),
            unitRateInInr: product.unitRate,
            standard_rate: product.unitRate,
            gst: headerGstRate,
            readyStock: product.readyStock,
            pendingStock: product.pendingStock,
          }
          : item
      )
    );
  };

  const handleAddRow = () => {
    updateItems([...items, createBlankRow(headerGstRate)]);
  };

  const handleDeleteRow = (rowId) => {
    updateItems(items.filter((item) => item.id !== rowId));
  };

  useEffect(() => {
    const defaultItemsSignature = JSON.stringify(defaultItems || []);
    if (defaultItemsSignatureRef.current === defaultItemsSignature) return;
    defaultItemsSignatureRef.current = defaultItemsSignature;
    const nextItems = normalizeRows(defaultItems, headerGstRate);
    updateItems(nextItems);
  }, [defaultItems, headerGstRate]);

  useEffect(() => {
    const bookingSourceKey = `${formData?.customer_id || ""}:${formData?.pi_id || ""}`;
    if (bookingSourceKeyRef.current === bookingSourceKey) return;
    bookingSourceKeyRef.current = bookingSourceKey;
    if (Array.isArray(defaultItems) && defaultItems.length) return;
    updateItems(normalizeRows([], headerGstRate));
  }, [formData?.customer_id, formData?.pi_id, headerGstRate]);

  useEffect(() => {
    const rate = Number(exchangeRate) || 1;
    const currencySignature = `${currency}:${rate}`;
    if (currencySignatureRef.current === currencySignature) return;
    currencySignatureRef.current = currencySignature;

    setItems((currentItems) => {
      const nextItems = currentItems.map((item) => {
        const baseInrRate = Number(item.unitRateInInr || item.standard_rate || 0);
        if (!baseInrRate) return item;
        return {
          ...item,
          unitRate: convertInrToCurrency(baseInrRate, rate),
        };
      });
      onItemsChange?.(nextItems);
      return nextItems;
    });
  }, [currency, exchangeRate]);

  useEffect(() => {
    if (!items.length) {
      updateItems([createBlankRow(headerGstRate)]);
    }
  }, [items]);

  const selectedPiItemIds = items
    .map((item) => item.pi_item_id)
    .filter(Boolean);

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
            disabled={piMode && !piItems.length}
            className="inline-flex h-6 items-center justify-center gap-1.5 rounded-md border border-orange-200 bg-orange-50 px-2.5 text-xs font-semibold text-orange-600 transition hover:border-orange-400 hover:bg-orange-100"
          >
            <Plus size={12} strokeWidth={2.5} />
            {piMode ? "Add PI Item Line" : "Add Product Line"}
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:thin]">
        <div className="min-w-0 border border-gray-200">
          <OrderItemsHeader className={rowGridClass} currencySymbol={currencySymbol} />

          <div className="divide-y divide-slate-100">
            {items.map((item, index) => (
              <OrderItemRow
                key={item.id}
                index={index}
                item={item}
                className={rowGridClass}
                currency={currency}
                gstPercent={item.gst}
                piMode={piMode}
                piItems={piItems}
                selectedPiItemIds={selectedPiItemIds}
                handleDeleteRow={handleDeleteRow}
                handleFieldChange={handleFieldChange}
                handleProductSelect={handleProductSelect}
                handlePiItemSelect={handlePiItemSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderItems;
