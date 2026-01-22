// Detect if running in Tauri desktop environment
export const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

// Storage abstraction that works on both web and desktop
export async function loadTargetHour(): Promise<number> {
  const DEFAULT_HOUR = 18;

  if (isTauri) {
    try {
      const { load } = await import('@tauri-apps/plugin-store');
      const store = await load('settings.json', {
        defaults: { targetHour: DEFAULT_HOUR },
        autoSave: true,
      });
      const hour = await store.get<number>('targetHour');
      return hour ?? DEFAULT_HOUR;
    } catch {
      return DEFAULT_HOUR;
    }
  } else {
    // Web: use localStorage
    const stored = localStorage.getItem('targetHour');
    return stored ? parseInt(stored, 10) : DEFAULT_HOUR;
  }
}

export async function saveTargetHour(hour: number): Promise<void> {
  if (isTauri) {
    try {
      const { load } = await import('@tauri-apps/plugin-store');
      const store = await load('settings.json', {
        defaults: { targetHour: 18 },
        autoSave: true,
      });
      await store.set('targetHour', hour);
    } catch {
      // Fallback silently
    }
  } else {
    // Web: use localStorage
    localStorage.setItem('targetHour', hour.toString());
  }
}

export async function startWindowDrag(): Promise<void> {
  if (isTauri) {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().startDragging();
    } catch {
      // Not in Tauri, ignore
    }
  }
}
