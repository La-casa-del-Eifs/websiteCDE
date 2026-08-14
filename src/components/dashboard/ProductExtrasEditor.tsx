"use client";

import { useState } from "react";
import { Save, Loader2, Check, Upload, FileText, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ProductExtrasEditor({
  productId,
  initial,
  configured,
}: {
  productId: string;
  initial: {
    leyenda: string;
    description: string;
    datasheet_url: string | null;
    datasheet_path: string | null;
  };
  configured: boolean;
}) {
  const [leyenda, setLeyenda] = useState(initial.leyenda);
  const [description, setDescription] = useState(initial.description);
  const [pdfUrl, setPdfUrl] = useState<string | null>(initial.datasheet_url);
  const [pdfPath, setPdfPath] = useState<string | null>(initial.datasheet_path);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!configured) {
    return (
      <div className="card mt-5 p-6 text-sm text-ink-soft">
        Conecta Supabase y ejecuta{" "}
        <code className="rounded bg-brand-50 px-1">migration_015_product_extras.sql</code>{" "}
        para editar estos campos.
      </div>
    );
  }

  async function saveText() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("products")
        .update({
          leyenda: leyenda.trim() || null,
          description: description.trim() || null,
        })
        .eq("id", productId);
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err?.message || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function onUploadPdf(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `${productId}/${Date.now()}-${safe}`;
      const bytes = await file.arrayBuffer();
      const up = await supabase.storage.from("datasheets").upload(filePath, bytes, {
        upsert: false,
        contentType: file.type || "application/pdf",
      });
      if (up.error) throw up.error;
      const { data: pub } = supabase.storage.from("datasheets").getPublicUrl(filePath);
      const { error } = await supabase
        .from("products")
        .update({ datasheet_url: pub.publicUrl, datasheet_path: filePath })
        .eq("id", productId);
      if (error) throw error;
      const prev = pdfPath;
      if (prev) await supabase.storage.from("datasheets").remove([prev]);
      setPdfUrl(pub.publicUrl);
      setPdfPath(filePath);
    } catch (err: any) {
      setError(err?.message || "No se pudo subir el PDF.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function removePdf() {
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("products")
        .update({ datasheet_url: null, datasheet_path: null })
        .eq("id", productId);
      if (error) throw error;
      if (pdfPath) await supabase.storage.from("datasheets").remove([pdfPath]);
      setPdfUrl(null);
      setPdfPath(null);
    } catch (err: any) {
      setError(err?.message || "No se pudo quitar el PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-5 space-y-6">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="card p-5">
        <label className="block text-sm font-medium text-ink">Leyenda (frase corta)</label>
        <p className="mb-2 text-xs text-ink-muted">
          Se muestra bajo el nombre en la tarjeta del catálogo y en la ficha.
        </p>
        <input
          type="text"
          value={leyenda}
          onChange={(e) => setLeyenda(e.target.value)}
          maxLength={120}
          placeholder="Ej: Alta resistencia y terminación premium"
          className="input"
        />

        <label className="mt-5 block text-sm font-medium text-ink">Descripción</label>
        <p className="mb-2 text-xs text-ink-muted">
          Párrafo que se muestra en la ficha del producto.
        </p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          placeholder="Detalle del producto, usos, ventajas..."
          className="input"
        />

        <button onClick={saveText} disabled={saving} className="btn-primary mt-4">
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : saved ? (
            <Check size={16} />
          ) : (
            <Save size={16} />
          )}
          {saved ? "Guardado" : "Guardar textos"}
        </button>
      </div>

      <div className="card p-5">
        <p className="text-sm font-medium text-ink">Cartilla técnica (PDF)</p>
        <p className="mb-3 text-xs text-ink-muted">
          Opcional. Se ofrece como descarga en la ficha del producto.
        </p>
        {pdfUrl ? (
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-brand-200 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
            >
              <FileText size={16} /> Ver PDF actual
            </a>
            <label className="btn-outline cursor-pointer">
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}{" "}
              Reemplazar
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={onUploadPdf}
                disabled={busy}
              />
            </label>
            <button
              onClick={removePdf}
              disabled={busy}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
            >
              <Trash2 size={15} /> Quitar
            </button>
          </div>
        ) : (
          <label className="btn-primary cursor-pointer">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Subir PDF
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={onUploadPdf}
              disabled={busy}
            />
          </label>
        )}
      </div>
    </div>
  );
}
