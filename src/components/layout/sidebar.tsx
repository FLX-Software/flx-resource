"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Truck,
  Building2,
  CalendarDays,
  LogOut,
  Shield,
  UserCircle,
} from "lucide-react";
import { logout } from "@/lib/auth-actions";
import type { SessionUser } from "@/lib/auth-types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/planung", label: "Planung", icon: CalendarDays },
  { href: "/mitarbeiter", label: "Mitarbeiter", icon: Users },
  { href: "/fahrzeuge", label: "Fahrzeuge", icon: Truck },
  { href: "/baustellen", label: "Baustellen", icon: Building2 },
];

const adminNavItems = [
  { href: "/administration", label: "Administration", icon: Shield },
];

const accountNavItems = [
  { href: "/profil", label: "Mein Profil", icon: UserCircle },
];

interface SidebarProps {
  session: SessionUser | null;
  isAdmin: boolean;
}

function NavLink({
  href,
  label,
  icon: Icon,
  pathname,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  pathname: string;
}) {
  const isActive =
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-flx-blue/15 text-flx-blue-light shadow-[inset_3px_0_0_0_#0080ff]"
          : "text-flx-muted hover:bg-flx-elevated hover:text-white"
      )}
    >
      <Icon className={cn("h-4 w-4", isActive && "text-flx-blue")} />
      {label}
    </Link>
  );
}

export function Sidebar({ session, isAdmin }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-flx-border bg-flx-sidebar text-white">
      <div className="border-b border-flx-border px-6 py-5">
        <Image
          src="/flx-logo.png"
          alt="FLX Software"
          width={140}
          height={48}
          className="h-10 w-auto"
          priority
        />
        <p className="mt-2 text-xs text-flx-muted">Fluck Holzbau</p>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} pathname={pathname} />
        ))}

        {isAdmin && (
          <>
            <div className="my-3 border-t border-flx-border" />
            {adminNavItems.map((item) => (
              <NavLink key={item.href} {...item} pathname={pathname} />
            ))}
          </>
        )}

        <div className="my-3 border-t border-flx-border" />
        {accountNavItems.map((item) => (
          <NavLink key={item.href} {...item} pathname={pathname} />
        ))}
      </nav>

      <div className="border-t border-flx-border p-4">
        {session && (
          <div className="mb-3">
            <p className="truncate text-sm font-medium text-white">
              {session.firstName} {session.lastName}
            </p>
            <p className="truncate text-xs text-flx-muted">@{session.username}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wide text-flx-muted-foreground">
              {isAdmin ? "Administrator" : "Mitarbeiter"}
            </p>
          </div>
        )}
        <form action={logout}>
          <Button type="submit" variant="ghost" size="sm" className="w-full justify-start">
            <LogOut className="h-4 w-4" />
            Abmelden
          </Button>
        </form>
      </div>
    </aside>
  );
}
