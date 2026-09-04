import type { Metadata } from "next";
import { Wrench, MessageCircle, Phone } from "lucide-react";
import { SITE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Sitio en mantención",
  robots: { index: false, follow: false },
};

export default function MantencionPage() {
  const wa = `https://wa.me/${SITE.whatsapp}`;
  const phone = SITE.phones[0] || "";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-900 px-6 py-16 text-center text-white">
      <div className="w-full max-w-lg">
        <div className="flex justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-400 text-brand-900">
            <Wrench size={30} />
          </span>
        </div>

        <h1 className="mt-8 text-2xl font-bold sm:text-3xl">Sitio en mantención</h1>
        <p className="mt-3 leading-relaxed text-brand-100">
          Estamos mejorando el sitio para darte una mejor experiencia. Volveremos
          muy pronto. Mientras tanto, puedes contactarnos:
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1eb955]"
          >
            <MessageCircle size={18} /> Escríbenos por WhatsApp
          </a>
          {phone && (
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 text-sm text-brand-100 hover:text-white"
            >
              <Phone size={16} /> {phone}
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
