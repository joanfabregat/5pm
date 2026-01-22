# 6pm

A minimalist countdown timer that shows the time remaining until a target hour. Available as a native macOS desktop app and a web app.

## Features

- **Countdown Display** - Large, readable timer showing hours and minutes until your target time
- **Configurable Target** - Set any hour (0-23) as your countdown target
- **Desktop Features** (macOS)
  - Always-on-top mode to keep the timer visible
  - Transparent window with backdrop blur
  - Remembers window position and size across sessions
  - Draggable window from anywhere
- **Cross-Platform** - Runs as a native desktop app or in any browser

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Tailwind CSS 4 |
| Build | Vite 7 |
| Desktop | Tauri 2 (Rust) |
| Font | Space Grotesk |
| Deployment | Cloudflare Pages |

## Project Structure

```
6pm/
├── src/                      # React frontend
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # Entry point
│   ├── styles.css            # Global styles + Tailwind
│   ├── components/
│   │   ├── CountdownClock.tsx   # Timer display
│   │   └── Settings.tsx         # Settings panel
│   ├── hooks/
│   │   └── useTimer.ts       # Timer hook
│   └── lib/
│       ├── platform.ts       # Tauri/web abstraction layer
│       └── time.ts           # Time calculations
├── src-tauri/                # Tauri/Rust backend
│   ├── src/
│   │   ├── main.rs           # Desktop entry point
│   │   └── lib.rs            # App builder
│   ├── tauri.conf.json       # Tauri config
│   └── Cargo.toml            # Rust dependencies
├── public/                   # Static assets
│   └── fonts/
│       └── SpaceGrotesk.woff2
└── dist/                     # Build output
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start web development server (port 1420) |
| `npm run dev:desktop` | Start Tauri desktop app in dev mode |
| `npm run build` | Build web app for production |
| `npm run build:desktop` | Build native macOS app (.app, .dmg) |
| `npm run preview` | Preview production web build |

## Architecture

### Platform Abstraction

The app uses a platform abstraction layer (`src/lib/platform.ts`) to handle differences between web and desktop:

- **Desktop (Tauri)**: Settings persist via `tauri-plugin-store` to `settings.json`. Window state (position, size, always-on-top, transparency) is saved and restored.
- **Web**: Settings persist to `localStorage`. Desktop-only features are gracefully disabled.

### Timer Logic

The countdown logic (`src/lib/time.ts`) calculates time remaining until the target hour. If the target time has passed for today, it automatically rolls over to tomorrow.

### Desktop Window Management

- Window position and size are saved on move/resize (debounced)
- On startup, position is restored only if at least 100px would be visible (handles monitor changes)
- Transparent windows use macOS private APIs for backdrop blur

## Development

### Prerequisites

- Node.js 24+
- Rust (for desktop builds)
- Xcode Command Line Tools (macOS)

### Setup

```bash
# Install dependencies
npm install

# Start web dev server
npm run dev

# Or start desktop app
npm run dev:desktop
```

### Building

```bash
# Web build (outputs to dist/)
npm run build

# Desktop build (outputs to src-tauri/target/release/bundle/)
npm run build:desktop
```

## IDE Setup

Recommended: [VS Code](https://code.visualstudio.com/) with:
- [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Deployment

The web version auto-deploys to Cloudflare Pages via GitHub Actions when a version tag is pushed.

## License

[MIT](LICENSE)
