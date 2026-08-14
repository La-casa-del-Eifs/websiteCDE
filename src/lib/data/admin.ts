import { createClient } from "@/lib/supabase/server";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/config";
import type {
  Customer,
  DashboardKpis,
  Order,
  Product,
  Profile,
} from "@/types/database";
import type { UserRole } from "@/types/database";
import {
  sampleCustomers,
  sampleKpis,
  sampleOrders,
  sampleProducts,
} from "./sample";

// Devuelve el rol y nombre del usuario que ve el panel.
// En modo demo (sin Supabase) se asume administrador para poder previsualizar.
export async function getViewer(): Promise<{
  role: UserRole;
  name: string;
  discount: number;
}> {
  if (!isSupabaseConfigured()) {
    return { role: "admin", name: "Administrador (demo)", discount: 0 };
  }
  const profile = await getCurrentProfile();
  const name =
    profile?.full_name ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    "Mi cuenta";
  return {
    role: profile?.role ?? "usuario",
    name,
    discount: Number(profile?.discount_percent ?? 0),
  };
}

// Perfil del usuario autenticado (rol incluido).
export async function getCurrentProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    return (data as Profile) ?? null;
  } catch {
    return null;
  }
}

export async function getKpis(): Promise<DashboardKpis> {
  if (!isSupabaseConfigured()) return sampleKpis;

  try {
    const supabase = await createClient();
    const [products, customers, users, orders] = await Promise.all([
      supabase.from("products").select("id, active, stock"),
      supabase.from("customers").select("id"),
      supabase.from("profiles").select("id"),
      supabase.from("orders").select("id, status, total"),
    ]);

    const prod = products.data ?? [];
    const ords = orders.data ?? [];

    return {
      totalProducts: prod.length,
      activeProducts: prod.filter((p: any) => p.active).length,
      totalCustomers: customers.data?.length ?? 0,
      totalUsers: users.data?.length ?? 0,
      totalOrders: ords.length,
      revenue: ords
        .filter((o: any) => o.status !== "cancelado")
        .reduce((s: number, o: any) => s + Number(o.total || 0), 0),
      pendingOrders: ords.filter((o: any) => o.status === "pendiente").length,
      lowStock: prod.filter((p: any) => Number(p.stock) < 80).length,
    };
  } catch {
    return sampleKpis;
  }
}

export async function getCustomers(): Promise<Customer[]> {
  if (!isSupabaseConfigured()) return sampleCustomers;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });
    return (data as Customer[]) ?? sampleCustomers;
  } catch {
    return sampleCustomers;
  }
}

export async function getUsers(): Promise<Profile[]> {
  if (!isSupabaseConfigured()) {
    return [
      { id: "u1", first_name: "Ana", apellido_paterno: "Torres", apellido_materno: "Vega", last_name: "Torres Vega", full_name: "Ana Torres Vega", rut: "12.345.678-5", role: "admin", phone: "+56 9 1111 1111", company: "La Casa del Eifs", discount_percent: 0, created_at: "2026-05-01T10:00:00Z" },
      { id: "u2", first_name: "Diego", apellido_paterno: "Muñoz", apellido_materno: "Silva", last_name: "Muñoz Silva", full_name: "Diego Muñoz Silva", rut: "9.876.543-1", role: "vendedor", phone: "+56 9 2222 2222", company: "La Casa del Eifs", discount_percent: 0, created_at: "2026-06-10T10:00:00Z" },
      { id: "u3", first_name: "Carla", apellido_paterno: "Rojas", apellido_materno: "Díaz", last_name: "Rojas Díaz", full_name: "Carla Rojas Díaz", rut: "15.111.222-8", role: "cliente", phone: null, company: "Particular", discount_percent: 0, created_at: "2026-07-15T10:00:00Z" },
      { id: "u4", first_name: "Empresa", apellido_paterno: "Demo", apellido_materno: "", last_name: "Demo", full_name: "Empresa Demo", rut: "76.086.428-5", role: "empresa", phone: "+56 2 2345 6789", company: "Constructora Demo Ltda.", discount_percent: 12, created_at: "2026-07-20T10:00:00Z" },
    ];
  }
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    return (data as Profile[]) ?? [];
  } catch {
    return [];
  }
}

export async function getRecentOrders(): Promise<Order[]> {
  if (!isSupabaseConfigured()) return sampleOrders;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("orders")
      .select("*, customer:customers(*)")
      .order("created_at", { ascending: false })
      .limit(8);
    return (data as unknown as Order[]) ?? sampleOrders;
  } catch {
    return sampleOrders;
  }
}

export async function getProductsAdmin(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return sampleProducts;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*, category:categories(*)")
      .order("created_at", { ascending: false });
    return (data as unknown as Product[]) ?? sampleProducts;
  } catch {
    return sampleProducts;
  }
}


// Resumen de un pedido por su buy_order (para la página de resultado).
export async function getOrderSummary(buyOrder: string) {
  if (!isSupabaseConfigured() || !hasServiceRole()) return null;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("orders")
      .select("total, payment_status, bsale_document_number, bsale_document_url")
      .eq("buy_order", buyOrder)
      .single();
    return data as any;
  } catch {
    return null;
  }
}


// Lista de pedidos para el panel.
export async function getOrders(): Promise<Order[]> {
  if (!isSupabaseConfigured()) return sampleOrders;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    return (data as unknown as Order[]) ?? [];
  } catch {
    return [];
  }
}

// Detalle de un pedido con sus ítems.
export async function getOrderById(
  id: string
): Promise<{ order: Order; items: any[] } | null> {
  if (!isSupabaseConfigured()) {
    const order = sampleOrders.find((o) => o.id === id);
    return order ? { order, items: [] } : null;
  }
  try {
    const supabase = await createClient();
    const { data: order } = await supabase.from("orders").select("*").eq("id", id).single();
    if (!order) return null;
    const { data: items } = await supabase
      .from("order_items")
      .select("quantity, unit_price, product:products(name, sku)")
      .eq("order_id", id);
    return { order: order as unknown as Order, items: items ?? [] };
  } catch {
    return null;
  }
}
