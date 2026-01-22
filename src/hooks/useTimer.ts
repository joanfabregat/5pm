import { useState, useEffect } from 'react';
import { getTimeUntilTarget, formatTime, type TimeRemaining } from '../lib/time';

export function useTimer(targetHour: number, targetMinute: number = 0) {
  const [time, setTime] = useState<TimeRemaining | null>(null);

  useEffect(() => {
    const update = () => setTime(getTimeUntilTarget(targetHour, targetMinute));

    update(); // Initial update
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [targetHour, targetMinute]);

  return {
    hours: time?.hours ?? 0,
    minutes: time?.minutes ?? 0,
    formatted: time ? formatTime(time.hours, time.minutes) : '--:--',
    isLoaded: time !== null,
  };
}
