# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**20-20-20 护眼助手 (Eye Care Timer)** — Implementing the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds.

Available as Browser (index.html), Desktop/Windows (Electron), and iOS app (Expo).

## How to Use

- **Browser:** Open `index.html` directly — no server needed
- **Desktop app:** `npm start` (requires `npm install` first)
- **iOS app:** `cd eye20-ios && npx expo start` → scan QR code with Expo Go on iPhone
- **Packaging (desktop):** `npm run dist` builds a portable `.exe` via electron-builder

## File Structure

```
index.html        — Frontend (self-contained, all CSS/JS inline, ~750 lines)
main.js           — Electron main process (window, system tray)
preload.js        — Electron preload script (context bridge)
package.json      — Node.js config (electron + electron-builder)
icon.png          — App icon (32×32 green eye)
eye20-ios/        — iOS app (React Native + Expo)
  App.tsx         - Root component
  src/useTimer.ts - Core timer hook (state machine + deadline logic)
  src/storage.ts  - AsyncStorage persistence
  src/notifications.ts - Local notifications (iOS system sound)
  src/components/ - UI components
CLAUDE.md         — This file
```

### Electron (`main.js`)
- Fixed window 440×660, no menu bar, non-resizable
- Close button hides to system tray (doesn't quit); double-click tray to show
- Right-click tray menu: Show / Quit
- Single-instance lock via `app.requestSingleInstanceLock()`
- `icon.png` is optional — Electron uses default if missing

## Core Timer Architecture (in `index.html`)

Single self-contained HTML file with all CSS and JS inline (~750 lines):

### State Machine (3 states)
- **IDLE** — Timer stopped, ready to start
- **WORK** — 20-min countdown (customizable)
- **REST** — 20-sec countdown (customizable)

### Core Timer (wall-clock based)
Uses `Date.now()` offset rather than `setInterval` accumulation to stay accurate across pauses. `setInterval` fires every 200ms for smooth UI updates.

### Features
- **SVG ring** — Circular countdown progress bar via `stroke-dashoffset` (circumference = 2π×44 ≈ 276.46)
- **Dark mode** — CSS custom properties toggled via `localStorage`
- **Audio** — Web Audio API with siren-like alert (alternating 880/660 Hz square wave) and rest-done chime (660→880 Hz sine sweep). No external audio files.
- **Desktop notification** — Browser Notification API with SVG data URI icon
- **Vibration** — `navigator.vibrate()` for mobile devices
- **Full-screen rest overlay** — Green overlay with pulsing countdown when rest starts, auto-dismisses when rest ends
- **Screen flash** — CSS animation on work→rest transition
- **Title flash** — Alternates document title to grab attention when tab is backgrounded
- **Keyboard shortcuts** — Space (start/pause), R (reset), S (skip rest)
- **localStorage** — Persists settings (work/rest duration, dark mode) and daily stats (cycles completed, total rest seconds, tracked per calendar date)

### Stats (daily)
- Cycles completed today — resets per calendar date
- Cumulative rest seconds — accumulates across work sessions (even when skipping rest early, partial credit is saved)
