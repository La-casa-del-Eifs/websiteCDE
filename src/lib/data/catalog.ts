import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";
import type { Category, Product, ProductImage } from "@/types/database";
import { sampleCategories, sampleProducts } from "./sample";

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
    let list = sampleProducts.filter((p) => p.active);
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
    return applyEmpresaPrices(list);
  } catch {
    return sampleProducts;
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
