# Three.js 3D Cartoon Short — GitHub Actions Cloud Render Studio

Render native **1080×1920, 30 fps** Three.js r160 3D cartoon shorts entirely in the cloud on GitHub Actions (`ubuntu-latest`) with zero rendering load on your laptop.

## Features
- **Mandatory Contact Sheet Audit (`stills` mode)**: Renders 1 native 1080×1920 still per shot into a labeled `stills_audit.jpg` (with `y = 76%` subtitle-safe guide lines) before committing to a full render.
- **Parallel Cloud Sharding (`full` mode)**: Splits frame rendering across `N` concurrent GitHub Actions runners (default 4 runners × 3 parallel Chromium workers = 12 workers), then merges, burns Rollo-style bottom-third viral subtitles, masters `-6.0 dB` music / `≤ -6.0 dB` SFX audio, encodes `crf 17` MP4, and runs full QA (`freezedetect`, `blackdetect`, `ebur128`, `qa_sheet.jpg`).
- **Locked Quality Gates**: Automatically wires Three.js r160, applies anti-glitch fixes (`--disable-accelerated-2d-canvas`, `{ willReadFrequently: true }`, `cardNd` `THREE.NoBlending`, `PCFSoftShadowMap`), and fails fast if `dofAt` returns `cinf > 0`.

## Quick Commands
```bash
python cloud_render.py check
python cloud_render.py init
python cloud_render.py stills smoke-soldier
python cloud_render.py full smoke-soldier --shards 4 --title "Smoke Test"
```
