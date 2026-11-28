#!/usr/bin/env python3
"""
100% Unique 6-Act Cambodian Golden-Era Surf-Rom-Com Score & Slapstick Foley Suite
for 'khmer-school-crush' («ហោះផ្កាប់មុខចូលថ្លុកភក់នៅចំមុខក្រាស់!», 56.00s, 1680 frames).

100% Distinct From All Prior Episodes:
- ZERO Roneat/Kong/Chhing folk loops; ZERO Chapei/Accordion 128 BPM swing; ZERO Khloy/Kse Diev/Skor Chhaiyam 6/8.
- Lead Voice 1: 1960s Phnom Penh Golden-Era Tremolo Surf Electric Guitar (clean spring-twang + whammy vibrato).
- Lead Voice 2: Retro Transistor Combo Organ (Vox-style drawbar chords) + Shimmering Celesta/Vibraphone Bells.
- Groove & Comedy Brass: Funky Slap/Finger Electric Bass + Plunger-Mute "Wah-Wah" Comedy Trombone + Crisp Snare/HiHat/Finger-Snap Kit.
- 6 Story-Synced Musical Acts:
  1. Freeze-Frame Puddle Suspense & Ticking Pulse (0.00 - 5.80s, F minor / C7#9)
  2. VHS Rewind Warble -> Dreamy Eb-Lydian Vibraphone & Organ Crush Reveal (5.80 - 12.85s)
  3. 110 BPM G-Minor Blues Cinema-Idol Strut (Surf Guitar + Finger Snaps + Walking Bass, 12.85 - 22.95s)
  4. Banana-Peel Tiptoe -> Record-Stop Silence for Slip & "ផ្លូក!" Mud Splat -> 136 BPM Bb Ska/Polka Laughing Trombone (22.95 - 36.15s)
  5. Awkward Deadpan C-Minor "Soil Inspector" Minimalist Tiptoe + Sparkle Tooth Ting (36.15 - 44.72s)
  6. 172 BPM Hyper Surf-Punk Restroom Sprint -> 118 BPM F-Major Romvong-Pop CTA -> Seamless Loop Cliffhanger (44.72 - 56.00s)
- Mastered strictly via audio_mix.py (-6.0 dB music, <= -6.0 dB SFX, peaks <= 0.70x voice peak).
"""
import numpy as np
from audio_mix import SR, load_voice, master_mix

DUR = 1680 / 30.0  # 56.000s exact
N = int(round(DUR * SR))
rng = np.random.default_rng(202611289)


def lp_fft(x: np.ndarray, cutoff: float) -> np.ndarray:
    if len(x) == 0:
        return x
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1.0 / SR)
    X *= 1.0 / (1.0 + (f / max(cutoff, 20.0)) ** 4)
    return np.fft.irfft(X, len(x)).astype(np.float32)


def bp_fft(x: np.ndarray, f_lo: float, f_hi: float) -> np.ndarray:
    if len(x) == 0:
        return x
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1.0 / SR)
    hp = 1.0 - 1.0 / (1.0 + (f / max(f_lo, 15.0)) ** 3)
    lp = 1.0 / (1.0 + (f / max(f_hi, 30.0)) ** 4)
    X *= hp * lp
    return np.fft.irfft(X, len(x)).astype(np.float32)


def place(buf: np.ndarray, sig: np.ndarray, t0: float, gain: float = 1.0):
    i = int(round(t0 * SR))
    if i < 0:
        sig = sig[-i:]
        i = 0
    j = min(N, i + len(sig))
    if i < N and j > i:
        buf[i:j] += sig[: j - i] * gain


midi = lambda m: 440.0 * (2.0 ** ((m - 69.0) / 12.0))


# ==============================================================================
# 1. BESPOKE GOLDEN-ERA SURF-ROM-COM & SLAPSTICK INSTRUMENT SYNTHESIZERS
# ==============================================================================

def surf_guitar(freq: float, dur: float = 0.38, trem_hz: float = 7.2, slide_semi: float = 0.0) -> np.ndarray:
    """1960s Cambodian Golden-Age clean electric surf guitar with bridge-pickup twang & amp tremolo."""
    n = max(16, int(dur * SR))
    t = np.arange(n, dtype=np.float32) / SR
    bend = 2.0 ** ((slide_semi * np.exp(-t * 20.0)) / 12.0)
    whammy = 1.0 + 0.0035 * np.sin(2.0 * np.pi * 5.4 * t) * np.clip((t - 0.05) * 8.0, 0.0, 1.0)
    ph = 2.0 * np.pi * np.cumsum(freq * bend * whammy) / SR

    # Metallic single-coil harmonic recipe + crisp pick attack transient
    sig = (
        0.58 * np.sin(ph) * np.exp(-t * 3.8)
        + 0.34 * np.sin(2.0 * ph + 0.2) * np.exp(-t * 5.2)
        + 0.22 * np.sin(3.0 * ph + 0.5) * np.exp(-t * 7.0)
        + 0.14 * np.sin(4.0 * ph) * np.exp(-t * 9.5)
        + 0.08 * np.sin(6.0 * ph) * np.exp(-t * 14.0)
    )
    pick = bp_fft(rng.standard_normal(n).astype(np.float32), 900.0, 4200.0) * np.exp(-t * 85.0) * 0.22
    trem = 1.0 - 0.22 * (0.5 - 0.5 * np.cos(2.0 * np.pi * trem_hz * t))
    att = np.clip(t / 0.003, 0.0, 1.0)
    rel = np.clip((dur - t) / min(0.04, dur * 0.3), 0.0, 1.0)
    # Subtle spring-reverb slapback echo (42 ms)
    dry = ((sig + pick) * trem * att * rel).astype(np.float32)
    delay = int(0.042 * SR)
    if n > delay:
        dry[delay:] += 0.26 * dry[:-delay]
    return lp_fft(dry, 3800.0)


