import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  accent?: "amber" | "emerald" | "blue" | "slate";
}

const accentStyles = {
  amber: "bg-amber-50 text-amber-700",
  emerald: "bg-emerald-50 text-emerald-700",
  blue: "bg-blue-50 text-blue-700",
  slate: "bg-stone-100 text-stone-700",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accent = "amber",
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-stone-500">{title}</p>
            <p className="mt-2 text-3xl font-bold text-stone-900">{value}</p>
            {subtitle && (
              <p className="mt-1 text-xs text-stone-500">{subtitle}</p>
            )}
            {trend && (
              <p className="mt-2 text-xs font-medium text-emerald-600">{trend}</p>
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
