"use client";

import { useState } from "react";
import { Upload, Trash2, ArrowLeft, ArrowRight, Loader2, Star, ImageOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ProductImage } from "@/types/database";

export default function ProductImagesManager({
  productId,
  initial,
  configured,
}: {
  productId: string;
  initial: ProductImage[];
  configured: boolean;
}) {
  const [images, setImages] = useState<ProductImage[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function syncMain(list: ProductImage[]) {
    const supabase = createClient();
    await supabase
      .from("products")
      .update({ image_url: list.length ? list[0].url : null })
      .eq("id", productId);
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const list = [...images];
      let order = list.length ? list[list.length - 1].sort_order + 1 : 0;
      for (const file of files) {
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${productId}/${Date.now()}-${safe}`;
        const bytes = await file.arrayBuffer();
        const up = await supabase.storage.from("products").upload(path, bytes, {
          contentType: file.type || "image/jpeg",
          upsert: false,
        });
        if (up.error) throw up.error;
        const { data: pub } = supabase.storage.from("products").getPublicUrl(path);
        const ins = await supabase
          .from("product_images")
          .insert({ product_id: productId, url: pub.publicUrl, path, sort_order: order++ })
          .select("*")
          .single();
        if (ins.error) throw ins.error;
        list.push(ins.data as ProductImage);
      }
      setImages(list);
      await syncMain(list);
    } catch (err: any) {
      setError(err?.message || "No se pudieron subir las imágenes.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function remove(img: ProductImage) {
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const del = await supabase.from("product_images").delete().eq("id", img.id);
      if (del.error) throw del.error;
      await supabase.storage.from("products").remove([img.path]);
      const list = images.filter((x) => x.id !== img.id);
      setImages(list);
      await syncMain(list);
    } catch (err: any) {
      setError(err?.message || "No se pudo eliminar.");
    } finally {
      setBusy(false);
    }
  }

  async function move(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= images.length) return;
    setBusy(true);
    try {
      const supabase = createClient();
      const a = images[idx];
      const b = images[j];
      await supabase.from("product_images").update({ sort_order: b.sort_order }).eq("id", a.id);
      await supabase.from("product_images").update({ sort_order: a.sort_order }).eq("id", b.id);
      const list = [...images];
      list[idx] = { ...a, sort_order: b.sort_order };
      list[j] = { ...b, sort_order: a.sort_order };
      list.sort((x, y) => x.sort_order - y.sort_order);
      setImages(list);
      await syncMain(list);
    } catch (err: any) {
      setError(err?.message || "No se pudo reordenar.");
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <div className="card mt-5 p-6 text-sm text-ink-soft">
        Conecta Supabase y ejecuta{" "}
        <code className="rounded bg-brand-50 px-1">migration_006_product_images.sql</code>{" "}
        para gestionar imágenes.
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
        Subir imágenes
        <input type="file" accept="image/*" multiple className="hidden" onChange={onUpload} disabled={busy} />
      </label>
      <p className="mt-2 text-xs text-ink-muted">
        Puedes subir varias a la vez. La primera (★) es la principal que se ve en
        las tarjetas. Usa las flechas para reordenar.
      </p>

      {images.length === 0 ? (
        <div className="card mt-5 flex flex-col items-center justify-center gap-2 py-14 text-center">
          <ImageOff size={36} className="text-ink-muted" />
          <p className="text-sm text-ink-soft">Este producto aún no tiene imágenes.</p>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img, idx) => (
            <div key={img.id} className="card overflow-hidden">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="aspect-square w-full object-cover" />
                {idx === 0 && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-gold-400 px-2 py-0.5 text-[10px] font-bold text-brand-900">
                    <Star size={11} /> Principal
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between p-2">
                <div className="flex gap-1">
                  <button onClick={() => move(idx, -1)} disabled={busy || idx === 0} className="rounded-lg p-1.5 text-ink-soft hover:bg-brand-50 disabled:opacity-40" aria-label="Mover antes">
                    <ArrowLeft size={15} />
                  </button>
                  <button onClick={() => move(idx, 1)} disabled={busy || idx === images.length - 1} className="rounded-lg p-1.5 text-ink-soft hover:bg-brand-50 disabled:opacity-40" aria-label="Mover después">
                    <ArrowRight size={15} />
                  </button>
                </div>
                <button onClick={() => remove(img)} disabled={busy} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-40" aria-label="Eliminar">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
