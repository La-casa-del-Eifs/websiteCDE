import type { Metadata } from "next";
import PublicShell from "@/components/PublicShell";
import CartView from "@/components/cart/CartView";

export const metadata: Metadata = { title: "Carrito" };

export default function CarritoPage() {
  return (
    <PublicShell>
      <CartView />
    </PublicShell>
  );
}
