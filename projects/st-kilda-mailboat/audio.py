"""Synthesized Scottish Hebridean Celtic harp/whistle/bodhran maritime score + scene-synced SFX
for 'St Kilda: The Ocean Post Office', mastered strictly via audio_mix.py
(-6.0 dB music, <= -6.0 dB SFX, peaks <= 0.7x voice peak)."""
import numpy as np
from audio_mix import SR, load_voice, master_mix

DUR = 1410 / 30.0
N = int(round(DUR * SR))
rng = np.random.default_rng(1876)  # Year of historic St Kilda mailboats!


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


# ---------------- Scottish Hebridean Celtic Folk Instruments ----------------
def celtic_harp(freq, dur=1.25):
    """Warm plucked Celtic harp string with rich fundamental & silky decay."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = (
        1.00 * np.sin(2 * np.pi * freq * t) * np.exp(-t * 2.8)
        + 0.42 * np.sin(2 * np.pi * freq * 2.0 * t) * np.exp(-t * 5.2)
        + 0.16 * np.sin(2 * np.pi * freq * 3.0 * t) * np.exp(-t * 9.5)
        + 0.06 * np.sin(2 * np.pi * freq * 4.0 * t) * np.exp(-t * 15.0)
    )
    atk = np.minimum(1.0, t / 0.005)
    return lp_fast((s * atk).astype(np.float32), 3800)


def tin_whistle(freq, dur=0.85):
    """Airy, expressive Scottish Highland penny whistle with gentle vibrato."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    vib = 0.0045 * np.sin(2 * np.pi * 5.4 * t) * np.minimum(1.0, t / 0.18)
    ph = 2 * np.pi * freq * (t + vib / (2 * np.pi))
    s = (
        np.sin(ph)
        + 0.24 * np.sin(2 * ph)
        + 0.08 * np.sin(3 * ph)
    )
    breath = hp_fast(lp_fast(rng.standard_normal(n).astype(np.float32), 4200), 1600) * 0.06
    env = np.minimum(1.0, t / 0.045) * np.clip((dur - t) / 0.12, 0, 1)
    return lp_fast(((s + breath) * env).astype(np.float32), 3200) * 0.42


def bodhran(kind="low"):
    """Traditional Scottish/Celtic goatskin frame drum."""
    if kind == "low":
        n = int(0.32 * SR); t = np.arange(n) / SR
        f = 72 + 48 * np.exp(-t * 22)
        return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9.5)).astype(np.float32)
    n = int(0.14 * SR); t = np.arange(n) / SR
    rim = hp_fast(lp_fast(rng.standard_normal(n).astype(np.float32), 3200), 900) * np.exp(-t * 28) * 0.35
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 24) * 0.35
    return (rim + tone).astype(np.float32)


def warm_strings(freqs, dur):
    """Warm Celtic fiddle/cello ensemble pad for emotional & heroic lifts."""
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n, np.float32)
    for idx, freq in enumerate(freqs):
        ph = 2 * np.pi * freq * t + 0.003 * np.sin(2 * np.pi * (4.6 + idx * 0.3) * t)
        s += sum(np.sin((k + 1) * ph) / (k + 1) ** 1.45 for k in range(6)).astype(np.float32)
    env = np.minimum(1.0, t / 0.18) * np.clip((dur - t) / 0.28, 0, 1)
    return lp_fast(s * env, 1950) / max(1, len(freqs))


music = np.zeros(N, np.float32)
BPM = 96.0
beat = 60.0 / BPM

# Act 1 (0-19.8s): Haunted windswept D Dorian (Dm - C - G - Am)
prog_dorian = [
    (50, [62, 65, 69, 74]),  # Dm
    (48, [60, 64, 67, 72]),  # C
    (43, [59, 62, 67, 71]),  # G
    (45, [57, 60, 64, 69]),  # Am
]
# Act 2-3 (20-47s): Hopeful resilient D Major Celtic sea theme (D - A - Bm - G)
prog_major = [
    (50, [62, 66, 69, 74]),  # D
    (45, [61, 64, 69, 73]),  # A
    (47, [59, 62, 66, 71]),  # Bm
    (43, [59, 62, 67, 71]),  # G
]

whistle_dorian = [74, 72, 69, 71, 74, 76, 74, 69]
whistle_major  = [74, 76, 78, 81, 78, 76, 74, 71]

