import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { getOrderIdentifier, normalizeOrderData } from "../utils/orders.utils";
import { getConfirmationOrderDetails } from "../data/confirmation.service";
import { ordersModuleSchema } from "../data/module.schema";

const mapApiOrderItems = (items = []) => {
  if (!Array.isArray(items)) return [];

  return items.map((item = {}) => ({
    order_item_id: item.order_item_id ?? null,
    company_id: item.company_id ?? null,
    order_id: item.order_id ?? null,
    product_id: item.product_id ?? null,
    product_code_snapshot: item.product_code_snapshot ?? null,
    product_name_snapshot: item.product_name_snapshot ?? null,
    brand_snapshot: item.brand_snapshot ?? null,
    order_qty: Number(item.order_qty ?? 0),
    item_status: item.item_status ?? null,
    expected_delivery_date: item.expected_delivery_date ?? null,
    remarks: item.remarks ?? null,
    status: item.status ?? null,
    product_code: item.product_code ?? null,
    product_name: item.product_name ?? null,
    product: item.product ?? item.product_name ?? item.product_name_snapshot ?? null,
    brand: item.brand ?? null,
    weight: Number(item.weight ?? 0),
    gst_rate: Number(item.gst_rate ?? 0),
    unit_rate: Number(item.unit_rate ?? 0),
    line_value: Number(item.line_value ?? 0),
    standard_rate: Number(item.standard_rate ?? 0),
  }));
};

export const useConfirmationOrderForm = ({ isOpen, onClose, selectedOrder }) => {
  const [fetchingOrder, setFetchingOrder] = useState(false);
  const [formData, setFormData] = useState(ordersModuleSchema.form.initialValues);
  const [initialOrderItems, setInitialOrderItems] = useState([]);
  const orderID = getOrderIdentifier(selectedOrder);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!isOpen || !orderID) return;
      try {
        setFetchingOrder(true);
        const res = await getConfirmationOrderDetails(orderID);
        if (!res?.success) {
          toast.error(res?.message || "Unable to fetch order details");
          return;
        }
        const orderData = res?.data || {};
        setFormData(normalizeOrderData(orderData));
        setInitialOrderItems(mapApiOrderItems(orderData?.items));
      } catch (error) {
        toast.error(error.message || "Unable to fetch order details");
        setFormData(normalizeOrderData(selectedOrder));
        setInitialOrderItems(mapApiOrderItems(selectedOrder?.items));
      } finally {
        setFetchingOrder(false);
      }
    };

    if (selectedOrder && isOpen) {
      fetchOrderDetails();
      return;
    }

    setFormData(ordersModuleSchema.form.initialValues);
    setInitialOrderItems([]);
  }, [selectedOrder, isOpen, orderID]);

  const handleClose = () => {
    setFormData(ordersModuleSchema.form.initialValues);
    setInitialOrderItems([]);
    onClose();
  };

  return {
    fetchingOrder,
    formData,
    initialOrderItems,
    handleClose,
  };
};
