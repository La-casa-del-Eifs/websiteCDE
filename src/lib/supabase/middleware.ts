import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/config";

// Refresca la sesión y protege las rutas del panel según el rol.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Si Supabase aún no está configurado, no bloqueamos nada (modo demo).
  if (!isSupabaseConfigured()) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isDashboard = path.startsWith("/dashboard");

  // Sin sesión e intentando entrar al panel -> a login.
  if (isDashboard && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  // Con sesión, revisar rol para rutas de administración.
  if (isDashboard && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? "usuario";
    const isStaff = role === "admin" || role === "vendedor";
    const adminOnly = ["/dashboard/usuarios", "/dashboard/portada", "/dashboard/bsale", "/dashboard/categorias", "/dashboard/equipo"];
    const staffOnly = ["/dashboard/clientes", "/dashboard/productos", "/dashboard/pedidos"];

    const denied =
      (adminOnly.some((p) => path.startsWith(p)) && role !== "admin") ||
      (staffOnly.some((p) => path.startsWith(p)) && !isStaff);

    if (denied) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.searchParams.set("error", "sin_permiso");
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
