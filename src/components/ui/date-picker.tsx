"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  parse,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { de } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  name: string;
  id?: string;
  value?: string;
  defaultValue?: string;
  min?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

function parseDateString(value: string): Date {
  return parse(value, "yyyy-MM-dd", new Date());
}

export function DatePicker({
  name,
  id,
  value,
  defaultValue,
  min,
  onChange,
  required,
  placeholder = "Datum wählen",
  className,
}: DatePickerProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const containerRef = useRef<HTMLDivElement>(null);

  const minDate = min ? startOfDay(parseDateString(min)) : undefined;
  const initialValue = value ?? defaultValue ?? "";

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Date | null>(
    initialValue ? parseDateString(initialValue) : null
  );
  const [viewMonth, setViewMonth] = useState<Date>(
    selected ?? (minDate ? minDate : new Date())
  );

  useEffect(() => {
    if (value) {
      const next = parseDateString(value);
      setSelected(next);
      setViewMonth(next);
    }
  }, [value]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  function isDisabled(day: Date) {
    if (!minDate) return false;
    return isBefore(startOfDay(day), minDate);
  }

  function selectDay(day: Date) {
    if (isDisabled(day)) return;
    setSelected(day);
    const formatted = format(day, "yyyy-MM-dd");
    onChange?.(formatted);
    setOpen(false);
  }

  const displayValue = selected
    ? format(selected, "EEEE, d. MMMM yyyy", { locale: de })
    : null;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <input type="hidden" name={name} value={selected ? format(selected, "yyyy-MM-dd") : ""} required={required} />

      <button
        id={inputId}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-3 rounded-lg border border-flx-border bg-flx-elevated px-3 text-left transition-colors",
          "hover:border-flx-blue/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flx-blue",
          open && "border-flx-blue ring-2 ring-flx-blue/30"
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={cn("truncate text-sm", displayValue ? "text-white" : "text-flx-muted-foreground")}>
          {displayValue ?? placeholder}
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-flx-blue/30 bg-flx-blue/10 text-flx-blue-light">
          <CalendarDays className="h-4 w-4" />
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Datum wählen"
          className="absolute left-0 right-0 z-50 mt-2 rounded-xl border border-flx-border bg-flx-card p-4 shadow-2xl shadow-black/40"
        >
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMonth((m) => subMonths(m, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-md text-flx-muted hover:bg-flx-elevated hover:text-white"
              aria-label="Vorheriger Monat"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-semibold text-white">
              {format(viewMonth, "MMMM yyyy", { locale: de })}
            </p>
            <button
              type="button"
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-md text-flx-muted hover:bg-flx-elevated hover:text-white"
              aria-label="Nächster Monat"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1">
            {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
              <div
                key={day}
                className="py-1 text-center text-[11px] font-medium uppercase tracking-wide text-flx-muted"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const disabled = isDisabled(day);
              const isSelected = selected ? isSameDay(day, selected) : false;
              const isToday = isSameDay(day, new Date());
              const outsideMonth = !isSameMonth(day, viewMonth);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectDay(day)}
                  className={cn(
                    "flex h-9 w-full items-center justify-center rounded-md text-sm transition-colors",
                    outsideMonth && "text-flx-muted-foreground/50",
                    !outsideMonth && !disabled && "text-slate-200 hover:bg-flx-elevated",
                    disabled && "cursor-not-allowed text-flx-muted-foreground/30",
                    isSelected && "bg-flx-blue font-semibold text-white hover:bg-flx-blue",
                    isToday && !isSelected && "ring-1 ring-inset ring-flx-blue/50"
                  )}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>

          {minDate && (
            <p className="mt-3 text-center text-[11px] text-flx-muted">
              Frühestens ab {format(minDate, "d. MMMM yyyy", { locale: de })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
