"use client";

import { useState } from "react";
import { Upload, Loader2, Trash2, ImageOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SiteImageManager({
  imageKey,
  currentUrl,
  configured,
  hint,
  aspect = "aspect-[5/4]",
}: {
  imageKey: string;
  currentUrl: string | null;
  configured: boolean;
  hint?: string;
  aspect?: string;
}) {
  const [url, setUrl] = useState<string | null>(currentUrl);
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
      const filePath = `${imageKey}/${Date.now()}-${safe}`;
      const bytes = await file.arrayBuffer();
      const up = await supabase.storage.from("site").upload(filePath, bytes, {
        upsert: false,
        contentType: file.type || "image/jpeg",
      });
      if (up.error) throw up.error;
      const { data: pub } = supabase.storage.from("site").getPublicUrl(filePath);
      const ins = await supabase
        .from("site_images")
        .upsert(
          { key: imageKey, url: pub.publicUrl, path: filePath, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        )
        .select("url")
        .single();
      if (ins.error) throw ins.error;
      setUrl(pub.publicUrl);
    } catch (err: any) {
      setError(err?.message || "No se pudo subir la imagen.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const del = await supabase.from("site_images").delete().eq("key", imageKey);
      if (del.error) throw del.error;
      setUrl(null);
    } catch (err: any) {
      setError(err?.message || "No se pudo quitar la imagen.");
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <div className="card mt-5 p-6 text-sm text-ink-soft">
        Conecta Supabase y ejecuta{" "}
        <code className="rounded bg-brand-50 px-1">migration_014_site_images.sql</code> para
        administrar esta imagen.
      </div>
    );
  }

  return (
    <div className="mt-5">
      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card overflow-hidden">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className={`${aspect} w-full object-cover`} />
          ) : (
            <div
              className={`${aspect} flex flex-col items-center justify-center gap-2 bg-brand-50 text-ink-muted`}
            >
              <ImageOff size={36} />
              <p className="text-sm">Sin imagen</p>
            </div>
          )}
        </div>
        <div>
          <label className="btn-primary cursor-pointer">
            {busy ? <Loader2 size={17} className="animate-spin" /> : <Upload size={17} />}
            {url ? "Cambiar imagen" : "Subir imagen"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onUpload}
              disabled={busy}
            />
          </label>
          {url && (
            <button
              onClick={remove}
              disabled={busy}
              className="btn-outline mt-3 text-red-600"
            >
              <Trash2 size={16} /> Quitar
            </button>
          )}
          {hint && <p className="mt-3 text-xs text-ink-muted">{hint}</p>}
        </div>
      </div>
    </div>
  );
}
