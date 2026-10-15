import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { addMonthsForInputDate, getCurrencyCode, getDefaultOrderDates, getOrderIdentifier, normalizeOrderData } from "../utils/booking.utils";
import { getCurrencyExchangeRates, getOrderBookingDetails, getProformaInvoiceItemsForBooking, saveOrderBooking } from "../data/booking.service";
import { ordersModuleSchema } from "../data/module.schema";

const getValidOrderItems = (items = []) => {
    return items.filter((item) => {
        const productId = Number(item.product_id || item.id || 0);
        const qty = Number(item.qty || item.order_qty || 0);
        return productId > 0 && qty > 0;
    });
};

const mapApiOrderItems = (items = [], order = {}) => {
    if (!Array.isArray(items)) return [];
    const exchangeRate = Number(order.exchange_rate || 1) || 1;

    return items.map((item, index) => ({
        id: item.order_item_id || `${item.order_id || "order"}-${index}`,
        order_item_id: item.order_item_id || null,
        product_id: item.product_id || null,
        pi_item_id: item.pi_item_id || null,
        available_qty: Number(item.available_qty ?? item.order_qty ?? 0),
        product: item.product_name_snapshot || item.product_name || null,
        productCode: item.product_code_snapshot || item.product_code || null,
        model: item.brand_snapshot || item.brand || null,
        weight: Number(item.weight || 0),
        qty: Number(item.order_qty || 0),
        unitRate: Number(item.unit_rate || item.standard_rate || 0),
        unitRateInInr: Number(item.unit_rate_in_inr || item.standard_rate || item.unit_rate / exchangeRate || 0),
        standard_rate: Number(item.standard_rate || item.unit_rate / exchangeRate || 0),
        gst: Number(item.gst_rate || 0),
        readyStock: Number(item.ready_stock || item.readyStock || 0),
        pendingStock: Number(item.pending_stock || item.pendingStock || 0),
    }));
};

const extractRows = (response) => {
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    return [];
};

