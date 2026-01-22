import { useState, useEffect } from 'react';
import { CountdownClock } from './components/CountdownClock';
import { Settings } from './components/Settings';
import { isTauri, loadTargetHour, saveTargetHour, loadAlwaysOnTop, saveAlwaysOnTop, setWindowAlwaysOnTop, loadTransparent, saveTransparent, setWindowTransparent, startWindowDrag, restoreWindowState, setupWindowStateListener } from './lib/platform';

function App() {
  const [targetHour, setTargetHour] = useState(18);
  const [alwaysOnTop, setAlwaysOnTop] = useState(false);
  const [transparent, setTransparent] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadTargetHour().then(setTargetHour);
    loadAlwaysOnTop().then((value) => {
      setAlwaysOnTop(value);
      setWindowAlwaysOnTop(value);
    });
    loadTransparent().then((value) => {
      setTransparent(value);
      setWindowTransparent(value);
    });
    restoreWindowState();

    const cleanup = setupWindowStateListener();
    return cleanup;
  }, []);

  const handleTargetHourChange = async (hour: number) => {
    setTargetHour(hour);
    await saveTargetHour(hour);
  };

  const handleAlwaysOnTopChange = async (value: boolean) => {
    setAlwaysOnTop(value);
    await saveAlwaysOnTop(value);
    await setWindowAlwaysOnTop(value);
  };

  const handleTransparentChange = async (value: boolean) => {
    setTransparent(value);
    await saveTransparent(value);
    await setWindowTransparent(value);
  };

  return (
    <div className="window-container">
      {/* Drag region for window movement (desktop only) */}
      {isTauri && (
        <div
          className="absolute top-0 left-0 right-0 h-10 z-10 cursor-grab active:cursor-grabbing"
          onMouseDown={() => startWindowDrag()}
        />
      )}
      {showSettings ? (
        <Settings
          targetHour={targetHour}
          onTargetHourChange={handleTargetHourChange}
          alwaysOnTop={alwaysOnTop}
          onAlwaysOnTopChange={handleAlwaysOnTopChange}
          transparent={transparent}
          onTransparentChange={handleTransparentChange}
          onClose={() => setShowSettings(false)}
        />
      ) : (
        <div className="flex flex-col h-full">
          <CountdownClock targetHour={targetHour} />
          <button
            onClick={() => setShowSettings(true)}
            className="absolute bottom-3 right-3 p-2 rounded-lg
                       text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300
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