bar = 0
tt = 0.0
while tt < DUR - 0.6:
    is_hopeful = tt >= 20.0
    prog = prog_major if is_hopeful else prog_dorian
    root, ch = prog[bar % 4]

    # Tuck music right on "No radio. No telephone. No ship in sight." (16.1-19.7s) for punchy SFX impact!
    tucked = (16.0 <= tt <= 19.8)
    g_scale = 0.24 if tucked else (1.14 if tt >= 36.5 else 0.96)

    # Celtic harp rolling arpeggio + soft bodhran maritime pulse
    for b in range(4):
        tb = tt + b * beat
        if tb >= DUR - 0.4:
            break
        if b == 0:
            place(music, celtic_harp(midi(root), 1.6), tb, 0.46 * g_scale)
            place(music, bodhran("low"), tb, 0.36 * g_scale)
        elif b == 2:
            place(music, celtic_harp(midi(root + 12), 1.1), tb, 0.30 * g_scale)
            place(music, bodhran("low"), tb, 0.26 * g_scale)
        else:
            place(music, bodhran("rim"), tb, 0.20 * g_scale)

        # Flowing eighth-note harp arpeggios
        n1 = ch[b % len(ch)]
        n2 = ch[(b + 1) % len(ch)]
        place(music, celtic_harp(midi(n1), 0.95), tb, 0.28 * g_scale)
        if tb + beat * 0.5 < DUR - 0.3:
            place(music, celtic_harp(midi(n2), 0.75), tb + beat * 0.5, 0.21 * g_scale)

    # Airy Highland tin-whistle phrases on expressive beats
    if not tucked and (bar % 2 == 0 or tt >= 36.5):
        mel = whistle_major if is_hopeful else whistle_dorian
        m_note = mel[bar % len(mel)]
        place(music, tin_whistle(midi(m_note), beat * 1.8), tt + beat * 0.5, 0.22 * g_scale)
        if tt + beat * 2.5 < DUR - 0.8:
            m_next = mel[(bar + 1) % len(mel)]
            place(music, tin_whistle(midi(m_next), beat * 1.4), tt + beat * 2.5, 0.18 * g_scale)

    # Warm Celtic strings swell on opening, ocean drift, and grand finale!
    if (tt < 7.5 or tt >= 31.0) and not tucked:
        place(music, warm_strings([midi(m) for m in ch[:3]], beat * 3.9), tt, 0.16 * g_scale)

    bar += 1
    tt += beat * 4

# Poignant resolving D-Major chord & harp flourish on "Their only post office was the sea."
place(music, warm_strings([midi(50), midi(62), midi(66), midi(69), midi(74)], 2.8), 44.0, 0.22)
for k, note in enumerate([50, 62, 66, 69, 74]):
    place(music, celtic_harp(midi(note), 2.2), 44.3 + k * 0.11, 0.30)


# ---------------- Scene-Synced North Atlantic & Crafting SFX ----------------
sfx = np.zeros(N, np.float32)
noise = lambda d: rng.standard_normal(int(round(d * SR))).astype(np.float32)


def atlantic_surf(d, wind=0.35):
    n = int(round(d * SR)); t = np.arange(n) / SR
    swell = 0.52 + 0.48 * np.sin(2 * np.pi * 0.24 * t) ** 2
    surf = lp_fast(noise(d), 780) * 0.52 + hp_fast(lp_fast(noise(d), 2800), 950) * 0.20 * swell
    gale = hp_fast(lp_fast(noise(d), 1400), 380) * wind * (0.6 + 0.4 * np.sin(2 * np.pi * 0.35 * t))
    fade = np.minimum(1, t / 0.35) * np.clip((d - t) / 0.35, 0, 1)
    return ((surf * swell + gale) * fade).astype(np.float32)


def splash(d=0.95, big=1.0):
    n = int(round(d * SR)); t = np.arange(n) / SR
    hi = hp_fast(lp_fast(noise(d), 4600), 620) * np.exp(-t * 4.4) * np.minimum(1, t / 0.015)
    lo = lp_fast(noise(d), 360) * np.exp(-t * 7.8) * 1.35
    return ((hi + lo) * big).astype(np.float32)


def paper_flip():
    d = 0.14; n = int(round(d * SR)); t = np.arange(n) / SR
    return (hp_fast(lp_fast(noise(d), 5000), 1400) * np.sin(np.pi * t / d) * 0.55).astype(np.float32)


def pop_thump(f0=102.0, d=0.26):
    n = int(round(d * SR)); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f0 * t * (1 + 0.85 * np.exp(-t * 32))) * np.exp(-t * 14)
    click = lp_fast(noise(d), 1500) * np.exp(-t * 42) * 0.65
    return (s + click).astype(np.float32)


def wood_carve():
    d = 0.28; n = int(round(d * SR)); t = np.arange(n) / SR
    scrape = hp_fast(lp_fast(noise(d), 3400), 900) * np.sin(np.pi * t / d) * 0.55
    knock = np.sin(2 * np.pi * 340 * t) * np.exp(-t * 28) * 0.32
    return (scrape + knock).astype(np.float32)


