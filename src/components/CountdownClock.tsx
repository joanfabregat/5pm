import { useTimer } from '../hooks/useTimer';
import { formatTargetTime } from '../lib/time';

interface Props {
  targetHour: number;
}

export function CountdownClock({ targetHour }: Props) {
  const { formatted } = useTimer(targetHour);

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-8">
      {/* Large countdown display */}
      <div
        className="font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100 leading-none"
        style={{ fontSize: 'clamp(4rem, min(45vh, 32vw), 14rem)' }}
      >
        {formatted}
      </div>

      {/* Subtitle */}
      <p
        className="text-zinc-500 dark:text-zinc-400 mt-3"
        style={{ fontSize: 'clamp(1rem, min(10vh, 6.5vw), 2.5rem)' }}
      >
        until {formatTargetTime(targetHour)}
      </p>
    </div>
  );
}
