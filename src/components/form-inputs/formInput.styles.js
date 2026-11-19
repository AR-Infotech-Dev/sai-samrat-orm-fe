export const FORM_INPUT_BASE_CLASS = "w-full rounded-md border bg-slate-50 px-3 py-1.5 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-400/15 disabled:cursor-not-allowed disabled:opacity-70 read-only:cursor-default";

export const getFormInputClass = (error, extraClass = "") => [
  FORM_INPUT_BASE_CLASS,
  error ? "border-red-400 text-red-600" : "border-slate-200",
  extraClass,
].filter(Boolean).join(" ");

export const FORM_DROPDOWN_CLASS = "rounded-md border border-slate-200 bg-white text-sm shadow-lg shadow-slate-900/10";
