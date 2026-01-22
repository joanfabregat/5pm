import { useState, useEffect } from 'react';
import { isTauri } from '../lib/platform';

interface UpdateInfo {
  version: string;
  body?: string;
}

export function useUpdater() {
  const [updateAvailable, setUpdateAvailable] = useState<UpdateInfo | null>(null);
  const [checking, setChecking] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upToDate, setUpToDate] = useState(false);

  const checkForUpdates = async (showUpToDate = false) => {
    if (!isTauri) return;

    setChecking(true);
    setError(null);
    setUpToDate(false);

    try {
      const { check } = await import('@tauri-apps/plugin-updater');
      const update = await check();

      if (update) {
        setUpdateAvailable({
          version: update.version,
          body: update.body ?? undefined
        });
      } else if (showUpToDate) {
        setUpToDate(true);
        setTimeout(() => setUpToDate(false), 3000);
      }
    } catch (err) {
      console.error('Failed to check for updates:', err);
      setError(err instanceof Error ? err.message : 'Failed to check for updates');
      if (showUpToDate) {
        setTimeout(() => setError(null), 3000);
      }
    } finally {
      setChecking(false);
    }
  };

  const installUpdate = async () => {
    if (!isTauri || !updateAvailable) return;

    setInstalling(true);
    setError(null);

    try {
      const { check } = await import('@tauri-apps/plugin-updater');
      const { relaunch } = await import('@tauri-apps/plugin-process');

      const update = await check();
      if (update) {
        await update.downloadAndInstall();
        await relaunch();
      }
    } catch (err) {
      console.error('Failed to install update:', err);
      setError(err instanceof Error ? err.message : 'Failed to install update');
      setInstalling(false);
    }
  };

  const dismissUpdate = () => {
    setUpdateAvailable(null);
  };

  // Check for updates on mount
  useEffect(() => {
    const timer = setTimeout(() => checkForUpdates(false), 3000); // Check 3s after launch
    return () => clearTimeout(timer);
  }, []);

  
  return {
    updateAvailable,
    checking,
    installing,
    error,
    upToDate,
    checkForUpdates,
    installUpdate,
    dismissUpdate
  };
}