def combo_organ(midi_notes, dur: float = 0.28, pad: bool = False) -> np.ndarray:
    """Retro transistor combo organ (8' + 4' + 2-2/3' drawbars) for upbeat high-school rom-com."""
    n = max(16, int(dur * SR))
    t = np.arange(n, dtype=np.float32) / SR
    sig = np.zeros(n, dtype=np.float32)
    vib = 1.0 + 0.0032 * np.sin(2.0 * np.pi * 6.2 * t)
    for m in midi_notes:
        f = midi(m)
        ph = 2.0 * np.pi * np.cumsum(f * vib) / SR
        sig += 0.55 * np.sin(ph) + 0.30 * np.sin(2.0 * ph) + 0.16 * np.sin(3.0 * ph) + 0.10 * np.sin(4.0 * ph)
    sig /= max(1, len(midi_notes))
    if pad:
        env = np.clip(t / 0.06, 0.0, 1.0) * np.clip((dur - t) / 0.09, 0.0, 1.0) * 0.34
    else:
        env = np.clip(t / 0.008, 0.0, 1.0) * np.exp(-t * 5.8) * np.clip((dur - t) / 0.025, 0.0, 1.0) * 0.42
    return lp_fft((sig * env).astype(np.float32), 2900.0)


def vibraphone_bell(freq: float, dur: float = 0.65) -> np.ndarray:
    """Dreamy metallic celesta/vibraphone bell bar for sparkling anime crush reveal."""
    n = max(16, int(dur * SR))
    t = np.arange(n, dtype=np.float32) / SR
    motor = 1.0 - 0.18 * (0.5 - 0.5 * np.cos(2.0 * np.pi * 5.5 * t))
    s = (
        0.72 * np.sin(2.0 * np.pi * freq * t) * np.exp(-t * 3.4)
        + 0.24 * np.sin(2.0 * np.pi * freq * 3.99 * t) * np.exp(-t * 11.0)
        + 0.09 * np.sin(2.0 * np.pi * freq * 9.2 * t) * np.exp(-t * 26.0)
    )
    att = np.clip(t / 0.004, 0.0, 1.0) * np.clip((dur - t) / 0.06, 0.0, 1.0)
    return (s * motor * att * 0.48).astype(np.float32)


def electric_bass(freq: float, dur: float = 0.28, slap: bool = False) -> np.ndarray:
    """Punchy roundwound electric bass for cinema-idol strut & surf chase."""
    n = max(16, int(dur * SR))
    t = np.arange(n, dtype=np.float32) / SR
    f_env = freq * (1.0 + (0.04 if slap else 0.015) * np.exp(-t * 50.0))
    ph = 2.0 * np.pi * np.cumsum(f_env) / SR
    s = (
        0.72 * np.sin(ph) * np.exp(-t * 5.5)
        + 0.36 * np.sin(2.0 * ph) * np.exp(-t * 9.5)
        + (0.24 if slap else 0.10) * np.sin(3.0 * ph) * np.exp(-t * 16.0)
    )
    pop = bp_fft(rng.standard_normal(n).astype(np.float32), 600.0, 2400.0) * np.exp(-t * 95.0) * (0.22 if slap else 0.06)
    att = np.clip(t / 0.004, 0.0, 1.0) * np.clip((dur - t) / 0.025, 0.0, 1.0)
    return ((s + pop) * att * 0.58).astype(np.float32)


def wah_trombone(f0: float, f1: float, dur: float = 0.36, wah_hz: float = 4.5) -> np.ndarray:
    """Comedic plunger-mute 'wah-wah' brass trombone for whole-school laughter & fake-cool excuse."""
    n = max(16, int(dur * SR))
    t = np.arange(n, dtype=np.float32) / SR
    f = np.linspace(f0, f1, n, dtype=np.float32) * (1.0 + 0.007 * np.sin(2.0 * np.pi * 6.0 * t))
    ph = 2.0 * np.pi * np.cumsum(f) / SR
    brass = np.zeros(n, dtype=np.float32)
    for k in range(1, 9):
        brass += (1.0 / (k ** 0.85)) * np.sin(k * ph)
    # Plunger-mute vowel sweep via dynamic blend of low muffled vs nasal open band
    wah = 0.5 - 0.5 * np.cos(2.0 * np.pi * wah_hz * t)
    closed = bp_fft(brass, 220.0, 680.0)
    opened = bp_fft(brass, 480.0, 2350.0)
    sig = (1.0 - wah) * closed + wah * opened * 1.35
    env = np.clip(t / 0.018, 0.0, 1.0) * np.clip((dur - t) / 0.04, 0.0, 1.0)
    return (sig * env * 0.24).astype(np.float32)


