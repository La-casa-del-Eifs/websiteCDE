// Rendimientos por producto para la calculadora EIFS.
// perM2 = unidades necesarias por cada 1 m².
// (Para "1 saco / 4 m²" → perM2 = 1/4. Para "0,4 un / m²" → perM2 = 0.4)

export interface EifsItem {
  sku: string;
  name: string;
  unit: string; // sacos, rollos, tinetas, paquetes, unidades
  yieldLabel: string; // texto que se muestra (rendimiento)
  perM2: number;
}

// Tipos de poliestireno (EPS) seleccionables por el usuario.
export interface EpsType {
  id: string;
  label: string; // "EPS 40d20 (15P)"
  unit: string; // paquetes
  yieldLabel: string; // "1 paq / 7,7 m²"
  perM2: number;
  sku: string; // SKU para el enlace "Ver" (vacío → busca "poliestireno")
}

export const EPS_TYPES: EpsType[] = [
  { id: "40d20", label: "EPS 40d20 (15P)", unit: "paquetes", yieldLabel: "1 paq / 7,7 m²", perM2: 1 / 7.7, sku: "P-0417" },
  { id: "20d20", label: "EPS 20d20 (30P)", unit: "paquetes", yieldLabel: "1 paq / 15 m²", perM2: 1 / 15, sku: "" },
  { id: "30d20", label: "EPS 30d20 (20P)", unit: "paquetes", yieldLabel: "1 paq / 10 m²", perM2: 1 / 10, sku: "" },
  { id: "50d10", label: "EPS 50d10 (12P)", unit: "paquetes", yieldLabel: "1 paq / 6 m²", perM2: 1 / 6, sku: "" },
  { id: "100d10", label: "EPS 100d10 (6P)", unit: "paquetes", yieldLabel: "1 paq / 3 m²", perM2: 1 / 3, sku: "" },
];

// Resto de materiales (rendimiento fijo).
export const EIFS_ITEMS: EifsItem[] = [
  { sku: "P-0407", name: "Mortero 25kg", unit: "sacos", yieldLabel: "1 saco / 4 m²", perM2: 1 / 4 },
  { sku: "P-0406", name: "Malla fibra de vidrio 1x50", unit: "rollos", yieldLabel: "1 rollo / 50 m²", perM2: 1 / 50 },
  { sku: "P-0375", name: "Esquinero 2.5", unit: "unidades", yieldLabel: "0,4 un / m²", perM2: 0.4 },
  { sku: "P-0388", name: "Finish GM blanco", unit: "tinetas", yieldLabel: "1 tineta / 8 m²", perM2: 1 / 8 },
  { sku: "P-0398", name: "Látex blanco", unit: "tinetas", yieldLabel: "1 tineta / 60 m²", perM2: 1 / 60 },
];
