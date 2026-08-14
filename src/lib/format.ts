// Formato de moneda y fechas. Cambia CURRENCY / LOCALE según tu país.
export const CURRENCY = "CLP";
export const LOCALE = "es-CL";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}
