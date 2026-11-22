#!/usr/bin/env python3
"""
subtitles.py — Generates Rollo Films-style bottom-third viral ASS subtitles from words.json.

Locked Style Rules:
- Native 1080x1920 PlayRes, bottom-third center at y = 76% (pos(540, 1460)).
- 2 to 4 words per chunk (breaks cleanly on punctuation or long pauses).
- Bold sans-serif 62px (DejaVu Sans / Liberation Sans / Arial Black).
- Thick dark outline (Outline=6) + soft drop shadow (Shadow=3.5), BorderStyle=1 (NO black boxes).
- Bold white text (#FFFFFF) with gold (#FFD644 -> ASS &H0044D6FF&) highlight on the active word.

Usage:
  python3 subtitles.py work/words.json work/subtitles.ass
"""
import json
import os
import re
import sys


def ass_time(sec: float) -> str:
    sec = max(0.0, sec)
    h = int(sec // 3600)
    m = int((sec % 3600) // 60)
    s = int(sec % 60)
    cs = int(round((sec - int(sec)) * 100))
    if cs >= 100:
        s += 1
        cs = 0
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"


def escape_ass(text: str) -> str:
    return text.replace("\\", "\\\\").replace("{", "\\{").replace("}", "\\}")


def chunk_words(words, min_w=2, max_w=4, max_chars=18):
    chunks = []
    cur = []
    for idx, w in enumerate(words):
        word_text = w["w"].strip()
        if not word_text:
            continue
        if cur:
            gap = w["s"] - cur[-1]["e"]
            cur_chars = sum(len(x["w"]) for x in cur) + len(cur) + len(word_text)
            prev_punct = bool(re.search(r"[.!?,;:]$", cur[-1]["w"]))
            if len(cur) >= max_w or (cur_chars > max_chars and len(cur) >= min_w) or gap > 0.35 or (prev_punct and len(cur) >= min_w):
                chunks.append(cur)
                cur = []
        cur.append({"w": word_text, "s": float(w["s"]), "e": float(w["e"])})
        if re.search(r"[.!?]$", word_text) and len(cur) >= min_w:
            chunks.append(cur)
            cur = []
    if cur:
        # Merge trailing orphan 1-word chunk into previous chunk if short enough
        if len(cur) == 1 and chunks and len(chunks[-1]) < max_w:
            chunks[-1].extend(cur)
        else:
            chunks.append(cur)
    return chunks


def build_ass(words, font_name="DejaVu Sans", font_size=62, pos_y=1460):
    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Viral,{font_name},{font_size},&H00FFFFFF,&H0044D6FF,&H001A1014,&H55000000,-1,0,0,0,100,100,0.5,0,1,6.5,3.5,5,70,70,460,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    chunks = chunk_words(words)
    events = []
    for c_idx, chunk in enumerate(chunks):
        next_chunk_start = chunks[c_idx + 1][0]["s"] if c_idx + 1 < len(chunks) else chunk[-1]["e"] + 0.15
        for i, active in enumerate(chunk):
            t0 = active["s"]
            if i + 1 < len(chunk):
                t1 = max(active["e"], chunk[i + 1]["s"])
            else:
                t1 = min(max(active["e"] + 0.08, t0 + 0.08), next_chunk_start)
            if t1 <= t0:
                t1 = t0 + 0.05

            parts = []
            for j, item in enumerate(chunk):
                txt = escape_ass(item["w"].upper())
                if j == i:
                    # Gold highlight (#FFD644 -> ASS BGR &H0044D6FF&) + subtle active pop
                    parts.append(r"{\c&H0044D6FF&\fscx106\fscy106}" + txt + r"{\c&H00FFFFFF&\fscx100\fscy100}")
                else:
                    parts.append(txt)

            line_text = f"{{\\an5\\pos(540,{pos_y})}}" + " ".join(parts)
            events.append(f"Dialogue: 0,{ass_time(t0)},{ass_time(t1)},Viral,,0,0,0,,{line_text}")

    return header + "\n".join(events) + "\n"


def main():
    if len(sys.argv) < 3:
        print("Usage: python3 subtitles.py <words.json> <out.ass>", file=sys.stderr)
        sys.exit(1)
    with open(sys.argv[1], "r", encoding="utf-8") as f:
        words = json.load(f)
    ass = build_ass(words)
    os.makedirs(os.path.dirname(os.path.abspath(sys.argv[2])), exist_ok=True)
    with open(sys.argv[2], "w", encoding="utf-8") as f:
        f.write(ass)
    print(f"Generated Rollo-style viral subtitles: {sys.argv[2]} ({len(words)} words)")


if __name__ == "__main__":
    main()
