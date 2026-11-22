"""Synthesized 1870 Parisian accordion/French strings & heroic brass score + scene-synced SFX
for 'Paris Found the Sky' (Siege of Paris, 1870), mastered with audio_mix.py
(-6.0 dB music, <= -6.0 dB SFX, peaks <= 0.7x voice peak)."""
import numpy as np
from audio_mix import SR, load_voice, master_mix

DUR = 1691 / 30.0
N = int(round(DUR * SR))
rng = np.random.default_rng(1870)


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


# ---------------- 1870 Parisian Accordion, Pizzicato Strings, Snare & Heroic Brass ----------------
def accordion_note(freq, dur=0.42):
    """Warm Parisian musette accordion reed (twin subtly detuned reedy oscillators)."""
    n = int(round(dur * SR))
    t = np.arange(n) / SR
    s = np.zeros(n, np.float32)
    for det in (0.9982, 1.0018):
        ph = 2 * np.pi * (freq * det) * t
        s += (
            0.55 * np.sin(ph)
            + 0.34 * np.sin(2 * ph)
            + 0.22 * np.sin(3 * ph)
            + 0.12 * np.sin(4 * ph)
            + 0.08 * np.sin(5 * ph)
        ).astype(np.float32)
    env = np.minimum(1.0, t / 0.025) * np.clip((dur - t) / 0.08, 0, 1)
    return lp_fast(s * env, 2600) * 0.28


def pizz_string(freq, dur=0.35):
    """Bouncy orchestral pizzicato string bass/cello pluck."""
    n = int(round(dur * SR))
    t = np.arange(n) / SR
    s = (
        np.sin(2 * np.pi * freq * t) * np.exp(-t * 7.5)
        + 0.42 * np.sin(2 * np.pi * freq * 2 * t) * np.exp(-t * 14.0)
        + 0.18 * np.sin(2 * np.pi * freq * 3 * t) * np.exp(-t * 22.0)
    )
    atk = np.minimum(1.0, t / 0.005)
    return (s * atk).astype(np.float32) * 0.45


def warm_strings(freqs, dur):
    """Lush romantic Parisian string pad."""
    n = int(round(dur * SR))
    t = np.arange(n) / SR
    s = np.zeros(n, np.float32)
    for f0 in freqs:
        vib = 0.003 * np.sin(2 * np.pi * 5.4 * t)
        ph = 2 * np.pi * f0 * (t + vib)
        s += sum(np.sin((k + 1) * ph) / ((k + 1) ** 1.45) for k in range(6)).astype(np.float32)
    env = np.minimum(1.0, t / 0.12) * np.clip((dur - t) / 0.18, 0, 1)
    return lp_fast(s * env, 2200) / max(1, len(freqs)) * 0.22


def march_drum(kind="kick"):
    if kind == "kick":
        n = int(0.24 * SR); t = np.arange(n) / SR
        f = 58 + 56 * np.exp(-t * 28)
        return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)).astype(np.float32) * 0.45
    n = int(0.14 * SR); t = np.arange(n) / SR
    sn = hp_fast(lp_fast(rng.standard_normal(n).astype(np.float32), 5200), 1100) * np.exp(-t * 26)
    body = np.sin(2 * np.pi * 195 * t) * np.exp(-t * 32) * 0.35
    return (sn * 0.32 + body).astype(np.float32)


def heroic_brass(freqs, dur):
    """Triumphant 19th-century French horn & brass swell."""
    n = int(round(dur * SR)); t = np.arange(n) / SR; s = np.zeros(n, np.float32)
    for f0 in freqs:
        ph = 2 * np.pi * f0 * t + 0.002 * np.sin(2 * np.pi * 4.8 * t)
        s += sum(np.sin((k + 1) * ph) / ((k + 1) ** 1.25) for k in range(7)).astype(np.float32)
    env = np.minimum(1.0, t / 0.09) * np.clip((dur - t) / 0.18, 0, 1)
    return lp_fast(s * env, 2400) / max(1, len(freqs)) * 0.24


music = np.zeros(N, np.float32)
BPM = 114.0
beat = 60.0 / BPM

# Bittersweet Parisian D-minor -> heroic F-major / Bb / C / D-major journey!
# Act 1 (0..10s): Tense Siege in D minor (Dm - Bb - Gm - A7)
# Act 2 (10..32s): Spirited Parisian Balloon Adventure (Dm - C - Bb - A / F - C - Dm - Bb)
# Act 3 (32..35.5s): Curious question pause -> punchy "Pigeons." reveal!
# Act 4 (35.5..56.3s): Uplifting Pigeon & Sunrise Finale in bright F major / G / C / F!
prog_minor = [
    (50, [62, 65, 69]),  # Dm
    (46, [58, 62, 65]),  # Bb
    (43, [55, 58, 62]),  # Gm
    (45, [57, 61, 64]),  # A
]
prog_hero = [
    (53, [65, 69, 72]),  # F
    (48, [60, 64, 67]),  # C
    (50, [62, 65, 69]),  # Dm
    (46, [58, 62, 65]),  # Bb
]

