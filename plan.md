# 6pm Desktop — macOS Menu Bar Timer (Tauri)

A cross-platform desktop app that counts down to a configurable target time (default: 6:00 PM), with system tray integration.

## Overview

This app replicates the functionality of the [6pm web app](../6pm) as a desktop application using Tauri, with added configurability. Built with Rust + TypeScript/React, it can reuse much of the existing web app code.

### Core Concept

The timer continuously displays the remaining time until the target hour (e.g., 6:00 PM). Once the target time passes, it automatically rolls over to count down to the same time the next day.

---

## Features

### Must Have (MVP)

- [ ] **System tray icon** — Clock icon in the system tray/menu bar
- [ ] **Tray popup window** — Click tray to show timer panel positioned below menu bar
- [ ] **Automatic rollover** — When target time passes, count to next day
- [ ] **Settings panel** — Configure the target hour (1-24)
- [ ] **Dark/light mode support** — Follows system appearance
- [ ] **Hide from dock** — Menu bar only presence

### Nice to Have (Post-MVP)

- [ ] Dynamic tray icon showing time (requires icon generation)
- [ ] Launch at login option
- [ ] Optional notification when timer reaches zero
- [ ] Keyboard shortcut to show/hide panel
- [ ] Multiple timer presets
- [ ] Windows/Linux support

---

## Technical Specification

### Requirements

- **Tauri:** v2.x
- **Rust:** 1.70+
- **Node.js:** 18+
- **Frontend:** React 19 + TypeScript (reuse from web app)
- **Styling:** Tailwind CSS (reuse from web app)

### Tauri Plugins Required

```toml
# src-tauri/Cargo.toml
[dependencies]
tauri-plugin-positioner = "2"    # Position window near tray
tauri-plugin-store = "2"         # Persist settings
tauri-plugin-autostart = "2"     # Launch at login (optional)
tauri-plugin-notification = "2"  # Notifications (optional)
```

### Project Structure

```
6pm-desktop/
├── src/                          # Frontend (React/TypeScript)
│   ├── components/
│   │   ├── CountdownClock.tsx    # Main timer display (from web app)
│   │   └── Settings.tsx          # Settings panel
│   ├── hooks/
│   │   └── useTimer.ts           # Timer logic hook
│   ├── lib/
│   │   └── time.ts               # Time calculation utilities
│   ├── App.tsx                   # Main app component
│   ├── main.tsx                  # Entry point
│   └── styles.css                # Tailwind + custom styles
├── src-tauri/                    # Backend (Rust)
│   ├── src/
│   │   ├── main.rs               # App entry, tray setup
│   │   ├── tray.rs               # System tray configuration
│   │   └── lib.rs                # Tauri commands
│   ├── Cargo.toml
│   ├── tauri.conf.json           # Tauri configuration
│   └── icons/                    # App & tray icons
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
├── plan.md
└── README.md
```

---

## Menu Bar Approach: Tray + Positioned Window

Since Tauri doesn't have native `MenuBarExtra` like SwiftUI, we use the **tray window pattern**:

```
┌─────────────────────────────────────────────────────┐
│ macOS Menu Bar                        [🕐] [other]  │  ← Tray icon (clock)
└─────────────────────────────────────────────────────┘
                                          │
                                          ▼
                               ┌─────────────────────┐
                               │                     │
                               │      05:47          │  ← Positioned window
                               │   until 6:00 PM     │
                               │                     │
                               │  ─────────────────  │
                               │  ⚙️ Settings        │
                               │  Quit               │
                               └─────────────────────┘
```

### How It Works

1. **Tray icon** — Static clock icon in system tray
2. **Click handler** — On tray click, toggle a small borderless window
3. **Positioner plugin** — Anchors window directly below tray icon
4. **Focus handling** — Window hides when it loses focus

### Limitations vs Native

| Feature | Native SwiftUI | Tauri |
|---------|---------------|-------|
| Live text in menu bar | ✅ `05:47` in bar | ❌ Icon only |
| Native popover | ✅ Built-in | ⚠️ Positioned window |
| Vibrancy/blur | ✅ Automatic | ⚠️ CSS approximation |
| Bundle size | ~3 MB | ~12-15 MB |
| Code reuse | ❌ New code | ✅ Reuse web app |

---

## Timer Logic

### Core Algorithm (TypeScript)

```typescript
// lib/time.ts — Can be copied from web app

interface TimeRemaining {
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
```

