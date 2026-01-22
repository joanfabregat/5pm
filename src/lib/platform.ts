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

export async function loadAlwaysOnTop(): Promise<boolean> {
  if (isTauri) {
    try {
      const { load } = await import('@tauri-apps/plugin-store');
      const store = await load('settings.json', {
        defaults: { alwaysOnTop: false },
        autoSave: true,
      });
      const value = await store.get<boolean>('alwaysOnTop');
      return value ?? false;
    } catch {
      return false;
    }
  }
  return false;
}

export async function saveAlwaysOnTop(alwaysOnTop: boolean): Promise<void> {
  if (isTauri) {
    try {
      const { load } = await import('@tauri-apps/plugin-store');
      const store = await load('settings.json', {
        defaults: { alwaysOnTop: false },
        autoSave: true,
      });
      await store.set('alwaysOnTop', alwaysOnTop);
    } catch {
      // Fallback silently
    }
  }
}

export async function setWindowAlwaysOnTop(alwaysOnTop: boolean): Promise<void> {
  if (isTauri) {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().setAlwaysOnTop(alwaysOnTop);
    } catch {
      // Not in Tauri, ignore
    }
  }
}

export async function loadTransparent(): Promise<boolean> {
  if (isTauri) {
    try {
      const { load } = await import('@tauri-apps/plugin-store');
      const store = await load('settings.json', {
        defaults: { transparent: true },
        autoSave: true,
      });
      const value = await store.get<boolean>('transparent');
      return value ?? true;
    } catch {
      return true;
    }
  }
  return false;
}

export async function saveTransparent(transparent: boolean): Promise<void> {
  if (isTauri) {
    try {
      const { load } = await import('@tauri-apps/plugin-store');
      const store = await load('settings.json', {
        defaults: { transparent: true },
        autoSave: true,
      });
      await store.set('transparent', transparent);
    } catch {
      // Fallback silently
    }
  }
}

export async function setWindowTransparent(transparent: boolean): Promise<void> {
  if (transparent) {
    document.documentElement.setAttribute('data-transparent', '');
  } else {
    document.documentElement.removeAttribute('data-transparent');
  }

  if (isTauri) {
    try {
      const { getCurrentWindow, Effect, EffectState } = await import('@tauri-apps/api/window');
      const win = getCurrentWindow();
      if (transparent) {
        await win.setEffects({
          effects: [Effect.Popover],
          state: EffectState.Active,
        });
      } else {
        await win.setEffects({ effects: [] });
      }
    } catch {
      // Ignore errors
    }
  }
}

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function saveWindowState(): Promise<void> {
  if (isTauri) {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const { load } = await import('@tauri-apps/plugin-store');

      const win = getCurrentWindow();
      const position = await win.outerPosition();
      const size = await win.outerSize();
      const store = await load('settings.json', {
        defaults: {},
        autoSave: true,
      });
      await store.set('windowState', {
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
      });
    } catch {
      // Ignore errors
    }
  }
}

export async function restoreWindowState(): Promise<void> {
  if (isTauri) {
    try {
      const { getCurrentWindow, availableMonitors, PhysicalPosition, PhysicalSize } = await import('@tauri-apps/api/window');
      const { load } = await import('@tauri-apps/plugin-store');

      const store = await load('settings.json', {
        defaults: {},
        autoSave: true,
      });
      const state = await store.get<WindowState>('windowState');

      if (!state) return;

      const win = getCurrentWindow();
      const monitors = await availableMonitors();

      if (monitors.length === 0) return;

      // Check if the saved position is visible on any monitor
      // We want at least 100px of the window to be visible
      const minVisible = 100;
      const isVisible = monitors.some((monitor) => {
        const mx = monitor.position.x;
        const my = monitor.position.y;
        const mw = monitor.size.width;
        const mh = monitor.size.height;

        // Check if window overlaps with this monitor by at least minVisible pixels
        const overlapX = Math.min(state.x + state.width, mx + mw) - Math.max(state.x, mx);
        const overlapY = Math.min(state.y + state.height, my + mh) - Math.max(state.y, my);

        return overlapX >= minVisible && overlapY >= minVisible;
      });

      // Restore size first, then position
      if (state.width && state.height) {
        await win.setSize(new PhysicalSize(state.width, state.height));
      }

      if (isVisible) {
        await win.setPosition(new PhysicalPosition(state.x, state.y));
      }
      // If not visible, let the window use its default centered position
    } catch {
      // Ignore errors
    }
  }
}

export function setupWindowStateListener(): () => void {
  if (!isTauri) return () => {};

  let saveTimeout: ReturnType<typeof setTimeout> | null = null;

  const handleChange = () => {
    // Debounce saves to avoid excessive writes while dragging/resizing
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveWindowState();
    }, 500);
  };

  // Listen for window move and resize events
  let unlistenMove: (() => void) | null = null;
  let unlistenResize: (() => void) | null = null;

  import('@tauri-apps/api/window').then(({ getCurrentWindow }) => {
    const win = getCurrentWindow();
    win.onMoved(() => handleChange()).then((fn) => {
      unlistenMove = fn;
    });
    win.onResized(() => handleChange()).then((fn) => {
      unlistenResize = fn;
    });
  });

  return () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    if (unlistenMove) unlistenMove();
    if (unlistenResize) unlistenResize();
  };
}
