"use client";

import { useEffect, useState } from "react";

function getTimeUntil6PM(): { hours: number; minutes: number } {
  const now = new Date();
  const sixPM = new Date(now);
  sixPM.setHours(18, 0, 0, 0);

  // If it's already past 6pm, show countdown to next day's 6pm
  if (now >= sixPM) {
    sixPM.setDate(sixPM.getDate() + 1);
  }

  const diff = sixPM.getTime() - now.getTime();

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { hours, minutes };
}

export default function CountdownClock() {
  const [time, setTime] = useState<{ hours: number; minutes: number } | null>(null);

  useEffect(() => {
    setTime(getTimeUntil6PM());

    const interval = setInterval(() => {
      setTime(getTimeUntil6PM());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!time) {
    return (
      <div className="flex flex-col items-center justify-center gap-8">
        <div className="text-[12rem] font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100 leading-none">
          --:--
        </div>
      </div>
    );
  }

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="text-[12rem] font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100 leading-none">
        {pad(time.hours)}:{pad(time.minutes)}
      </div>
      <p className="text-2xl text-zinc-600 dark:text-zinc-400 mt-4">
        until 6:00 PM
      </p>
    </div>
  );
}
