import { useEffect, useMemo, useState } from "react";
import { getOrderBookingPreview } from "../data/booking.service";
import { X } from "lucide-react";
import ActionButton from "@components/ui/ActionButton";
import FlyoutPanel from "@components/ui/FlyoutPanel";
import Spinner from "@components/ui/Spinner";
import { useOrderBookingForm } from "../hooks/useBookingForm";
import { numberToWords } from "../utils/booking.utils";

function PreviewFile({ isOpen, onClose, selectedOrder, onAfterSave, menu_id }) {
  const [orderItems, setOrderItems] = useState([]);
  const { loading, fetchingOrder, formData, initialOrderItems, errors, handleClose, handleChange, handleSave } = useOrderBookingForm({ isOpen, onClose, selectedOrder, onAfterSave });
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [setLoading] = useState(false);
  const customer = previewData?.customerDetails || {};
  const totalPIValue = Number(previewData?.summary?.totalPIValue || 0);
  const totalPIValueInWords = numberToWords(totalPIValue);
  const orderID = selectedOrder?.order_id;

  useEffect(() => {
    const fetchPreview = async () => {
      if (!isOpen || !selectedOrder?.order_id) { return; }
      try {
        setPreviewLoading(true);
        const res = await getOrderBookingPreview(selectedOrder.order_id);
        if (res?.success) { setPreviewData(res.data); }
      } catch (error) {
      } finally {
        setPreviewLoading(false);
      }
    }; fetchPreview();
  }, [isOpen, selectedOrder]);
  if (!isOpen) {
    return null;
  }

  return (
    <FlyoutPanel
      isOpen={isOpen}
      onClose={handleClose}
      title={selectedOrder ? "PROFORMA INVOICE" : "Create Order"}
      panelClassName="!w-[860px] max-w-full"
      closeButton={<button className="flyout-close" onClick={handleClose} aria-label="Close panel"><X size={18} /> </button>}
      footer={
        <div className="flex w-full items-center justify-end gap-2 border-t border-slate-100 bg-white px-4 py-2">
          <ActionButton type="button" variant="flyoutSecondary" disabled={loading} onClick={() => handleSave({ ...saveContext, statusOverride: "draft" })} > {loading ? <Spinner size="sm" /> : "Save Draft"} </ActionButton>
          <ActionButton type="button" variant="flyoutPrimary" disabled={loading} onClick={() => handleSave({ ...saveContext, statusOverride: selectedOrder ? undefined : "waiting" })} > {loading ? <Spinner size="sm" /> : selectedOrder ? "Update Order" : "Book Order"} </ActionButton>
        </div>
      }
    >
      <div className="flyout-form-shell h-full overflow-x-hidden  min-h-0  bg-slate-100 p-7">
        <div className="w-full bg-white text-[10px] text-black shadow-lg p-7 ">
          <div className="h-[20px]  flex items-center justify-center">
            <div className="text-[12px] font-bold"> PROFORMA INVOICE</div>
          </div>
          <div className="mx-auto w-full border border-black" >
            {/* ================= TITLE ================= */}
            {/* ================= EXPORTER + INVOICE DETAILS ================= */}
            <div className="grid grid-cols-[55%_45%] border-b border-black">
              {/* ================= EXPORTER ================= */}
              <div className="border-r border-black">
                <div className="h-[20px] flex items-center px-2  font-bold"> EXPORTER <span className=" ml-11 font-bold   leading-[1.20]"> {previewData?.companyDetails?.company_name || "-"} </span>  </div>
                <div className="grid grid-cols-[80px_1fr]  min-h-auto">
                  {/* LOGO */}
                  <div className="flex items-start">
                    <img src={`http://localhost:3003${previewData?.companyDetails?.email_logo}`} alt={previewData?.companyDetails?.company_name || "Company Logo"} className="max-w-[100px] max-h-[75px] object-contain" />
                  </div>
                  <div>
                    <div className="font-semibold "> -</div>
                    <div className="mt-1 leading-[1.35]">  {previewData?.companyDetails?.company_address || "-"} </div>
                    <div className="leading-[1.35]"> State: {previewData?.companyDetails?.state || "-"}  {" "}
                      Country: {previewData?.companyDetails?.country || "-"}</div>
                    <div className="grid grid-cols-[1.45fr_1fr] items-start gap-x-5   leading-[1.35] ">
                      <div>
                        {/* <div className="mt-1 leading-[1.35]"> An ISO 9001 & 14001 Co. | ICM Approved Products </div> */}
                        <div >Email : {previewData?.companyDetails?.sender_email || "-"}</div>
                        <div >  Call : {previewData?.companyDetails?.mobile_number || "-"}</div>
                        <div >  Call : {previewData?.companyDetails?.mobile_number || "-"} </div>
                      </div>
                      <div className="mt-1 leading-[1.35]" >
                        <div> IEC CODE: 3106016043  </div>
                        <div>  PAN NO: {previewData?.companyDetails?.pan || "-"}</div>
                        <div> GST NO: 27ABHCS1151K1Z8 </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* ================= INVOICE DETAILS ================= */}
              <div className="self-start ">
                <div className="grid grid-cols-[155px_1fr] text-[10px]">
                  {/* Invoice No */}
                  <div className=" py-[2px] font-semibold">PROFORMA INVOICE NO. </div>
                  <div className=" py-[3px]"> {previewData?.orderDetails?.order_no || "-"}</div>
                  {/* Invoice Date */}
                  <div className="py-[2px]   border-b border-black font-semibold"> PROFORMA INVOICE DATE </div>
                  <div className=" py-[3px]  border-b border-black"> {previewData?.orderDetails?.order_date || "-"}</div>
                  {/* Payment */}
                  <div className="py-[2px] border-r border-b border-black"> PAYMENT </div>
                  <div className=" py-[2px] border-b border-black"> -</div>
                  {/* Delivery */}
                  <div className=" py-[2px] border-r border-b border-black"> DELIVERY </div>
                  <div className=" py-[2px] border-b border-black">- </div>
                  {/* Delivery Terms */}
                  <div className=" py-[2px] border-r border-b border-black"> DELIVERY TERMS </div>
                  <div className="py-[2px] border-b border-black"> -</div>
                  {/* Packing */}
                  <div className="py-[2px] border-r border-b border-black "> PACKING </div>
                  <div className=" py-[2px] border-b border-black">-</div>
                  {/* Validity */}
                  <div className=" py-[2px] border-r border-b border-black "> VALIDITY OF OFFER </div>
                  <div className=" py-[2px] border-b border-black">--</div>
                  {/* Other Term */}
                  <div className=" py-[2px] border-r border-black"> OTHER TERM </div>
                  <div className=" py-[2px]  "> --</div>
                </div>
              </div>
            </div>
            {/* ================= IMPORTER + CONSIGNEE ================= */}
            <div className="grid grid-cols-[55%_45%]">
              {/* IMPORTER */}
              <div className="border-r text-[9px] border-black">
                <div className="h-[15px]  flex items-center px-1 border-black font-bold"> IMPORTER NAME AND ADDRESS </div>
                <div className="px-1  min-h-auto">
                  <div className="grid grid-cols-[125px_1fr] gap-y-[2px]">
                    <span >FULL NAME:</span>
                    <span>  {customer.name || "-"}</span>
                    <span>ADDRESS:</span>
                    <span>   {customer.address || "-"}</span>
                    <span >Email ID:</span>
                    <span>  {customer.email || "-"}</span>
                    <span >Postal Code:</span>
                    <span> {previewData?.orderDetails?.[0]?.postal_code || formData?.postal_code || selectedOrder?.postal_code || "-"} </span>
                    <span >TELEPHONE:</span>
                    <span>{customer.mobile_no || "-"} </span>
                    <span >VAT NO:</span>
                    <span>{customer.gst_number || "-"}</span>
                    <span >REGISTRATION NO:</span>
                    <span>{customer.pan_number || "-"}</span>
                    <span >COUNTRY OF ORIGIN</span>
                    <span> {previewData?.orderDetails?.[0]?.country || formData?.country || selectedOrder?.country || "-"} </span>
                    <span>PORT OF LOADING</span>
                    <span>-</span>
                    <span>COUNTRY OF EXPORT</span>
                    <span>-</span>
                    <span >PORT OF DISCHARGE</span>
                    <span>-</span>
                    <span >FINAL DESTINATION</span>
                    <span>-</span>
                  </div>
                </div>
              </div>
              {/* CONSIGNEE */}
              <div className="text-[9px]">
                <div className="h-[15px]  flex items-center px-1 border-black font-bold"> CONSIGNEE </div>
                <div className="px-1  min-h-auto">
                  <div className="grid grid-cols-[125px_1fr] gap-y-[2px]">
                    <span>FULL NAME:</span>
                    <span>{customer.name || "-"}</span>
                    <span>ADDRESS:</span>
                    <span>{customer.address || "-"} </span>
                    <span>COUNTRY</span>
                    <span> -</span>
                    <span>Email ID:</span>
                    <span>{customer.email || "-"}</span>
                    <span>Postal Code:</span>
                    <span>-</span>
                    <span>TELEPHONE:</span>
                    <span>{customer.mobile_no || "-"}</span>
                    <span>VAT NO:</span>
                    <span>{customer.gst_number || "-"}</span>
                    <span>REGISTRATION NO:</span>
                    <span>{customer.pan_number || "-"}</span>
                    <span>COUNTRY OF ORIGIN</span>
                    <span>{customer.country || "-"}</span>
                    <span>PORT OF LOADING</span>
                    <span>-</span>
                    <span>COUNTRY OF EXPORT</span>
                    <span>-</span>
                    <span>PORT OF DISCHARGE</span>
                    <span>-</span>
                    <span>FINAL DESTINATION</span>
                    <span>-</span>
                  </div>
                </div>
              </div>
            </div>
            {/* ================= PRODUCT TABLE ================= */}
            <div className="w-full max-w-full min-w-0 overflow-hidden  border-t border-black text-[8px]">
              {/* ================= TABLE HEADER ================= */}
              <div className=" grid w-full min-w-0 grid-cols-[4%_8%_7%_17%_19%_7%_6%_7%_7%_7%_9%] border-b border-black " >
                {/* SR NO */}
                <div className="min-w-0 border-r border-black flex items-center justify-center text-center font-semibold p-1">
                  Sr. No
                </div>
                {/* BRAND */}
                <div className="min-w-0 border-r border-black flex items-center justify-center text-center font-semibold p-1">
                  Brand
                </div>
                {/* MODEL CODE */}
                <div className="min-w-0 border-r border-black flex items-center justify-center text-center font-semibold p-1 leading-[1.1]"> MODEL <br /> CODE </div>
                {/* SAIPL FG CODE */}
                <div className="min-w-0 border-r border-black flex items-center justify-center text-center font-semibold p-1 leading-[1.1]"> SAIPL FG CODE <br /> (ACTUAL PRODUCT <br /> DESCRIPTIONS) </div>
                {/* PRODUCT MARKING */}
                <div className="min-w-0 border-r border-black flex items-center justify-center text-center font-semibold p-1 leading-[1.1]"> PRODUCT MARKING REQUIRED BY <br /> CUSTOMER </div>
                {/* HSN CODE */}
                <div className="min-w-0 border-r border-black flex items-center justify-center text-center font-semibold p-1"> HSN CODE </div>
                {/* UNIT WEIGHT */}
                <div className="min-w-0 border-r border-black flex flex-col items-center justify-center text-center p-1 leading-[1.1]">
                  <span className="font-semibold"> Unit Weight </span>
                  <span> (+/- 2 kg) </span>
                </div>
                {/* ORDER QTY */}
                <div className="min-w-0 border-r border-black flex items-center justify-center text-center font-semibold p-1"> ORDER QTY </div>
                {/* UNIT OF MEASURE */}
                <div className="min-w-0 border-r border-black flex flex-col items-center justify-center text-center p-1 leading-[1.1]">
                  <span className="font-semibold"> UNIT OF </span>
                  <span className="font-semibold"> MEASURE </span>
                  <span className="text-[8px]"> pieces / units / <br /> set / etc. </span>
                </div>
                {/* RATE */}
                <div className="min-w-0 border-r border-black flex flex-col items-center justify-center text-center p-1 leading-[1.1]">
                  <span className="font-semibold"> RATE </span>
                  <span className="font-semibold"> PER UNIT </span>
                  <span className="text-[8px]"> currency USD </span>
                </div>
                {/* TOTAL VALUE */}
                <div className="min-w-0 flex flex-col items-center justify-center text-center p-1 leading-[1.1]">
                  <span className="font-semibold"> TOTAL VALUE </span>
                  <span className="text-[8px]"> Total USD </span>
                </div>

              </div>
              {/* ================= PRODUCT ROWS ================= */}

              {previewData?.items?.length > 0 ? (
                previewData.items.map((item, index) => (
                  <div
                    key={item.order_item_id || item.product_id || index}
                    className="grid w-full min-w-0 grid-cols-[4%_8%_7%_17%_19%_7%_6%_7%_7%_7%_9%] border-b border-black"
                  >
                    {/* SR NO */}
                    <div className="min-w-0 border-r border-black flex items-center justify-center p-1"> {index + 1} </div>
                    {/* BRAND */}
                    <div className="min-w-0 border-r  border-black flex items-center p-1 break-words"> {item.brand || item.brand_snapshot || "-"} </div>
                    {/* MODEL CODE */}
                    <div className="min-w-0 border-r border-black flex items-center justify-center p-1 break-words text-center"> {item.product_code || item.product_code_snapshot || "-"} </div>
                    {/* SAIPL FG CODE / PRODUCT DESCRIPTION */}
                    <div className="min-w-0 border-r  border-black p-1 leading-[1.2] break-words">
                      <div className="font-semibold"> {item.product_code || item.product_code_snapshot || "-"} </div>
                      <div> ( {item.product_name || item.product_name_snapshot || item.product_description || "-"} ) </div>
                    </div>
                    {/* PRODUCT MARKING */}
                    <div className="min-w-0 border-r  border-black p-1 leading-[1.2] break-words">
                      {item.product_description || item.product_name || item.product_name_snapshot || "-"}
                    </div>
                    {/* HSN CODE */}
                    <div className="min-w-0 border-r  border-black flex items-center justify-center p-1 text-center">
                      {item.hsn_code || "-"}
                    </div>
                    {/* UNIT WEIGHT */}
                    <div className="min-w-0 border-r  border-black flex items-center justify-center p-1 text-center">
                      {item.weight ?? "-"}
                    </div>
                    {/* ORDER QTY */}
                    <div className="min-w-0 border-r  border-black flex items-center justify-center p-1 text-center">
                      {item.order_qty ?? 0}
                    </div>
                    {/* UNIT OF MEASURE */}
                    <div className="min-w-0 border-r  border-black flex items-center justify-center p-1 text-center">
                      {item.unit || "-"}
                    </div>
                    {/* RATE */}
                    <div className="min-w-0 border-r  border-black grid grid-cols-[22px_minmax(0,1fr)]">
                      <div className="border-r border-black flex items-center justify-center">
                        {previewData?.orderDetails?.[0]?.currency === "INR" ? "₹" : "$"}
                      </div>
                      <div className="min-w-0 flex items-center justify-end px-1">
                        {Number(item.unit_rate || item.standard_rate || 0).toLocaleString("en-IN")}
                      </div>
                    </div>

                    {/* TOTAL VALUE */}
                    <div className="min-w-0  grid grid-cols-[22px_minmax(0,1fr)]">
                      <div className="border-r border-black flex items-center justify-center">
                        {previewData?.orderDetails?.[0]?.currency === "INR" ? "₹" : "$"}
                      </div>

                      <div className="min-w-0 flex items-center justify-end px-1">
                        {Number(item.line_value || 0).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full border-b border-black p-2 text-center">
                  No products found
                </div>
              )}
            </div>


            {/* ========================================================= BOTTOM SUMMARY / BANK DETAILS ========================================================= */}
            <div className="w-full min-w-0  border-black text-[10px]">
              {/* ===================================================== MAIN GRID Same proportional alignment as your upper table ===================================================== */}
              <div className="grid min-w-0 grid-cols-[36%_64%]">
                {/* ================= LEFT BLANK ================= */}
                <div className="min-w-0 border-r border-black min-h-[127px]" />

                {/* ================= RIGHT SECTION ================= */}
                <div className="grid min-w-0 grid-cols-[41.1%_20%_22%_17.06%]">
                  {/* ================================================= SUMMARY LABEL ================================================= */}
                  <div className="min-w-0 border-r border-black">
                    <div className="h-[25px] flex items-center px-1 border-b border-black"> Number of Containers </div>
                    <div className="h-[25px] flex items-center px-1 border-b border-black"> Total Qty as per Proforma Invoice </div>
                    <div className="h-[25px] flex items-center px-1 border-b border-black leading-[11px]"> Total consignment weight as per Proforma Invoice </div>
                    <div className="h-[25px] flex items-center px-1 leading-[11px]"> Total Consignment Weight as per Proforma Invoice </div>
                  </div>
                  {/* ================================================= SUMMARY VALUE ================================================= */}
                  <div className="min-w-0 border-r border-black">
                    <div className="h-[25px] flex items-center justify-end px-1 border-b border-black">
                      {previewData?.summary?.numberOfContainers ?? "-"}
                    </div>

                    <div className="h-[25px] flex items-center justify-end px-1 border-b border-black">
                      {Number(previewData?.summary?.totalQty || 0).toLocaleString("en-IN")}
                    </div>

                    <div className="h-[25px] flex items-center justify-end px-1 border-b border-black">
                      {Number(previewData?.summary?.totalConsignmentWeight || 0).toLocaleString("en-IN")}
                    </div>
                    <div className="h-[25px] flex items-center justify-end px-1"> - </div>
                  </div>
                  {/* ================================================= INVOICE LABEL ================================================= */}
                  <div className="min-w-0 border-r border-black">
                    <div className="h-[25px] flex items-center px-1 border-b border-black text-[8px]"> INVOICE VALUE TOTAL </div>
                    <div className="h-[25px] flex items-center px-1 border-b border-black"> Insurance </div>
                    <div className="h-[25px] flex items-center px-1 border-b border-black"> Freight </div>
                    <div className="h-[25px] flex items-center px-1"> Less Advance Recived </div>
                  </div>

                  {/* ================================================= AMOUNT ================================================= */}
                  <div className="min-w-0">
                    <div className="h-[25px] grid grid-cols-[22px_1fr] border-b border-black">
                      <div className="flex items-center justify-center border-black">
                        {previewData?.orderDetails?.[0]?.currency === "INR" ? "₹" : "$"}
                      </div>
                      <div className="flex items-center justify-end px-1">
                        {Number(previewData?.summary?.invoiceValueTotal || 0).toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div className="h-[25px] grid grid-cols-[22px_1fr] border-b border-black">
                      <div className="flex items-center justify-center border-black"> $ </div>
                      <div />
                    </div>

                    <div className="h-[25px] flex items-center px-1 border-b border-black"> at actual </div>
                    <div className="h-[25px] grid grid-cols-[22px_1fr]">
                      <div className="flex items-center justify-center  border-black"> $ </div>
                      <div />
                    </div>
                  </div>
                  {/* ================================================= TOTAL PI VALUE ================================================= */}
                  <div className="col-span-2 h-[27px] border-t border-r border-black" />
                  <div className="h-[27px] flex items-center px-1 border-t border-r border-black font-semibold"> Total PI Value </div>
                  <div className="h-[27px] grid grid-cols-[22px_1fr] border-t border-black">
                    <div className="flex items-center justify-center  border-black"> $ </div>
                    <div className="flex items-center justify-end px-1 font-semibold">
                      {Number(previewData?.summary?.totalPIValue ?? 0).toLocaleString("en-IN")} </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= BANK DETAILS + PI AMOUNT ================= */}
            <div className="grid grid-cols-[55%_45%] border-t border-black text-[8px]">
              {/* ================= BANK DETAILS ================= */}
              <div className="border-r border-black">
                {/* BANK DETAILS */}
                <div className="h-[15px] px-1 flex items-center  border-b border-black"> BANK DETAILS </div>
                {/* PLEASE TRANSFER FUNDS TO */}
                <div className="h-[15px] px-1 flex items-center  border-b border-black"> PLEASE TRANSFER FUNDS TO </div>
                {/* Account No */}
                <div className="grid grid-cols-[180px_1fr] border-b  border-black">
                  {/* BENEFICIARY DETAILS */}
                  <div className=" px-1 border-r border-b "> BENEFICIARY DETAILS </div>
                  <div className="px-1 border-b">---</div>
                  <div className="px-1 border-r border-b"> ACCOUNT NO </div>
                  <div className="px-1 border-b"> 09168060000030 </div>
                  {/* Name */}
                  <div className="px-1 border-r border-b "> NAME </div>
                  <div className="px-1 border-b"> SAI ACCUMULATOR INDUSTRIES PRIVATE LIMITED, </div>
                  {/* Account Maintained With */}
                  <div className="px-1 border-r border-b "> ACCOUNT MAINTAINED WITH </div>
                  <div className="px-1 border-b"> YES BANK , BRANCH SANGAMNER </div>
                  {/* Swift Code */}
                  <div className="px-1 border-r border-b "> SWIFT CODE </div>
                  <div className="px-1 border-b "> YESBINBB </div>
                  {/* Further Credit */}
                  <div className="px-1"> FOR FURTHER CREDIT TO </div>
                  <div className="px-1"> </div>
                </div>

                {/* Currency */}
                <div className="grid grid-cols-[180px_1fr]  border-black">
                  <div className="px-1 border-r border-b  "></div>
                  <div className="px-1  border-b"> EURO </div>
                  {/* Correspondent Bank */}
                  <div className="px-1 border-r border-b "> Correspondent Bank </div>
                  <div className="px-1  border-b"> JP Morgan Chase Bank </div>
                  {/* Account Number */}
                  <div className="px-1 border-r border-b "> ACCOUNT NUMBER </div>
                  <div className="px-1  border-b"> 765902317 (ABA Routing No.: 021000021) </div>
                  {/* Swift Code */}
                  <div className="px-1 border-r "> Swift Code </div>
                  <div className="px-1 "> CHASUS33 </div>
                </div>
              </div>
              {/* ================= RIGHT SIDE ================= */}
              <div>
                {/* PI AMOUNT IN WORD */}
                <div className="h-[36px] px-1 flex items-center font-semibold border-b border-black"> PI AMOUNT IN WORD: </div>
                <div className="min-h-[55px] px-1 py-1 border-b border-black font-medium"> {previewData?.orderDetails?.[0]?.currency || "USD"}{" "}
                  {totalPIValueInWords} ONLY</div>
                {/* SPECIAL REMARKS */}
                <div className="h-[30px] px-1 flex items-center font-bold border-b border-black"> Special Remarks : </div>
              </div>
            </div>
            {/* ================= LAST / FOOTER SECTION ================= */}

            <div className="border-t border-black text-[8px] leading-[1.35]">

              {/* NOTE + CERTIFICATION */}
              <div className="grid grid-cols-[55%_45%] min-h-auto">
                {/* LEFT - NOTE */}
                <div className="border-r border-black px-2 py-1">
                  <div className="font-semibold italic mb-1"> Note </div>
                  <div> PRODUCT DESCRIPTIONS ON BATTERY IS MENTIONED AS PER CUSTOMER REQUIREMENT. IT MAY OR MAY NOT VARY THAN THE ACTUAL BATTERY DESCRIPTION. IN CASE OF ANY DISPUTE REGARDING THAT SAI ACCUMULATOR INDUSTRIES PVT LTD SHALL NOT BE HELD RESPONSIBLE. </div>
                  <div className="mt-2"> -FREIGHT WILL BE APPLIED AT ACTUAL AT THE TIME OF DISPATCH </div>
                  <div> -SAIPL WILL NOT BE HELD RESPONSIBLE FOR ANY EXTRA CHARGES, DETENTION OR FINES APPLIED BY SHIPPING LINE AT </div>
                  {/* ACCEPTED BY */}
                  <div className="mt-3">
                    <div> Accepted by : {customer.name || "-"}</div>
                    <div> Name: </div>
                    <div> Designation: </div>
                    <div > Date </div>
                    <div className="flex items-end justify-center  border-black pb-1">
                      <span className="font-semibold"> Sign &amp; Stamp </span>
                    </div>
                  </div>
                </div>
                {/* RIGHT - CERTIFICATION */}
                <div className="px-2 py-2 relative">
                  <div className="leading-[1.35]"> I hearby certify that this invoice shows the actual price of goods described, that no other invoice has been issued, and that all particulars are true and correct. </div>
                  {/* COMPANY */}
                  <div className="mt-5 pr-4 font-semibold"> For  {previewData?.companyDetails?.company_name || "-"}  </div>
                  {/* SEAL + SIGNATURE */}
                  <div className="flex justify-between items-end mt-3 px-8">
                    {/* SEAL */}
                    <div className="flex flex-col items-center">
                      <div className="mt-2"> CHECKED BY </div>
                    </div>
                    {/* SIGNATURE */}
                    <div className="flex flex-col items-center">
                      <div className="h-[55px] flex items-end justify-center">
                      </div>
                      <div className="mt-2"> APPROVED BY </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FlyoutPanel>
  );
}
export default PreviewFile;
