"""Synthesized Playful Cambodian Folk Comedy Score (Roneat Ek bamboo xylophone,
Skor Dai hand drums, Chhing bronze cymbals, Kong Vong gongs, Tro Sau fiddle)
+ Frame-Synced Comedic SFX for 'khmer-lazy-brother' (44.90s, 1347 frames).
Mastered strictly via audio_mix.py (-6.0 dB music, <= -6.0 dB SFX, peaks <= 0.70x voice peak)."""
import numpy as np
from audio_mix import SR, load_voice, master_mix

DUR = 1347 / 30.0
N = int(round(DUR * SR))
rng = np.random.default_rng(20261127)


def lp_fast(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, len(x)).astype(np.float32)


def hp_fast(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 - 1 / (1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, len(x)).astype(np.float32)


def place(buf, sig, t0, gain=1.0):
    i = int(round(t0 * SR))
    j = min(N, i + len(sig))
    if i < N and j > i:
        buf[i:j] += sig[: j - i] * gain


midi = lambda m: 440.0 * 2.0 ** ((m - 69) / 12.0)


# ---------------- Traditional Khmer Folk Comedy Instruments ----------------
def roneat_ek(freq, dur=0.34):
    """Bright playful Cambodian hardwood/bamboo xylophone (រនាតឯក)."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = (
        np.sin(2 * np.pi * freq * t) * np.exp(-t * 8.8)
        + 0.38 * np.sin(2 * np.pi * freq * 3.01 * t) * np.exp(-t * 24.0)
        + 0.14 * np.sin(2 * np.pi * freq * 5.95 * t) * np.exp(-t * 42.0)
    )
    atk = np.minimum(1.0, t / 0.003)
    return (s * atk).astype(np.float32)


def kong_gong(freq, dur=1.25):
    """Warm bronze Khmer gong (គងវង់)."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = (
        np.sin(2 * np.pi * freq * t) * np.exp(-t * 2.5)
        + 0.34 * np.sin(2 * np.pi * freq * 2.0 * t) * np.exp(-t * 3.9)
        + 0.16 * np.sin(2 * np.pi * freq * 2.98 * t) * np.exp(-t * 5.8)
    )
    atk = np.minimum(1.0, t / 0.015) * np.clip((dur - t) / 0.12, 0, 1)
    return lp_fast((s * atk).astype(np.float32), 2600)


def skor_drum(kind="low"):
    """Cambodian Skor Dai hand drum + Chhing bronze cymbal."""
    if kind == "low":
        n = int(0.26 * SR); t = np.arange(n) / SR
        f = 80 + 62 * np.exp(-t * 26)
        return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 10.5)).astype(np.float32)
    if kind == "chhing":
        n = int(0.14 * SR); t = np.arange(n) / SR
        ring = (np.sin(2 * np.pi * 3560 * t) + 0.52 * np.sin(2 * np.pi * 5340 * t)) * np.exp(-t * 26)
        return (ring * 0.16).astype(np.float32)
    n = int(0.12 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 250 * t) * np.exp(-t * 28) * 0.42).astype(np.float32)


# ---------------- Build 44.90s Bouncy Khmer Sibling Comedy Score ----------------
music = np.zeros(N, np.float32)
BPM = 116.0
beat = 60.0 / BPM

# Playful G-pentatonic / C-pentatonic Cambodian village comedy progression
prog = [
    (55, [67, 69, 71, 74, 76]),  # G major pentatonic (G A B D E)
    (52, [64, 67, 71, 74, 79]),  # Em7 playful bounce
    (48, [60, 62, 67, 71, 74]),  # C cheerful lift
    (50, [62, 67, 69, 74, 78]),  # D bright turnaround
]