def drum_hit(kind: str = "kick") -> np.ndarray:
    """Crisp surf/rom-com drum kit + finger snaps (zero traditional gongs/chhing!)."""
    if kind == "kick":
        n = int(0.18 * SR); t = np.arange(n, dtype=np.float32) / SR
        f = 54.0 + 95.0 * np.exp(-t * 36.0)
        return (np.sin(2.0 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 14.0) * 0.65).astype(np.float32)
    if kind == "snare":
        n = int(0.15 * SR); t = np.arange(n, dtype=np.float32) / SR
        body = np.sin(2.0 * np.pi * 195.0 * t) * np.exp(-t * 28.0) * 0.35
        wires = bp_fft(rng.standard_normal(n).astype(np.float32), 1100.0, 6500.0) * np.exp(-t * 26.0) * 0.38
        return (body + wires).astype(np.float32)
    if kind == "hat":
        n = int(0.055 * SR); t = np.arange(n, dtype=np.float32) / SR
        h = bp_fft(rng.standard_normal(n).astype(np.float32), 5200.0, 12500.0) * np.exp(-t * 68.0)
        return (h * 0.20).astype(np.float32)
    if kind == "snap":
        # Cool movie-star finger-snap!
        n = int(0.065 * SR); t = np.arange(n, dtype=np.float32) / SR
        pop = np.sin(2.0 * np.pi * (2150.0 - 650.0 * t / 0.065) * t) * np.exp(-t * 62.0) * 0.34
        crisp = bp_fft(rng.standard_normal(n).astype(np.float32), 1800.0, 5200.0) * np.exp(-t * 85.0) * 0.26
        return (pop + crisp).astype(np.float32)
    # rimshot
    n = int(0.05 * SR); t = np.arange(n, dtype=np.float32) / SR
    return ((np.sin(2.0 * np.pi * 1420.0 * t) + 0.5 * np.sin(2.0 * np.pi * 2380.0 * t)) * np.exp(-t * 75.0) * 0.24).astype(np.float32)


# ==============================================================================
# 2. COMPOSE 6 STORY-SYNCED MUSICAL ACTS (0.00s .. 56.00s)
# ==============================================================================
music = np.zeros(N, dtype=np.float32)

