"use client";

import { useState } from "react";
import { Upload, Trash2, ArrowUp, ArrowDown, Loader2, ImageOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { HeroSlide } from "@/types/database";

export default function HeroManager({
  initial,
  configured,
}: {
  initial: HeroSlide[];
  configured: boolean;
}) {
  const [slides, setSlides] = useState<HeroSlide[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `${Date.now()}-${safe}`;
      // Subir como bytes (evita el error "No content provided" con File directo).
      const bytes = await file.arrayBuffer();
      const up = await supabase.storage.from("hero").upload(filePath, bytes, {
        upsert: false,
        contentType: file.type || "image/jpeg",
      });
      if (up.error) throw up.error;
      const { data: pub } = supabase.storage.from("hero").getPublicUrl(filePath);
      const nextOrder =
        slides.length > 0 ? slides[slides.length - 1].sort_order + 1 : 1;
      const ins = await supabase
        .from("hero_slides")
        .insert({ path: filePath, url: pub.publicUrl, sort_order: nextOrder, active: true })
        .select("*")
        .single();
      if (ins.error) throw ins.error;
      setSlides((s) => [...s, ins.data as HeroSlide]);
    } catch (err: any) {
      setError(err?.message || "No se pudo subir la imagen.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function remove(slide: HeroSlide) {
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const del = await supabase.from("hero_slides").delete().eq("id", slide.id);
      if (del.error) throw del.error;
      await supabase.storage.from("hero").remove([slide.path]);
      setSlides((s) => s.filter((x) => x.id !== slide.id));
    } catch (err: any) {
      setError(err?.message || "No se pudo eliminar.");
    } finally {
      setBusy(false);
    }
  }

  async function move(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= slides.length) return;
    const a = slides[idx];
    const b = slides[j];
    setBusy(true);
    try {
      const supabase = createClient();
      await supabase.from("hero_slides").update({ sort_order: b.sort_order }).eq("id", a.id);
      await supabase.from("hero_slides").update({ sort_order: a.sort_order }).eq("id", b.id);
      const copy = [...slides];
      copy[idx] = { ...a, sort_order: b.sort_order };
      copy[j] = { ...b, sort_order: a.sort_order };
      copy.sort((x, y) => x.sort_order - y.sort_order);
      setSlides(copy);
    } catch (err: any) {
      setError(err?.message || "No se pudo reordenar.");
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <div className="card mt-5 p-6 text-sm text-ink-soft">
        Conecta Supabase y ejecuta <code className="rounded bg-brand-50 px-1">migration_004_hero.sql</code>{" "}
        para administrar las imágenes desde aquí. Mientras tanto, el carrusel usa
        las imágenes de <code className="rounded bg-brand-50 px-1">public/hero</code>.
      </div>
    );
  }

  return (
    <div className="mt-5">
      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <label className="btn-primary cursor-pointer">
        {busy ? <Loader2 size={17} className="animate-spin" /> : <Upload size={17} />}
        Subir imagen
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onUpload}
          disabled={busy}
        />
      </label>
      <p className="mt-2 text-xs text-ink-muted">
        Recomendado ~1200×960 px (proporción 5:4). Se muestran en orden; usa las
        flechas para reordenar.
      </p>

      {slides.length === 0 ? (
        <div className="card mt-5 flex flex-col items-center justify-center gap-2 py-14 text-center">
          <ImageOff size={36} className="text-ink-muted" />
          <p className="text-sm text-ink-soft">Aún no hay imágenes. Sube la primera.</p>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slides.map((slide, idx) => (
            <div key={slide.id} className="card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.url}
                alt=""
                className="aspect-[5/4] w-full object-cover"
              />
              <div className="flex items-center justify-between p-3">
                <span className="text-xs text-ink-muted">#{idx + 1}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => move(idx, -1)}
                    disabled={busy || idx === 0}
                    className="rounded-lg p-1.5 text-ink-soft hover:bg-brand-50 disabled:opacity-40"
                    aria-label="Subir"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => move(idx, 1)}
                    disabled={busy || idx === slides.length - 1}
                    className="rounded-lg p-1.5 text-ink-soft hover:bg-brand-50 disabled:opacity-40"
                    aria-label="Bajar"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    onClick={() => remove(slide)}
                    disabled={busy}
                    className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-40"
                    aria-label="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
