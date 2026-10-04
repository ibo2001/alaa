"use client";

import { useEffect } from "react";
import { markStation } from "@/lib/device";
import type { StationNumber } from "@/lib/journey";

/** Opening a station's card counts the station as read (unless it was already found by photo). */
export function JourneyMark({ station }: { station: StationNumber }) {
  useEffect(() => {
    markStation(station, "read").catch(() => {});
  }, [station]);
  return null;
}