bar = 0
tt = 0.0
while tt < DUR - 0.45:
    root, scale = prog[bar % 4]
    # Brief comedic hush right as Younger Bro stares at the remote 10cm from Brother's elbow (25.5s-27.2s)
    deadpan_pause = (25.5 <= tt <= 27.1)
    panic_run = (21.8 <= tt < 24.3)
    royal_beat = (9.4 <= tt <= 11.0) or (35.2 <= tt <= 37.3)
    g_scale = 0.18 if deadpan_pause else (1.18 if panic_run else (1.08 if royal_beat else 0.96))

    for b in range(4):
        tb = tt + b * beat
        if tb >= DUR - 0.35:
            break
        if deadpan_pause and b in (1, 2, 3):
            continue
        if b in (0, 2):
            place(music, kong_gong(midi(root), 0.75), tb, 0.24 * g_scale)
            place(music, skor_drum("low"), tb, 0.33 * g_scale)
        else:
            place(music, skor_drum("tap"), tb, 0.25 * g_scale)
            place(music, skor_drum("chhing"), tb, 0.20 * g_scale)

        note = scale[(b * 2 + bar) % len(scale)]
        place(music, roneat_ek(midi(note), 0.32), tb, 0.31 * g_scale)
        if b in (1, 3) or panic_run:
            sub_note = scale[(b + bar + 2) % len(scale)] + 12
            place(music, roneat_ek(midi(sub_note), 0.22), tb + beat * 0.5, 0.19 * g_scale)

    bar += 1
    tt += beat * 4

# Bright final Khmer Roneat + Gong cadence at 44.1s
place(music, kong_gong(midi(55), 0.75), 44.05, 0.32)
place(music, roneat_ek(midi(79), 0.65), 44.10, 0.30)


# ---------------- Scene-Synced Comedic & Action SFX ----------------
sfx = np.zeros(N, np.float32)
noise = lambda d: rng.standard_normal(int(round(d * SR))).astype(np.float32)


def bongo_sprint(d=1.5):
    """Rapid cartoon bongo-scamper footsteps + breeze whoosh!"""
    n = int(round(d * SR)); t = np.arange(n) / SR
    out = np.zeros(n, np.float32)
    steps = int(d / 0.10)
    for k in range(steps):
        idx = int(k * 0.10 * SR)
        ln = min(int(0.075 * SR), n - idx)
        if ln > 0:
            ts = np.arange(ln) / SR
            f0 = 255 + (k % 2) * 95
            out[idx : idx + ln] += np.sin(2 * np.pi * f0 * ts) * np.exp(-ts * 34) * 0.54
    wh = lp_fast(noise(d), 1650) * np.sin(np.pi * t / d) ** 2 * 0.32
    return (out + wh).astype(np.float32)


def ruler_pop():
    """Crisp wooden ruler snap + bright 10cm chime!"""
    d = 0.45; n = int(round(d * SR)); t = np.arange(n) / SR
    pop = np.sin(2 * np.pi * (480 + 380 * np.exp(-t * 35)) * t) * np.exp(-t * 18) * 0.55
    ding = np.sin(2 * np.pi * midi(84) * t) * np.exp(-t * 8.5) * 0.35
    return (pop + ding).astype(np.float32)


def royal_fanfare():
    """Majestic golden Khmer gong + brassy fifth flourish for «អំណាចស្តេច!» & «អញជាបង!»"""
    d = 1.05; n = int(round(d * SR)); t = np.arange(n) / SR
    chord = (
        np.sin(2 * np.pi * midi(67) * t)
        + 0.75 * np.sin(2 * np.pi * midi(74) * t)
        + 0.60 * np.sin(2 * np.pi * midi(79) * t)
    ) * np.minimum(1.0, t / 0.02) * np.exp(-t * 3.2) * 0.28
    gong = kong_gong(midi(43), d) * 0.45
    return (chord + gong[:n]).astype(np.float32)


def buzzer_nope():
    """Comedic 'nope / refuses to get up' two-tone thud."""
    d = 0.48; n = int(round(d * SR)); t = np.arange(n) / SR
    f = np.where(t < 0.20, 195.0, 145.0)
    s = (np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.4 * np.sin(4 * np.pi * np.cumsum(f) / SR)) * np.exp(-t * 5.5) * 0.48
    return lp_fast(s.astype(np.float32), 950)


def megaphone_roar(d=0.85):
    """Booming village-echoing shout whoosh + shockwave ring!"""
    n = int(round(d * SR)); t = np.arange(n) / SR
    wh = lp_fast(noise(d), 1900) * np.sin(np.pi * t / d) ** 1.8 * 0.58
    boom = np.sin(2 * np.pi * (140 * np.exp(-t * 6) + 55) * t) * np.exp(-t * 5.0) * 0.45
    return (wh + boom).astype(np.float32)