### Timer Hook

```typescript
// hooks/useTimer.ts
import { useState, useEffect } from 'react';
import { getTimeUntilTarget, formatTime } from '../lib/time';

export function useTimer(targetHour: number) {
  const [time, setTime] = useState({ hours: 0, minutes: 0 });

  useEffect(() => {
    const update = () => setTime(getTimeUntilTarget(targetHour));

    update(); // Initial update
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [targetHour]);

  return {
    hours: time.hours,
    minutes: time.minutes,
    formatted: formatTime(time.hours, time.minutes),
  };
}
```

---

## UI Components

### 1. Main Timer Panel

```tsx
// components/CountdownClock.tsx
import { useTimer } from '../hooks/useTimer';
import { formatTargetTime } from '../lib/time';

interface Props {
  targetHour: number;
  onSettingsClick: () => void;
  onQuit: () => void;
}

export function CountdownClock({ targetHour, onSettingsClick, onQuit }: Props) {
  const { formatted } = useTimer(targetHour);

  return (
    <div className="flex flex-col items-center p-6 select-none">
      {/* Large countdown display */}
      <div className="text-5xl font-bold tabular-nums tracking-tight">
        {formatted}
      </div>

      {/* Subtitle */}
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
        until {formatTargetTime(targetHour)}
      </p>

      {/* Divider */}
      <div className="w-full h-px bg-zinc-200 dark:bg-zinc-700 my-4" />

      {/* Menu items */}
      <div className="w-full space-y-1">
        <button
          onClick={onSettingsClick}
          className="w-full text-left px-2 py-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          ⚙️ Settings
        </button>
        <button
          onClick={onQuit}
          className="w-full text-left px-2 py-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          Quit 6pm
        </button>
      </div>
    </div>
  );
}
```

### 2. Settings Panel

```tsx
// components/Settings.tsx
interface Props {
  targetHour: number;
  onTargetHourChange: (hour: number) => void;
  onClose: () => void;
}

export function Settings({ targetHour, onTargetHourChange, onClose }: Props) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Settings</h2>

      <label className="block mb-4">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          Target Time
        </span>
        <select
          value={targetHour}
          onChange={(e) => onTargetHourChange(Number(e.target.value))}
          className="mt-1 block w-full rounded border border-zinc-300 dark:border-zinc-600
                     bg-white dark:bg-zinc-800 px-3 py-2"
        >
          {hours.map((h) => (
            <option key={h} value={h}>
              {formatTargetTime(h)}
            </option>
          ))}
        </select>
      </label>

      <button
        onClick={onClose}
        className="w-full py-2 bg-zinc-900 dark:bg-zinc-100
                   text-white dark:text-zinc-900 rounded font-medium"
      >
        Done
      </button>
    </div>
  );
}
```

---

## Rust Backend

### Main Entry & Tray Setup

```rust
// src-tauri/src/main.rs
use tauri::{
    Manager,
    SystemTray,
    SystemTrayEvent,
    WindowEvent,
};
use tauri_plugin_positioner::{Position, WindowExt};

fn main() {
    let tray = SystemTray::new();

    tauri::Builder::default()
        .plugin(tauri_plugin_positioner::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .system_tray(tray)
        .on_system_tray_event(|app, event| {
            tauri_plugin_positioner::on_tray_event(app, &event);

            match event {
                SystemTrayEvent::LeftClick { .. } => {
                    let window = app.get_window("main").unwrap();

                    if window.is_visible().unwrap() {
                        window.hide().unwrap();
                    } else {
                        window.move_window(Position::TrayCenter).unwrap();
                        window.show().unwrap();
                        window.set_focus().unwrap();
                    }
                }
                _ => {}
            }
        })
        .on_window_event(|event| {
            // Hide window when it loses focus
            if let WindowEvent::Focused(false) = event.event() {
                event.window().hide().unwrap();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Tauri Configuration

```json
// src-tauri/tauri.conf.json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "6pm",
  "identifier": "com.6pm.desktop",
  "version": "0.1.0",
  "build": {
    "beforeBuildCommand": "npm run build",
    "beforeDevCommand": "npm run dev",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "label": "main",
        "title": "6pm",
        "width": 280,
        "height": 200,
        "resizable": false,
        "decorations": false,
        "transparent": true,
        "visible": false,
        "skipTaskbar": true,
        "alwaysOnTop": true
      }
    ],
    "trayIcon": {
      "iconPath": "icons/tray-icon.png",
      "iconAsTemplate": true
    },
    "macOSPrivateApi": true
  },
  "bundle": {
    "active": true,
    "targets": ["dmg", "app"],
    "icon": ["icons/icon.icns"],
    "macOS": {
      "minimumSystemVersion": "10.15"
    }
  }
}
```

---

## State & Persistence

### Using tauri-plugin-store

```typescript
// lib/store.ts
import { Store } from '@tauri-apps/plugin-store';

