import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";
import type { Category, Product, ProductImage, ProductVariant } from "@/types/database";
import { sampleCategories, sampleProducts } from "./sample";
import { effectivePrice } from "@/lib/price";

// ── Categorías ──────────────────────────────────────────────────
export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return sampleCategories;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    if (error || !data) return sampleCategories;
    return data as Category[];
  } catch {
    return sampleCategories;
  }
}

// ── Productos (con filtros) ─────────────────────────────────────
export async function getProducts(opts?: {
  categorySlug?: string;
  search?: string;
  featuredOnly?: boolean;
}): Promise<Product[]> {
  const { categorySlug, search, featuredOnly } = opts ?? {};

  if (!isSupabaseConfigured()) {
    let list = sampleProducts.filter((p) => p.active && !p.hidden);
    if (categorySlug)
      list = list.filter((p) => p.category?.slug === categorySlug);
    if (featuredOnly) list = list.filter((p) => p.featured);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku ?? "").toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }

  try {
    const supabase = await createClient();
    let query = supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (featuredOnly) query = query.eq("featured", true);
    if (search) {
      const term = search.replace(/[,()]/g, " ").trim();
      query = query.or(`name.ilike.%${term}%,sku.ilike.%${term}%`);
    }

    const { data, error } = await query;
    if (error || !data) return sampleProducts;

    let list = data as unknown as Product[];
    if (categorySlug)
      list = list.filter((p) => p.category?.slug === categorySlug);
    // Ocultar del catálogo los productos marcados como "ocultos" en el panel.
    // (Si la columna aún no existe, p.hidden es undefined y no oculta nada.)
    list = list.filter((p) => !p.hidden);
    return groupVariants(await applyEmpresaPrices(list));
  } catch {
    return sampleProducts;
  }
}

// ── Variantes ───────────────────────────────────────────────────
// Nombre corto de la variante ("10 cm", "Blanco"...).
export function variantLabel(p: Product): string {
  if (p.variant_name) return p.variant_name;
  if (p.base_name && p.name.startsWith(p.base_name)) {
    const rest = p.name.slice(p.base_name.length).replace(/^\s*-\s*/, "").trim();
    if (rest) return rest;
  }
  return p.name;
}

function toVariant(p: Product): ProductVariant {
  return {
    id: p.id,
    slug: p.slug,
    label: variantLabel(p),
    sku: p.sku,
    price: p.price,
    offer_price: p.offer_price ?? null,
    stock: p.stock,
  };
}

// Respaldo si aún no existen base_name/variant_name (migración 021 sin correr):
// la sincronización arma el nombre como "Producto - Variante", así que el
// nombre base es la parte común hasta el último " - ".
function fillVariantNames(vs: Product[]): Product[] {
  if (vs.length < 2 || vs.every((v) => v.base_name)) return vs;
  let prefix = vs[0].name;
  for (const v of vs) {
    let i = 0;
    while (i < prefix.length && i < v.name.length && prefix[i] === v.name[i]) i++;
    prefix = prefix.slice(0, i);
  }
  const cut = prefix.lastIndexOf(" - ");
  if (cut <= 0) return vs;
  const base = prefix.slice(0, cut).trim();
  return vs.map((v) => (v.base_name ? v : { ...v, base_name: base }));
}

const byVariantOrder = (a: Product, b: Product) =>
  Number(a.bsale_variant_id ?? 0) - Number(b.bsale_variant_id ?? 0);

// Junta en una sola tarjeta las variantes del mismo producto de Bsale.
// La tarjeta usa la variante más barata con stock y lleva la lista en `variants`.
function groupVariants(list: Product[]): Product[] {
  const groups = new Map<number, Product[]>();
  const order: (Product | number)[] = [];
  for (const p of list) {
    const key = p.bsale_product_id ? Number(p.bsale_product_id) : 0;
    if (!key) {
      order.push(p);
      continue;
    }
    if (!groups.has(key)) {
      groups.set(key, []);
      order.push(key);
    }
    groups.get(key)!.push(p);
  }

  return order.map((x) => {
    if (typeof x !== "number") return x;
    const vs = fillVariantNames(groups.get(x)!.sort(byVariantOrder));
    if (vs.length === 1) return vs[0];
    const main = [...vs].sort(
      (a, b) =>
        Number(b.stock > 0) - Number(a.stock > 0) || effectivePrice(a) - effectivePrice(b)
    )[0];
    return {
      ...main,
      name: main.base_name || main.name,
      image_url: main.image_url ?? vs.find((v) => v.image_url)?.image_url ?? null,
      leyenda: main.leyenda ?? vs.find((v) => v.leyenda)?.leyenda ?? null,
      stock: vs.reduce((s, v) => s + Math.max(0, v.stock), 0),
      featured: vs.some((v) => v.featured),
      variants: vs.map(toVariant),
    };
  });
}

