import type { Metadata } from "next";
import PublicShell from "@/components/PublicShell";
import CheckoutForm from "@/components/cart/CheckoutForm";
import { getOffices } from "@/lib/data/catalog";
import { getDeliveryEnabled } from "@/lib/data/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const [offices, deliveryEnabled] = await Promise.all([
    getOffices(),
    getDeliveryEnabled(),
  ]);
  return (
    <PublicShell>
      <CheckoutForm offices={offices} deliveryEnabled={deliveryEnabled} />
    </PublicShell>
  );
}
