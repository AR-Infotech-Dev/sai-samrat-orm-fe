import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Loader2, Package, Search } from "lucide-react";
import { makeRequest } from "@api/httpClient";
import { formatIndianCurrency } from "@modules/orders/shared/utils/currency.utils";

const productCache = new Map();
const numberFormat = new Intl.NumberFormat("en-IN");

const normalizeProduct = (item = {}) => {
  const productName = item.product_name || item.product || item.name || item.item_name || "Unnamed Product";
  const productId = item.product_id || item.id || item.tally_item_id || productName;
  const model = item.series || item.brand || item.model || item.product_type_name || item.product_type || item.categoryName || "-";
  const readyStock = Number(item.ready_stock ?? item.readyStock ?? item.stock_qty ?? item.stock ?? item.current_stock ?? item.available_stock ?? 0);
  const pendingStock = Number(item.pending_stock ?? item.pendingStock ?? item.pending_qty ?? item.pending ?? 0);

  return {
    ...item,
    product_id: productId,
    product: productName,
    productCode: item.product_code || item.productCode || item.item_code || item.code || "-",
    model,
    weight: Number(item.weight ?? item.weight_kg ?? item.standard_weight ?? 0),
    unitRate: Number(item.standard_rate ?? item.unitRate ?? item.rate ?? item.sales_rate ?? 0),
    gst: Number(item.gst_rate ?? item.gst ?? item.tax_rate ?? 0),
    readyStock,
    pendingStock,
    category: item.category || item.categoryName || item.product_type_name || model,
  };
};

const getCacheKey = (searchText = "") => `products:${searchText.trim().toLowerCase()}`;

function ProductSmartSelect({ value, onSelect, disabled = false, apiUrl = "/products" }) {
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const requestIdRef = useRef(0);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectedLabel = selectedProduct?.product || value || "Select Product";

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return products;

    return products.filter((item) =>
      [item.product, item.model, item.productCode, item.category]
        .filter(Boolean)
        .some((text) => String(text).toLowerCase().includes(keyword))
    );
  }, [products, search]);

  const fetchProducts = async (searchText = "") => {
    const cacheKey = getCacheKey(searchText);
    const cached = productCache.get(cacheKey);
    if (cached) {
      setProducts(cached);
      return cached;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);

    try {
      const response = await makeRequest(apiUrl, {
        method: "POST",
        body: {
          status: "active",
          page: 1,
          searchText,
          filters: [],
          order: "DESC",
          order_by: "product_id",
        },
      });

      const rows = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.rows)
          ? response.rows
          : Array.isArray(response?.data?.rows)
            ? response.data.rows
            : Array.isArray(response?.result)
              ? response.result
              : [];

      const normalized = rows.map(normalizeProduct);
      productCache.set(cacheKey, normalized);

      if (requestIdRef.current === requestId) {
        setProducts(normalized);
      }

      return normalized;
    } catch (error) {
      console.error("Failed to fetch products", error);
      if (requestIdRef.current === requestId) {
        setProducts([]);
      }
      return [];
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchProducts("");
  }, []);

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

      const dropdownWidth = Math.min(380, Math.max(320, window.innerWidth - 24));
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

  useEffect(() => {
    const nextSelected = products.find((item) =>
      String(item.product_id) === String(value) || item.product === value
    );

    if (nextSelected) {
      setSelectedProduct(nextSelected);
    } else if (!value) {
      setSelectedProduct(null);
    }
  }, [products, value]);

  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => {
      fetchProducts(search.trim());
    }, 250);

    return () => window.clearTimeout(timer);
  }, [search, open]);

  const handleSelect = (product) => {
    setSelectedProduct(product);
    setSearch("");
    setOpen(false);
    onSelect?.(product);
  };

  return (
    <div ref={rootRef} className="relative min-w-0 w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={`flex h-8 w-full min-w-0 items-center justify-between gap-2 rounded-sm   bg-slate-50 px-2 text-left text-xs font-medium text-slate-700 outline-none transition hover:border-orange-300 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-400/15 border border-gray-200 ${open ? "border-orange-400 bg-white ring-2 ring-orange-400/15" : "border-gray-200"
          } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
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
                placeholder="Search product, series, code..."
                className="h-8 w-full rounded-sm border border-gray-200 text-gray-600 pl-8 pr-8 text-xs outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-400/15"
              />
              {loading ? <Loader2 size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin text-orange-500" /> : null}
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-1.5 [scrollbar-width:thin]">
            {filteredProducts.length ? (
              filteredProducts.map((product) => {
                const isSelected = String(selectedProduct?.product_id) === String(product.product_id);

                return (
                  <button
                    key={`${product.product_id}-${product.productCode}`}
                    type="button"
                    onClick={() => handleSelect(product)}
                    className={`group flex w-full gap-2 rounded-sm p-2 text-left transition ${isSelected ? "bg-orange-50" : "hover:bg-orange-50"
                      }`}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-orange-100 group-hover:text-orange-600">
                      <Package size={15} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="min-w-0">
                          <p className="block truncate text-xs">
                            <span className="font-semibold text-slate-800">
                              {product.product}
                            </span>
                            <span className="rounded bg-orange-50 text-xs px-1 py-0.5 text-orange-600 ml-2"> ₹ {formatIndianCurrency(product.unitRate || 0)} </span>
                          </p>
                          <span className="mt-0.5 block truncate text-[11px] text-slate-400">
                            {product.productCode} • {product.model} • {product.weight || 0}Kg
                          </span>
                        </span>
                        {isSelected ? <Check size={14} className="mt-0.5 shrink-0 text-orange-500" /> : null}
                      </span>

                      <span className="mt-2 grid grid-cols-4 gap-1.5 text-[10px]">
                        {/* <span className="rounded bg-emerald-50 px-1.5 py-1 text-emerald-700">
                          Stock {numberFormat.format(product.readyStock || 0)}
                        </span> */}
                        {/* <span className="rounded bg-red-50 px-1.5 py-1 text-red-600">
                          Pend {numberFormat.format(product.pendingStock || 0)}
                        </span> */}
                        {/* <span className="rounded bg-orange-50 px-1.5 py-1 text-orange-600">
                          ₹ {formatIndianCurrency(product.unitRate || 0)}
                        </span> */}
                        {/* <span className="rounded bg-slate-50 px-1.5 py-1 text-slate-500">
                          GST {product.gst || 0}%
                        </span> */}
                      </span>
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-6 text-center text-xs text-slate-400">
                {loading ? "Loading products..." : "No products found."}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default ProductSmartSelect;