export const useOrderBookingForm = ({ isOpen, onClose, onAfterSave, selectedOrder }) => {
    const [loading, setLoading] = useState(false);
    const [fetchingOrder, setFetchingOrder] = useState(false);
    const [formData, setFormData] = useState(() => ({
        ...ordersModuleSchema.form.initialValues,
        ...getDefaultOrderDates(),
    }));
    const [initialOrderItems, setInitialOrderItems] = useState([]);
    const [piItems, setPiItems] = useState([]);
    const [errors, setErrors] = useState({});
    const [currencyRateLoading, setCurrencyRateLoading] = useState(false);
    const mode = selectedOrder ? "edit" : "create";
    const orderID = getOrderIdentifier(selectedOrder);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!isOpen || !orderID) { return; }
            try {
                setFetchingOrder(true);
                const res = await getOrderBookingDetails(orderID)
                const orderData = res?.data;
                setFormData(normalizeOrderData(orderData));
                setInitialOrderItems(mapApiOrderItems(orderData?.items, orderData));
                if (orderData?.pi_id) {
                    const piItemResponse = await getProformaInvoiceItemsForBooking(orderData.pi_id);
                    setPiItems(extractRows(piItemResponse));
                } else {
                    setPiItems([]);
                }
            } catch (error) {
                toast.error("Unable to fetch order details");
                setFormData(normalizeOrderData(selectedOrder));
                setInitialOrderItems(mapApiOrderItems(selectedOrder?.items, selectedOrder));
                setPiItems([]);
            } finally {
                setFetchingOrder(false);
            }
        };
        // EDIT MODE
        if (selectedOrder && isOpen) { fetchOrderDetails(); return; }
        // CREATE MODE
        setFormData({
            ...ordersModuleSchema.form.initialValues,
            ...getDefaultOrderDates(),
        });
        setInitialOrderItems([]);
        setPiItems([]);
    }, [selectedOrder, isOpen, orderID]);

    useEffect(() => {
        const currencyCode = getCurrencyCode(formData.currency || "INR");
        if (!isOpen) return;
        const savedCurrencyCode = getCurrencyCode(selectedOrder?.currency || "");
        if (mode === "edit" && formData.order_id && currencyCode === savedCurrencyCode && Number(formData.exchange_rate || 0) > 0) {
            return;
        }

        if (currencyCode === "INR") {
            if (formData.currency !== "INR" || Number(formData.exchange_rate || 1) !== 1) {
                setFormData((current) => ({ ...current, currency: "INR", exchange_rate: 1 }));
            }
            return;
        }

        let cancelled = false;
        const fetchRate = async () => {
            try {
                setCurrencyRateLoading(true);
                const response = await getCurrencyExchangeRates([currencyCode]);
                const rate = Number(response?.rates?.[currencyCode] || response?.data?.rates?.[currencyCode] || 0);
                if (!cancelled && rate > 0) {
                    setFormData((current) => ({ ...current, currency: currencyCode, exchange_rate: rate }));
                }
            } catch (error) {
                if (!cancelled) toast.error(error.message || "Unable to fetch currency exchange rate");
            } finally {
                if (!cancelled) setCurrencyRateLoading(false);
            }
        };

        fetchRate();
        return () => {
            cancelled = true;
        };
    }, [formData.currency, isOpen]);

    const handleClose = () => {
        setFormData({
            ...ordersModuleSchema.form.initialValues,
            ...getDefaultOrderDates(),
        });
        setInitialOrderItems([]);
        setPiItems([]);
        setErrors({});
        onClose();
    }
    const handleChange = (event) => {
        const { name, value } = event.target;
        let nextData = {
            ...formData,
            [name]: value,
        };
        if (name === "order_date") {
            nextData.expected_delivery_date = addMonthsForInputDate(value, 1);
        }
        if (name == 'order_type') {
            const gst_rate = value == 'domestic' ? Number(18) : (value == 'export' ? Number(0) : Number(0.1));
            const currency = value === "domestic" ? "INR" : "USD";
            nextData = {
                ...nextData,
                gst_rate: gst_rate,
                currency,
                exchange_rate: currency === "INR" ? 1 : nextData.exchange_rate,
                customer_id: null,
                customer_name: "",
                pi_id: null,
                pi_number: "",
            }
        }
        if (name === "customer_id") {
            nextData = {
                ...nextData,
                pi_id: null,
                pi_number: "",
            };
            setPiItems([]);
            setInitialOrderItems([]);
        }
        setFormData(nextData);
    };
    const handleObjectSelect = async (field, item) => {
        const selected = item?.original || item || {};
        if (field?.name === "customer_id") {
            setFormData((current) => ({
                ...current,
                customer_id: selected?.customer_id || item?.value || null,
                customer_name: selected?.name || item?.label || "",
                pi_id: null,
                pi_number: "",
            }));
            setPiItems([]);
            setInitialOrderItems([]);
            return;
        }

        if (field?.name !== "pi_number") return;

        const piId = selected?.pi_id || null;
        setFormData((current) => ({
            ...current,
            pi_id: piId,
            pi_number: selected?.pi_no || item?.value || "",
            brand: selected?.brand || current.brand,
            order_type: selected?.order_type || current.order_type,
            currency: selected?.currency || current.currency,
            exchange_rate: selected?.exchange_rate || current.exchange_rate,
            gst_rate: selected?.gst_rate ?? current.gst_rate,
        }));
        setInitialOrderItems([]);
        if (!piId) {
            setPiItems([]);
            return;
        }

        try {
            const response = await getProformaInvoiceItemsForBooking(piId);
            const rows = extractRows(response);
            setPiItems(rows);
        } catch (error) {
            setPiItems([]);
            toast.error(error.message || "Unable to fetch PI items");
        }
    };
    const handleSave = async ({ items = [], summary = {}, statusOverride } = {}) => {
        const result = ordersModuleSchema.validationSchema.safeParse(formData);
        if (result.success == false) {
            const newErrors = {};
            result.error.issues.forEach((item) => {
                newErrors[item.path[0]] = item.message;
            });
            setErrors(newErrors);
            return;
        }

        const validItems = getValidOrderItems(items);
        if (!validItems.length) {
            toast.error(formData.pi_id ? "Please add at least one PI item with quantity" : "Please add at least one product with quantity");
            return;
        }
        if (formData.pi_id) {
            const missingPiItem = validItems.find((item) => !item.pi_item_id);
            if (missingPiItem) {
                toast.error("Please select item from PI list");
                return;
            }

            const overBookedItem = validItems.find((item) => {
                const qty = Number(item.qty || 0);
                const availableQty = Number(item.available_qty || 0);
                return qty > availableQty;
            });
            if (overBookedItem) {
                toast.error(`Qty cannot be more than PI remaining qty (${overBookedItem.available_qty})`);
                return;
            }
        }
        try {
            setErrors({});
            setLoading(true);
            const payload = {
                order: {
                    ...formData,
                    customer_id: formData.customer_id || formData.client_id,
                    remarks: formData.remarks || formData.remark,
                    order_status: statusOverride || formData.order_status || "draft",
                    total_order_qty: summary.totalQty || 0,
                    total_order_value: summary.subtotal || 0,
                    total_value_in_inr: summary.grandTotal || 0,
                    currency: formData.currency || "INR",
                    exchange_rate: formData.exchange_rate || 1,
                    source: formData.source || "manual",
                    status: formData.status || "active",
                },
                items: validItems,
                summary,
            };

            const res = await saveOrderBooking({ mode, orderID, payload });
            if (res.success) {
                toast.success(
                    res?.message ||
                    `Order ${mode === "create" ? "created" : "updated"} successfully`
                );
                setFormData({
                    ...ordersModuleSchema.form.initialValues,
                    ...getDefaultOrderDates(),
                });
                setInitialOrderItems([]);
                setPiItems([]);
                onClose();
                onAfterSave?.();
                return;
            }
            toast.error(res?.message || "Something went wrong");
        } catch (error) {
            toast.error(error.message || "Server error");
        } finally {
            setLoading(false);
        }
    };
    return {
        loading,
        fetchingOrder,
        formData,
        initialOrderItems,
        piItems,
        errors,
        currencyRateLoading,
        handleClose,
        handleChange,
        handleObjectSelect,
        handleSave,
    }
}
