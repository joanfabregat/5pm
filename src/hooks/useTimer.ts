import { useState, useEffect } from 'react';
import { getTimeUntilTarget, formatTime, type TimeRemaining } from '../lib/time';

export function useTimer(targetHour: number) {
  const [time, setTime] = useState<TimeRemaining | null>(null);

  useEffect(() => {
    const update = () => setTime(getTimeUntilTarget(targetHour));

    update(); // Initial update
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [targetHour]);

  return {
    hours: time?.hours ?? 0,
    minutes: time?.minutes ?? 0,
    formatted: time ? formatTime(time.hours, time.minutes) : '--:--',
    isLoaded: time !== null,
  };
}
