import { formatPercent } from "@/lib/utils";

interface UtilizationBarProps {
  label: string;
  value: number;
  available: number;
  total: number;
}

export function UtilizationBar({
  label,
  value,
  available,
  total,
}: UtilizationBarProps) {
  const color =
    value >= 80
      ? "bg-amber-500"
      : value >= 50
        ? "bg-flx-blue"
        : "bg-emerald-500";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-200">{label}</span>
        <span className="text-flx-muted">
          {formatPercent(value)} · {available} von {total} verfügbar
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-flx-elevated">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}
