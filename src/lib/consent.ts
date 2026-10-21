// Consentimiento de cookies: se guarda en localStorage del visitante.
export type ConsentValue = "all" | "necessary";

const STORAGE_KEY = "cde_cookie_consent_v1";
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // se vuelve a preguntar al año
export const CONSENT_EVENT = "cde:cookie-consent";
export const OPEN_SETTINGS_EVENT = "cde:open-cookie-settings";

export function readConsent(): ConsentValue | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { value, date } = JSON.parse(raw) as { value: ConsentValue; date: number };
    if (value !== "all" && value !== "necessary") return null;
    if (!date || Date.now() - date > MAX_AGE_MS) return null;
    return value;
  } catch {
    return null;
  }
}

export function saveConsent(value: ConsentValue) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ value, date: Date.now() }));
  } catch {
    /* sin almacenamiento: la elección dura solo esta visita */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}
