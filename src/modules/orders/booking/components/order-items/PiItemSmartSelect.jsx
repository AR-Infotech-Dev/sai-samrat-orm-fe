import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, FileText, Search } from "lucide-react";
import { formatIndianCurrency, getCurrencySymbol } from "../../utils/booking.utils";

const numberFormat = new Intl.NumberFormat("en-IN");

const normalizePiItem = (item = {}) => {
  const productName = item.product_name_snapshot || item.product_name || item.product || "Unnamed Product";
  const piQty = Number(item.qty || 0);
  const bookedQty = Number(item.booked_qty || 0);
  const availableQty = Number(item.available_qty ?? Math.max(piQty - bookedQty, 0));

  return {
    ...item,
    pi_item_id: item.pi_item_id,
    product_id: item.product_id,
    product: productName,
    productCode: item.product_code_snapshot || item.product_code || "-",
    model: item.brand_snapshot || item.model || item.brand || "-",
    weight: Number(item.weight || 0),
    piQty,
    bookedQty,
    availableQty,
    unitRate: Number(item.unit_rate || 0),
    unitRateInInr: Number(item.unit_rate_in_inr || item.unit_rate || 0),
    gst: Number(item.gst_rate ?? item.line_gst ?? 0),
  };
};

function PiItemSmartSelect({ value, piItems = [], selectedPiItemIds = [], currentPiItemId = null, currency = "INR", onSelect, disabled = false }) {
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState({});

  const normalizedItems = useMemo(() => piItems.map(normalizePiItem), [piItems]);
  const selectedItem = normalizedItems.find((item) => String(item.pi_item_id) === String(currentPiItemId));
  const selectedLabel = selectedItem?.product || value || "Select PI Item";
  const currencySymbol = getCurrencySymbol(currency);

  const filteredItems = useMemo(() => {
    const selectedSet = new Set(selectedPiItemIds.map((id) => String(id)));
    const keyword = search.trim().toLowerCase();

    return normalizedItems.filter((item) => {
      const isCurrent = String(item.pi_item_id) === String(currentPiItemId);
      if (!isCurrent && selectedSet.has(String(item.pi_item_id))) return false;
      if (!isCurrent && Number(item.availableQty || 0) <= 0) return false;
      if (!keyword) return true;

      return [item.product, item.productCode, item.model]
        .filter(Boolean)
        .some((text) => String(text).toLowerCase().includes(keyword));
    });
  }, [currentPiItemId, normalizedItems, search, selectedPiItemIds]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (!rootRef.current?.contains(target) && !dropdownRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;

    const updateDropdownPosition = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;

      const dropdownWidth = Math.min(430, Math.max(340, window.innerWidth - 24));
      const left = Math.min(rect.left, window.innerWidth - dropdownWidth - 12);
      setDropdownStyle({
        top: `${rect.bottom + 4}px`,
        left: `${Math.max(12, left)}px`,
        width: `${dropdownWidth}px`,
      });
    };

    updateDropdownPosition();
    window.setTimeout(() => inputRef.current?.focus(), 0);
    window.addEventListener("scroll", updateDropdownPosition, true);
    window.addEventListener("resize", updateDropdownPosition);

    return () => {
      window.removeEventListener("scroll", updateDropdownPosition, true);
      window.removeEventListener("resize", updateDropdownPosition);
    };
  }, [open]);

  const handleSelect = (item) => {
    setSearch("");
    setOpen(false);
    onSelect?.(item);
  };

  return (
    <div ref={rootRef} className="relative min-w-0 w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={`flex h-8 w-full min-w-0 items-center justify-between gap-2 rounded-sm border bg-slate-50 px-2 text-left text-xs font-medium text-slate-700 outline-none transition hover:border-orange-300 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-400/15 ${open ? "border-orange-400 bg-white ring-2 ring-orange-400/15" : "border-gray-200"} ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
      >
        <span className="min-w-0 truncate">{selectedLabel}</span>
        <ChevronDown size={14} className={`shrink-0 text-slate-400 transition ${open ? "rotate-180 text-orange-500" : ""}`} />
      </button>

      {open && createPortal(
        <div ref={dropdownRef} style={{ ...dropdownStyle, position: "fixed", zIndex: 9999 }} className="overflow-hidden rounded-xl border border-orange-100 bg-white shadow-2xl shadow-slate-900/15">
          <div className="border-b border-slate-100 bg-white p-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={inputRef}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search PI item, code, series..."
                className="h-8 w-full rounded-sm border border-gray-200 pl-8 pr-2 text-xs text-gray-600 outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-400/15"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-1.5 [scrollbar-width:thin]">
            {filteredItems.length ? (
              filteredItems.map((item) => {
                const isSelected = String(currentPiItemId) === String(item.pi_item_id);

                return (
                  <button
                    key={item.pi_item_id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={`group flex w-full gap-2 rounded-sm p-2 text-left transition ${isSelected ? "bg-orange-50" : "hover:bg-orange-50"}`}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-orange-100 group-hover:text-orange-600">
                      <FileText size={15} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="min-w-0">
                          <p className="block truncate text-xs">
                            <span className="font-semibold text-slate-800">{item.product}</span>
                            <span className="ml-2 rounded bg-orange-50 px-1 py-0.5 text-xs text-orange-600">
                              {currencySymbol} {formatIndianCurrency(item.unitRate || 0)}
                            </span>
                          </p>
                          <span className="mt-0.5 block truncate text-[11px] text-slate-400">
                            {item.productCode} • {item.model} • {item.weight || 0}Kg
                          </span>
                        </span>
                        {isSelected ? <Check size={14} className="mt-0.5 shrink-0 text-orange-500" /> : null}
                      </span>

                      <span className="mt-2 grid grid-cols-3 gap-1.5 text-[10px]">
                        <span className="rounded bg-blue-50 px-1.5 py-1 text-blue-700">PI {numberFormat.format(item.piQty || 0)}</span>
                        <span className="rounded bg-slate-50 px-1.5 py-1 text-slate-600">Booked {numberFormat.format(item.bookedQty || 0)}</span>
                        <span className="rounded bg-emerald-50 px-1.5 py-1 text-emerald-700">Remain {numberFormat.format(item.availableQty || 0)}</span>
                      </span>
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-6 text-center text-xs text-slate-400">
                No remaining PI items found.
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default PiItemSmartSelect;
