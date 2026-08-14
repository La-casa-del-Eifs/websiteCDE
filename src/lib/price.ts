// Precio efectivo considerando oferta.
export function hasOffer(p: { price: number; offer_price?: number | null }): boolean {
  const o = Number(p.offer_price ?? 0);
  return o > 0 && o < Number(p.price);
}

export function effectivePrice(p: { price: number; offer_price?: number | null }): number {
  return hasOffer(p) ? Number(p.offer_price) : Number(p.price);
}
