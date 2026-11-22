#!/usr/bin/env bash
# Encode native 1080x1920 30 fps frames + optional Rollo subtitles + mastered audio -> MP4 + full QA.
# Usage: bash finish.sh "<Title Of Short>" [frames_dir] [out_dir]
set -euo pipefail

TITLE="${1:-short}"
FRAMES_DIR="${2:-frames}"
OUT_DIR="${3:-out}"
SAFE_NAME="$(echo "$TITLE" | tr ' /:' '---' | tr -cd 'A-Za-z0-9._-')"
mkdir -p "$OUT_DIR"
OUT_MP4="$OUT_DIR/${SAFE_NAME}.mp4"
QA_LOG="$OUT_DIR/qa_report.txt"

# Build video filter (optional Rollo-style ASS subtitles)
VF_ARGS=()
if [ -f "work/subtitles.ass" ]; then
  echo "Burning Rollo-style bottom-third subtitles from work/subtitles.ass..."
  VF_ARGS=(-vf "ass=work/subtitles.ass")
fi

# Audio handling: loudnorm mix_raw.wav if present, otherwise clean silent track for visual-only smoke tests
if [ -f "mix_raw.wav" ]; then
  echo "Normalizing audio with loudnorm (I=-14, TP=-1.5, LRA=7)..."
  ffmpeg -v error -y -i mix_raw.wav -af "loudnorm=I=-14:TP=-1.5:LRA=7" -ar 48000 -ac 2 mix.wav
  ffmpeg -v error -y -framerate 30 -i "${FRAMES_DIR}/f%04d.jpg" -i mix.wav \
    -map 0:v:0 -map 1:a:0 "${VF_ARGS[@]}" \
    -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT_MP4"
else
  echo "No mix_raw.wav found — encoding with silent stereo audio track (visual smoke test)..."
  ffmpeg -v error -y -framerate 30 -i "${FRAMES_DIR}/f%04d.jpg" \
    -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=48000 \
    -map 0:v:0 -map 1:a:0 "${VF_ARGS[@]}" \
    -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT_MP4"
fi

{
  echo "=== FINAL MP4 ==="
  echo "$OUT_MP4"
  ls -lh "$OUT_MP4"
  echo "=== FFPROBE ==="
  ffprobe -v error -show_entries format=duration -show_entries stream=codec_type,width,height,r_frame_rate -of compact "$OUT_MP4"
  echo "=== FREEZE / BLACK QA (empty = pass) ==="
  ffmpeg -i "$OUT_MP4" -vf "freezedetect=n=0.0005:d=0.4,blackdetect=d=0.05" -an -f null - 2>&1 | grep -E "freeze_start|black_start" || echo "CLEAN (no black/frozen spans)"
  echo "=== EBUR128 LOUDNESS ==="
  ffmpeg -i "$OUT_MP4" -af ebur128 -f null - 2>&1 | grep -E "^\s+(I|LRA|Peak):" | tail -5 || true
} | tee "$QA_LOG"

ffmpeg -v error -y -i "$OUT_MP4" -vf "fps=2,scale=180:-1,tile=10x4" -frames:v 1 "$OUT_DIR/qa_sheet.jpg"
echo "QA contact sheet saved: $OUT_DIR/qa_sheet.jpg"
