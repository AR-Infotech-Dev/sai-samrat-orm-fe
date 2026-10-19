import Swal from "sweetalert2";
import "../styles/compact-swal.css";

export const compactSwal = Swal.mixin({
  width: "360px",
  padding: "16px",
  heightAuto: false,
  confirmButtonColor: "#fb8b50",
  cancelButtonColor: "#64748b",
  customClass: {
    container: "orm-swal-container",
    popup: "orm-swal-popup",
    title: "orm-swal-title",
    htmlContainer: "orm-swal-text",
    actions: "orm-swal-actions",
    confirmButton: "orm-swal-button",
    cancelButton: "orm-swal-button",
    icon: "orm-swal-icon",
  },
});

export const confirmAction = async (message) => {
  const result = await compactSwal.fire({
    title: "Please confirm",
    text: message,
    showCancelButton: true,
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    focusCancel: true,
    returnFocus: true,
  });
  return result.isConfirmed;
};