bar = 0
tt = 0.0
while tt < DUR - 0.6:
    in_hero = (9.8 <= tt < 28.0) or (tt >= 35.5)
    prog = prog_hero if in_hero else prog_minor
    root, ch = prog[bar % 4]

    # Comedic/dramatic brief musical tuck right on "So how did Paris get replies? ... Pigeons." (33.9-35.3s)
    tucked = 33.9 <= tt <= 35.3
    g_scale = 0.22 if tucked else (1.18 if tt >= 50.5 else 0.96)

    # 3/4-flavored Parisian accordion bounce in 4/4 cinematic pulse
    for b in range(4):
        tb = tt + b * beat
        if tb >= DUR - 0.4:
            break
        if b in (0, 2):
            place(music, pizz_string(midi(root), 0.42), tb, 0.52 * g_scale)
            place(music, march_drum("kick"), tb, 0.36 * g_scale)
        else:
            # Crisp Parisian off-beat accordion chord + light military snare tap
            for m in ch:
                place(music, accordion_note(midi(m), beat * 0.72), tb, 0.22 * g_scale)
            if tt < 10.0 or (47.5 <= tt <= 50.6):
                place(music, march_drum("snare"), tb, 0.34 * g_scale)

        # Expressive Parisian accordion lead motif
        mel_m = ch[(b + bar) % len(ch)] + (12 if in_hero else 0)
        place(music, accordion_note(midi(mel_m), beat * 0.85), tb, 0.20 * g_scale)

    # Warm romantic strings bed across each bar
    place(music, warm_strings([midi(m) for m in ch], beat * 3.85), tt, 0.30 * g_scale)

    # Soaring heroic brass lift on Minister escape (24-28s) and grand sunrise finale (50.5-56s)!
    if (24.0 <= tt <= 27.6) or (tt >= 50.5 and bar % 2 == 0):
        place(music, heroic_brass([midi(m) for m in ch], beat * 3.6), tt, 0.24 * g_scale)

    bar += 1
    tt += beat * 4

# Inspiring resolving golden F-major chord on "still found the sky."
place(music, heroic_brass([midi(53), midi(60), midi(65), midi(69), midi(72)], 2.8), 53.4, 0.26)
place(music, warm_strings([midi(65), midi(69), midi(72), midi(77)], 2.6), 53.6, 0.32)


# ---------------- Scene-Synced 1870 Paris Balloon, Pigeon & Siege SFX ----------------
sfx = np.zeros(N, np.float32)
noise = lambda d: rng.standard_normal(int(round(d * SR))).astype(np.float32)


def wind_bed(d=3.0, bright=1400):
    n = int(round(d * SR)); t = np.arange(n) / SR
    swell = 0.55 + 0.45 * np.sin(2 * np.pi * 0.45 * t) ** 2
    s = hp_fast(lp_fast(noise(d), bright), 240) * swell
    fade = np.minimum(1, t / 0.35) * np.clip((d - t) / 0.35, 0, 1)
    return (s * fade * 0.36).astype(np.float32)


def gas_hiss(d=2.2):
    n = int(round(d * SR)); t = np.arange(n) / SR
    s = hp_fast(lp_fast(noise(d), 4800), 900)
    env = np.minimum(1, t / 0.15) * np.clip((d - t) / 0.35, 0, 1)
    return (s * env * 0.45).astype(np.float32)


def whoosh(d=0.65):
    n = int(round(d * SR)); t = np.arange(n) / SR
    return (lp_fast(noise(d), 1600) * np.sin(np.pi * t / d) ** 2 * 0.65).astype(np.float32)


def wire_snap():
    d = 0.38; n = int(round(d * SR)); t = np.arange(n) / SR
    twang = np.sin(2 * np.pi * (420 + 680 * np.exp(-t * 18)) * t) * np.exp(-t * 11)
    zap = hp_fast(lp_fast(noise(d), 6500), 1800) * np.exp(-t * 28) * 0.7
    return (twang * 0.42 + zap).astype(np.float32)


def pigeon_coo():
    """Soft recognizable carrier pigeon coo-coo!"""
    d = 0.55; n = int(round(d * SR)); t = np.arange(n) / SR
    f = 470 + 85 * np.sin(2 * np.pi * 3.8 * t) * np.exp(-t * 2.5)
    vib = 1.0 + 0.25 * np.sin(2 * np.pi * 28 * t)
    env = np.sin(np.pi * t / d) ** 1.4
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * vib * env * 0.42).astype(np.float32)


def wing_flutter(d=1.2):
    """Rapid fluttering pigeon wings taking flight."""
    n = int(round(d * SR)); t = np.arange(n) / SR
    pulses = np.maximum(0.0, np.sin(2 * np.pi * 11.5 * t)) ** 2
    s = hp_fast(lp_fast(noise(d), 2200), 320) * pulses
    env = np.minimum(1, t / 0.08) * np.clip((d - t) / 0.35, 0, 1)
    return (s * env * 0.62).astype(np.float32)


