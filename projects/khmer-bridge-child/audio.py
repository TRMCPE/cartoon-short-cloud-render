"""Synthesized Playful Cambodian Folk Comedy Score (Roneat Ek bamboo xylophone,
Kong Vong bronze gongs, Skor Dai hand drums, Chhing finger cymbals, gentle Khloy bridge flute)
+ Frame-Synced Comedic SFX for 'khmer-bridge-child' (47.60s, 1428 frames).
Mastered strictly via audio_mix.py (-6.0 dB music, <= -6.0 dB SFX, peaks <= 0.70x voice peak)."""
import numpy as np
from audio_mix import SR, load_voice, master_mix

DUR = 1428 / 30.0
N = int(round(DUR * SR))
rng = np.random.default_rng(20261128)


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


def khloy_flute(freq, dur=0.58):
    """Warm airy Cambodian bamboo flute (ខ្លុយឫស្សី) for bridge flashback."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    vib = 1.0 + 0.004 * np.sin(2 * np.pi * 5.2 * t)
    ph = 2 * np.pi * np.cumsum(np.full(n, freq) * vib) / SR
    s = np.sin(ph) + 0.22 * np.sin(2 * ph) + 0.08 * np.sin(3 * ph)
    env = np.minimum(1.0, t / 0.04) * np.clip((dur - t) / 0.08, 0, 1)
    return (s * env * 0.42).astype(np.float32)


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


# ---------------- Build 47.60s Bouncy Khmer Sibling Story Score ----------------
music = np.zeros(N, np.float32)
BPM = 114.0
beat = 60.0 / BPM

prog = [
    (55, [67, 69, 71, 74, 76]),  # G major pentatonic
    (52, [64, 67, 71, 74, 79]),  # Em7 playful story bounce
    (48, [60, 62, 67, 71, 74]),  # C warm village lift
    (50, [62, 67, 69, 74, 78]),  # D bright turnaround
]

bar = 0
tt = 0.0
while tt < DUR - 0.45:
    root, scale = prog[bar % 4]
    serious_hush = (14.8 <= tt <= 16.5)
    bridge_flashback = (18.6 <= tt <= 22.3)
    sad_walk = (27.8 <= tt <= 29.8)
    panic_chase = (32.1 <= tt <= 36.8)

    g_scale = 0.22 if serious_hush else (0.78 if sad_walk else (1.16 if panic_chase else 0.96))

    for b in range(4):
        tb = tt + b * beat
        if tb >= DUR - 0.35:
            break
        if serious_hush and b in (1, 2, 3):
            continue

        if b in (0, 2):
            place(music, kong_gong(midi(root), 0.75), tb, 0.24 * g_scale)
            if not bridge_flashback:
                place(music, skor_drum("low"), tb, 0.32 * g_scale)
        else:
            if not sad_walk:
                place(music, skor_drum("tap"), tb, 0.24 * g_scale)
                place(music, skor_drum("chhing"), tb, 0.19 * g_scale)

        note = scale[(b * 2 + bar) % len(scale)]
        if bridge_flashback:
            place(music, khloy_flute(midi(note), 0.48), tb, 0.34)
            place(music, roneat_ek(midi(note + 12), 0.28), tb + beat * 0.5, 0.16)
        else:
            place(music, roneat_ek(midi(note), 0.32), tb, 0.30 * g_scale)
            if b in (1, 3) or panic_chase:
                sub_note = scale[(b + bar + 2) % len(scale)] + 12
                place(music, roneat_ek(midi(sub_note), 0.22), tb + beat * 0.5, 0.19 * g_scale)

    bar += 1
    tt += beat * 4

# Warm final Khmer Roneat + Gong cadence at 46.85s
place(music, kong_gong(midi(55), 0.72), 46.80, 0.32)
place(music, roneat_ek(midi(79), 0.62), 46.85, 0.30)


# ---------------- Scene-Synced Comedic & Action SFX ----------------
sfx = np.zeros(N, np.float32)
noise = lambda d: rng.standard_normal(int(round(d * SR))).astype(np.float32)


def tear_wobble():
    """Comedic warbling cartoon sob slide!"""
    d = 0.72; n = int(round(d * SR)); t = np.arange(n) / SR
    f = 420 - 150 * (t / d) + 22 * np.sin(2 * np.pi * 11 * t)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = (np.sin(ph) + 0.35 * np.sin(2 * ph)) * np.sin(np.pi * t / d) ** 0.8 * 0.40
    return lp_fast(s.astype(np.float32), 1600)


def sparkle_chime(d=0.80):
    """Bright golden sparkle arpeggio (secret weapon / snack bribe / baby heart)."""
    n = int(round(d * SR)); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * midi(m) * t) * np.exp(-t * (4.8 + k)) for k, m in enumerate([74, 79, 83, 86]))
    return (s * 0.22).astype(np.float32)


def buzzer_nope():
    """Comedic 'no force used' two-tone thud."""
    d = 0.46; n = int(round(d * SR)); t = np.arange(n) / SR
    f = np.where(t < 0.20, 195.0, 145.0)
    s = (np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.4 * np.sin(4 * np.pi * np.cumsum(f) / SR)) * np.exp(-t * 5.5) * 0.46
    return lp_fast(s.astype(np.float32), 950)


def serious_boom():
    """Dramatic low Khmer gong + suspense sting for ultra-serious brother face!"""
    d = 0.95; n = int(round(d * SR)); t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * (120 * np.exp(-t * 7) + 52) * t) * np.exp(-t * 4.2) * 0.48
    gong = kong_gong(midi(43), d) * 0.42
    return (boom + gong[:n]).astype(np.float32)


def creek_ripple():
    """Gentle water ripple + bamboo chime for wooden creek bridge flashback."""
    d = 0.90; n = int(round(d * SR)); t = np.arange(n) / SR
    rip = hp_fast(lp_fast(noise(d), 1500), 420) * np.sin(np.pi * t / d) ** 1.5 * 0.22
    ch = roneat_ek(midi(76), 0.45)
    out = rip.copy()
    out[: len(ch)] += ch * 0.35
    return out.astype(np.float32)


def rummage_rustle(d=1.1):
    """Fast cloth-tossing & Krama-knotting rustle!"""
    n = int(round(d * SR)); t = np.arange(n) / SR
    env = np.abs(np.sin(2 * np.pi * 4.5 * t)) * np.sin(np.pi * t / d)
    return (hp_fast(lp_fast(noise(d), 2800), 500) * env * 0.42).astype(np.float32)


def panic_boing():
    """Upward cartoon spring jump when Older Bro realizes Little Bro actually walked out!"""
    d = 0.55; n = int(round(d * SR)); t = np.arange(n) / SR
    f = 230 + 510 * np.minimum(1.0, t / 0.32) + 28 * np.sin(2 * np.pi * 22 * t)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5.2) * 0.56).astype(np.float32)


def rattan_whip():
    """Sharp bamboo rattan switch 'whish-crack' when imagining angry Mom!"""
    d = 0.38; n = int(round(d * SR)); t = np.arange(n) / SR
    wh = hp_fast(lp_fast(noise(d), 4200), 900) * np.exp(-((t - 0.14) ** 2) / 0.004) * 0.65
    snap = np.sin(2 * np.pi * (880 * np.exp(-t * 35) + 180) * t) * np.exp(-t * 24) * 0.42
    return (wh + snap).astype(np.float32)


def bongo_sprint(d=0.95):
    """Rapid cartoon bongo-scamper footsteps + leg-hug thump!"""
    n = int(round(d * SR)); t = np.arange(n) / SR
    out = np.zeros(n, np.float32)
    steps = int(d / 0.095)
    for k in range(steps):
        idx = int(k * 0.095 * SR)
        ln = min(int(0.07 * SR), n - idx)
        if ln > 0:
            ts = np.arange(ln) / SR
            f0 = 260 + (k % 2) * 95
            out[idx : idx + ln] += np.sin(2 * np.pi * f0 * ts) * np.exp(-ts * 34) * 0.52
    return out.astype(np.float32)


def clock_spin():
    """Playful rising xylophone glissando for growing-up time skip!"""
    d = 0.85; n = int(round(d * SR))
    out = np.zeros(n, np.float32)
    notes = [67, 69, 71, 74, 76, 79, 83]
    for i, m in enumerate(notes):
        idx = int(i * 0.09 * SR)
        tone = roneat_ek(midi(m), 0.22) * 0.42
        ln = min(len(tone), n - idx)
        if ln > 0:
            out[idx : idx + ln] += tone[:ln]
    return out


F = lambda fr: fr / 30.0

# Frame-accurate comedic SFX placement across all 27 shots!
place(sfx, tear_wobble(), F(8), 0.78)               # Shot 1: Hook crying & Krama bundle walk
place(sfx, creek_ripple(), F(106), 0.80)            # Shot 3: Under-bridge baby basket reveal
place(sfx, sparkle_chime(0.75), F(228), 0.82)       # Shot 5: «អាវុធសម្ងាត់មួយ!» secret weapon
place(sfx, tear_wobble(), F(288), 0.76)             # Shot 6: «ឲ្យយំតាមចិត្ត!» instant tears
place(sfx, buzzer_nope(), F(406), 0.80)             # Shot 8: «គាត់មិនប្រើកម្លាំងទេ»
place(sfx, serious_boom(), F(446), 0.85)            # Shot 9: «ទឹកមុខម៉ឺងម៉ាត់បំផុត!»
place(sfx, creek_ripple(), F(562), 0.78)            # Shot 11: Mom walking across wooden bridge
place(sfx, sparkle_chime(0.85), F(626), 0.82)       # Shot 12: Mom rescues & cradles baby
place(sfx, panic_boing(), F(704), 0.78)             # Shot 13: Kid gullible gasp («ជឿស្លុង!»)
place(sfx, rummage_rustle(1.1), F(742), 0.82)       # Shot 14-15: Rummaging clothes & tying Krama bundle
place(sfx, tear_wobble(), F(842), 0.78)             # Shot 16: Crying walk to yard gate
place(sfx, panic_boing(), F(965), 0.88)             # Shot 18: Older Bro sudden panic jump!
place(sfx, rattan_whip(), F(1002), 0.86)            # Shot 19: Fear of Mom's rattan switch!
place(sfx, bongo_sprint(0.85), F(1040), 0.84)       # Shot 20: Sprinting to hug little bro's leg!
place(sfx, sparkle_chime(0.90), F(1110), 0.85)      # Shot 21: Snack bribe peace offering!
place(sfx, clock_spin(), F(1165), 0.80)             # Shot 22: Growing-up time skip!
place(sfx, serious_boom(), F(1246), 0.82)           # Shot 24: Grown-Up You reuses the exact same lie!
place(sfx, tear_wobble(), F(1276), 0.80)            # Shot 25: Youngest sibling (ប្អូនពៅ) cries with mini bundle!
place(sfx, sparkle_chime(0.90), F(1365), 0.80)      # Shot 27: Comment question CTA chime!

voice = load_voice("voice.mp3", N, SR)
master_mix(voice, music, sfx, out_wav="mix_raw.wav", sr=SR, music_rel_db=-6.0, sfx_max_rel_db=-6.0, sfx_max_peak_ratio=0.70)
