"use client";

import { useEffect, useRef, useState } from "react";
import { FlavorProfile } from "@/lib/types";

interface FlavorMeterProps {
  flavor: FlavorProfile;
  compact?: boolean;
}

const flavorLabels: Record<keyof FlavorProfile, string> = {
  sweetness: "甜度",
  spiciness: "辛辣度",
  aroma: "香气",
  bitterness: "苦度",
  richness: "浓郁度",
};

export default function FlavorMeter({ flavor, compact = false }: FlavorMeterProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const entries = Object.entries(flavor) as [keyof FlavorProfile, number][];

  return (
    <div ref={ref} className="space-y-1.5">
      {entries.map(([key, value]) => {
        const pct = (value / 5) * 100;
        // Color based on flavor type
        const barColors: Record<string, string> = {
          sweetness: "bg-amber-400",
          spiciness: "bg-red-400",
          aroma: "bg-purple-400",
          bitterness: "bg-emerald-600",
          richness: "bg-tea-500",
        };

        return (
          <div key={key} className={compact ? "flex items-center gap-2" : "flex items-center gap-3"}>
            <span className={`text-foreground/60 ${compact ? "text-xs w-10" : "text-sm w-14"} shrink-0`}>
              {flavorLabels[key]}
            </span>
            <div className={`flex-1 rounded-full bg-tea-200 dark:bg-tea-800 ${compact ? "h-1.5" : "h-2"}`}>
              <div
                className={`flavor-bar h-full rounded-full ${barColors[key] || "bg-tea-500"}`}
                style={{ width: visible ? `${pct}%` : "0%" }}
              />
            </div>
            {!compact && (
              <span className="text-xs text-foreground/40 w-4 text-right">
                {"★".repeat(value)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
