import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { CartProvider } from "@/lib/cart/CartContext";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "La Casa del EIFS",
    template: "%s | La Casa del EIFS",
  },
  description:
    "Especialistas en envolventes térmicos (EIFS): molduras, cornisas, marcos, adhesivos y acabados. Catálogo de productos y asesoría profesional.",
  keywords: [
    "EIFS",
    "molduras EIFS",
    "cornisas",
    "fachadas",
    "acabados",
    "poliestireno",
    "La Casa del Eifs",
  ],
  openGraph: {
    title: "La Casa del EIFS",
    description:
      "Envolventes térmicos.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CartProvider>{children}</CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
