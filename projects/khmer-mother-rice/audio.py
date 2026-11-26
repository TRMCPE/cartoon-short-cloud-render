"""Synthesized Playful Cambodian Folk Comedy Score (Roneat Ek bamboo xylophone,
Tro Sau two-string fiddle, Skor Dai hand drums, Chhing bronze cymbals, Kong Vong gongs)
+ 24 Frame-Synced Comedic & Kitchen SFX for 'khmer-mother-rice' (87.10s, 2613 frames).
Mastered strictly via audio_mix.py (-6.0 dB music, <= -6.0 dB SFX, peaks <= 0.70x voice peak)."""
import numpy as np
from audio_mix import SR, load_voice, master_mix

DUR = 2613 / 30.0
N = int(round(DUR * SR))
rng = np.random.default_rng(2026)


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
def roneat_ek(freq, dur=0.38):
    """Bright playful Cambodian hardwood/bamboo xylophone (រនាតឯក)."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = (
        np.sin(2 * np.pi * freq * t) * np.exp(-t * 8.4)
        + 0.40 * np.sin(2 * np.pi * freq * 3.01 * t) * np.exp(-t * 24.0)
        + 0.14 * np.sin(2 * np.pi * freq * 5.96 * t) * np.exp(-t * 40.0)
    )
    atk = np.minimum(1.0, t / 0.003)
    return (s * atk).astype(np.float32)


def kong_gong(freq, dur=1.35):
    """Warm bronze Khmer gong (គងវង់)."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = (
        np.sin(2 * np.pi * freq * t) * np.exp(-t * 2.4)
        + 0.34 * np.sin(2 * np.pi * freq * 2.0 * t) * np.exp(-t * 3.8)
        + 0.16 * np.sin(2 * np.pi * freq * 2.98 * t) * np.exp(-t * 5.8)
    )
    atk = np.minimum(1.0, t / 0.015) * np.clip((dur - t) / 0.12, 0, 1)
    return lp_fast((s * atk).astype(np.float32), 2600)


