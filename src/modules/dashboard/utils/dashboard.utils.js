export function getLifecycleTone(status = "") {
  const key = String(status).trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (["hold", "on_hold", "cancelled", "critical", "rework", "overdue"].includes(key)) return "hold";
  if (["partial_dispatch", "partially_dispatch", "partially_dispatched"].includes(key)) return "partial-dispatch";
  if (["dispatch", "dispatched", "completed"].includes(key)) return "completed";
  if (["ready", "ready_stock"].includes(key)) return "ready";
  if (["production", "in_progress", "partially_ready", "not_started"].includes(key)) return "production";
  if (["planning", "planned", "partial_planned", "not_planned", "confirmed"].includes(key)) return "planning";
  if (["draft", "waiting", "confirmation", "pending"].includes(key)) return "confirmation";
  return "neutral";
}

export function getParentLifecycleStatus(row = {}) {
  const status = row.production_note_status || row.current_stage || "";
  const key = String(status).toLowerCase().replace(/[\s-]+/g, "_");
  if (["hold", "on_hold", "cancelled"].includes(key)) return status;
  const ordered = Number(row.production_note_qty || 0);
  const dispatched = Number(row.dispatched_qty || 0);
  if (ordered > 0 && dispatched >= ordered) return "completed";
  if (dispatched > 0) return "partial_dispatch";
  return status;
}

export function getRoleLabel(roleSlug) {
  if (roleSlug === "super_admin") return "Super Admin";
  if (roleSlug === "admin") return "Admin";
  return "User";
}
export function isAdminRole(roleSlug) {
  return roleSlug === "super_admin" || roleSlug === "admin";
}
function getInitials(name = "User") {
  return String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
export const parseCustomerProducts = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
export const productMatchesAlert = (product = {}, alert = {}) => {
  const sameSerial = product.serial_number && alert.serial_number && String(product.serial_number) === String(alert.serial_number);
  const sameProductName = product.product_name && alert.product_name && String(product.product_name) === String(alert.product_name);
  const sameExpiry = product.expiry_date && alert.expiry_date && String(product.expiry_date).slice(0, 10) === String(alert.expiry_date).slice(0, 10);

  return sameSerial || (sameProductName && sameExpiry);
};
const getTodayDateInputValue = () => {
  const today = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
};

export const getDateInputMinValue = (currentExpiry = "") => {
  const todayValue = getTodayDateInputValue();
  if (!currentExpiry) return todayValue;

  const currentExpiryValue = String(currentExpiry).slice(0, 10);
  const currentExpiryDate = new Date(`${currentExpiryValue}T00:00:00`);
  const todayDate = new Date(`${todayValue}T00:00:00`);

  if (Number.isNaN(currentExpiryDate.getTime()) || currentExpiryDate < todayDate) {
    return todayValue;
  }

  return currentExpiryValue;
};
export const getRedirectFilters = ({ label = '', redirectTo = '' }) => {

}
export const customerSmartSelectConfig = {
  type: "customer",
  source: "customer",
  placeholder: "Select Customer",
  apiUrl: "",
  check: "name",
  list: "customer_id,name,mobile_no",
  preload: true,
  cache: true,
  showRecent: true,
  multi: false,
  statusCheck: true,
  allowAddNew: false,
  customParameters: { status: "active", },
  getValue: (customer) => customer.customer_id,
  getLabel: (customer) => {
    return customer.name || customer.customer_name || "Unnamed Customer";
    // const mobile = customer.mobile_no || customer.mobile || "";
    // const email = customer.email || "";
    // const city = customer.city || customer.location || "";
    // return [name, mobile, email, city].filter(Boolean).join(" • ");
  },
};
export const productSmartSelectConfig = {
  type: "product",
  source: "products",
  placeholder: "Select products",
  apiUrl: "",
  check: "product_name",
  list: "product_id,product_name",
  preload: true,
  cache: true,
  showRecent: true,
  multi: false,
  statusCheck: true,
  allowAddNew: false,
  customParameters: {},
  getValue: (product) => product.product_id,
  getLabel: (product) => {
    return product.product_name || "Unnamed product";
  },
};
export const orderSmartSelectConfig = {
  type: "order",
  source: "production_notes",
  placeholder: "Select Production Note",
  apiUrl: "",
  check: "production_code",
  list: "production_note_id,production_code",
  preload: true,
  cache: true,
  showRecent: true,
  multi: false,
  statusCheck: true,
  allowAddNew: false,
  customParameters: {},
  getValue: (order) => order.production_note_id,
  getLabel: (order) => {
    return order.production_code || "Unnamed order";
  },
};
