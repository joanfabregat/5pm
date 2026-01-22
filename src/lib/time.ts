export interface TimeRemaining {
  hours: number;
  minutes: number;
}

export function getTimeUntilTarget(targetHour: number = 18): TimeRemaining {
  const now = new Date();
  const target = new Date(now);

  target.setHours(targetHour, 0, 0, 0);

  // If target time has passed, roll over to tomorrow
  if (now >= target) {
    target.setDate(target.getDate() + 1);
  }

  const diff = target.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { hours, minutes };
}

export function formatTime(hours: number, minutes: number): string {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function formatTargetTime(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:00 ${period}`;
}
