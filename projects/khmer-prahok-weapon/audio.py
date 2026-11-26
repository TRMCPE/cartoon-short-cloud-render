"""Synthesized Traditional Khmer Pinpeat / Folk Adventure Score (Roneat Ek bamboo xylophone,
Tro Sau two-string fiddle, Skor Dai hand drums, Chhing bronze cymbals, Kong Vong gongs)
+ Scene-Synced Comedic & Jungle SFX for 'khmer-prahok-weapon' (86.70s, 2601 frames).
Mastered strictly via audio_mix.py (-6.0 dB music, <= -6.0 dB SFX, peaks <= 0.70x voice peak)."""
import numpy as np
from audio_mix import SR, load_voice, master_mix

DUR = 2601 / 30.0
N = int(round(DUR * SR))
rng = np.random.default_rng(108)


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


# ---------------- Traditional Khmer Instruments ----------------
def roneat_ek(freq, dur=0.42):
    """Bright resonant Cambodian hardwood/bamboo xylophone (រនាតឯក)."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = (
        np.sin(2 * np.pi * freq * t) * np.exp(-t * 7.8)
        + 0.42 * np.sin(2 * np.pi * freq * 3.02 * t) * np.exp(-t * 22.0)
        + 0.16 * np.sin(2 * np.pi * freq * 5.95 * t) * np.exp(-t * 38.0)
    )
    atk = np.minimum(1.0, t / 0.003)
    return (s * atk).astype(np.float32)


def kong_gong(freq, dur=1.45):
    """Warm bronze Khmer gong circle / Kong Vong Thom (គងវង់ធំ)."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = (
        np.sin(2 * np.pi * freq * t) * np.exp(-t * 2.2)
        + 0.35 * np.sin(2 * np.pi * freq * 2.0 * t) * np.exp(-t * 3.6)
        + 0.18 * np.sin(2 * np.pi * freq * 2.98 * t) * np.exp(-t * 5.5)
        + 0.09 * np.sin(2 * np.pi * freq * 4.17 * t) * np.exp(-t * 9.0)
    )
    atk = np.minimum(1.0, t / 0.015) * np.clip((dur - t) / 0.12, 0, 1)
    return lp_fast((s * atk).astype(np.float32), 2600)


