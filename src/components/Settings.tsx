import { formatTargetTime } from '../lib/time';

interface Props {
  targetHour: number;
  onTargetHourChange: (hour: number) => void;
  onClose: () => void;
}

export function Settings({ targetHour, onTargetHourChange, onClose }: Props) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex flex-col h-full p-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
        Settings
      </h2>

      <label className="block mb-6">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          Target Time
        </span>
        <select
          value={targetHour}
          onChange={(e) => onTargetHourChange(Number(e.target.value))}
          className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-600
                     bg-white dark:bg-zinc-800 px-3 py-2
                     text-zinc-900 dark:text-zinc-100
                     focus:outline-none focus:ring-2 focus:ring-zinc-500"
        >
          {hours.map((h) => (
            <option key={h} value={h}>
              {formatTargetTime(h)}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-auto">
        <button
          onClick={onClose}
          className="w-full py-2 bg-zinc-900 dark:bg-zinc-100
                     text-white dark:text-zinc-900 rounded-lg font-medium
                     hover:bg-zinc-800 dark:hover:bg-zinc-200
                     transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
