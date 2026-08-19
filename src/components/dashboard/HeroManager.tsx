"use client";

import { useState } from "react";
import {
  Upload,
  Trash2,
  ArrowUp,
  ArrowDown,
  Loader2,
  ImageOff,
  Link2,
  ImagePlus,
} from "lucide-react";
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

  const patchSlide = (id: string, patch: Partial<HeroSlide>) =>
    setSlides((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `${Date.now()}-${safe}`;
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
      const paths = [slide.path, slide.overlay_path].filter(Boolean) as string[];
      if (paths.length) await supabase.storage.from("hero").remove(paths);
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

  // Enlace al que lleva el banner al hacer clic (se guarda al salir del campo).
  async function saveLink(slide: HeroSlide, value: string) {
    const link = value.trim() || null;
    if ((slide.link_url ?? null) === link) return;
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("hero_slides")
        .update({ link_url: link })
        .eq("id", slide.id);
      if (error) throw error;
      patchSlide(slide.id, { link_url: link });
    } catch (err: any) {
      setError(err?.message || "No se pudo guardar el enlace.");
    }
  }

  // Imagen de producto (PNG sin fondo) que se muestra encima del banner.
  async function onUploadOverlay(slide: HeroSlide, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `overlay/${Date.now()}-${safe}`;
      const bytes = await file.arrayBuffer();
      const up = await supabase.storage.from("hero").upload(filePath, bytes, {
        upsert: false,
        contentType: file.type || "image/png",
      });
      if (up.error) throw up.error;
      const { data: pub } = supabase.storage.from("hero").getPublicUrl(filePath);
      const { error } = await supabase
        .from("hero_slides")
        .update({ overlay_url: pub.publicUrl, overlay_path: filePath })
        .eq("id", slide.id);
      if (error) throw error;
      const prev = slide.overlay_path;
      if (prev) await supabase.storage.from("hero").remove([prev]);
      patchSlide(slide.id, { overlay_url: pub.publicUrl, overlay_path: filePath });
    } catch (err: any) {
      setError(err?.message || "No se pudo subir la imagen de producto.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function removeOverlay(slide: HeroSlide) {
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("hero_slides")
        .update({ overlay_url: null, overlay_path: null })
        .eq("id", slide.id);
      if (error) throw error;
      if (slide.overlay_path) await supabase.storage.from("hero").remove([slide.overlay_path]);
      patchSlide(slide.id, { overlay_url: null, overlay_path: null });
    } catch (err: any) {
      setError(err?.message || "No se pudo quitar la imagen.");
    } finally {
      setBusy(false);
    }
  }

  // Texto de promo (editable, se muestra en el badge dorado del banner).
  async function saveOverlayText(slide: HeroSlide, value: string) {
    const text = value.trim() || null;
    if ((slide.overlay_text ?? null) === text) return;
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("hero_slides")
        .update({ overlay_text: text })
        .eq("id", slide.id);
      if (error) throw error;
      patchSlide(slide.id, { overlay_text: text });
    } catch (err: any) {
      setError(err?.message || "No se pudo guardar el texto.");
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
        Foto de fondo recomendada ~1600×900 px. Usa las flechas para reordenar.
        Por cada banner puedes agregar un enlace, una imagen de producto (PNG sin
        fondo) y una promo de cuotas.
      </p>

      {slides.length === 0 ? (
        <div className="card mt-5 flex flex-col items-center justify-center gap-2 py-14 text-center">
          <ImageOff size={36} className="text-ink-muted" />
          <p className="text-sm text-ink-soft">Aún no hay imágenes. Sube la primera.</p>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slides.map((slide, idx) => {
            const overlayNeedsText =
              !!slide.overlay_url && !(slide.overlay_text ?? "").trim();
            return (
              <div key={slide.id} className="card overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.url}
                  alt=""
                  className="aspect-[16/9] w-full object-cover"
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

                <div className="border-t border-brand-50 px-3 py-2.5">
                  <label className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-ink-muted">
                    <Link2 size={12} /> Enlace al hacer clic (opcional)
                  </label>
                  <input
                    type="text"
                    defaultValue={slide.link_url ?? ""}
                    placeholder="Ej: /catalogo/mortero-adhesivo-eifs"
                    onBlur={(e) => saveLink(slide, e.target.value)}
                    className="w-full rounded-lg border border-brand-200 bg-white px-2.5 py-1.5 text-xs text-ink placeholder:text-ink-muted focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div className="border-t border-brand-50 px-3 py-2.5">
                  <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-ink-muted">
                    <ImagePlus size={12} /> Producto encima (PNG sin fondo)
                  </p>
                  {slide.overlay_url ? (
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={slide.overlay_url}
                        alt=""
                        className="h-10 w-10 rounded bg-brand-50 object-contain"
                      />
                      <label className="cursor-pointer text-xs font-medium text-brand-600 hover:text-brand-700">
                        Reemplazar
                        <input
                          type="file"
                          accept="image/png,image/webp,image/*"
                          className="hidden"
                          onChange={(e) => onUploadOverlay(slide, e)}
                          disabled={busy}
                        />
                      </label>
                      <button
                        onClick={() => removeOverlay(slide)}
                        disabled={busy}
                        className="text-xs font-medium text-red-500 hover:underline disabled:opacity-50"
                      >
                        Quitar
                      </button>
                    </div>
                  ) : (
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-brand-200 px-2.5 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50">
                      {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}{" "}
                      Subir imagen
                      <input
                        type="file"
                        accept="image/png,image/webp,image/*"
                        className="hidden"
                        onChange={(e) => onUploadOverlay(slide, e)}
                        disabled={busy}
                      />
                    </label>
                  )}

                  <p className="mb-1 mt-2.5 text-[11px] font-medium text-ink-muted">
                    Texto de promo (opcional, admite saltos de línea)
                  </p>
                  <textarea
                    defaultValue={slide.overlay_text ?? ""}
                    rows={2}
                    placeholder="Ej: HASTA 3 CUOTAS SIN INTERÉS $20.000"
                    onBlur={(e) => saveOverlayText(slide, e.target.value)}
                    className={`w-full rounded-lg border bg-white px-2.5 py-1.5 text-xs text-ink placeholder:text-ink-muted focus:outline-none ${
                      overlayNeedsText
                        ? "border-red-400 focus:border-red-500"
                        : "border-brand-200 focus:border-brand-500"
                    }`}
                  />
                  {overlayNeedsText && (
                    <p className="mt-1 text-[11px] font-medium text-red-500">
                      El texto es obligatorio cuando subes la imagen de producto.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
