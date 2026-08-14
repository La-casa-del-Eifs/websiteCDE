import { bsaleGet, bsaleGetAll } from "./client";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slug";

export interface SyncSummary {
  priceListId: string;
  priceLists: number;
  categories: number;
  products: number;
  deactivated: number;
  withPrice: number;
  withStock: number;
}

export async function syncProductsAndStock(): Promise<SyncSummary> {
  const supabase = createAdminClient();

  // 1) Lista de precios a usar (env o la primera activa).
  let priceListId = process.env.BSALE_PRICE_LIST_ID || "";
  if (!priceListId) {
    const pls = await bsaleGet("price_lists.json?limit=1&state=0");
    priceListId = String(pls?.items?.[0]?.id ?? "");
  }
  if (!priceListId) throw new Error("No se encontró una lista de precios en Bsale.");

  // 2) Tipos de producto -> categorías.
  const types = await bsaleGetAll("product_types.json?state=0");
  const catRows = types.map((t: any) => ({
    bsale_product_type_id: Number(t.id),
    name: t.name,
    slug: slugify(t.name) || `tipo-${t.id}`,
  }));
  if (catRows.length) {
    await supabase.from("categories").upsert(catRows, { onConflict: "bsale_product_type_id" });
  }

  // Eliminar categorías que ya NO existen en Bsale (ANTES de construir el mapa).
  try {
    const currentTypeIds = new Set(types.map((t: any) => Number(t.id)));
    const { data: allCats } = await supabase
      .from("categories")
      .select("id, bsale_product_type_id");
    const toDeleteCats = (allCats ?? [])
      .filter(
        (c: any) =>
          c.bsale_product_type_id == null ||
          !currentTypeIds.has(Number(c.bsale_product_type_id))
      )
      .map((c: any) => c.id);
    for (let i = 0; i < toDeleteCats.length; i += 200) {
      await supabase.from("categories").delete().in("id", toDeleteCats.slice(i, i + 200));
    }
  } catch {
    /* no bloquea la sincronización */
  }

  const { data: cats } = await supabase
    .from("categories")
    .select("id, bsale_product_type_id")
    .not("bsale_product_type_id", "is", null);
  const catMap = new Map<number, string>();
  (cats ?? []).forEach((c: any) => catMap.set(Number(c.bsale_product_type_id), c.id));

  // 2b) Sucursales (para elegir en el checkout).
  try {
    const offices = await bsaleGetAll("offices.json");
    if (offices.length) {
      const officeRows = offices.map((o: any) => ({
        id: Number(o.id),
        name: o.name,
        active: o.state != null ? Number(o.state) === 0 : true,
      }));
      await supabase.from("bsale_offices").upsert(officeRows, { onConflict: "id" });
    }
  } catch {
    /* no bloquea la sincronización de productos */
  }

  // 3) Precios (con IVA) de la lista.
  const priceDetails = await bsaleGetAll(`price_lists/${priceListId}/details.json`);
  const priceMap = new Map<number, number>();
  for (const d of priceDetails) {
    const vid = Number(d?.variant?.id);
    const val = Number(d?.variantValueWithTaxes ?? d?.variantValue ?? 0);
    if (vid) priceMap.set(vid, val);
  }

  // 4) Stock disponible (suma por sucursal).
  const stocks = await bsaleGetAll("stocks.json");
  const stockMap = new Map<number, number>();
  for (const s of stocks) {
    const vid = Number(s?.variant?.id);
    if (!vid) continue;
    stockMap.set(vid, (stockMap.get(vid) ?? 0) + Number(s?.quantityAvailable ?? 0));
  }

  // 5) Productos con sus variantes.
  const products = await bsaleGetAll("products.json?expand=[variants]");
  const rows: any[] = [];
  const syncedVariantIds: number[] = [];
  for (const p of products) {
    const variants = p?.variants?.items ?? [];
    for (const v of variants) {
      const vid = Number(v.id);
      if (!vid) continue;
      syncedVariantIds.push(vid);
      const extra =
        v.description && String(v.description).toLowerCase() !== "única"
          ? ` - ${v.description}`
          : "";
      const name = `${p.name}${extra}`.trim();
      rows.push({
        bsale_variant_id: vid,
        bsale_product_id: Number(p.id),
        name,
        slug: `${slugify(name) || "producto"}-${vid}`,
        sku: v.code || null,
        price: Math.round(priceMap.get(vid) ?? 0),
        stock: Math.max(0, Math.round(stockMap.get(vid) ?? 0)),
        active: Number(p.state) === 0 && Number(v.state) === 0,
        category_id: catMap.get(Number(p?.product_type?.id)) ?? null,
      });
    }
  }

  // Upsert por lotes (no toca image_url/description/featured manuales).
  let upserted = 0;
  for (let i = 0; i < rows.length; i += 400) {
    const batch = rows.slice(i, i + 400);
    const { error } = await supabase
      .from("products")
      .upsert(batch, { onConflict: "bsale_variant_id" });
    if (error) throw new Error(error.message);
    upserted += batch.length;
  }

  // Desactivar productos Bsale que ya no existen.
  let deactivated = 0;
  const syncedSet = new Set(syncedVariantIds);
  const { data: existing } = await supabase
    .from("products")
    .select("id, bsale_variant_id")
    .not("bsale_variant_id", "is", null);
  const toDeactivate = (existing ?? [])
    .filter((r: any) => !syncedSet.has(Number(r.bsale_variant_id)))
    .map((r: any) => r.id);
  for (let i = 0; i < toDeactivate.length; i += 200) {
    const batch = toDeactivate.slice(i, i + 200);
    await supabase.from("products").update({ active: false }).in("id", batch);
    deactivated += batch.length;
  }

  // 6) Listas de precio + precios por lista (para empresas).
  let priceListsSynced = 0;
  try {
    const priceLists = await bsaleGetAll("price_lists.json?state=0");
    if (priceLists.length) {
      await supabase.from("bsale_price_lists").upsert(
        priceLists.map((pl: any) => ({ id: Number(pl.id), name: pl.name, active: true })),
        { onConflict: "id" }
      );
      priceListsSynced = priceLists.length;

      const { data: prods } = await supabase
        .from("products")
        .select("id, bsale_variant_id")
        .not("bsale_variant_id", "is", null);
      const vmap = new Map<number, string>();
      (prods ?? []).forEach((pr: any) => vmap.set(Number(pr.bsale_variant_id), pr.id));

      for (const pl of priceLists) {
        const dets = await bsaleGetAll(`price_lists/${pl.id}/details.json`);
        const rows: any[] = [];
        for (const d of dets) {
          const vid = Number(d?.variant?.id);
          const pid = vmap.get(vid);
          if (!pid) continue;
          rows.push({
            product_id: pid,
            price_list_id: Number(pl.id),
            price: Math.round(Number(d?.variantValueWithTaxes ?? d?.variantValue ?? 0)),
          });
        }
        for (let i = 0; i < rows.length; i += 500) {
          await supabase
            .from("product_prices")
            .upsert(rows.slice(i, i + 500), { onConflict: "product_id,price_list_id" });
        }
      }
    }
  } catch {
    /* no bloquea la sincronización principal */
  }

  return {
    priceListId,
    priceLists: priceListsSynced,
    categories: catRows.length,
    products: upserted,
    deactivated,
    withPrice: priceMap.size,
    withStock: stockMap.size,
  };
}
