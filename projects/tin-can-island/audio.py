"""Synthesized Pacific island marimba/ukulele score + scene-synced SFX for 'Tin Can Island',
mastered with audio_mix.py (-6.0 dB music, <= -6.0 dB SFX, peaks <= 0.7x voice peak)."""
import numpy as np
from audio_mix import SR, load_voice, master_mix

DUR = 1509 / 30.0
N = int(round(DUR * SR))
rng = np.random.default_rng(42)


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


# ---------------- Pacific Island + 1930s Adventure Music Bed ----------------
def marimba(freq, dur=0.45):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = (
        np.sin(2 * np.pi * freq * t) * np.exp(-t * 7.5)
        + 0.35 * np.sin(2 * np.pi * freq * 4.0 * t) * np.exp(-t * 28.0)
        + 0.12 * np.sin(2 * np.pi * freq * 9.2 * t) * np.exp(-t * 50.0)
    )
    atk = np.minimum(1.0, t / 0.004)
    return (s * atk).astype(np.float32)


def uke_strum(freqs, dur=0.55):
    n = int(dur * SR)
    out = np.zeros(n, np.float32)
    for k, freq in enumerate(freqs):
        off = int(k * 0.014 * SR)
        m = n - off
        if m <= 0:
            continue
        t = np.arange(m) / SR
        s = sum((0.55 ** h) * np.sin(2 * np.pi * freq * (h + 1) * t) / (h + 1) for h in range(5))
        env = np.minimum(1.0, t / 0.004) * np.exp(-t * 4.8)
        out[off:] += (s * env).astype(np.float32) * 0.32
    return lp_fast(out, 3600)


def island_drum(kind="low"):
    if kind == "low":
        n = int(0.28 * SR); t = np.arange(n) / SR
        f = 68 + 65 * np.exp(-t * 26)
        return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 10)).astype(np.float32)
    n = int(0.11 * SR); t = np.arange(n) / SR
    shaker = hp_fast(rng.standard_normal(n).astype(np.float32), 4500) * np.exp(-t * 34) * 0.35
    wood = np.sin(2 * np.pi * 520 * t) * np.exp(-t * 40) * 0.25
    return (shaker + wood).astype(np.float32)


def warm_brass(freqs, dur):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n, np.float32)
    for freq in freqs:
        ph = 2 * np.pi * freq * t + 0.0025 * np.sin(2 * np.pi * 5.2 * t)
        s += sum(np.sin((k + 1) * ph) / (k + 1) ** 1.35 for k in range(7)).astype(np.float32)
    env = np.minimum(1.0, t / 0.07) * np.clip((dur - t) / 0.14, 0, 1)
    return lp_fast(s * env, 2100) / max(1, len(freqs))


music = np.zeros(N, np.float32)
BPM = 112.0
beat = 60.0 / BPM
# Bright sunny tropical C - G - Am - F progression
prog = [
    (48, [60, 64, 67, 72]),  # C
    (43, [59, 62, 67, 71]),  # G
    (45, [57, 60, 64, 69]),  # Am
    (41, [57, 60, 65, 69]),  # F
]

bar = 0
tt = 0.0
while tt < DUR - 0.5:
    root, ch = prog[bar % 4]
    # Pause beat briefly right before "No dock. No boat." (29.8-31.5s) and "Tin Can Island." (44.3-44.7s) for comedic punch!
    tucked = (29.7 <= tt <= 31.6) or (44.2 <= tt <= 44.8)
    g_scale = 0.25 if tucked else (1.15 if tt >= 37.0 else 0.95)

    # Warm bass pulse + sunny ukulele strums on off-beats
    for b in range(4):
        tb = tt + b * beat
        if tb >= DUR - 0.3:
            break
        if b in (0, 2):
            place(music, marimba(midi(root + 12), 0.5), tb, 0.34 * g_scale)
            place(music, island_drum("low"), tb, 0.36 * g_scale)
        else:
            place(music, island_drum("shaker"), tb, 0.28 * g_scale)
        if b in (0, 1, 2, 3):
            place(music, uke_strum([midi(m) for m in ch], 0.45), tb + (0.0 if b == 0 else beat * 0.5), 0.26 * g_scale)
        # Playful marimba melody notes
        mel_m = ch[(b + bar) % len(ch)] + (12 if tt >= 37.0 else 0)
        place(music, marimba(midi(mel_m), 0.38), tb, 0.22 * g_scale)

    # Celebratory vintage brass lift from "Then the world noticed" (37s) to the famous Post Office finale!
    if tt >= 37.0 and bar % 2 == 0:
        place(music, warm_brass([midi(m) for m in ch[:3]], beat * 3.8), tt, 0.14)
    bar += 1
    tt += beat * 4

# Warm final resolving C-major chord on the finale
place(music, warm_brass([midi(60), midi(64), midi(67), midi(72)], 2.2), 47.8, 0.18)
place(music, uke_strum([midi(60), midi(64), midi(67), midi(72)], 1.6), 48.2, 0.36)


# ---------------- Scene-Synced Maritime & Postal SFX ----------------
sfx = np.zeros(N, np.float32)
noise = lambda d: rng.standard_normal(int(round(d * SR))).astype(np.float32)


def ocean_bed(d):
    n = int(round(d * SR)); t = np.arange(n) / SR
    swell = 0.55 + 0.45 * np.sin(2 * np.pi * 0.28 * t) ** 2
    s = lp_fast(noise(d), 850) * 0.55 + hp_fast(lp_fast(noise(d), 3200), 1100) * 0.22 * swell
    fade = np.minimum(1, t / 0.4) * np.clip((d - t) / 0.4, 0, 1)
    return (s * swell * fade).astype(np.float32)


