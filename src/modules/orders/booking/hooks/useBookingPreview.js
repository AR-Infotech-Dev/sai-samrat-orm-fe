import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getOrderBookingPreview } from "../data/booking.service";

const mapPreviewData = (data) => { return { order: data?.order || {}, items: Array.isArray(data?.items) ? data.items : [], company: data?.company || {}, }; };
export const useBookingPreview = ({ isOpen, selectedOrder, }) => {
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState({ order: {}, items: [], company: {}, });
  useEffect(() => {
    const fetchPreview = async () => {
      if (!isOpen || !selectedOrder?.order_id) {
        return;
      }

      try {
        setLoading(true);
        const response = await getOrderBookingPreview(
          selectedOrder.order_id
        );
        if (response?.success) {
          setPreviewData(mapPreviewData(response.data));
        } else {
          toast.error(
            response?.message || "Unable to fetch preview"
          );
        }
      } catch (error) {
        console.error("Preview API error:", error);
        toast.error(
          error?.message || "Unable to fetch order preview"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [isOpen, selectedOrder?.order_id]);
  return {
    loading,
    previewData,
  };
};