import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  accent?: "blue" | "emerald" | "amber" | "slate";
}

const accentStyles = {
  blue: "border border-flx-blue/30 bg-flx-blue/10 text-flx-blue-light",
  emerald: "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  amber: "border border-amber-500/30 bg-amber-500/10 text-amber-400",
  slate: "border border-flx-border bg-flx-elevated text-flx-muted",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accent = "blue",
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-flx-muted">{title}</p>
            <p className="mt-2 text-3xl font-bold text-white">{value}</p>
            {subtitle && (
              <p className="mt-1 text-xs text-flx-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <p className="mt-2 text-xs font-medium text-emerald-400">{trend}</p>
            )}
          </div>
          <div className={cn("rounded-lg p-3", accentStyles[accent])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
