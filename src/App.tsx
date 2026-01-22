import { useState, useEffect } from 'react';
import { CountdownClock } from './components/CountdownClock';
import { Settings } from './components/Settings';
import { isTauri, loadTargetHour, saveTargetHour, loadTargetMinute, saveTargetMinute, loadAlwaysOnTop, saveAlwaysOnTop, setWindowAlwaysOnTop, setWindowTransparent, startWindowDrag, restoreWindowState, setupWindowStateListener } from './lib/platform';
import { useUpdater } from './hooks/useUpdater';

function App() {
  const [targetHour, setTargetHour] = useState(18);
  const [targetMinute, setTargetMinute] = useState(0);
  const [alwaysOnTop, setAlwaysOnTop] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { updateAvailable, checking, installing, upToDate, error, checkForUpdates, installUpdate, dismissUpdate } = useUpdater();

  useEffect(() => {
    loadTargetHour().then(setTargetHour);
    loadTargetMinute().then(setTargetMinute);
    loadAlwaysOnTop().then((value) => {
      setAlwaysOnTop(value);
      setWindowAlwaysOnTop(value);
    });
    setWindowTransparent();
    restoreWindowState();

    const cleanup = setupWindowStateListener();
    return cleanup;
  }, []);

  const handleTargetTimeChange = async (hour: number, minute: number) => {
    setTargetHour(hour);
    setTargetMinute(minute);
    await saveTargetHour(hour);
    await saveTargetMinute(minute);
  };

  const handleAlwaysOnTopChange = async (value: boolean) => {
    setAlwaysOnTop(value);
    await saveAlwaysOnTop(value);
    await setWindowAlwaysOnTop(value);
  };

  return (
    <div className="window-container">
      {/* Update banner */}
      {updateAvailable && (
        <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-xs pl-20 pr-3 py-1.5 flex items-center justify-between z-20">
          <span>v{updateAvailable.version} available</span>
          <div className="flex gap-2">
            <button
              onClick={installUpdate}
              disabled={installing}
              className="px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded text-xs disabled:opacity-50"
            >
              {installing ? 'Installing...' : 'Update'}
            </button>
            <button
              onClick={dismissUpdate}
              className="px-2 py-0.5 hover:bg-white/20 rounded text-xs"
            >
              Later
            </button>
          </div>
        </div>
      )}
      {/* Drag region for window movement (desktop only) */}
      {isTauri && (
        <div
          className="absolute top-0 left-0 right-0 h-10 z-10"
          onMouseDown={() => startWindowDrag()}
        />
      )}
      {showSettings ? (
        <Settings
          targetHour={targetHour}
          targetMinute={targetMinute}
          onTargetTimeChange={handleTargetTimeChange}
          alwaysOnTop={alwaysOnTop}
          onAlwaysOnTopChange={handleAlwaysOnTopChange}
          onClose={() => setShowSettings(false)}
          onCheckForUpdates={() => checkForUpdates(true)}
          checkingForUpdates={checking}
          upToDate={upToDate}
          updateError={error}
        />
      ) : (
        <div className="flex flex-col h-full">
          <CountdownClock targetHour={targetHour} targetMinute={targetMinute} />
          <button
            onClick={() => setShowSettings(true)}
            className="absolute bottom-3 right-3 p-2 rounded-lg
                       text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200
                       hover:bg-zinc-100 dark:hover:bg-zinc-800
                       transition-colors"
            title="Settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