def emergency_siren(d=1.25):
    """Playful cartoon two-pitch emergency siren for «អាសន្នធំណាស់អ៊ីចឹង!»"""
    n = int(round(d * SR)); t = np.arange(n) / SR
    f = 740 + 220 * np.sin(2 * np.pi * 3.2 * t)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * 0.34
    return lp_fast(s.astype(np.float32), 2400)


def panic_boing():
    """Upward cartoon spring jump when Younger Bro panics in the backyard!"""
    d = 0.55; n = int(round(d * SR)); t = np.arange(n) / SR
    f = 240 + 480 * np.minimum(1.0, t / 0.32) + 28 * np.sin(2 * np.pi * 22 * t)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5.2) * 0.58).astype(np.float32)


def remote_click():
    """Crisp plastic TV remote button click + channel zap!"""
    d = 0.26; n = int(round(d * SR)); t = np.arange(n) / SR
    clk = hp_fast(lp_fast(noise(0.03), 4800), 1200) * np.exp(-np.arange(int(round(0.03 * SR))) / SR * 90) * 0.75
    zap = np.sin(2 * np.pi * (620 + 680 * t / d) * t) * np.exp(-t * 14) * 0.38
    zap[: len(clk)] += clk
    return zap.astype(np.float32)


def sour_trombone():
    """Funny sliding downward 'wah-wah' sad slide for ទឹកមុខជូរហួញដដែល!"""
    d = 0.92; n = int(round(d * SR)); t = np.arange(n) / SR
    f = 330 - 135 * (t / d) + 10 * np.sin(2 * np.pi * 12 * t)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph)) * np.sin(np.pi * t / d) ** 0.7 * 0.38
    return lp_fast(s.astype(np.float32), 1400)


def sparkle_chime(d=0.85):
    n = int(round(d * SR)); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * midi(m) * t) * np.exp(-t * (4.8 + k)) for k, m in enumerate([74, 79, 83, 86]))
    return (s * 0.22).astype(np.float32)


F = lambda fr: fr / 30.0

# Frame-accurate comedic SFX placement across all 26 shots!
place(sfx, bongo_sprint(1.6), F(4), 0.78)            # Shot 1: Hook sweat sprint
place(sfx, ruler_pop(), F(110), 0.85)                # Shot 3: "10 cm!" yellow ruler pop
place(sfx, royal_fanfare(), F(294), 0.85)            # Shot 6: «តែវាជាអំណាចស្តេច!» King Bong reveal
place(sfx, buzzer_nope(), F(428), 0.80)              # Shot 9: «ដាច់ខាតមិនងើបខ្លួនឯងឡើយ!»
place(sfx, megaphone_roar(0.9), F(502), 0.86)        # Shot 10-11: Village-wide scream shockwave
place(sfx, emergency_siren(1.2), F(568), 0.75)       # Shot 12: «ហាក់ដូចមានអាសន្នធំណាស់អ៊ីចឹង!»
place(sfx, panic_boing(), F(660), 0.88)              # Shot 14: Backyard panic jump!
place(sfx, bongo_sprint(1.4), F(688), 0.82)          # Shot 15: Breathless sprint to salon
place(sfx, ruler_pop(), F(849), 0.84)                # Shot 18: «តែមួយចំអាមប៉ុណ្ណោះ!» caliper pop
place(sfx, sparkle_chime(0.75), F(924), 0.75)        # Shot 20: «ហុចតេឡេឲ្យបងបន្តិចមើល៍!»
place(sfx, royal_fanfare(), F(1069), 0.88)           # Shot 23: «អញជាបង អញប្រើហ្អែងបាន!» royal slam
place(sfx, remote_click(), F(1162), 0.85)            # Shot 24: Older Bro clicks TV remote -> channel zap!
place(sfx, sour_trombone(), F(1169), 0.86)           # Shot 24: «ទាំងទឹកមុខជូរហួញដដែល!» sour face!
place(sfx, sparkle_chime(0.90), F(1295), 0.80)       # Shot 26: Like & Comment CTA chime!

voice = load_voice("voice.mp3", N, SR)
master_mix(voice, music, sfx, out_wav="mix_raw.wav", sr=SR, music_rel_db=-6.0, sfx_max_rel_db=-6.0, sfx_max_peak_ratio=0.70)
