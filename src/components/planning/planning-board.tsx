"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  subWeeks,
} from "date-fns";
import { de } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import type {
  ConstructionSite,
  Employee,
  Vehicle,
  Assignment,
} from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/shared/modal";
import { Button } from "@/components/ui/button";
import { ResourcePalette } from "@/components/planning/resource-palette";
import { WeekDaySection } from "@/components/planning/week-day-section";
import { DayTimeline } from "@/components/planning/day-timeline";

type AssignmentWithRelations = Assignment & {
  employee: Employee | null;
  vehicle: Vehicle | null;
  site: ConstructionSite;
};

interface PlanningBoardProps {
  employees: Employee[];
  vehicles: Vehicle[];
  sites: ConstructionSite[];
  assignments: AssignmentWithRelations[];
  defaultDate: Date;
  readOnly?: boolean;
}

export function PlanningBoard({
  employees,
  vehicles,
  sites,
  assignments,
  defaultDate,
  readOnly = false,
}: PlanningBoardProps) {
  const router = useRouter();
  const [openDay, setOpenDay] = useState<Date | null>(null);
  const weekStart = startOfWeek(defaultDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(defaultDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const todayStr = format(new Date(), "yyyy-MM-dd");

  function navigateWeek(offset: number) {
    const next = offset > 0 ? addWeeks(weekStart, 1) : subWeeks(weekStart, 1);
    router.push(`/planung?week=${format(next, "yyyy-MM-dd")}`);
  }

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {!readOnly && (
          <Card className="w-full shrink-0 lg:sticky lg:top-4 lg:w-72">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Ressourcen</CardTitle>
            </CardHeader>
            <CardContent>
              <ResourcePalette employees={employees} vehicles={vehicles} />
            </CardContent>
          </Card>
        )}

        <Card className="min-w-0 flex-1">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-flx-blue" />
              Wochenplan
              <span className="text-base font-normal text-flx-muted">
                ({format(weekStart, "d. MMM", { locale: de })} –{" "}
                {format(weekEnd, "d. MMM yyyy", { locale: de })})
              </span>
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateWeek(-1)}>
                <ChevronLeft className="h-4 w-4" />
                Vorherige
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/planung")}
              >
                Heute
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateWeek(1)}>
                Nächste
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <p className="border-b border-flx-border-subtle px-4 py-2 text-xs text-flx-muted">
              {readOnly
                ? "Ihre Einsätze pro Tag in der 24h-Zeitleiste."
                : "Jeder Tag ist eine Zeile mit 24h-Zeitleiste nach rechts. Bei vielen Mitarbeitern innerhalb des Tages vertikal scrollen."}
            </p>
            <div className="divide-y divide-flx-border-subtle">
              {weekDays.map((day) => {
                const dayStr = format(day, "yyyy-MM-dd");
                return (
                  <WeekDaySection
                    key={dayStr}
                    day={day}
                    assignments={assignments}
                    employees={employees}
                    vehicles={vehicles}
                    sites={sites}
                    isToday={dayStr === todayStr}
                    onExpand={() => setOpenDay(day)}
                    readOnly={readOnly}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {openDay && (
        <Modal
          open={!!openDay}
          onOpenChange={(open) => !open && setOpenDay(null)}
          title={`Tagesplanung – ${format(openDay, "EEEE, d. MMMM", { locale: de })}`}
          description="24-Stunden-Zeitleiste mit stundenweiser Zuweisung."
          className="max-w-[95vw]"
        >
          <DayTimeline
            day={openDay}
            assignments={assignments}
            employees={employees}
            vehicles={vehicles}
            sites={sites}
            readOnly={readOnly}
          />
        </Modal>
      )}

    </>
  );
}
