import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Rutas que siguen accesibles durante la mantención (para administrar el sitio).
function allowedDuringMaintenance(pathname: string): boolean {
  return (
    pathname.startsWith("/mantencion") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api")
  );
}

export async function middleware(request: NextRequest) {
  const maintenance = ["1", "true", "on"].includes(
    (process.env.MAINTENANCE_MODE || "").toLowerCase()
  );

  if (maintenance && !allowedDuringMaintenance(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/mantencion";
    return NextResponse.rewrite(url);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    // Aplica a todo excepto archivos estáticos e imágenes.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
