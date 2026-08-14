// Cliente Bsale (SOLO servidor). El token vive en BSALE_ACCESS_TOKEN (.env.local).
const BASE = process.env.BSALE_API_URL || "https://api.bsale.io/v1";

export function hasBsale(): boolean {
  const t = process.env.BSALE_ACCESS_TOKEN;
  return Boolean(t && t.length > 10);
}

export async function bsaleGet<T = any>(path: string): Promise<T> {
  const token = process.env.BSALE_ACCESS_TOKEN;
  if (!token) throw new Error("Falta BSALE_ACCESS_TOKEN en .env.local");
  const url = `${BASE}/${path.replace(/^\//, "")}`;
  const res = await fetch(url, {
    headers: { access_token: token, "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Bsale ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

// Recorre todas las páginas de un recurso de lista de Bsale (limit máx 50).
export async function bsaleGetAll(path: string, cap = 20000): Promise<any[]> {
  const items: any[] = [];
  let offset = 0;
  const limit = 50;
  while (items.length < cap) {
    const sep = path.includes("?") ? "&" : "?";
    let page: any;
    try {
      page = await bsaleGet(`${path}${sep}limit=${limit}&offset=${offset}`);
    } catch (e: any) {
      // Bsale devuelve 404 cuando un recurso de lista no tiene registros.
      if (offset === 0) return [];
      break;
    }
    const batch = page?.items ?? [];
    items.push(...batch);
    const count = Number(page?.count ?? 0);
    offset += limit;
    if (batch.length === 0 || offset >= count) break;
  }
  return items;
}

// POST a Bsale (crear recursos: documentos, clientes, etc.).
export async function bsalePost<T = any>(path: string, body: any): Promise<T> {
  const token = process.env.BSALE_ACCESS_TOKEN;
  if (!token) throw new Error("Falta BSALE_ACCESS_TOKEN en .env.local");
  const url = `${BASE}/${path.replace(/^\//, "")}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { access_token: token, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Bsale ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}
