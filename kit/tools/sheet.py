#!/usr/bin/env python3
"""
sheet.py — Contact sheet builder with optional shot/frame labels from stills_meta.json.

Usage:
  python3 sheet.py <stills_dir> <out.jpg> [cols] [--meta stills_meta.json]
"""
import glob
import json
import os
import re
import sys
from PIL import Image, ImageDraw, ImageFont


def load_font(size: int):
    for candidate in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
    ):
        if os.path.exists(candidate):
            try:
                return ImageFont.truetype(candidate, size)
            except Exception:
                pass
    return ImageFont.load_default()


def main():
    args = sys.argv[1:]
    meta_path = None
    if "--meta" in args:
        i = args.index("--meta")
        meta_path = args[i + 1]
        del args[i : i + 2]

    stills_dir = args[0]
    out_path = args[1]
    cols = int(args[2]) if len(args) > 2 else 6

    label_by_frame = {}
    if meta_path and os.path.exists(meta_path):
        with open(meta_path, "r", encoding="utf-8") as f:
            meta = json.load(f)
        for item in meta.get("stills", []):
            label_by_frame[int(item["frame"])] = item["label"]

    files = sorted(glob.glob(os.path.join(stills_dir, "f*.jpg")))
    if not files:
        print(f"No f*.jpg files found in {stills_dir}", file=sys.stderr)
        sys.exit(1)

    tw, th = 360, 640  # Crisp 9:16 tiles for detailed visual audit
    rows = (len(files) + cols - 1) // cols
    sheet = Image.new("RGB", (tw * min(cols, len(files)), th * rows), (18, 18, 22))
    draw = ImageDraw.Draw(sheet)
    font = load_font(20)

    for idx, fpath in enumerate(files):
        im = Image.open(fpath).convert("RGB").resize((tw, th), Image.Resampling.LANCZOS)
        x0 = (idx % cols) * tw
        y0 = (idx // cols) * th
        sheet.paste(im, (x0, y0))

        # Subtle subtitle-safe guide line at y = 76% (dotted visual check during audit)
        guide_y = y0 + int(th * 0.76)
        for gx in range(x0 + 8, x0 + tw - 8, 16):
            draw.line([(gx, guide_y), (gx + 8, guide_y)], fill=(255, 214, 68), width=1)

        # Label badge in top-left corner
        m = re.search(r"f(\d+)\.jpg$", os.path.basename(fpath))
        frame_num = int(m.group(1)) if m else idx
        label = label_by_frame.get(frame_num, f"f{frame_num:04d}")
        bbox = draw.textbbox((0, 0), label, font=font)
        lw = bbox[2] - bbox[0] + 16
        lh = bbox[3] - bbox[1] + 10
        draw.rectangle([x0 + 6, y0 + 6, x0 + 6 + lw, y0 + 6 + lh], fill=(20, 16, 26))
        draw.text((x0 + 14, y0 + 9), label, fill=(255, 214, 68), font=font)

    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    sheet.save(out_path, quality=92)
    print(f"Saved contact sheet: {out_path} ({len(files)} tiles, {sheet.width}x{sheet.height})")


if __name__ == "__main__":
    main()
