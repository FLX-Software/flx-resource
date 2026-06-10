"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { Assignment, ConstructionSite, Employee, Vehicle } from "@prisma/client";
import {
  formatTimeRange,
  MIN_ASSIGNMENT_MINUTES,
  MINUTES_PER_DAY,
  snapMinutes,
  timelinePercent,
} from "@/lib/planning-time";
import { assignVehicleToAssignment, updateAssignmentSchedule } from "@/lib/actions";
import { DRAG_VEHICLE_TYPE } from "@/components/planning/planning-constants";
import { cn } from "@/lib/utils";

type AssignmentBar = Assignment & {
  employee: Employee | null;
  vehicle: Vehicle | null;
  site: ConstructionSite;
};

interface TimelineAssignmentBarProps {
  assignment: AssignmentBar;
  getTimelineRect: () => DOMRect | null;
  compact?: boolean;
  readOnly?: boolean;
}

export function TimelineAssignmentBar({
  assignment,
  getTimelineRect,
  compact = false,
  readOnly = false,
}: TimelineAssignmentBarProps) {
  const [preview, setPreview] = useState({
    start: assignment.startMinutes,
    end: assignment.endMinutes,
  });
  const [dragMode, setDragMode] = useState<"start" | "end" | "move" | null>(null);
  const [vehicleDragOver, setVehicleDragOver] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dragRef = useRef({
    startX: 0,
    startMinutes: 0,
    endMinutes: 0,
  });
  const previewRef = useRef(preview);
  previewRef.current = preview;

  useEffect(() => {
    setPreview({
      start: assignment.startMinutes,
      end: assignment.endMinutes,
    });
  }, [assignment.startMinutes, assignment.endMinutes]);

  useEffect(() => {
    if (!dragMode || readOnly) return;

    function onMove(e: PointerEvent) {
      const rect = getTimelineRect();
      if (!rect) return;

      const deltaMinutes = snapMinutes(
        ((e.clientX - dragRef.current.startX) / rect.width) * MINUTES_PER_DAY
      );

      let start = dragRef.current.startMinutes;
      let end = dragRef.current.endMinutes;

      if (dragMode === "start") {
        start = Math.max(
          0,
          Math.min(end - MIN_ASSIGNMENT_MINUTES, start + deltaMinutes)
        );
      } else if (dragMode === "end") {
        end = Math.min(
          MINUTES_PER_DAY,
          Math.max(start + MIN_ASSIGNMENT_MINUTES, end + deltaMinutes)
        );
      } else {
        const duration = end - start;
        const ratio = (e.clientX - rect.left) / rect.width;
        start = snapMinutes(
          Math.max(0, Math.min(MINUTES_PER_DAY - duration, ratio * MINUTES_PER_DAY))
        );
        end = start + duration;
      }

      setPreview({ start, end });
    }

    async function onUp() {
      const { start, end } = previewRef.current;
      setDragMode(null);

      if (start !== assignment.startMinutes || end !== assignment.endMinutes) {
        try {
          await updateAssignmentSchedule({
            id: assignment.id,
            startMinutes: start,
            endMinutes: end,
          });
        } catch {
          setPreview({
            start: assignment.startMinutes,
            end: assignment.endMinutes,
          });
        }
      }
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragMode, assignment, getTimelineRect, readOnly]);

  function startDrag(mode: "start" | "end" | "move", e: React.PointerEvent) {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = {
      startX: e.clientX,
      startMinutes: preview.start,
      endMinutes: preview.end,
    };
    setDragMode(mode);
  }

  function handleVehicleDrop(e: React.DragEvent) {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    setVehicleDragOver(false);
    const vehicleId = e.dataTransfer.getData(DRAG_VEHICLE_TYPE);
    if (!vehicleId) return;

    startTransition(async () => {
      await assignVehicleToAssignment(assignment.id, vehicleId);
    });
  }

  const { left, width } = timelinePercent(preview.start, preview.end);
  const label = assignment.employee
    ? `${assignment.employee.firstName} ${assignment.employee.lastName}`
    : "Einsatz";
  const vehicleLabel = assignment.vehicle
    ? ` · ${assignment.vehicle.name}`
    : "";

  return (
    <div
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes(DRAG_VEHICLE_TYPE)) {
          e.preventDefault();
          e.stopPropagation();
          setVehicleDragOver(true);
        }
      }}
      onDragLeave={readOnly ? undefined : () => setVehicleDragOver(false)}
      onDrop={readOnly ? undefined : handleVehicleDrop}
      className={cn(
        "absolute inset-y-0.5 flex items-center overflow-hidden rounded border shadow-sm",
        compact ? "text-[10px]" : "text-xs",
        assignment.vehicle
          ? "border-flx-blue/60 bg-flx-blue/25"
          : "border-flx-blue/40 bg-flx-blue/15",
        dragMode && "z-20 ring-1 ring-inset ring-flx-blue-light",
        vehicleDragOver && "z-20 ring-1 ring-inset ring-emerald-400",
        isPending && "opacity-60"
      )}
      style={{ left: `${left}%`, width: `${width}%` }}
      title={`${label}${vehicleLabel} · ${assignment.site.name} · ${formatTimeRange(preview.start, preview.end)}`}
    >
      {!readOnly && (
        <div
          className="w-2 shrink-0 cursor-ew-resize self-stretch bg-flx-blue/50 hover:bg-flx-blue"
          onPointerDown={(e) => startDrag("start", e)}
        />
      )}
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col justify-center px-1.5",
          !readOnly && "cursor-grab active:cursor-grabbing"
        )}
        onPointerDown={readOnly ? undefined : (e) => startDrag("move", e)}
      >
        {compact ? (
          <span className="truncate font-medium leading-tight text-white">
            {assignment.site.name} · {formatTimeRange(preview.start, preview.end)}
          </span>
        ) : (
          <>
            <span className="truncate font-medium text-white">
              {label}
              {vehicleLabel}
            </span>
            <span className="truncate text-[10px] leading-tight text-flx-blue-light">
              {assignment.site.name} · {formatTimeRange(preview.start, preview.end)}
            </span>
          </>
        )}
      </div>
      {!readOnly && (
        <div
          className="w-2 shrink-0 cursor-ew-resize self-stretch bg-flx-blue/50 hover:bg-flx-blue"
          onPointerDown={(e) => startDrag("end", e)}
        />
      )}
    </div>
  );
}
