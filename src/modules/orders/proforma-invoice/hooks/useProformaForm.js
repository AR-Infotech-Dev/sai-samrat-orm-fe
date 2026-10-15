import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { getCurrencyExchangeRates } from "@modules/orders/booking/data/booking.service";
import { getProformaInvoiceDetails, saveProformaInvoice } from "../data/proforma.service";
import { getDefaultValidUntilDate, proformaModuleSchema } from "../data/module.schema";
import { buildPiSummary, calculatePiItem, createBlankPiItem, convertInrToCurrency, getCurrencyByOrderType, getGstRateByOrderType, normalizePiData, normalizePiItems, roundMoney, toNumber } from "../utils/proforma.utils";

const getCurrencyCode = (currency = "INR") => {
  const normalized = String(currency || "INR").trim().toUpperCase();
  const currencyMap = { "₹": "INR", INR: "INR", "$": "USD", USD: "USD", "€": "EUR", EUR: "EUR", "£": "GBP", GBP: "GBP", "¥": "JPY", JPY: "JPY" };
  return currencyMap[normalized] || normalized || "INR";
};

export const useProformaForm = ({ isOpen, onClose, onAfterSave, selectedPi }) => {
  const [formData, setFormData] = useState(proformaModuleSchema.initialValues);
  const [items, setItems] = useState([createBlankPiItem(proformaModuleSchema.initialValues.gst_rate)]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [currencyRateLoading, setCurrencyRateLoading] = useState(false);

  const mode = selectedPi?.pi_id ? "edit" : "create";
  const headerGstRate = toNumber(formData.gst_rate);
  const summary = useMemo(() => buildPiSummary(items), [items]);

  const applyItems = (nextItems) => setItems(nextItems.map((item) => calculatePiItem(item, headerGstRate)));

  const resetForm = () => {
    const normalized = normalizePiData();
    setFormData(normalized);
    setItems([createBlankPiItem(normalized.gst_rate)]);
    setErrors({});
  };

  const loadDetails = async () => {
    if (!selectedPi?.pi_id) return;
    try {
      setFetching(true);
      const res = await getProformaInvoiceDetails(selectedPi.pi_id);
      if (!res.success) { toast.error(res.message || "Unable to load proforma invoice"); return; }
      const data = res?.data?.pi_id
        ? res.data
        : res?.data?.data?.pi_id
          ? res.data.data
          : res?.pi_id
            ? res
            : res.data || {};
      const normalized = normalizePiData(data);
      setFormData(normalized);
      setItems(normalizePiItems(data.items || [], normalized.gst_rate));
      setErrors({});
    } catch (error) {
      toast.error(error.message || "Unable to load proforma invoice");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    if (selectedPi?.pi_id) {
      loadDetails();
      return;
    }
    resetForm();
  }, [isOpen, selectedPi?.pi_id]);

  useEffect(() => {
    if (!isOpen) return;
    const currencyCode = getCurrencyCode(formData.currency || "INR");
    if (currencyCode === "INR") {
      if (formData.exchange_rate !== 1) setFormData((current) => ({ ...current, currency: "INR", exchange_rate: 1 }));
      return;
    }

    let alive = true;
    const loadRate = async () => {
      try {
        setCurrencyRateLoading(true);
        const res = await getCurrencyExchangeRates([currencyCode]);
        const rates = res?.data?.rates || res?.rates || {};
        const nextRate = Number(rates[currencyCode] || formData.exchange_rate || 1);
        if (!alive || !Number.isFinite(nextRate) || nextRate <= 0) return;
        setFormData((current) => ({ ...current, currency: currencyCode, exchange_rate: nextRate }));
      } finally {
        if (alive) setCurrencyRateLoading(false);
      }
    };

    loadRate();
    return () => { alive = false; };
  }, [isOpen, formData.currency]);

  useEffect(() => {
    setItems((current) => current.map((item) => calculatePiItem({ ...item, gst_rate: headerGstRate }, headerGstRate)));
  }, [headerGstRate]);

  useEffect(() => {
    const rate = toNumber(formData.exchange_rate, 1) || 1;
    setItems((current) => current.map((item) => {
      const baseInrRate = toNumber(item.unit_rate_in_inr || item.standard_rate || 0);
      if (!baseInrRate) return calculatePiItem(item, headerGstRate);
      return calculatePiItem({ ...item, unit_rate: convertInrToCurrency(baseInrRate, rate) }, headerGstRate);
    }));
  }, [formData.exchange_rate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    let nextData = { ...formData, [name]: value };
    if (name === "order_type") nextData = { ...nextData, gst_rate: getGstRateByOrderType(value), currency: getCurrencyByOrderType(value) };
    if (name === "currency") nextData = { ...nextData, currency: getCurrencyCode(value) };
    if (name === "pi_date") nextData = { ...nextData, valid_until: getDefaultValidUntilDate(value) };
    setFormData(nextData);
    if (errors[name]) setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleCustomerSelect = (item = {}) => {
    const original = item.original || item;
    setFormData((current) => ({
      ...current,
      customer_id: item.value || original.customer_id || current.customer_id,
      customer_name: item.label || original.name || current.customer_name,
      customer_email: original.email || current.customer_email,
      customer_mobile: original.mobile_no || current.customer_mobile,
      country_of_export: current.country_of_export || original.country || "",
      final_destination: current.final_destination || original.country || "",
    }));
    setErrors((current) => ({ ...current, customer_id: "" }));
  };

  const updateItem = (rowId, field, value) => {
    const numericFields = ["weight", "qty", "unit_rate", "gst_rate"];
    const numericValue = value === "" ? "" : Number(value);
    applyItems(items.map((item) => item.id === rowId ? { ...item, [field]: numericFields.includes(field) ? numericValue : value } : item));
  };

  const handleProductSelect = (rowId, product = {}) => {
    const rate = toNumber(formData.exchange_rate, 1) || 1;
    applyItems(items.map((item) => item.id === rowId ? {
      ...item,
      product_id: product.product_id,
      product: product.product,
      product_code: product.productCode,
      model: product.model,
      weight: product.weight,
      unit_rate: convertInrToCurrency(product.unitRate, rate),
      unit_rate_in_inr: product.unitRate,
      standard_rate: product.unitRate,
      gst_rate: headerGstRate,
      product_marking: item.product_marking || product.productMarking || product.productDescription || product.product || "",
    } : item));
  };

  const addItem = () => applyItems([...items, createBlankPiItem(headerGstRate)]);
  const deleteItem = (rowId) => {
    const nextItems = items.filter((item) => item.id !== rowId);
    applyItems(nextItems.length ? nextItems : [createBlankPiItem(headerGstRate)]);
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.customer_id) nextErrors.customer_id = "Customer is required";
    if (!formData.pi_date) nextErrors.pi_date = "PI date is required";
    const validItems = items.filter((item) => toNumber(item.product_id) > 0 && toNumber(item.qty) > 0);
    if (!validItems.length) nextErrors.items = "At least one product line is required";
    if (validItems.some((item) => !String(item.brand || "").trim())) nextErrors.items = "Brand is required for every PI item";
    setErrors(nextErrors);
    return { isValid: Object.keys(nextErrors).length === 0, validItems };
  };

  const buildPayload = (validItems) => {
    const normalizedItems = validItems.map((item) => calculatePiItem(item, headerGstRate));
    const normalizedSummary = buildPiSummary(normalizedItems);
    return {
      proforma: {
        ...formData,
        total_qty: normalizedSummary.total_qty,
        total_value: roundMoney(normalizedSummary.total_value),
        total_value_in_inr: formData.currency === "INR" ? roundMoney(normalizedSummary.total_value) : roundMoney(normalizedSummary.total_value / (toNumber(formData.exchange_rate, 1) || 1)),
      },
      items: normalizedItems.map((item) => ({
        pi_item_id: item.pi_item_id || null,
        product_id: item.product_id,
        product_code: item.product_code,
        product_name: item.product,
        model: item.model,
        brand: item.brand,
        weight: roundMoney(item.weight),
        qty: roundMoney(item.qty),
        unit_rate: roundMoney(item.unit_rate),
        unit_rate_in_inr: roundMoney(item.unit_rate_in_inr || item.standard_rate),
        gst_rate: toNumber(item.gst_rate),
        product_marking: item.product_marking || "",
        line_value: roundMoney(item.line_value),
      })),
    };
  };

  const handleSave = async () => {
    const { isValid, validItems } = validate();
    if (!isValid) return null;
    try {
      setLoading(true);
      const res = await saveProformaInvoice({ mode, piId: selectedPi?.pi_id, payload: buildPayload(validItems) });
      if (!res.success) { toast.error(res.message || "Unable to save Proforma Invoice"); return null; }
      toast.success(res.message || "Proforma Invoice saved");
      onAfterSave?.();
      onClose?.();
      return res.data;
    } catch (error) {
      toast.error(error.message || "Unable to save Proforma Invoice");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
};
