export function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("ro-RO");
}

export function formatPrice(value) {
  if (value === null || value === undefined || value === "") return "-";
  const number = Number(value);
  if (Number.isNaN(number)) return value;
  return `${number.toFixed(2)} lei`;
}

export function getErrorMessage(error) {
  return error?.response?.data?.message || error?.response?.data || error?.message || "A apărut o eroare.";
}