def shutter_click():
    """Crisp 1870 brass camera mechanical shutter click."""
    d = 0.20; n = int(round(d * SR)); t = np.arange(n) / SR
    c1 = hp_fast(lp_fast(noise(d), 5200), 1200) * np.exp(-t * 55)
    c2 = np.roll(c1, int(0.055 * SR)) * 0.75
    return ((c1 + c2) * 0.75).astype(np.float32)


def rifle_shot(heavy=False):
    """Punchy vintage black-powder rifle/swivel-gun crack with crisp echo."""
    d = 0.55; n = int(round(d * SR)); t = np.arange(n) / SR
    crack = lp_fast(noise(d), 2600 if not heavy else 1500) * np.exp(-t * (16 if not heavy else 10))
    thump = np.sin(2 * np.pi * (95 if not heavy else 62) * t * np.exp(-t * 8)) * np.exp(-t * 14)
    return ((crack * 0.85 + thump * 0.65) * (1.0 if heavy else 0.82)).astype(np.float32)


def pop_thump(f0=115.0, d=0.25):
    n = int(round(d * SR)); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f0 * t * (1 + 0.75 * np.exp(-t * 32))) * np.exp(-t * 14) * 0.72).astype(np.float32)


def chime_sparkle():
    d = 0.95; n = int(round(d * SR)); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * midi(m) * t) * np.exp(-t * (4.8 + k)) for k, m in enumerate([69, 72, 77, 81]))
    return (s * 0.22).astype(np.float32)


def paper_flutter(d=0.8):
    n = int(round(d * SR)); t = np.arange(n) / SR
    pulses = 0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 8.5 * t))
    return (hp_fast(lp_fast(noise(d), 4800), 1300) * pulses * np.sin(np.pi * t / d) * 0.42).astype(np.float32)


F = lambda f: f / 30.0

# Subtle atmospheric wind layers on high-altitude sky shots
place(sfx, wind_bed(4.5, 1100), F(0), 0.24)
place(sfx, wind_bed(5.0, 1200), F(450), 0.26)
place(sfx, wind_bed(4.2, 1800), F(840), 0.45)  # strong wind pushing balloons away!
place(sfx, wind_bed(4.5, 1200), F(1520), 0.26)

# Beat-synced action SFX locked to exact frame cuts & KICKS!
place(sfx, whoosh(0.75), F(125), 0.75)           # "and the only way out was UP."
place(sfx, pop_thump(85, 0.3), F(155), 0.75)     # barricaded road cut
place(sfx, wire_snap(), F(260), 0.85)            # snapped sparking telegraph wire!
place(sfx, gas_hiss(2.3), F(298), 0.65)          # filling giant balloon with coal gas!
place(sfx, whoosh(0.85), F(376), 0.80)           # balloon liftoff into the sky!
place(sfx, paper_flutter(1.1), F(655), 0.75)     # "Some carried millions of letters."
place(sfx, chime_sparkle(), F(735), 0.65)        # Minister Gambetta heroic escape
place(sfx, whoosh(0.70), F(855), 0.78)           # wind gusts shoving balloon
place(sfx, whoosh(0.75), F(918), 0.75)           # balloons scattering across countryside
place(sfx, pop_thump(130, 0.22), F(975), 0.70)   # "?" pop on "So how did Paris get replies?"
place(sfx, pop_thump(105, 0.26), F(1047), 0.82)  # "Pigeons." punchy reveal!
place(sfx, pigeon_coo(), F(1050), 0.88)          # unmistakable carrier pigeon coo!
place(sfx, wing_flutter(0.9), F(1090), 0.62)     # birds carried out on balloons
place(sfx, pop_thump(120, 0.2), F(1168), 0.65)   # wicker cage door flips open!
place(sfx, wing_flutter(1.5), F(1170), 0.88)     # pigeon flock bursts into flight!
place(sfx, pigeon_coo(), F(1205), 0.75)          # homing pigeons swooping home
place(sfx, shutter_click(), F(1295), 0.88)       # 1870 brass bellows camera shutter!
place(sfx, chime_sparkle(), F(1372), 0.82)       # tiny microfilm -> thousands of letters burst!
place(sfx, paper_flutter(0.9), F(1375), 0.72)    # miniature envelopes fanning out
place(sfx, rifle_shot(False), F(1461), 0.90)     # Prussian rifle volley 1
place(sfx, rifle_shot(False), F(1485), 0.90)     # Prussian rifle volley 2
place(sfx, rifle_shot(True), F(1503), 0.95)      # Prussian Krupp anti-balloon gun 3
place(sfx, whoosh(0.7), F(1522), 0.70)           # soaring safely above gunsmoke
place(sfx, wing_flutter(1.1), F(1600), 0.55)     # pigeons circling triumphantly home
place(sfx, chime_sparkle(), F(1635), 0.80)       # golden dawn Paris sky finale!

voice = load_voice("voice.mp3", N, SR)
master_mix(voice, music, sfx, out_wav="mix_raw.wav", sr=SR, music_rel_db=-6.0, sfx_max_rel_db=-6.0, sfx_max_peak_ratio=0.70)
