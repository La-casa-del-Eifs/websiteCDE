"use client";

import { useState } from "react";
import { Upload, Trash2, ArrowUp, ArrowDown, Loader2, Save, Check, ImageOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { TeamMember } from "@/types/database";

type Row = TeamMember & { _saving?: boolean; _saved?: boolean };

export default function TeamManager({
  initial,
  configured,
}: {
  initial: TeamMember[];
  configured: boolean;
}) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [addName, setAddName] = useState("");
  const [addRole, setAddRole] = useState("");
  const [addFile, setAddFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setRow = (id: string, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  async function uploadPhoto(file: File) {
    const supabase = createClient();
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${Date.now()}-${safe}`;
    const bytes = await file.arrayBuffer();
    const up = await supabase.storage.from("team").upload(path, bytes, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
    if (up.error) throw up.error;
    const { data } = supabase.storage.from("team").getPublicUrl(path);
    return { url: data.publicUrl, path };
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!addName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      let photo: { url: string | null; path: string | null } = { url: null, path: null };
      if (addFile) {
        const r = await uploadPhoto(addFile);
        photo = { url: r.url, path: r.path };
      }
      const order = rows.length ? rows[rows.length - 1].sort_order + 1 : 0;
      const ins = await supabase
        .from("team_members")
        .insert({
          name: addName.trim(),
          role: addRole.trim() || null,
          photo_url: photo.url,
          photo_path: photo.path,
          sort_order: order,
          active: true,
        })
        .select("*")
        .single();
      if (ins.error) throw ins.error;
      setRows((rs) => [...rs, ins.data as Row]);
      setAddName("");
      setAddRole("");
      setAddFile(null);
    } catch (err: any) {
      setError(err?.message || "No se pudo agregar.");
    } finally {
      setBusy(false);
    }
  }

  async function save(m: Row) {
    setRow(m.id, { _saving: true, _saved: false });
    try {
      const supabase = createClient();
      await supabase.from("team_members").update({ name: m.name, role: m.role }).eq("id", m.id);
      setRow(m.id, { _saving: false, _saved: true });
      setTimeout(() => setRow(m.id, { _saved: false }), 2000);
    } catch {
      setRow(m.id, { _saving: false });
    }
  }

  async function changePhoto(m: Row, file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      const r = await uploadPhoto(file);
      const supabase = createClient();
      await supabase.from("team_members").update({ photo_url: r.url, photo_path: r.path }).eq("id", m.id);
      if (m.photo_path) await supabase.storage.from("team").remove([m.photo_path]);
      setRow(m.id, { photo_url: r.url, photo_path: r.path });
    } catch (err: any) {
      setError(err?.message || "No se pudo cambiar la foto.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(m: Row) {
    if (!window.confirm(`¿Eliminar a ${m.name}?`)) return;
    setBusy(true);
    try {
      const supabase = createClient();
      await supabase.from("team_members").delete().eq("id", m.id);
      if (m.photo_path) await supabase.storage.from("team").remove([m.photo_path]);
      setRows((rs) => rs.filter((r) => r.id !== m.id));
    } catch {
    } finally {
      setBusy(false);
    }
  }

  async function move(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= rows.length) return;
    setBusy(true);
    try {
      const supabase = createClient();
      const a = rows[idx];
      const b = rows[j];
      await supabase.from("team_members").update({ sort_order: b.sort_order }).eq("id", a.id);
      await supabase.from("team_members").update({ sort_order: a.sort_order }).eq("id", b.id);
      const list = [...rows];
      list[idx] = { ...a, sort_order: b.sort_order };
      list[j] = { ...b, sort_order: a.sort_order };
      list.sort((x, y) => x.sort_order - y.sort_order);
      setRows(list);
    } catch {
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <div className="card mt-5 p-6 text-sm text-ink-soft">
        Conecta Supabase y corre{" "}
        <code className="rounded bg-brand-50 px-1">migration_013_team.sql</code> para
        administrar el equipo.
      </div>
    );
  }

  return (
    <div className="mt-5">
      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {/* Agregar */}
      <form onSubmit={add} className="card p-5">
        <h2 className="font-semibold text-ink">Agregar miembro</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input className="input" placeholder="Nombre" value={addName} onChange={(e) => setAddName(e.target.value)} required />
          <input className="input" placeholder="Cargo (ej. Jefe de ventas)" value={addRole} onChange={(e) => setAddRole(e.target.value)} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="btn-outline cursor-pointer">
            <Upload size={16} /> {addFile ? "Cambiar foto" : "Elegir foto"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setAddFile(e.target.files?.[0] ?? null)} />
          </label>
          {addFile && <span className="text-xs text-ink-muted">{addFile.name}</span>}
          <button type="submit" disabled={busy || !addName.trim()} className="btn-primary ml-auto">
            {busy ? <Loader2 size={16} className="animate-spin" /> : null} Agregar
          </button>
        </div>
      </form>

      {/* Lista */}
      {rows.length === 0 ? (
        <div className="card mt-5 flex flex-col items-center justify-center gap-2 py-14 text-center">
          <ImageOff size={36} className="text-ink-muted" />
          <p className="text-sm text-ink-soft">Aún no hay miembros. Agrega el primero arriba.</p>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((m, idx) => (
            <div key={m.id} className="card p-4">
              <div className="flex items-center gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-brand-50">
                  {m.photo_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={m.photo_url} alt={m.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-bold text-brand-300">
                      {m.name.charAt(0)}
                    </div>
                  )}
                </div>
                <label className="cursor-pointer text-xs font-medium text-brand-600 hover:text-brand-700">
                  Cambiar foto
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => changePhoto(m, e.target.files?.[0])} />
                </label>
              </div>
              <input className="input mt-3" value={m.name} onChange={(e) => setRow(m.id, { name: e.target.value })} placeholder="Nombre" />
              <input className="input mt-2" value={m.role ?? ""} onChange={(e) => setRow(m.id, { role: e.target.value })} placeholder="Cargo" />
              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-1">
                  <button onClick={() => move(idx, -1)} disabled={busy || idx === 0} className="rounded-lg p-1.5 text-ink-soft hover:bg-brand-50 disabled:opacity-40"><ArrowUp size={16} /></button>
                  <button onClick={() => move(idx, 1)} disabled={busy || idx === rows.length - 1} className="rounded-lg p-1.5 text-ink-soft hover:bg-brand-50 disabled:opacity-40"><ArrowDown size={16} /></button>
                  <button onClick={() => remove(m)} disabled={busy} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
                </div>
                <button onClick={() => save(m)} disabled={m._saving} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-800 disabled:opacity-60">
                  {m._saving ? <Loader2 size={14} className="animate-spin" /> : m._saved ? <Check size={14} /> : <Save size={14} />}
                  {m._saved ? "Guardado" : "Guardar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
