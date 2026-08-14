import { NextResponse } from "next/server";

// Endpoint retirado (el reenvío de correo se hace desde el panel de Bsale).
export async function POST() {
  return NextResponse.json({ error: "No disponible." }, { status: 410 });
}
