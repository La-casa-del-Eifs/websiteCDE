// Rendimientos por producto para la calculadora EIFS.
// Edita/añade aquí: perM2 = unidades necesarias por cada 1 m².
// (Para "1 saco / 4 m²" → perM2 = 1/4. Para "0,4 un / m²" → perM2 = 0.4)
export interface EifsItem {
  sku: string;
  name: string;
  unit: string; // sacos, rollos, tinetas, paquetes, unidades
  yieldLabel: string; // texto que se muestra (rendimiento)
  perM2: number;
}

export const EIFS_ITEMS: EifsItem[] = [
  { sku: "P-0417", name: "Poliestireno 40 D20", unit: "paquetes", yieldLabel: "1 paq / 7,7 m²", perM2: 1 / 7.7 },
  { sku: "P-0407", name: "Mortero 25kg", unit: "sacos", yieldLabel: "1 saco / 4 m²", perM2: 1 / 4 },
  { sku: "P-0406", name: "Malla fibra de vidrio 1x50", unit: "rollos", yieldLabel: "1 rollo / 50 m²", perM2: 1 / 50 },
  { sku: "P-0375", name: "Esquinero 2.5", unit: "unidades", yieldLabel: "0,4 un / m²", perM2: 0.4 },
  { sku: "P-0388", name: "Finish GM blanco", unit: "tinetas", yieldLabel: "1 tineta / 8 m²", perM2: 1 / 8 },
  { sku: "P-0398", name: "Látex blanco", unit: "tinetas", yieldLabel: "1 tineta / 60 m²", perM2: 1 / 60 },
];
