"use client";

import { useEffect, useState } from "react";
import { getStage } from "@/lib/device";

/** Shows its text only to users who chose "I'm new to the Quran". */
export function StageNote({ text }: { text: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    getStage()
      .then((s) => setShow(s === "new"))
      .catch(() => {});
  }, []);

  if (!show) return null;
  return <p className="mt-3 text-center text-sm text-sama/80">{text}</p>;
}
