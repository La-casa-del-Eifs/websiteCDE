import type { LucideIcon } from "lucide-react";

export default function KpiCard({
  title, value, hint, icon: Icon,
}: {
  title: string; value: string | number; hint?: string; icon: LucideIcon;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-ink-soft">{title}</p>
          <p className="mt-1 text-2xl font-bold text-ink">{value}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-100 text-brand-900">
          <Icon size={20} />
        </span>
      </div>
      {hint && <p className="mt-2 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}