def tro_sau(freq, dur=0.95):
    """Warm expressive bowed Khmer two-string fiddle (ទ្រសោ) with gentle vibrato."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    vib = 0.0035 * np.sin(2 * np.pi * 5.4 * t) * np.minimum(1.0, t / 0.18)
    ph = 2 * np.pi * freq * t * (1.0 + vib)
    s = sum((0.68 ** h) * np.sin((h + 1) * ph) / (h + 1) for h in range(6)).astype(np.float32)
    env = np.minimum(1.0, t / 0.09) * np.clip((dur - t) / 0.15, 0, 1)
    return lp_fast(s * env, 2400) * 0.45


def skor_drum(kind="low"):
    """Cambodian Skor Dai / Skor Thom warm hand drum + Chhing bronze cymbal."""
    if kind == "low":
        n = int(0.30 * SR); t = np.arange(n) / SR
        f = 74 + 62 * np.exp(-t * 24)
        return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9.5)).astype(np.float32)
    if kind == "chhing":
        n = int(0.16 * SR); t = np.arange(n) / SR
        ring = (np.sin(2 * np.pi * 3420 * t) + 0.6 * np.sin(2 * np.pi * 5180 * t)) * np.exp(-t * 24)
        return (ring * 0.18).astype(np.float32)
    n = int(0.14 * SR); t = np.arange(n) / SR
    tap = np.sin(2 * np.pi * 235 * t) * np.exp(-t * 26) * 0.45
    return tap.astype(np.float32)


# ---------------- Build 86.70s Khmer Storytelling Score ----------------
music = np.zeros(N, np.float32)
BPM = 104.0
beat = 60.0 / BPM

# Traditional warm D-pentatonic / G-pentatonic Khmer modal progressions
prog = [
    (50, [62, 64, 66, 69, 71]),  # D major pentatonic (D E F# A B)
    (47, [59, 62, 66, 69, 74]),  # Bm / D pentatonic
    (43, [55, 59, 62, 67, 71]),  # G pentatonic
    (45, [57, 62, 64, 69, 73]),  # A5 / D resolving lift
]

bar = 0
tt = 0.0
while tt < DUR - 0.5:
    root, scale = prog[bar % 4]
    # Gentle comedic pauses around "គ្មានទូទឹកកក" (18.3-19.5s) and Tiger shock sniff (56.2-57.6s)
    tucked = (18.2 <= tt <= 19.6) or (56.1 <= tt <= 57.7)
    tender = (36.2 <= tt <= 44.6) or (74.2 <= tt <= 78.8)
    heroic = (33.5 <= tt < 36.2) or (67.0 <= tt < 74.2) or (78.8 <= tt)
    g_scale = 0.28 if tucked else (0.82 if tender else (1.15 if heroic else 0.96))

    for b in range(4):
        tb = tt + b * beat
        if tb >= DUR - 0.35:
            break
        if b in (0, 2):
            place(music, kong_gong(midi(root), 0.85), tb, 0.26 * g_scale)
            if not tender:
                place(music, skor_drum("low"), tb, 0.34 * g_scale)
        else:
            if not tender:
                place(music, skor_drum("tap"), tb, 0.26 * g_scale)
            place(music, skor_drum("chhing"), tb, 0.22 * g_scale)

        # Roneat Ek pentatonic melody + octave ornament
        note = scale[(b * 2 + bar) % len(scale)]
        place(music, roneat_ek(midi(note), 0.40), tb, 0.30 * g_scale)
        if b in (1, 3) and not tucked:
            sub_note = scale[(b + bar + 2) % len(scale)] + 12
            place(music, roneat_ek(midi(sub_note), 0.28), tb + beat * 0.5, 0.18 * g_scale)

    # Expressive Tro Sau bowed melody on tender Mother-Son & finale bars
    if (tender or heroic) and bar % 2 == 0:
        place(music, tro_sau(midi(scale[2]), beat * 3.6), tt, 0.24 * g_scale)

    bar += 1
    tt += beat * 4

# Warm resolving Angkor Gong & Roneat chord at the very end (84.8s)
place(music, kong_gong(midi(50), 1.8), 84.6, 0.35)
place(music, kong_gong(midi(62), 1.8), 84.6, 0.28)
place(music, roneat_ek(midi(74), 0.9), 84.65, 0.32)


# ---------------- Scene-Synced Action & Comedic SFX ----------------
sfx = np.zeros(N, np.float32)
noise = lambda d: rng.standard_normal(int(round(d * SR))).astype(np.float32)


def x_slam(f0=92.0, d=0.28):
    n = int(round(d * SR)); t = np.arange(n) / SR
    thump = np.sin(2 * np.pi * f0 * t * (1 + 0.7 * np.exp(-t * 30))) * np.exp(-t * 14)
    snap = lp_fast(noise(d), 1500) * np.exp(-t * 42) * 0.6
    return (thump + snap).astype(np.float32)


def wood_pound():
    """Wooden mortar & pestle pound (សំឡេងបុកប្រហុកក្នុងត្បាល់ឈើ)."""
    d = 0.24; n = int(round(d * SR)); t = np.arange(n) / SR
    body = (np.sin(2 * np.pi * 155 * t) + 0.5 * np.sin(2 * np.pi * 310 * t)) * np.exp(-t * 18)
    knock = lp_fast(noise(d), 1200) * np.exp(-t * 45) * 0.5
    return (body * 0.7 + knock).astype(np.float32)


def water_splash(d=0.65):
    n = int(round(d * SR)); t = np.arange(n) / SR
    hi = hp_fast(lp_fast(noise(d), 4200), 650) * np.exp(-t * 5.5) * np.minimum(1, t / 0.015)
    lo = lp_fast(noise(d), 380) * np.exp(-t * 9.0)
    return (hi * 0.75 + lo * 0.85).astype(np.float32)


def cart_roll(d=2.2):
    """Gentle wooden ox-cart wheel roll + tiny brass ox bell."""
    n = int(round(d * SR)); t = np.arange(n) / SR
    rumble = lp_fast(noise(d), 280) * 0.32 * np.sin(np.pi * t / d)
    bell = np.sin(2 * np.pi * 1480 * t) * (np.mod(t, 0.55) < 0.12) * np.exp(-np.mod(t, 0.55) * 20) * 0.18
    return (rumble + bell).astype(np.float32)


def jar_pop():
    """Satisfying clay lid cork POP when opening the Prahok jar!"""
    d = 0.22; n = int(round(d * SR)); t = np.arange(n) / SR
    f = 240 + 480 * np.minimum(1.0, t / 0.045)
    pop = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 22) * np.minimum(1.0, t / 0.004)
    return (pop * 0.95).astype(np.float32)


def aroma_shimmer(d=1.2):
    """Magical swirling aroma wave shimmer."""
    n = int(round(d * SR)); t = np.arange(n) / SR
    whoosh = lp_fast(noise(d), 1400) * np.sin(np.pi * t / d) ** 2 * 0.42
    chime = sum(np.sin(2 * np.pi * midi(m) * t) * np.exp(-t * (4 + k)) for k, m in enumerate([69, 74, 78, 81])) * 0.16
    return (whoosh + chime).astype(np.float32)


def tiger_growl(d=0.95):
    """Low resonant jungle tiger rumble."""
    n = int(round(d * SR)); t = np.arange(n) / SR
    f = 82 + 12 * np.sin(2 * np.pi * 16 * t)
    s = sum(np.sin((k + 1) * 2 * np.pi * np.cumsum(f) / SR) / (k + 1) for k in range(5)).astype(np.float32)
    env = np.sin(np.pi * t / d) ** 1.3
    return lp_fast(s * env, 520) * 0.55


def sniff_halt():
    """Comedic double sniff + shocked cartoon boing!"""
    d = 0.65; n = int(round(d * SR)); t = np.arange(n) / SR
    sn1 = hp_fast(lp_fast(noise(d), 3500), 900) * np.exp(-((t - 0.10) ** 2) / 0.0018) * 0.75
    sn2 = hp_fast(lp_fast(noise(d), 3500), 900) * np.exp(-((t - 0.24) ** 2) / 0.0018) * 0.75
    boing_f = 220 + 260 * np.maximum(0, t - 0.32)
    boing = (t >= 0.32) * np.sin(2 * np.pi * np.cumsum(boing_f) / SR) * np.exp(-np.maximum(0, t - 0.32) * 10) * 0.55
    return (sn1 + sn2 + boing).astype(np.float32)


def cartoon_flee(d=1.0):
    """Rapid cartoon bongo-scamper + whoosh into the bushes!"""
    n = int(round(d * SR)); t = np.arange(n) / SR
    scamper = np.zeros(n, np.float32)
    for k in range(8):
        tk = k * 0.085
        idx = int(tk * SR)
        m = min(int(0.08 * SR), n - idx)
        if m > 0:
            ts = np.arange(m) / SR
            f0 = 260 + (k % 2) * 95
            scamper[idx : idx + m] += np.sin(2 * np.pi * f0 * ts) * np.exp(-ts * 32) * 0.6
    wh = lp_fast(noise(d), 1800) * np.sin(np.pi * t / d) ** 2 * 0.45
    return (scamper + wh).astype(np.float32)


def fly_buzz(d=0.95):
    n = int(round(d * SR)); t = np.arange(n) / SR
    f = 195 + 22 * np.sin(2 * np.pi * 7 * t)
    s = sum(np.sin((k + 1) * 2 * np.pi * np.cumsum(f) / SR) / (k + 1) ** 1.2 for k in range(6)).astype(np.float32)
    return lp_fast(s * np.sin(np.pi * t / d), 1600) * 0.25


def golden_sparkle(d=0.95):
    n = int(round(d * SR)); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * midi(m) * t) * np.exp(-t * (4.5 + k)) for k, m in enumerate([74, 78, 81, 86]))
    return (s * 0.22).astype(np.float32)


F = lambda fr: fr / 30.0

# Frame-accurate placement across all 37 story shots!
place(sfx, kong_gong(midi(50), 1.4), 0.05, 0.65)        # Shot 1: Angkor Wat opening gong
place(sfx, golden_sparkle(), F(85), 0.70)               # Shot 2: «អាវុធសម្ងាត់» secret weapon glow
place(sfx, x_slam(95), F(226), 0.85)                    # Shot 4: Red X on Sword & Spear!
place(sfx, cart_roll(2.6), F(375), 0.75)                # Shot 6: Ox-cart rolling through dense forest
place(sfx, x_slam(92), F(564), 0.80)                    # Shot 8: No Refrigerator X!
place(sfx, x_slam(86), F(608), 0.80)                    # Shot 9: No Roadside Shop X!
place(sfx, fly_buzz(1.1), F(672), 0.75)                 # Shot 10: Spoiled meat buzzing flies
place(sfx, x_slam(115, 0.22), F(790), 0.65)             # Shot 12: Mother's determined vow!
place(sfx, water_splash(0.7), F(825), 0.70)             # Shot 13: Fresh fish in receding Tonle Sap
for kp in range(4):
    place(sfx, wood_pound(), F(906 + kp * 11), 0.75)    # Shot 14: Pounding fish & salt in wooden mortar!
place(sfx, golden_sparkle(1.1), F(1050), 0.85)          # Shot 16: «ប្រហុក» national dish born!
place(sfx, golden_sparkle(0.8), F(1196), 0.60)          # Shot 18: Packing Prahok jar into Thong Yam
place(sfx, jar_pop(), F(1482), 0.95)                    # Shot 21: Clay jar lid POP in forest!
place(sfx, aroma_shimmer(1.3), F(1520), 0.80)           # Shot 22: Savory aroma erupts!
place(sfx, aroma_shimmer(1.5), F(1572), 0.85)           # Shot 23: Shockwave rings spread across jungle!
place(sfx, tiger_growl(0.95), F(1630), 0.80)            # Shot 24: Tiger & boar prowl closer
place(sfx, sniff_halt(), F(1692), 0.90)                 # Shot 25: Tiger freezes & sniffs!
place(sfx, cartoon_flee(1.15), F(1740), 0.85)           # Shot 26: Tiger & boar sprint away!
place(sfx, aroma_shimmer(1.0), F(1836), 0.70)           # Shot 27: Aroma wave hits ambushing bandits
place(sfx, sniff_halt(), F(1878), 0.75)                 # Shot 28: Bandits cough ("ផ្សែងពិសបុរាណ!")
place(sfx, cartoon_flee(0.95), F(1906), 0.75)           # Shot 28: Bandits scramble away!
place(sfx, golden_sparkle(1.1), F(2132), 0.85)          # Shot 31: Son flexes with full protein & energy!
place(sfx, cart_roll(1.8), F(2172), 0.65)               # Shot 32: Safe arrival through Angkor Gate
place(sfx, golden_sparkle(1.0), F(2238), 0.65)          # Shot 33: Mother's love heart glow
place(sfx, jar_pop(), F(2305), 0.55)                    # Shot 34: Cheeky aroma puff
place(sfx, kong_gong(midi(50), 1.5), F(2390), 0.70)     # Shot 35: Greatest life-saving weapon in history!
place(sfx, golden_sparkle(1.2), F(2540), 0.70)          # Shot 37: Sunset Angkor finale sparkle

voice = load_voice("voice.mp3", N, SR)
master_mix(voice, music, sfx, out_wav="mix_raw.wav", sr=SR, music_rel_db=-6.0, sfx_max_rel_db=-6.0, sfx_max_peak_ratio=0.70)
