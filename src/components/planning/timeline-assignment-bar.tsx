"use client";

import { useEffect, useRef, useState } from "react";
import type { Assignment, ConstructionSite, Employee } from "@prisma/client";
import {
  formatTimeRange,
  MIN_ASSIGNMENT_MINUTES,
  MINUTES_PER_DAY,
  snapMinutes,
  timelinePercent,
} from "@/lib/planning-time";
import { updateAssignmentSchedule } from "@/lib/actions";
import { cn } from "@/lib/utils";

type AssignmentBar = Assignment & {
  employee: Employee | null;
  site: ConstructionSite;
};

interface TimelineAssignmentBarProps {
  assignment: AssignmentBar;
  getTimelineRect: () => DOMRect | null;
}

export function TimelineAssignmentBar({
  assignment,
  getTimelineRect,
}: TimelineAssignmentBarProps) {
  const [preview, setPreview] = useState({
    start: assignment.startMinutes,
    end: assignment.endMinutes,
  });
  const [dragMode, setDragMode] = useState<"start" | "end" | "move" | null>(null);
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
    if (!dragMode) return;

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
  }, [dragMode, assignment, getTimelineRect]);

  function startDrag(mode: "start" | "end" | "move", e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = {
      startX: e.clientX,
      startMinutes: preview.start,
      endMinutes: preview.end,
    };
    setDragMode(mode);
  }

  const { left, width } = timelinePercent(preview.start, preview.end);
  const label = assignment.employee
    ? `${assignment.employee.firstName} ${assignment.employee.lastName}`
    : "Einsatz";

  return (
    <div
      className={cn(
        "absolute top-1 flex h-10 items-center overflow-hidden rounded-md border border-amber-300 bg-amber-100 text-xs shadow-sm",
        dragMode && "z-20 ring-2 ring-amber-400"
      )}
      style={{ left: `${left}%`, width: `${width}%` }}
      title={`${label} · ${assignment.site.name} · ${formatTimeRange(preview.start, preview.end)}`}
    >
      <div
        className="w-2 shrink-0 cursor-ew-resize self-stretch bg-amber-300/80 hover:bg-amber-400"
        onPointerDown={(e) => startDrag("start", e)}
      />
      <div
        className="flex min-w-0 flex-1 cursor-grab flex-col justify-center px-2 active:cursor-grabbing"
        onPointerDown={(e) => startDrag("move", e)}
      >
        <span className="truncate font-medium text-amber-900">{label}</span>
        <span className="truncate text-[10px] text-amber-700">
          {assignment.site.name} · {formatTimeRange(preview.start, preview.end)}
        </span>
      </div>
      <div
        className="w-2 shrink-0 cursor-ew-resize self-stretch bg-amber-300/80 hover:bg-amber-400"
        onPointerDown={(e) => startDrag("end", e)}
      />
    </div>
  );
}