// Todas las variantes visibles del mismo producto de Bsale (incluida la actual).
export async function getProductVariants(product: Product): Promise<Product[]> {
  if (!isSupabaseConfigured() || !product.bsale_product_id) return [product];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("bsale_product_id", product.bsale_product_id)
      .eq("active", true);
    if (error || !data) return [product];
    const list = (data as unknown as Product[]).filter((p) => !p.hidden);
    if (!list.some((p) => p.id === product.id)) list.push(product);
    const priced = await applyEmpresaPrices(list);
    return fillVariantNames(
      priced.map((p) => (p.id === product.id ? product : p)).sort(byVariantOrder)
    );
  } catch {
    return [product];
  }
}

// Categorías para el inicio: solo las marcadas, ordenadas. Con respaldo.
export async function getHomeCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return sampleCategories.slice(0, 6);
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("featured", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (data && data.length > 0) return data as Category[];
    // Respaldo: si aún no eligen ninguna, muestra las primeras 6 por nombre.
    const { data: any6 } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true })
      .limit(6);
    return (any6 as Category[]) ?? [];
  } catch {
    return [];
  }
}

// Portada de cada categoría: la imagen de un producto de esa categoría
// (prioriza destacados). Devuelve { category_id: image_url }.
export async function getCategoryCovers(
  categoryIds: string[]
): Promise<Record<string, string>> {
  if (!isSupabaseConfigured() || categoryIds.length === 0) return {};
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("category_id, image_url, hidden")
      .eq("active", true)
      .not("image_url", "is", null)
      .in("category_id", categoryIds)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });
    if (error || !data) return {};
    const covers: Record<string, string> = {};
    for (const p of data as any[]) {
      if (p.hidden || !p.category_id || covers[p.category_id]) continue;
      covers[p.category_id] = p.image_url;
    }
    return covers;
  } catch {
    return {};
  }
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const list = await getProducts({ featuredOnly: true });
  if (list.length > 0) return list.slice(0, limit);
  // Respaldo: si aún no marcas destacados, muestra los primeros productos.
  const all = await getProducts({});
  return all.slice(0, limit);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    return sampleProducts.find((p) => p.slug === slug) ?? null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("slug", slug)
      .single();
    if (error || !data) {
      return sampleProducts.find((p) => p.slug === slug) ?? null;
    }
    // Producto oculto: tampoco accesible por su URL directa.
    if ((data as any).hidden) return null;
    const [priced] = await applyEmpresaPrices([data as unknown as Product]);
    return priced;
  } catch {
    return sampleProducts.find((p) => p.slug === slug) ?? null;
  }
}


// Imágenes (galería) de un producto.
export async function getProductImages(productId: string): Promise<ProductImage[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true });
    return (data as ProductImage[]) ?? [];
  } catch {
    return [];
  }
}


// Datos básicos de un producto por id (para el panel).
export async function getProductBasic(
  id: string
): Promise<{ id: string; name: string; sku: string | null; image_url: string | null } | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("id, name, sku, image_url")
      .eq("id", id)
      .single();
    return (data as any) ?? null;
  } catch {
    return null;
  }
}


// Sucursales activas (para el selector del checkout).
export async function getOffices(): Promise<{ id: number; name: string }[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("bsale_offices")
      .select("id, name")
      .eq("active", true)
      .order("name");
    return (data as any) ?? [];
  } catch {
    return [];
  }
}


// ── Listas de precio por empresa ────────────────────────────────
export async function getViewerPriceListId(): Promise<number | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase
      .from("profiles")
      .select("role, bsale_price_list_id")
      .eq("id", user.id)
      .single();
    if (data?.role === "empresa" && data.bsale_price_list_id) {
      return Number(data.bsale_price_list_id);
    }
    return null;
  } catch {
    return null;
  }
}

async function applyEmpresaPrices(products: Product[]): Promise<Product[]> {
  const plid = await getViewerPriceListId();
  if (!plid || products.length === 0) return products;
  try {
    const supabase = await createClient();
    const ids = products.map((p) => p.id);
    const { data } = await supabase
      .from("product_prices")
      .select("product_id, price")
      .eq("price_list_id", plid)
      .in("product_id", ids);
    const map = new Map<string, number>((data ?? []).map((x: any) => [x.product_id, Number(x.price)]));
    return products.map((p) => (map.has(p.id) ? { ...p, price: map.get(p.id)!, offer_price: null } : p));
  } catch {
    return products;
  }
}

// Listas de precio (para el selector del admin).
export async function getPriceLists(): Promise<{ id: number; name: string }[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("bsale_price_lists")
      .select("id, name")
      .eq("active", true)
      .order("name");
    return (data as any) ?? [];
  } catch {
    return [];
  }
}

// Producto con textos + PDF para el editor del panel.
export async function getProductForEditor(id: string): Promise<{
  id: string;
  name: string;
  sku: string | null;
  leyenda: string | null;
  description: string | null;
  datasheet_url: string | null;
  datasheet_path: string | null;
} | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("id, name, sku, leyenda, description, datasheet_url, datasheet_path")
      .eq("id", id)
      .single();
    return (data as any) ?? null;
  } catch {
    return null;
  }
}
