// Tipos de dominio de La Casa del Eifs.
// Coinciden con las tablas definidas en supabase/schema.sql

export type UserRole = "admin" | "vendedor" | "cliente" | "usuario" | "empresa";

export interface Profile {
  id: string;
  first_name: string | null;
  apellido_paterno: string | null;
  apellido_materno: string | null;
  last_name: string | null;
  full_name: string | null;
  rut: string | null;
  role: UserRole;
  phone: string | null;
  company: string | null;
  discount_percent: number;
  bsale_price_list_id?: number | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  featured?: boolean;
  sort_order?: number;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  category?: Category | null;
  price: number;
  offer_price?: number | null;
  sku: string | null;
  dimensions: string | null;
  image_url: string | null;
  featured: boolean;
  stock: number;
  active: boolean;
  created_at?: string;
}

export type CustomerStatus = "activo" | "prospecto" | "inactivo";

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  city: string | null;
  status: CustomerStatus;
  notes: string | null;
  created_at: string;
}

export type OrderStatus =
  | "pendiente"
  | "confirmado"
  | "en_proceso"
  | "entregado"
  | "cancelado";

export interface Order {
  id: string;
  customer_id: string | null;
  customer?: Customer | null;
  status: OrderStatus;
  total: number;
  subtotal?: number | null;
  buy_order?: string | null;
  payment_status?: string | null;
  tbk_token?: string | null;
  buyer_name?: string | null;
  buyer_email?: string | null;
  buyer_phone?: string | null;
  buyer_rut?: string | null;
  delivery_method?: string | null;
  office_id?: number | null;
  address?: string | null;
  comuna?: string | null;
  city?: string | null;
  notes?: string | null;
  bsale_document_number?: string | null;
  bsale_document_url?: string | null;
  bsale_error?: string | null;
  doc_type?: string | null;
  factura_razon_social?: string | null;
  factura_rut?: string | null;
  factura_giro?: string | null;
  factura_direccion?: string | null;
  factura_comuna?: string | null;
  factura_email?: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  quantity: number;
  unit_price: number;
}

export interface HeroSlide {
  id: string;
  path: string;
  url: string;
  sort_order: number;
  active: boolean;
  created_at?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  path: string;
  sort_order: number;
  created_at?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string | null;
  photo_url: string | null;
  photo_path: string | null;
  sort_order: number;
  active: boolean;
  created_at?: string;
}

export interface DashboardKpis {
  totalProducts: number;
  activeProducts: number;
  totalCustomers: number;
  totalUsers: number;
  totalOrders: number;
  revenue: number;
  pendingOrders: number;
  lowStock: number;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  vendedor: "Vendedor",
  cliente: "Cliente",
  usuario: "Usuario",
  empresa: "Empresa",
};