def splash(d=0.9, big=1.0):
    n = int(round(d * SR)); t = np.arange(n) / SR
    hi = hp_fast(lp_fast(noise(d), 4500), 600) * np.exp(-t * 4.5) * np.minimum(1, t / 0.015)
    lo = lp_fast(noise(d), 380) * np.exp(-t * 8.0) * 1.4
    return ((hi + lo) * big).astype(np.float32)


def ship_horn(d=1.35):
    n = int(round(d * SR)); t = np.arange(n) / SR
    f1, f2 = 138.0, 174.0  # Classic warm twin-tone steamship horn
    s = (
        np.sin(2 * np.pi * f1 * t) + 0.55 * np.sin(2 * np.pi * f1 * 2 * t) + 0.25 * np.sin(2 * np.pi * f1 * 3 * t)
        + 0.75 * np.sin(2 * np.pi * f2 * t) + 0.35 * np.sin(2 * np.pi * f2 * 2 * t)
    )
    env = np.minimum(1, t / 0.08) * np.clip((d - t) / 0.22, 0, 1)
    return lp_fast((s * env).astype(np.float32), 1100) * 0.28


def pulley_creak(d=1.4):
    n = int(round(d * SR)); t = np.arange(n) / SR
    rate = 130 + 35 * np.sin(2 * np.pi * 2.1 * t)
    pulses = (np.mod(np.cumsum(rate) / SR, 1.0) < 0.09).astype(np.float32)
    s = hp_fast(lp_fast(pulses, 1800), 260) * np.sin(np.pi * t / d)
    return (s * 0.7).astype(np.float32)


def tin_clank():
    d = 0.45; n = int(round(d * SR)); t = np.arange(n) / SR
    ring = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(620, 11), (1180, 14), (1960, 18), (2840, 22)])
    hit = lp_fast(noise(d), 1400) * np.exp(-t * 40) * 0.6
    return (ring * 0.28 + hit).astype(np.float32)


def whoosh(d=0.45):
    n = int(round(d * SR)); t = np.arange(n) / SR
    return (lp_fast(noise(d), 1700) * np.sin(np.pi * t / d) ** 2 * 0.65).astype(np.float32)


def pop_thump(f0=110.0, d=0.28):
    n = int(round(d * SR)); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f0 * t * (1 + 0.8 * np.exp(-t * 32))) * np.exp(-t * 14)
    click = lp_fast(noise(d), 1500) * np.exp(-t * 42) * 0.65
    return (s + click).astype(np.float32)


def paper_flip():
    d = 0.16; n = int(round(d * SR)); t = np.arange(n) / SR
    return (hp_fast(lp_fast(noise(d), 5200), 1400) * np.sin(np.pi * t / d) * 0.55).astype(np.float32)


def chime_sparkle():
    d = 0.9; n = int(round(d * SR)); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * midi(m) * t) * np.exp(-t * (5 + k)) for k, m in enumerate([72, 76, 79, 84]))
    return (s * 0.22).astype(np.float32)


F = lambda f: f / 30.0

# Continuous gentle tropical surf ambience on ocean shots
place(sfx, ocean_bed(18.5), 0.0, 0.22)
place(sfx, ocean_bed(11.5), 22.8, 0.24)
place(sfx, ocean_bed(4.2), 46.1, 0.20)

# Beat-synced action SFX
place(sfx, splash(0.6, 0.7), F(70), 0.65)        # mailman swimming strokes
place(sfx, splash(0.65, 0.85), F(96), 0.75)      # "swim!" splash
place(sfx, splash(1.1, 1.1), F(244), 0.85)       # huge rough surf crashing on rocks
place(sfx, ship_horn(1.35), F(298), 0.80)        # steamship appears!
place(sfx, splash(0.55, 0.6), F(360), 0.55)      # paddling out
place(sfx, splash(0.55, 0.6), F(390), 0.55)
place(sfx, pulley_creak(1.6), F(505), 0.70)      # bucket hauled up hull
place(sfx, tin_clank(), F(656), 0.90)            # biscuit tin lid sealed shut!
place(sfx, whoosh(0.55), F(684), 0.70)           # biscuit tin thrown in arc
place(sfx, splash(1.15, 1.25), F(712), 1.00)     # BIG ocean splash!
place(sfx, splash(0.75, 0.85), F(756), 0.75)     # fighting choppy waves
place(sfx, tin_clank(), F(796), 0.75)            # grabbing floating tin
place(sfx, splash(0.6, 0.65), F(848), 0.60)      # pushing tin back to shore
place(sfx, pop_thump(95, 0.28), F(899), 0.90)    # "No dock." X slam
place(sfx, pop_thump(82, 0.28), F(925), 0.90)    # "No boat." X slam
place(sfx, chime_sparkle(), F(960), 0.70)        # triumphant swimmer & tin
for k in range(4):
    place(sfx, paper_flip(), F(1048 + k * 15), 0.75)  # calendar pages flipping across months
place(sfx, whoosh(0.5), F(1115), 0.65)           # cut to World Map
place(sfx, chime_sparkle(), F(1135), 0.65)       # golden mail routes radiating out
place(sfx, pop_thump(72, 0.38), F(1342), 1.00)   # HEAVY rubber stamp SLAM on "Tin Can Island!"
place(sfx, chime_sparkle(), F(1354), 0.80)       # postmark sparkle reveal
place(sfx, chime_sparkle(), F(1405), 0.70)       # famous Post Office finale

voice = load_voice("voice.mp3", N, SR)
master_mix(voice, music, sfx, out_wav="mix_raw.wav", sr=SR, music_rel_db=-6.0, sfx_max_rel_db=-6.0, sfx_max_peak_ratio=0.70)
