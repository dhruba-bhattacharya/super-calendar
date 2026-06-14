# Super Calendar

A dark-mode, modular desktop calendar concept for Windows. It combines ordinary calendar planning with a dedicated episode-release tracker, draggable widgets, theme switching, compact layout density, quick-add templates, and wallpaper-oriented presentation.

## Run locally

```bash
npm run build
npm run dev
```

Open <http://localhost:4173> for the static preview.

## Build a Windows EXE

On a Windows machine with Node.js installed:

```bash
npm install
npm run dist:win
```

The Electron Builder configuration emits NSIS installer and portable Windows targets into `release/`.

## Wallpaper use

The UI is designed to run as a desktop dashboard. Dynamic wallpaper mode can be implemented as a borderless always-on-bottom Electron window, while static mode can export a 4K snapshot for Windows background rotation or Wallpaper Engine.
