import { formatTargetTime } from '../lib/time';
import { isTauri } from '../lib/platform';

interface Props {
  targetHour: number;
  onTargetHourChange: (hour: number) => void;
  alwaysOnTop: boolean;
  onAlwaysOnTopChange: (alwaysOnTop: boolean) => void;
  onClose: () => void;
  onCheckForUpdates?: () => void;
  checkingForUpdates?: boolean;
  upToDate?: boolean;
  updateError?: string | null;
}

export function Settings({ targetHour, onTargetHourChange, alwaysOnTop, onAlwaysOnTopChange, onClose, onCheckForUpdates, checkingForUpdates, upToDate, updateError }: Props) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex flex-col w-full max-w-sm mx-auto p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Settings
        </h2>

        <label className="block mb-4">
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

      {isTauri && (
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={alwaysOnTop}
            onChange={(e) => onAlwaysOnTopChange(e.target.checked)}
            className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600
                       text-zinc-900 dark:text-zinc-100
                       focus:ring-2 focus:ring-zinc-500 focus:ring-offset-0
                       bg-white dark:bg-zinc-800"
          />
          <span className="text-base text-zinc-600 dark:text-zinc-400">
            Always on top
          </span>
        </label>
      )}

      {isTauri && onCheckForUpdates && (
          <button
            onClick={onCheckForUpdates}
            disabled={checkingForUpdates || upToDate}
            className={`mt-4 w-full py-2 text-sm transition-colors
                       ${upToDate
                         ? 'text-green-600 dark:text-green-400'
                         : updateError
                           ? 'text-red-500 dark:text-red-400'
                           : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'}
                       disabled:opacity-70`}
          >
            {checkingForUpdates ? 'Checking...' : upToDate ? 'You\'re up to date!' : updateError ? 'Could not check for updates' : 'Check for Updates'}
          </button>
        )}

        <div className="mt-4">
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
    </div>
  );
}