def tro_sau(freq, dur=0.95):
    """Warm expressive bowed Khmer two-string fiddle (ទ្រសោ) for heartwarming Mom scenes."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    vib = 0.0035 * np.sin(2 * np.pi * 5.3 * t) * np.minimum(1.0, t / 0.18)
    ph = 2 * np.pi * freq * t * (1.0 + vib)
    s = sum((0.66 ** h) * np.sin((h + 1) * ph) / (h + 1) for h in range(6)).astype(np.float32)
    env = np.minimum(1.0, t / 0.09) * np.clip((dur - t) / 0.15, 0, 1)
    return lp_fast(s * env, 2400) * 0.44


def skor_drum(kind="low"):
    """Cambodian Skor Dai hand drum + Chhing bronze cymbal."""
    if kind == "low":
        n = int(0.28 * SR); t = np.arange(n) / SR
        f = 78 + 60 * np.exp(-t * 25)
        return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 10.0)).astype(np.float32)
    if kind == "chhing":
        n = int(0.15 * SR); t = np.arange(n) / SR
        ring = (np.sin(2 * np.pi * 3520 * t) + 0.55 * np.sin(2 * np.pi * 5280 * t)) * np.exp(-t * 25)
        return (ring * 0.17).astype(np.float32)
    n = int(0.13 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 245 * t) * np.exp(-t * 28) * 0.42).astype(np.float32)


# ---------------- Build 87.10s Khmer Comedy & Heartwarming Score ----------------
music = np.zeros(N, np.float32)
BPM = 110.0
beat = 60.0 / BPM

# Bright cheerful F-pentatonic / C-pentatonic Cambodian folk progressions
prog = [
    (53, [65, 67, 69, 72, 74]),  # F major pentatonic (F G A C D)
    (50, [62, 65, 69, 72, 77]),  # Dm7 / F pentatonic
    (48, [60, 64, 67, 72, 76]),  # C major lift
    (53, [65, 69, 72, 74, 77]),  # F joyful resolution
]

bar = 0
tt = 0.0
while tt < DUR - 0.5:
    root, scale = prog[bar % 4]
    # Comedic deadpan pause right when Kid freezes in shock in the kitchen (52.1s - 54.2s)!
    shock_stop = (52.1 <= tt <= 54.2)
    sneaky = (29.0 <= tt < 36.4)
    sprint_dream = (41.4 <= tt < 50.6)
    warm_heart = (70.0 <= tt <= 78.0)
    g_scale = 0.12 if shock_stop else (0.78 if sneaky else (1.16 if sprint_dream else (0.86 if warm_heart else 0.96)))

    for b in range(4):
        tb = tt + b * beat
        if tb >= DUR - 0.35:
            break
        if shock_stop:
            continue
        if b in (0, 2):
            place(music, kong_gong(midi(root), 0.80), tb, 0.25 * g_scale)
            if not warm_heart:
                place(music, skor_drum("low"), tb, 0.33 * g_scale)
        else:
            if not warm_heart:
                place(music, skor_drum("tap"), tb, 0.25 * g_scale)
            place(music, skor_drum("chhing"), tb, 0.21 * g_scale)

        note = scale[(b * 2 + bar) % len(scale)]
        place(music, roneat_ek(midi(note), 0.36), tb, 0.31 * g_scale)
        if b in (1, 3) or sprint_dream:
            sub_note = scale[(b + bar + 2) % len(scale)] + 12
            place(music, roneat_ek(midi(sub_note), 0.24), tb + beat * 0.5, 0.19 * g_scale)

    if warm_heart and bar % 2 == 0:
        place(music, tro_sau(midi(scale[2]), beat * 3.6), tt, 0.26 * g_scale)

    bar += 1
    tt += beat * 4

# Joyful final Khmer Roneat + Gong cadence at 85.8s
place(music, kong_gong(midi(53), 1.6), 85.8, 0.34)
place(music, kong_gong(midi(65), 1.6), 85.8, 0.28)
place(music, roneat_ek(midi(77), 0.85), 85.85, 0.32)


# ---------------- Scene-Synced Comedic & Kitchen SFX ----------------
sfx = np.zeros(N, np.float32)
noise = lambda d: rng.standard_normal(int(round(d * SR))).astype(np.float32)


def game_bloops(d=0.85):
    """Retro mobile gaming arcade bloops."""
    n = int(round(d * SR))
    out = np.zeros(n, np.float32)
    notes = [72, 76, 79, 84, 79, 84]
    for k, m in enumerate(notes):
        i = int(k * 0.12 * SR)
        ln = min(int(0.10 * SR), n - i)
        if ln > 0:
            ts = np.arange(ln) / SR
            out[i : i + ln] += np.sign(np.sin(2 * np.pi * midi(m) * ts)) * np.exp(-ts * 22) * 0.26
    return lp_fast(out, 2800)


def clock_spin_alarm(d=1.8):
    """Accelerating cartoon clock ticks ending in a bright twin-bell ring!"""
    n = int(round(d * SR))
    out = np.zeros(n, np.float32)
    t_cur = 0.0
    step = 0.16
    while t_cur < d - 0.45:
        idx = int(t_cur * SR)
        ln = min(int(0.03 * SR), n - idx)
        if ln > 0:
            ts = np.arange(ln) / SR
            out[idx : idx + ln] += np.sin(2 * np.pi * 1150 * ts) * np.exp(-ts * 90) * 0.45
        t_cur += step
        step = max(0.045, step * 0.86)
    # Alarm ring at end
    r0 = int((d - 0.42) * SR)
    ts = np.arange(n - r0) / SR
    mod = 0.5 + 0.5 * np.sin(2 * np.pi * 22 * ts)
    ring = (np.sin(2 * np.pi * 2450 * ts) + 0.6 * np.sin(2 * np.pi * 3680 * ts)) * mod * np.exp(-ts * 4.5) * 0.35
    out[r0:] += ring
    return out


def megaphone_whoosh(d=0.65):
    n = int(round(d * SR)); t = np.arange(n) / SR
    wh = lp_fast(noise(d), 1800) * np.sin(np.pi * t / d) ** 2 * 0.55
    chime = np.sin(2 * np.pi * midi(77) * t) * np.exp(-t * 7) * 0.25
    return (wh + chime).astype(np.float32)


def belly_growl(d=0.95):
    """Funny bubbly cartoon stomach rumble (ក្រពះកូរ!)."""
    n = int(round(d * SR)); t = np.arange(n) / SR
    f = 95 + 38 * np.sin(2 * np.pi * 11 * t) + 22 * np.sin(2 * np.pi * 23 * t)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 1.2
    return lp_fast(s.astype(np.float32), 480) * 0.72


def bongo_sprint(d=1.6):
    """Rapid cartoon bongo-scamper footsteps + breeze whoosh!"""
    n = int(round(d * SR)); t = np.arange(n) / SR
    out = np.zeros(n, np.float32)
    for k in range(14):
        idx = int(k * 0.105 * SR)
        ln = min(int(0.08 * SR), n - idx)
        if ln > 0:
            ts = np.arange(ln) / SR
            f0 = 250 + (k % 2) * 95
            out[idx : idx + ln] += np.sin(2 * np.pi * f0 * ts) * np.exp(-ts * 32) * 0.55
    wh = lp_fast(noise(d), 1600) * np.sin(np.pi * t / d) ** 2 * 0.35
    return (out + wh).astype(np.float32)


def shock_boing():
    """Comedic record-halt + downward jaw-drop cartoon boing for ឈរភាំង!"""
    d = 0.72; n = int(round(d * SR)); t = np.arange(n) / SR
    halt = lp_fast(noise(0.14), 2200) * np.exp(-np.arange(int(round(0.14 * SR))) / SR * 28) * 0.65
    f = 420 - 240 * np.minimum(1.0, t / 0.45) + 18 * np.sin(2 * np.pi * 16 * t)
    boing = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4.8) * 0.68
    boing[: len(halt)] += halt
    return boing.astype(np.float32)


def water_swish(d=0.85):
    """Washing raw rice in water swish (លាងអង្ករដាក់ឆ្នាំង)."""
    n = int(round(d * SR)); t = np.arange(n) / SR
    sw = hp_fast(lp_fast(noise(d), 3800), 600) * (0.45 + 0.45 * np.sin(2 * np.pi * 3.5 * t)) * np.sin(np.pi * t / d)
    return (sw * 0.62).astype(np.float32)


def fish_flop():
    """Wet metallic basin splash + fish tail flop!"""
    d = 0.45; n = int(round(d * SR)); t = np.arange(n) / SR
    ping = np.sin(2 * np.pi * 680 * t) * np.exp(-t * 18) * 0.32
    spl = hp_fast(lp_fast(noise(d), 3600), 700) * np.exp(-t * 10) * 0.55
    return (ping + spl).astype(np.float32)


def stem_snap():
    """Crisp green Trakuon hollow stem snap (បេះត្រកួន!)."""
    d = 0.12; n = int(round(d * SR)); t = np.arange(n) / SR
    pop = np.sin(2 * np.pi * 920 * t) * np.exp(-t * 55) * 0.55
    crisp = hp_fast(lp_fast(noise(d), 5200), 1400) * np.exp(-t * 65) * 0.50
    return (pop + crisp).astype(np.float32)


def sparkle_chime(d=0.95):
    n = int(round(d * SR)); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * midi(m) * t) * np.exp(-t * (4.5 + k)) for k, m in enumerate([72, 77, 81, 84]))
    return (s * 0.22).astype(np.float32)


F = lambda fr: fr / 30.0

# Frame-accurate placement across all 38 story shots!
place(sfx, game_bloops(0.8), F(55), 0.70)               # Shot 2: Mobile gaming bloops
place(sfx, sparkle_chime(0.9), F(103), 0.75)            # Shot 3: «បាយឆ្អិនហើយកូន!» hook pop
place(sfx, sparkle_chime(0.9), F(242), 0.70)            # Shot 5: Mastermind Crowned Brain glow
place(sfx, kong_gong(midi(53), 1.1), F(360), 0.60)      # Shot 7: Generational handoff gong
place(sfx, game_bloops(0.9), F(416), 0.68)              # Shot 8: Addicted gaming bloops
place(sfx, clock_spin_alarm(1.9), F(792), 0.80)         # Shot 14: 5 min -> 1 hour turbo clock alarm!
place(sfx, kong_gong(midi(53), 1.2), F(922), 0.72)      # Shot 16: Secret technique gong!
place(sfx, megaphone_whoosh(0.7), F(1022), 0.75)        # Shot 17: Kitchen shout sonic wave
place(sfx, megaphone_whoosh(0.7), F(1098), 0.80)        # Shot 18: «កូនអើយ មកហូបបាយលឿនឡើង!»
place(sfx, sparkle_chime(0.8), F(1245), 0.72)           # Shot 20: Kid's ears perk up!
place(sfx, belly_growl(0.95), F(1300), 0.88)            # Shot 21: Stomach starts rumbling!
place(sfx, bongo_sprint(2.2), F(1348), 0.82)            # Shot 22: Kid sprints to kitchen!
place(sfx, sparkle_chime(1.1), F(1440), 0.85)           # Shot 23: Dream Feast Table golden shimmer!
place(sfx, shock_boing(), F(1566), 0.92)                # Shot 25: «ឈរភាំង!» freeze shock!
place(sfx, water_swish(1.1), F(1628), 0.78)             # Shot 26: Washing raw rice in pot
place(sfx, fish_flop(), F(1700), 0.82)                  # Shot 27: Unscaled raw fish flopping in steel basin!
place(sfx, fish_flop(), F(1724), 0.68)                  # Shot 27: Second comedic tail flop
place(sfx, sparkle_chime(0.85), F(1840), 0.68)          # Shot 29: Mom's sweet smile chime
for ks in range(3):
    place(sfx, stem_snap(), F(1965 + ks * 16), 0.78)    # Shot 30-31: Snapping Trakuon stems!
place(sfx, sparkle_chime(1.0), F(2155), 0.72)           # Shot 33: Mom's clever loving heart glow
for ks in range(3):
    place(sfx, stem_snap(), F(2272 + ks * 18), 0.65)    # Shot 35: Chatting & picking Trakuon together
place(sfx, sparkle_chime(0.9), F(2454), 0.75)           # Shot 37: Subscribe CTA chime
place(sfx, kong_gong(midi(53), 1.4), F(2545), 0.68)     # Shot 38: Warm Khmer sunset finale

voice = load_voice("voice.mp3", N, SR)
master_mix(voice, music, sfx, out_wav="mix_raw.wav", sr=SR, music_rel_db=-6.0, sfx_max_rel_db=-6.0, sfx_max_peak_ratio=0.70)