# --- ACT 1 (0.00 - 5.80s): Freeze-Frame Above Mud Puddle Suspense (F minor / C7#9) ---
t = 0.08
step_a1 = 0.26
idx = 0
fm_riff = [53, 56, 60, 63, 60, 56, 55, 52]
while t < 5.65:
    place(music, drum_hit("hat"), t, 0.75)
    if idx % 2 == 0:
        place(music, electric_bass(midi(fm_riff[idx % len(fm_riff)] - 12), 0.24), t, 0.52)
    if idx % 4 == 0:
        place(music, surf_guitar(midi(fm_riff[(idx // 2) % len(fm_riff)] + 12), 0.45, trem_hz=9.5), t, 0.40)
        place(music, drum_hit("kick"), t, 0.55)
    t += step_a1
    idx += 1

# --- ACT 2 (7.08 - 12.82s): Dreamy Eb-Lydian Vibraphone & Organ Crush Reveal ---
t = 7.08
beat_a2 = 60.0 / 98.0
crush_chords = [
    (51, [63, 67, 70, 74], [75, 79, 82, 86]),  # Ebmaj7
    (58, [62, 65, 70, 74], [74, 77, 82, 89]),  # Bbadd9
    (48, [60, 63, 67, 70], [72, 75, 79, 82]),  # Cm7
    (53, [65, 69, 72, 75], [77, 81, 84, 87]),  # F7sus -> F
]
bar = 0
while t < 12.75:
    b_note, org_ch, vib_arp = crush_chords[bar % 4]
    place(music, combo_organ(org_ch, beat_a2 * 1.9, pad=True), t, 0.62)
    place(music, electric_bass(midi(b_note - 12), beat_a2 * 0.9), t, 0.44)
    for sub in range(4):
        ts = t + sub * (beat_a2 * 0.5)
        if ts < 12.80:
            place(music, vibraphone_bell(midi(vib_arp[sub % 4]), 0.52), ts, 0.56)
    t += beat_a2 * 2.0
    bar += 1

# --- ACT 3 (12.88 - 22.92s): 110 BPM G-Minor Blues "Movie-Star Transformation" Strut! ---
t = 12.88
beat_a3 = 60.0 / 110.0
strut_prog = [
    (55, [67, 70, 74], [67, 70, 72, 73, 74, 70]),  # Gm7 cool blues riff
    (48, [60, 63, 67], [72, 75, 74, 72, 70, 67]),  # Cm7 swagger
    (51, [63, 67, 70], [75, 74, 72, 70, 67, 70]),  # Ebmaj7
    (50, [62, 66, 69], [74, 75, 74, 72, 70, 69]),  # D7#9 turnaround
]
bar = 0
while t < 22.85:
    root, chord, lick = strut_prog[bar % 4]
    for b in range(4):
        tb = t + b * beat_a3
        if tb >= 22.90:
            break
        walk_semi = [0, 3, 5, 6][b]
        place(music, electric_bass(midi(root - 12 + walk_semi), beat_a3 * 0.85, slap=True), tb, 0.64)
        place(music, drum_hit("hat"), tb + beat_a3 * 0.5, 0.68)
        if b in (0, 2):
            place(music, drum_hit("kick"), tb, 0.62)
        else:
            # Iconic cinema-idol finger-snap on beats 2 & 4!
            place(music, drum_hit("snap"), tb, 0.85)
            place(music, combo_organ(chord, 0.20, pad=False), tb, 0.52)
        # Twangy surf guitar blues melody
        g_note = lick[(b + bar) % len(lick)]
        place(music, surf_guitar(midi(g_note), 0.32, trem_hz=7.8, slide_semi=(1.0 if b == 0 else 0.0)), tb, 0.50)
    t += beat_a3 * 4.0
    bar += 1

# --- ACT 4A (23.15 - 25.65s): Rising Chromatic Banana-Peel Tiptoe -> SUDDEN STOP at 25.68s! ---
t = 23.15
tiptoe_step = 0.24
chrom = 50
while t < 25.62:
    place(music, electric_bass(midi(chrom - 12), 0.16, slap=True), t, 0.56)
    place(music, drum_hit("rim"), t, 0.65)
    place(music, vibraphone_bell(midi(chrom + 19), 0.18), t + 0.11, 0.40)
    chrom += 1
    t += tiptoe_step
# (25.68s .. 29.65s = deliberate dramatic music silence so banana slip whistle & 29.16s "ផ្លូក!" mud splat dominate!)

# --- ACT 4B (29.75 - 36.12s): 136 BPM Bb-Major Ska/Polka Laughing Wah-Wah Trombone! ---
t = 29.75
beat_a4 = 60.0 / 136.0
laugh_prog = [
    (58, [70, 74, 77], 70),  # Bb
    (55, [67, 70, 74], 67),  # Gm
    (51, [63, 67, 70], 75),  # Eb
    (53, [65, 69, 72], 74),  # F7
]
bar = 0
while t < 36.05:
    root, ch, tb_lead = laugh_prog[bar % 4]
    for b in range(4):
        tb = t + b * beat_a4
        if tb >= 36.10:
            break
        if b % 2 == 0:
            place(music, drum_hit("kick"), tb, 0.62)
            place(music, electric_bass(midi(root - 12), 0.22), tb, 0.58)
        else:
            place(music, drum_hit("snare"), tb, 0.52)
            place(music, electric_bass(midi(root - 5), 0.20), tb, 0.52)
        # Upbeat ska organ skank on off-beats!
        if tb + beat_a4 * 0.5 < 36.10:
            place(music, combo_organ(ch, 0.16, pad=False), tb + beat_a4 * 0.5, 0.56)
        if b in (0, 2):
            # Laughing wah-wah trombone phrase!
            place(music, wah_trombone(midi(tb_lead), midi(tb_lead - 3), beat_a4 * 1.4, wah_hz=6.5), tb, 0.72)
    t += beat_a4 * 4.0
    bar += 1

# --- ACT 5 (36.28 - 44.65s): Awkward Deadpan C-Minor "Soil Inspector" Excuse Tiptoe ---
t = 36.28
beat_a5 = 60.0 / 94.0
awk_notes = [48, 55, 51, 55, 48, 56, 55, 43]
step_i = 0
while t < 44.55:
    # Brief deadpan hush right on the sparkle-tooth grin (39.3s - 40.2s)
    if not (39.30 <= t <= 40.15):
        n_m = awk_notes[step_i % len(awk_notes)]
        place(music, electric_bass(midi(n_m), 0.20), t, 0.48)
        place(music, drum_hit("hat"), t, 0.45)
        if step_i % 2 == 1:
            place(music, combo_organ([60, 63, 67], 0.15, pad=False), t + beat_a5 * 0.5, 0.38)
    t += beat_a5
    step_i += 1

# --- ACT 6A (44.75 - 48.72s): 172 BPM Hyper Surf-Punk Restroom Sprint of Shame! ---
t = 44.75
beat_a6 = 60.0 / 172.0
sprint_riff = [60, 63, 65, 67, 70, 67, 65, 63]
step_i = 0
while t < 48.68:
    place(music, drum_hit("kick" if step_i % 2 == 0 else "snare"), t, 0.68)
    place(music, drum_hit("hat"), t + beat_a6 * 0.5, 0.60)
    place(music, electric_bass(midi(48 if step_i % 4 < 2 else 53), 0.18, slap=True), t, 0.62)
    place(music, surf_guitar(midi(sprint_riff[step_i % len(sprint_riff)] + 12), 0.20, trem_hz=11.0), t, 0.54)
    t += beat_a6
    step_i += 1

# --- ACT 6B (48.85 - 56.00s): Sunny 118 BPM F-Major Romvong-Pop CTA -> Loop Match-Cut! ---
t = 48.85
beat_cta = 60.0 / 118.0
cta_prog = [
    (53, [65, 69, 72], [77, 81, 84, 81]),  # F
    (50, [62, 65, 69], [74, 77, 81, 77]),  # Dm
    (58, [62, 65, 70], [74, 77, 82, 84]),  # Bb
    (48, [60, 64, 67], [72, 76, 79, 84]),  # C7
]
bar = 0
while t < 55.45:
    root, ch, arp = cta_prog[bar % 4]
    for b in range(4):
        tb = t + b * beat_cta
        if tb >= 55.45:
            break
        place(music, electric_bass(midi(root - 12), 0.28), tb, 0.56)
        place(music, drum_hit("kick" if b in (0, 2) else "snap"), tb, 0.62)
        place(music, combo_organ(ch, 0.22, pad=False), tb + beat_cta * 0.5, 0.48)
        place(music, surf_guitar(midi(arp[b % 4]), 0.30, trem_hz=7.0), tb, 0.46)
    t += beat_cta * 4.0
    bar += 1

# Final Loop Cliffhanger Suspense Chord (55.45 - 55.98s, matching Frame 0 F-minor freeze!)
place(music, combo_organ([53, 60, 65, 68], 0.50, pad=True), 55.45, 0.65)
place(music, surf_guitar(midi(65), 0.48, trem_hz=9.5), 55.45, 0.55)


# ==============================================================================
# 3. 22 FRESHLY SYNTHESIZED SLAPSTICK & HIGH-SCHOOL FOLEY SFX
# ==============================================================================
sfx = np.zeros(N, dtype=np.float32)


def sfx_freeze_shutter():
    """Crisp camera freeze-frame click + dramatic sub-drop."""
    n = int(0.42 * SR); t = np.arange(n, dtype=np.float32) / SR
    click = bp_fft(rng.standard_normal(n).astype(np.float32), 1800.0, 7500.0) * np.exp(-t * 95.0) * 0.65
    click2 = bp_fft(rng.standard_normal(n).astype(np.float32), 1500.0, 6500.0) * np.exp(-np.maximum(0, t - 0.045) * 95.0) * (t >= 0.045) * 0.50
    sub = np.sin(2.0 * np.pi * np.cumsum(135.0 * np.exp(-t * 5.2)) / SR) * np.exp(-t * 6.5) * 0.55
    return (click + click2 + sub).astype(np.float32)


def sfx_vhs_rewind(dur=1.15):
    """Authentic VHS tape high-speed rewind warble + mechanical reel whir («ត្រឡប់មកមួយនាទីមុន...»)."""
    n = int(dur * SR); t = np.arange(n, dtype=np.float32) / SR
    f_chirp = 420.0 + 1350.0 * (t / dur) + 240.0 * np.sin(2.0 * np.pi * 22.0 * t)
    chirp = np.sin(2.0 * np.pi * np.cumsum(f_chirp) / SR) * 0.26
    whir = bp_fft(rng.standard_normal(n).astype(np.float32), 800.0, 4200.0) * (0.22 + 0.10 * np.sin(2.0 * np.pi * 16.0 * t))
    env = np.clip(t / 0.04, 0, 1) * np.clip((dur - t) / 0.06, 0, 1)
    return ((chirp + whir) * env * 0.68).astype(np.float32)


def sfx_school_bell():
    """Metallic brass Cambodian school recess bell (ជួងសាលា — 3 bright strikes)."""
    n = int(1.25 * SR); out = np.zeros(n, dtype=np.float32)
    for k, t0 in enumerate([0.0, 0.28, 0.56]):
        m = int(0.65 * SR); t = np.arange(m, dtype=np.float32) / SR
        # Inharmonic bronze bell partials
        bell = (
            0.55 * np.sin(2 * np.pi * 1180.0 * t) * np.exp(-t * 5.5)
            + 0.38 * np.sin(2 * np.pi * 1845.0 * t) * np.exp(-t * 7.5)
            + 0.26 * np.sin(2 * np.pi * 2710.0 * t) * np.exp(-t * 11.0)
            + 0.16 * np.sin(2 * np.pi * 3920.0 * t) * np.exp(-t * 16.0)
        )
        i = int(t0 * SR)
        out[i:min(n, i + m)] += bell[: min(m, n - i)] * (0.55 if k < 2 else 0.68)
    return out


def sfx_heartbeat_shimmer():
    """Lovestruck 'lub-dub!' heartbeat + ascending anime harp/bell glissando."""
    n = int(1.10 * SR); out = np.zeros(n, dtype=np.float32)
    for t0, amp in [(0.0, 0.58), (0.19, 0.72), (0.58, 0.52), (0.77, 0.65)]:
        m = int(0.16 * SR); t = np.arange(m, dtype=np.float32) / SR
        thump = np.sin(2 * np.pi * (68.0 + 42.0 * np.exp(-t * 32.0)) * t) * np.exp(-t * 18.0) * amp
        i = int(t0 * SR); out[i:i + m] += thump
    # Rising celestial sparkle notes
    for idx, semi in enumerate([75, 79, 82, 86, 89, 94]):
        b = vibraphone_bell(midi(semi), 0.35)
        i = int((0.12 + idx * 0.085) * SR)
        j = min(n, i + len(b))
        out[i:j] += b[:j - i] * 0.65
    return out


def sfx_comb_zip():
    """Crisp plastic pocket-comb teeth zipping through hair («ប្រញាប់សិតសក់»)."""
    n = int(0.32 * SR); t = np.arange(n, dtype=np.float32) / SR
    teeth = np.sin(2 * np.pi * (95.0 + 85.0 * t / 0.32) * t)
    carrier = bp_fft(rng.standard_normal(n).astype(np.float32), 2200.0, 7800.0)
    env = np.clip(t / 0.02, 0, 1) * np.clip((0.32 - t) / 0.04, 0, 1)
    return (carrier * (0.5 + 0.5 * np.sign(teeth)) * env * 0.46).astype(np.float32)


def sfx_collar_snap():
    """Sharp starched cotton shirt collar POP + cool sunglasses gleam chime («សារ៉េកអាវស»)."""
    n = int(0.36 * SR); t = np.arange(n, dtype=np.float32) / SR
    flap = bp_fft(rng.standard_normal(n).astype(np.float32), 450.0, 3200.0) * np.exp(-t * 58.0) * 0.68
    thwack = np.sin(2 * np.pi * 240.0 * t) * np.exp(-t * 42.0) * 0.45
    gleam = (np.sin(2 * np.pi * 2637.0 * t) + 0.5 * np.sin(2 * np.pi * 3951.0 * t)) * np.exp(-np.maximum(0, t - 0.06) * 14.0) * (t >= 0.06) * 0.22
    return (flap + thwack + gleam).astype(np.float32)


def sfx_wind_whoosh(dur=0.55, pitch_hi=1800.0):
    """Cinematic wind / whip-pan whoosh."""
    n = int(dur * SR); t = np.arange(n, dtype=np.float32) / SR
    env = np.sin(np.pi * t / dur) ** 1.6
    w = bp_fft(rng.standard_normal(n).astype(np.float32), 260.0, pitch_hi)
    return (w * env * 0.48).astype(np.float32)


def sfx_heart_pop(freq_base=380.0):
    """Bouncy cartoon 'bloop-pop!' as giant glowing hearts block his vision."""
    n = int(0.22 * SR); t = np.arange(n, dtype=np.float32) / SR
    f = freq_base * (0.65 + 0.85 * (1.0 - np.exp(-t * 28.0)))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 14.0)
    return (s * np.clip(t / 0.006, 0, 1) * 0.52).astype(np.float32)


def sfx_banana_slip_whistle():
    """Classic slapstick rubber-skid + wild upward slide-whistle («រអិលបះជើងឡើងលើ»)!"""
    n = int(1.05 * SR); t = np.arange(n, dtype=np.float32) / SR
    # Initial sneaker-on-banana squishy skid (0..0.22s)
    f_skid = 520.0 + 980.0 * np.sin(2 * np.pi * 9.0 * np.minimum(t, 0.22))
    skid = np.sin(2 * np.pi * np.cumsum(f_skid) / SR) * np.exp(-t * 11.0) * 0.45
    # Soaring slide-whistle shooting legs into the air (0.12..1.05s)
    t2 = np.maximum(0.0, t - 0.12)
    f_whis = 580.0 * (2.0 ** (2.15 * np.clip(t2 / 0.78, 0.0, 1.0))) + 35.0 * np.sin(2 * np.pi * 14.0 * t2)
    whis = (np.sin(2 * np.pi * np.cumsum(f_whis) / SR) + 0.18 * np.sin(4 * np.pi * np.cumsum(f_whis) / SR))
    whis_env = (t >= 0.12) * np.clip(t2 / 0.03, 0, 1) * np.clip((1.05 - t) / 0.12, 0, 1) * 0.42
    return (skid + whis * whis_env).astype(np.float32)


def sfx_falling_dive_whistle(dur=0.85):
    """Descending cartoon falling whistle right before puddle impact!"""
    n = int(dur * SR); t = np.arange(n, dtype=np.float32) / SR
    f = 1950.0 * (2.0 ** (-1.85 * (t / dur) ** 1.3))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / dur) * 0.36
    return s.astype(np.float32)


def sfx_massive_mud_splat():
    """COLOSSAL WET MUD PUDDLE FACEPLANT («លាន់ឮសូរ ផ្លូក!») — heavy body thud + wet mud squelch + flying globs!"""
    n = int(1.15 * SR); t = np.arange(n, dtype=np.float32) / SR
    # 1. Deep wet puddle belly/face impact ("PLOOK!")
    f_thud = 48.0 + 130.0 * np.exp(-t * 26.0)
    thud = np.sin(2 * np.pi * np.cumsum(f_thud) / SR) * np.exp(-t * 8.5) * 0.82
    # 2. Thick resonant mud bubble ("ផ្លូក!" formant sweep 180 -> 460 -> 140 Hz)
    f_bub = 160.0 + 310.0 * np.sin(np.pi * np.clip(t / 0.16, 0, 1))
    bub = np.sin(2 * np.pi * np.cumsum(f_bub) / SR) * np.exp(-t * 11.0) * 0.62
    # 3. Wet splash spray & thick squelching mud splatters
    spray = bp_fft(rng.standard_normal(n).astype(np.float32), 320.0, 3400.0) * np.exp(-t * 5.2) * 0.52
    out = thud + bub + spray
    # 4. Secondary wet mud globs plopping back down (0.28s..0.95s)
    for td, fd in [(0.26, 340.0), (0.39, 460.0), (0.54, 290.0), (0.71, 520.0), (0.86, 380.0)]:
        m = int(0.11 * SR); tm = np.arange(m, dtype=np.float32) / SR
        plop = np.sin(2 * np.pi * np.cumsum(fd * (0.7 + 0.7 * tm / 0.11)) / SR) * np.exp(-tm * 28.0) * 0.30
        i = int(td * SR); out[i:min(n, i + m)] += plop[:min(m, n - i)]
    return out.astype(np.float32)


def sfx_mud_drip(f0=360.0):
    """Comedic thick mud drip 'bloop!' off his nose."""
    n = int(0.14 * SR); t = np.arange(n, dtype=np.float32) / SR
    f = f0 * (0.65 + 0.95 * (t / 0.14))
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 24.0) * 0.45).astype(np.float32)


def sfx_school_crowd_laughter(dur=2.25):
    """Multi-voice rhythmic high-school courtyard laughter burst («ផ្ទុះសំណើចលាន់ឮពេញអគារ!»)."""
    n = int(dur * SR); out = np.zeros(n, dtype=np.float32)
    # 6 layered student pitch voices pulsing rhythmic 'ha-ha-ha-ha!' formants (F1 ~750Hz, F2 ~1350Hz)
    voices = [210.0, 245.0, 278.0, 315.0, 355.0, 392.0]
    for v_idx, f_base in enumerate(voices):
        rate = 5.4 + 0.45 * v_idx
        offset = 0.04 * v_idx
        t = np.arange(n, dtype=np.float32) / SR
        pulse = np.maximum(0.0, np.sin(2 * np.pi * rate * np.maximum(0, t - offset))) ** 2.2
        f_inst = f_base * (1.0 - 0.12 * (t / dur) + 0.04 * np.sin(2 * np.pi * rate * t))
        ph = 2 * np.pi * np.cumsum(f_inst) / SR
        glottal = np.zeros(n, dtype=np.float32)
        for h in range(1, 10):
            glottal += (1.0 / (h ** 0.8)) * np.sin(h * ph)
        vowel_a = bp_fft(glottal, 580.0, 1650.0) + 0.45 * bp_fft(glottal, 2100.0, 3400.0)
        out += vowel_a * pulse * 0.13
    breath = bp_fft(rng.standard_normal(n).astype(np.float32), 900.0, 4200.0) * 0.10
    env = np.clip(np.arange(n) / (0.08 * SR), 0, 1) * np.clip((n - np.arange(n)) / (0.28 * SR), 0, 1)
    return ((out + breath) * env * 0.72).astype(np.float32)


def sfx_tooth_sparkle_ting():
    """Blinding cartoon silver-gold tooth-sparkle 'TING!!' («ញញឹមទាំងភក់ពេញធ្មេញ»)."""
    n = int(0.75 * SR); t = np.arange(n, dtype=np.float32) / SR
    s = (
        0.58 * np.sin(2 * np.pi * 3136.0 * t) * np.exp(-t * 5.2)
        + 0.36 * np.sin(2 * np.pi * 4698.6 * t) * np.exp(-t * 7.8)
        + 0.22 * np.sin(2 * np.pi * 6272.0 * t) * np.exp(-t * 12.0)
    )
    return (s * np.clip(t / 0.003, 0, 1) * 0.56).astype(np.float32)


def sfx_sad_excuse_trombone():
    """Comedic 'wah-wah-waaaah' plunger trombone sting after his soil-inspector excuse!"""
    out = np.zeros(int(1.15 * SR), dtype=np.float32)
    notes = [(0.0, 311.1, 293.7, 0.24), (0.25, 293.7, 277.2, 0.24), (0.50, 277.2, 233.1, 0.60)]
    for t0, fa, fb, d in notes:
        seg = wah_trombone(fa, fb, d, wah_hz=3.5)
        i = int(t0 * SR); j = min(len(out), i + len(seg))
        out[i:j] += seg[:j - i] * 1.45
    return out


def sfx_roadrunner_sprint_and_door():
    """Cartoon rapid foot-scurry + supersonic peel-out zip + restroom wooden door SLAM!"""
    n = int(2.20 * SR); out = np.zeros(n, dtype=np.float32)
    # Rapid feet scurry taps (0..0.65s)
    for k in range(11):
        tk = k * 0.056
        m = int(0.05 * SR); tm = np.arange(m, dtype=np.float32) / SR
        tap = np.sin(2 * np.pi * (240.0 + (k % 3) * 75.0) * tm) * np.exp(-tm * 55.0) * 0.42
        i = int(tk * SR); out[i:i + m] += tap
    # Supersonic zip whoosh (0.58..1.15s)
    m2 = int(0.55 * SR); t2 = np.arange(m2, dtype=np.float32) / SR
    zip_s = np.sin(2 * np.pi * np.cumsum(380.0 * (2.0 ** (2.4 * t2 / 0.55))) / SR) * np.sin(np.pi * t2 / 0.55) * 0.45
    i2 = int(0.58 * SR); out[i2:i2 + m2] += zip_s
    # Restroom wooden door SLAM at +1.82s («ចូលបន្ទប់ទឹក!»)
    m3 = int(0.32 * SR); t3 = np.arange(m3, dtype=np.float32) / SR
    slam = (
        np.sin(2 * np.pi * (82.0 + 95.0 * np.exp(-t3 * 35.0)) * t3) * np.exp(-t3 * 14.0) * 0.68
        + bp_fft(rng.standard_normal(m3).astype(np.float32), 250.0, 2600.0) * np.exp(-t3 * 28.0) * 0.52
    )
    i3 = int(1.82 * SR); out[i3:min(n, i3 + m3)] += slam[:min(m3, n - i3)]
    return out


def sfx_like_pop_chime():
    """Crisp UI Like-button pop + bright major triad chime («ចុចឡៃមួយមក...»)."""
    n = int(0.55 * SR); t = np.arange(n, dtype=np.float32) / SR
    pop = np.sin(2 * np.pi * np.cumsum(320.0 + 540.0 * np.exp(-t * 45.0)) / SR) * np.exp(-t * 32.0) * 0.48
    chime = (
        vibraphone_bell(midi(77), 0.48)[:n] * 0.55
        + vibraphone_bell(midi(81), 0.48)[:n] * 0.45
        + vibraphone_bell(midi(84), 0.48)[:n] * 0.55
    )
    return (pop + chime).astype(np.float32)


# --- Place All 22 Frame-Accurate Foley & Slapstick SFX ---
place(sfx, sfx_freeze_shutter(), 0.08, 0.82)                     # f0002 Frame-0 mid-air puddle freeze!
place(sfx, sfx_wind_whoosh(0.55, 1900.0), 2.22, 0.65)            # f0066 Bullet-time orbit around school
place(sfx, sfx_vhs_rewind(1.18), 5.82, 0.80)                     # f0175 "ត្រឡប់មកមួយនាទីមុន..." VHS rewind!
place(sfx, sfx_school_bell(), 7.10, 0.72)                        # f0213 "ដល់ម៉ោងចេញលេងនៅវិទ្យាល័យ" Recess bell!
place(sfx, sfx_heartbeat_shimmer(), 8.85, 0.78)                  # f0265 "ឃើញមនុស្សដែលអ្នកលួចស្រឡាញ់"
place(sfx, sfx_heartbeat_shimmer(), 10.65, 0.62)                 # f0320 Sparkling Crush reveal outside classroom
place(sfx, sfx_comb_zip(), 14.55, 0.78)                          # f0436 "ប្រញាប់សិតសក់" Comb slick!
place(sfx, sfx_collar_snap(), 15.08, 0.85)                       # f0452 "សារ៉េកអាវស" Collar POP!
place(sfx, sfx_wind_whoosh(0.75, 1450.0), 16.08, 0.65)           # f0482 Slow-mo dramatic hair wind!
place(sfx, sfx_heart_pop(360.0), 18.95, 0.72)                    # f0568 Heart-eyes pop #1
place(sfx, sfx_heart_pop(440.0), 20.80, 0.75)                    # f0624 Giant hearts block ground ahead!
place(sfx, sfx_heart_pop(520.0), 21.65, 0.70)                    # f0649 Heart blindfold pop #3
place(sfx, sfx_banana_slip_whistle(), 25.58, 0.88)               # f0767 "រអិលបះជើងឡើងលើ!" Banana slip + slide whistle!
place(sfx, sfx_falling_dive_whistle(0.82), 27.95, 0.78)          # f0838 Falling dive toward mud puddle
place(sfx, sfx_massive_mud_splat(), 29.10, 0.96)                 # f0873 "ផ្លូក!" COLOSSAL MUD PUDDLE SPLAT!
place(sfx, sfx_mud_drip(350.0), 30.40, 0.75)                     # f0912 Mud dripping off nose #1
place(sfx, sfx_mud_drip(410.0), 31.32, 0.75)                     # f0940 Mud dripping off nose #2
place(sfx, sfx_school_crowd_laughter(2.25), 33.80, 0.88)         # f1014 "ផ្ទុះសំណើចលាន់ឮពេញអគារ!" Whole school laughs!
place(sfx, sfx_mud_drip(310.0), 37.90, 0.68)                     # f1137 Squelchy stand-up mud drip
place(sfx, sfx_tooth_sparkle_ting(), 39.48, 0.86)                # f1184 "ញញឹមទាំងភក់ពេញធ្មេញ!" Sparkle tooth TING!
place(sfx, sfx_sad_excuse_trombone(), 43.45, 0.82)               # f1303 "ពិនិត្យមើលដីបន្តិច!" Sad-funny wah-wah!
place(sfx, sfx_roadrunner_sprint_and_door(), 45.45, 0.88)        # f1363 "រត់បាតជើងសព្រាតចូលបន្ទប់ទឹក!" Sprint + door slam!
place(sfx, sfx_like_pop_chime(), 51.90, 0.84)                    # f1557 "ចុចឡៃមួយមក..." Like button pop!
place(sfx, sfx_banana_slip_whistle(), 53.95, 0.80)               # f1618 Loop replay banana slip!
place(sfx, sfx_freeze_shutter(), 55.45, 0.80)                    # f1663 "អ្នកក៏..." Seamless loop match-cut freeze!


# ==============================================================================
# 4. STRICT -6.0 dB MUSIC & <= -6.0 dB SFX MASTERING
# ==============================================================================
if __name__ == "__main__":
    voice = load_voice("voice.mp3", N, SR)
    master_mix(
        voice=voice,
        music=music,
        sfx=sfx,
        out_wav="mix_raw.wav",
        sr=SR,
        music_rel_db=-6.0,
        sfx_max_rel_db=-6.0,
        sfx_max_peak_ratio=0.70,
    )
