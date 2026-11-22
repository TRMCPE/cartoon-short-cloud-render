#!/usr/bin/env python3
"""
fix_cartoon_glitch.py — Universal Patch Script for cartoon-audio-short (Three.js r160 + 2D Bean-Head Kit)

Fixes three critical rendering issues across any project or kit directory:
1. SwiftShader 2D Canvas Tessellation Glitch:
   - Adds '--disable-accelerated-2d-canvas' to Chromium flags in render.mjs and cdp_render.py.
   - Adds '{ willReadFrequently: true }' to all 2D canvas getContext('2d') calls in
     toonbase.js, roman.js, toon.js, paint.js, and main.js.
2. 3D Background Outline Bleed-Through into 2D Characters (rtNd Normal+Depth Corruption):
   - Ensures cardNd in main.js has:
     'transparent: false, blending: THREE.NoBlending, depthWrite: true, depthTest: true'
3. Full-Resolution 1080x1920 Render Targets & Clean Soft Shadow Bias:
   - Ensures W = 1080, H = 1920 and full-res rtNd (no half-res 'W >> 1, H >> 1').
   - Ensures PCFSoftShadowMap with clean bias (-0.0015) and normalBias (0.04).

Usage:
    python fix_cartoon_glitch.py [path/to/project_or_kit_dir]
"""

import os
import re
import sys


def patch_2d_context(text: str) -> str:
    """Replace bare getContext('2d') / getContext("2d") with { willReadFrequently: true }."""
    return re.sub(
        r"""\.getContext\(\s*(['"])2d\1\s*\)""",
        r""".getContext(\g<1>2d\g<1>, { willReadFrequently: true })""",
        text,
    )


def patch_card_nd(code: str) -> str:
    """Ensure cardNd uses transparent: false, blending: THREE.NoBlending, depthWrite: true, depthTest: true."""
    if "const cardNd" not in code:
        return code
    if "THREE.NoBlending" in code:
        return code

    # Case 1: cardNd had transparent: true
    patched, n = re.subn(
        r"""(const\s+cardNd\s*=\s*\(map\)\s*=>\s*new\s+THREE\.ShaderMaterial\(\{\s*uniforms:\s*\{\s*map:\s*\{\s*value:\s*map\s*\}\s*\}\s*,)\s*transparent:\s*true\s*,""",
        r"""\1\n  transparent: false, blending: THREE.NoBlending, depthWrite: true, depthTest: true,""",
        code,
    )
    if n > 0:
        return patched

    # Case 2: cardNd omitted transparent/blending flags (engine/main.js default)
    patched, _ = re.subn(
        r"""(const\s+cardNd\s*=\s*\(map\)\s*=>\s*new\s+THREE\.ShaderMaterial\(\{\s*uniforms:\s*\{\s*map:\s*\{\s*value:\s*map\s*\}\s*\}\s*,)""",
        r"""\1\n  transparent: false, blending: THREE.NoBlending, depthWrite: true, depthTest: true,""",
        code,
    )
    return patched


def patch_main_js(path: str) -> bool:
    if not os.path.exists(path):
        return False
    with open(path, "r", encoding="utf-8") as f:
        orig = f.read()
    code = orig

    # 1. Force CPU 2D Canvas
    code = patch_2d_context(code)

    # 2. Fix cardNd alpha-blending corruption in rtNd pass
    code = patch_card_nd(code)

    # 3. Ensure full 1080x1920 resolution and full-res rtNd
    code = code.replace("const W = 720, H = 1280;", "const W = 1080, H = 1920;")
    code = code.replace("W >> 1, H >> 1", "W, H")

    # 4. Upgrade BasicShadowMap / 384 shadow map and tighten shadow bias
    code = code.replace("THREE.BasicShadowMap", "THREE.PCFSoftShadowMap")
    code = re.sub(
        r"""sun\.shadow\.mapSize\.set\(\s*384\s*,\s*384\s*\);""",
        "sun.shadow.mapSize.set(1024, 1024);",
        code,
    )
    code = code.replace(
        "sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.025;",
        "sun.shadow.bias = -0.0015; sun.shadow.normalBias = 0.04;",
    )
    code = code.replace(
        "sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;",
        "sun.shadow.bias = -0.0015; sun.shadow.normalBias = 0.04;",
    )

    if code != orig:
        with open(path, "w", encoding="utf-8") as f:
            f.write(code)
        print(f"[PATCHED] {path}")
        return True
    print(f"[OK - ALREADY CLEAN] {path}")
    return False


def patch_canvas_js(path: str) -> bool:
    if not os.path.exists(path):
        return False
    with open(path, "r", encoding="utf-8") as f:
        orig = f.read()
    code = patch_2d_context(orig)
    if code != orig:
        with open(path, "w", encoding="utf-8") as f:
            f.write(code)
        print(f"[PATCHED] {path}")
        return True
    print(f"[OK - ALREADY CLEAN] {path}")
    return False


def patch_render_runner(path: str) -> bool:
    if not os.path.exists(path):
        return False
    with open(path, "r", encoding="utf-8") as f:
        orig = f.read()
    code = orig

    if "--disable-accelerated-2d-canvas" not in code:
        code = code.replace(
            '"--ignore-gpu-blocklist",',
            '"--ignore-gpu-blocklist",\n        "--disable-accelerated-2d-canvas",',
        )
        code = code.replace(
            "'--ignore-gpu-blocklist',",
            "'--ignore-gpu-blocklist',\n    '--disable-accelerated-2d-canvas',",
        )
        code = code.replace(
            "'--ignore-gpu-blocklist']",
            "'--ignore-gpu-blocklist', '--disable-accelerated-2d-canvas']",
        )
        code = code.replace(
            '"--ignore-gpu-blocklist"]',
            '"--ignore-gpu-blocklist", "--disable-accelerated-2d-canvas"]',
        )

    code = code.replace("c.width = 720;\n      c.height = 1280;", "c.width = 1080;\n      c.height = 1920;")

    if code != orig:
        with open(path, "w", encoding="utf-8") as f:
            f.write(code)
        print(f"[PATCHED] {path}")
        return True
    print(f"[OK - ALREADY CLEAN] {path}")
    return False


def patch_directory(root_dir: str) -> int:
    count = 0
    for dirpath, _, filenames in os.walk(root_dir):
        for fn in filenames:
            full = os.path.join(dirpath, fn)
            if fn == "main.js":
                count += int(patch_main_js(full))
            elif fn in ("toonbase.js", "roman.js", "toon.js", "paint.js"):
                count += int(patch_canvas_js(full))
            elif fn in ("cdp_render.py", "render.mjs"):
                count += int(patch_render_runner(full))
    return count


def main():
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    target = os.path.abspath(target)
    print(f"Scanning and patching cartoon-audio-short files in: {target}")
    patched = patch_directory(target)
    print(f"\nDone! Patched {patched} file(s).")


if __name__ == "__main__":
    main()