def wood_lid_slam():
    d = 0.36; n = int(round(d * SR)); t = np.arange(n) / SR
    body = (np.sin(2 * np.pi * 165 * t) + 0.5 * np.sin(2 * np.pi * 310 * t)) * np.exp(-t * 16)
    crack = lp_fast(noise(d), 2200) * np.exp(-t * 38) * 0.75
    return (body * 0.75 + crack).astype(np.float32)


def rope_tie():
    d = 0.42; n = int(round(d * SR)); t = np.arange(n) / SR
    s = hp_fast(lp_fast(noise(d), 2400), 600) * (np.sin(np.pi * t / d) ** 2) * (0.6 + 0.4 * np.sin(2 * np.pi * 16 * t))
    return (s * 0.65).astype(np.float32)


def whoosh(d=0.45):
    n = int(round(d * SR)); t = np.arange(n) / SR
    return (lp_fast(noise(d), 1700) * (np.sin(np.pi * t / d) ** 2) * 0.65).astype(np.float32)


def seagull():
    d = 0.62; n = int(round(d * SR)); t = np.arange(n) / SR
    freq = 1520 - 440 * (t / d) ** 1.3 + 90 * np.sin(2 * np.pi * 9 * t)
    s = np.sin(2 * np.pi * np.cumsum(freq) / SR) + 0.25 * np.sin(4 * np.pi * np.cumsum(freq) / SR)
    env = np.minimum(1, t / 0.04) * np.exp(-t * 3.8)
    return (s * env * 0.22).astype(np.float32)


def chime_warm():
    d = 0.9; n = int(round(d * SR)); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * midi(m) * t) * np.exp(-t * (4.5 + k)) for k, m in enumerate([74, 78, 81, 86]))
    return (s * 0.22).astype(np.float32)


F = lambda f: f / 30.0

# Continuous atmospheric North Atlantic surf & wind beds on coastal/ocean scenes
place(sfx, atlantic_surf(4.3, 0.28), 0.0, 0.22)       # St Kilda intro
place(sfx, atlantic_surf(12.2, 0.52), 7.5, 0.28)      # 9-month storm & cliff overlook
place(sfx, atlantic_surf(3.5, 0.30), 27.8, 0.24)      # Cliff launch & hope
place(sfx, atlantic_surf(13.6, 0.32), 33.2, 0.24)     # Open ocean drift -> Scotland -> Norway -> Finale

# Beat-synced action SFX
place(sfx, seagull(), F(18), 0.45)                    # North Atlantic gull in opening aerial
place(sfx, whoosh(0.45), F(130), 0.55)                # Cut to North Atlantic chart
for k in range(6):
    place(sfx, paper_flip(), F(230 + k * 8), 0.68)    # 9-month winter calendar flipping!
place(sfx, splash(1.1, 1.1), F(286), 0.85)            # Giant storm surf crashing on St Kilda rocks!
place(sfx, chime_warm(), F(442), 0.60)                # Idea spark on "only one way to call for help!"
place(sfx, pop_thump(102, 0.26), F(488), 0.90)        # "No radio." X slam
place(sfx, pop_thump(90, 0.26), F(516), 0.90)         # "No telephone." X slam
place(sfx, pop_thump(78, 0.28), F(550), 0.90)         # "No ship in sight." X slam
for k in range(4):
    place(sfx, wood_carve(), F(610 + k * 21), 0.72)   # Whittling & hollowing wooden boat!
place(sfx, paper_flip(), F(712), 0.75)                # SOS parchment scroll tucked inside
place(sfx, wood_lid_slam(), F(738), 0.95)             # Wooden lid SEALED SHUT!
place(sfx, rope_tie(), F(764), 0.72)                  # Tying twine to sheep's bladder float
place(sfx, whoosh(0.55), F(850), 0.78)                # Throwing mailboat off cliff!
place(sfx, splash(1.15, 1.25), F(880), 1.00)          # BIG Atlantic splash!
place(sfx, whoosh(0.45), F(935), 0.55)                # Cut to mystery map
place(sfx, chime_warm(), F(1126), 0.72)               # Discovery on Scottish mainland!
place(sfx, seagull(), F(1145), 0.45)                  # Scottish coastal gull
place(sfx, chime_warm(), F(1212), 0.76)               # Discovery on Norwegian fjord!
place(sfx, chime_warm(), F(1365), 0.70)               # Golden ocean post office finale!

voice = load_voice("voice.mp3", N, SR)
master_mix(voice, music, sfx, out_wav="mix_raw.wav", sr=SR, music_rel_db=-6.0, sfx_max_rel_db=-6.0, sfx_max_peak_ratio=0.70)
