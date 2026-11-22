#!/usr/bin/env bash
# prepare_project.sh — Ensures Three.js r160, toon.js, and all anti-glitch patches are wired before rendering.
set -euo pipefail

PROJ="${1:?Usage: bash kit/tools/prepare_project.sh projects/<name>}"
test -d "$PROJ/web" || { echo "ERROR: Missing $PROJ/web"; exit 1; }

# 1. Wire Three.js r160
mkdir -p "$PROJ/web/lib"
if [ ! -f "$PROJ/web/lib/three.module.js" ]; then
  cp kit/lib/three.module.js "$PROJ/web/lib/three.module.js"
fi

# 2. Build toonbase.js and toon.js if not already present
if [ ! -f "$PROJ/web/toon.js" ]; then
  if [ ! -f "$PROJ/web/toonbase.js" ]; then
    node -e "
      const m = require('node:module'), fs = require('fs');
      const src = fs.readFileSync('kit/vendor/toon.ts', 'utf8');
      let js;
      try { js = m.stripTypeScriptTypes(src, { mode: 'strip' }); }
      catch { js = m.stripTypeScriptTypes(src, { mode: 'transform' }); }
      fs.writeFileSync(process.argv[1], js);
    " "$PROJ/web/toonbase.js"
  fi
  if [ -f "$PROJ/web/cast.js" ]; then
    cat "$PROJ/web/toonbase.js" "$PROJ/web/cast.js" > "$PROJ/web/toon.js"
  elif [ -f "$PROJ/web/roman.js" ]; then
    cat "$PROJ/web/toonbase.js" "$PROJ/web/roman.js" > "$PROJ/web/toon.js"
  else
    cp "$PROJ/web/toonbase.js" "$PROJ/web/toon.js"
  fi
fi

# 3. Apply anti-glitch patcher (CPU 2D canvas + cardNd NoBlending + 1080x1920 + PCFSoftShadowMap)
python3 kit/tools/fix_cartoon_glitch.py "$PROJ"

# 4. Syntax check every JS module
for f in "$PROJ"/web/*.js; do
  node --check "$f"
done

echo "Prepared project cleanly: $PROJ"
