import { useState, useEffect, useCallback } from 'react';
import { formatTargetTime } from '../lib/time';
import { isTauri } from '../lib/platform';

interface Props {
  targetHour: number;
  targetMinute: number;
  onSave: (hour: number, minute: number, alwaysOnTop: boolean) => void;
  alwaysOnTop: boolean;
  onClose: () => void;
  onCheckForUpdates?: () => void;
  checkingForUpdates?: boolean;
  upToDate?: boolean;
  updateError?: string | null;
}

// Generate 30-minute increment options (48 total: 0:00, 0:30, 1:00, 1:30, ... 23:30)
const timeOptions = Array.from({ length: 48 }, (_, i) => ({
  hour: Math.floor(i / 2),
  minute: (i % 2) * 30,
}));

export function Settings({ targetHour, targetMinute, onSave, alwaysOnTop, onClose, onCheckForUpdates, checkingForUpdates, upToDate, updateError }: Props) {
  const [localHour, setLocalHour] = useState(targetHour);
  const [localMinute, setLocalMinute] = useState(targetMinute);
  const [localAlwaysOnTop, setLocalAlwaysOnTop] = useState(alwaysOnTop);

  const currentValue = `${localHour}:${localMinute}`;

  const handleSave = useCallback(() => {
    onSave(localHour, localMinute, localAlwaysOnTop);
    onClose();
  }, [localHour, localMinute, localAlwaysOnTop, onSave, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleSave]);

  return (
    <div className="flex flex-col h-full">
      {/* Fixed header with title next to window controls */}
      <div className="flex-shrink-0 relative">
        <div className={`flex items-center justify-center ${isTauri ? 'h-10' : 'h-10 pt-2'}`}>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Settings
          </h2>
        </div>
        {/* Gradient fade - only on desktop */}
        {isTauri && (
          <div className="absolute bottom-0 left-0 right-0 h-6 -mb-6 bg-gradient-to-b from-black/[0.03] dark:from-white/[0.03] to-transparent pointer-events-none" />
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col w-full max-w-sm mx-auto px-6 pt-4 pb-4">
          <label className="block mb-4">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Target Time
            </span>
            <select
              value={currentValue}
              onChange={(e) => {
                const [hour, minute] = e.target.value.split(':').map(Number);
                setLocalHour(hour);
                setLocalMinute(minute);
              }}
              className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-600
                         bg-white dark:bg-zinc-800 px-3 py-2
                         text-zinc-900 dark:text-zinc-100
                         focus:outline-none focus:ring-2 focus:ring-zinc-500"
            >
              {timeOptions.map(({ hour, minute }) => (
                <option key={`${hour}:${minute}`} value={`${hour}:${minute}`}>
                  {formatTargetTime(hour, minute)}
                </option>
              ))}
            </select>
          </label>

          {isTauri && (
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={localAlwaysOnTop}
                onChange={(e) => setLocalAlwaysOnTop(e.target.checked)}
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

          <button
            onClick={handleSave}
            className="w-full py-2 bg-zinc-900 dark:bg-zinc-100
                       text-white dark:text-zinc-900 rounded-lg font-medium
                       hover:bg-zinc-800 dark:hover:bg-zinc-200
                       transition-colors"
          >
            Done
          </button>

          {isTauri && onCheckForUpdates && (
            <button
              onClick={onCheckForUpdates}
              disabled={checkingForUpdates || upToDate}
              className={`mt-3 w-full py-2 text-sm transition-colors
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
        </div>
      </div>
    </div>
  );
}
