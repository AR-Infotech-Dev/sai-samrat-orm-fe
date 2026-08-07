export const formatIndianCurrency = (value) => new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(Number(value) || 0);
