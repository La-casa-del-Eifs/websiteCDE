import type { Metadata } from "next";
import PublicShell from "@/components/PublicShell";
import CheckoutForm from "@/components/cart/CheckoutForm";
import { getOffices } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const offices = await getOffices();
  return (
    <PublicShell>
      <CheckoutForm offices={offices} />
    </PublicShell>
  );
}
