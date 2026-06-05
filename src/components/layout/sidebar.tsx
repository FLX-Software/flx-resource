"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Truck,
  Building2,
  CalendarDays,
  TreePine,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/planung", label: "Planung", icon: CalendarDays },
  { href: "/mitarbeiter", label: "Mitarbeiter", icon: Users },
  { href: "/fahrzeuge", label: "Fahrzeuge", icon: Truck },
  { href: "/baustellen", label: "Baustellen", icon: Building2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-stone-200 bg-stone-900 text-white">
      <div className="flex items-center gap-3 border-b border-stone-700 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-700">
          <TreePine className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">FLX Resource</p>
          <p className="text-xs text-stone-400">Fluck Holzbau</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-amber-700 text-white"
                  : "text-stone-300 hover:bg-stone-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-stone-700 p-4">
        <p className="text-xs text-stone-500">Ressourcenplanung v1.0</p>
      </div>
    </aside>
  );
}