const store = new Store('settings.json');

export async function getTargetHour(): Promise<number> {
  return (await store.get<number>('targetHour')) ?? 18;
}

export async function setTargetHour(hour: number): Promise<void> {
  await store.set('targetHour', hour);
  await store.save();
}
```

---

## Visual Design

### Window Styling

```css
/* styles.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Transparent background for positioned window */
  background: transparent;
}

body {
  /* Rounded corners with shadow */
  @apply bg-white dark:bg-zinc-900 rounded-xl shadow-xl;
  @apply border border-zinc-200 dark:border-zinc-700;

  /* Prevent text selection for native feel */
  user-select: none;
  -webkit-user-select: none;
}

/* macOS vibrancy approximation */
@supports (backdrop-filter: blur(20px)) {
  body {
    @apply bg-white/80 dark:bg-zinc-900/80;
    backdrop-filter: blur(20px);
  }
}
```

### Typography

- **Timer:** 48px, bold, tabular-nums (monospaced digits)
- **Subtitle:** 14px, secondary color
- **Font:** System font stack (SF Pro on macOS)

### Tray Icon

- Use a simple clock icon (template image for macOS)
- 22x22px for standard, 44x44px for Retina
- Monochrome for template image support

---

## Build & Development

### Setup

```bash
# Install dependencies
npm install

# Install Tauri CLI
cargo install tauri-cli

# Run in development
cargo tauri dev

# Build for production
cargo tauri build
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "tauri": "tauri"
  }
}
```

### Distribution

1. `cargo tauri build` creates `.app` and `.dmg` in `src-tauri/target/release/bundle/`
2. Sign with Apple Developer certificate (optional but recommended)
3. Notarize for Gatekeeper (required for distribution outside App Store)

---

## Implementation Order

### Phase 1: Project Setup

1. Initialize Tauri project: `npm create tauri-app@latest`
2. Add required plugins to Cargo.toml
3. Configure tauri.conf.json (window, tray, bundle)
4. Set up Tailwind CSS

### Phase 2: Core Timer (MVP)

1. Copy/adapt timer logic from web app (`lib/time.ts`)
2. Create `useTimer` hook
3. Build `CountdownClock` component
4. Set up system tray with click handler
5. Implement positioned window toggle
6. Add focus blur to hide window

### Phase 3: Settings & Persistence

1. Add Settings component
2. Integrate tauri-plugin-store
3. Load/save target hour preference
4. Toggle between timer and settings views

### Phase 4: Polish

1. Create tray icon (template image)
2. Add app icon
3. Style window with rounded corners, shadow, vibrancy
4. Test dark/light mode
5. Add quit functionality

### Phase 5: Enhancements

1. Launch at login (tauri-plugin-autostart)
2. Notifications (tauri-plugin-notification)
3. Keyboard shortcuts

---

## Reference: Web App Behavior

The original web app at `../6pm`:

- **Target time:** Fixed at 6:00 PM (18:00)
- **Display format:** `HH:MM` (zero-padded)
- **Update frequency:** Every 1 second
- **Rollover:** Automatic when current time ≥ 6:00 PM
- **Subtitle:** "until 6:00 PM"
- **Styling:** Large bold text, Space Grotesk font, zinc colors
- **Features NOT included:** Notifications, persistence, settings

The desktop version adds:
- Configurable target hour
- Persistent settings
- System tray integration
- Native desktop presence

---

## Code Reuse from Web App

These files can be directly adapted from `../6pm`:

| Web App File | Desktop Location | Changes Needed |
|--------------|------------------|----------------|
| `src/app/components/CountdownClock.tsx` | `src/components/CountdownClock.tsx` | Add settings/quit buttons, accept targetHour prop |
| Timer logic (inline) | `src/lib/time.ts` | Extract to module, add targetHour param |
| `src/app/globals.css` | `src/styles.css` | Add transparency, vibrancy styles |
| `tailwind.config.ts` | `tailwind.config.js` | Minimal changes |