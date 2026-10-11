"use client";

import { Switch } from "@/components/ui/switch";

export interface DayHours {
  closed: boolean;
  open: string;
  close: string;
}

export type WorkingHours = Record<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun", DayHours>;

export const DEFAULT_HOURS: WorkingHours = {
  mon: { closed: false, open: "09:00", close: "23:00" },
  tue: { closed: false, open: "09:00", close: "23:00" },
  wed: { closed: false, open: "09:00", close: "23:00" },
  thu: { closed: false, open: "09:00", close: "23:00" },
  fri: { closed: false, open: "09:00", close: "23:00" },
  sat: { closed: false, open: "09:00", close: "23:00" },
  sun: { closed: false, open: "09:00", close: "23:00" },
};

const DAY_LABELS: Record<keyof WorkingHours, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

interface WorkingHoursEditorProps {
  value: WorkingHours;
  onChange: (next: WorkingHours) => void;
}

export function WorkingHoursEditor({ value, onChange }: WorkingHoursEditorProps) {
  function updateDay(day: keyof WorkingHours, patch: Partial<DayHours>) {
    onChange({ ...value, [day]: { ...value[day], ...patch } });
  }

  return (
    <div className="flex flex-col gap-2">
      {(Object.keys(DAY_LABELS) as (keyof WorkingHours)[]).map((day) => {
        const hours = value[day];
        return (
          <div
            key={day}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5"
          >
            <span className="w-24 shrink-0 text-[12.5px] font-medium">{DAY_LABELS[day]}</span>

            <div className="flex items-center gap-2">
              <Switch checked={!hours.closed} onCheckedChange={(open) => updateDay(day, { closed: !open })} />
              <span className="text-[11.5px] text-muted-foreground">{hours.closed ? "Closed" : "Open"}</span>
            </div>

            {!hours.closed && (
              <div className="ms-auto flex items-center gap-2 text-[12px]">
                <input
                  type="time"
                  value={hours.open}
                  onChange={(e) => updateDay(day, { open: e.target.value })}
                  className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-foreground outline-none focus-visible:border-gold/50"
                />
                <span className="text-muted-foreground">to</span>
                <input
                  type="time"
                  value={hours.close}
                  onChange={(e) => updateDay(day, { close: e.target.value })}
                  className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-foreground outline-none focus-visible:border-gold/50"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
