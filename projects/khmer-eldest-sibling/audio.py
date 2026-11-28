#!/usr/bin/env python3
"""
100% Unique 5-Act Musical Score & Bespoke Household-Comedy Foley/SFX Suite
for 'khmer-eldest-sibling' («បងធំខុសគ្រប់ករណី!», 45.40s, 1362 frames).

100% Distinct From All Prior Episodes:
- NO Roneat/Kong/Chhing 4/4 folk loop; NO Chapei + Accordion 128 BPM C/Am swing.
- Lead Voice 1: Expressive Breathy Cambodian Khloy Bamboo Flute (ខ្លុយឫស្សី) with breath turbulence & pitch-grace ornaments.
- Lead Voice 2: Resonant Cambodian Kse Diev Gourd Monochord (ខ្សែដៀវ) with chest-gourd formant & harmonic overtone twang.
- Groove & Ensemble: Bouncy 6/8 Skor Chhaiyam Goblet Hand-Drum (ស្គរឆៃយ៉ាំ) + Warm Marimba/Tuba Bass + Superhero Brass Fanfare + Tragic Bowed Tro Khmer Solo.
- 5 Story-Synced Musical Acts:
  1. D Mixolydian 6/8 Khmer Household Comedy Lilt (0.00 - 10.60s)
  2. E Dorian Asymmetrical Ninja-Krama Heist Tiptoe (10.60 - 18.33s)
  3. Rising Kettle-Steam Tension -> Feather Hush -> D-Minor 3/4 Tragic Opera Floor-Flop Waltz (18.33 - 26.57s)
  4. Turbo <3s Stopwatch Build -> Bb-C-D Superhero Mom Brass Fanfare -> Courtroom Verdict March (26.57 - 35.53s)
  5. Sneaky G-Blues Eyebrow-Wiggle Groove -> Joyful D-Major 6/8 Sunset Finale (35.53 - 45.40s)
- Mastered strictly via audio_mix.py (-6.0 dB music, <= -6.0 dB SFX, peaks <= 0.70x voice peak).
"""
import numpy as np
from audio_mix import SR, load_voice, master_mix

DUR = 1362 / 30.0  # 45.40s
N = int(round(DUR * SR))
rng = np.random.default_rng(20261128)


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
# 1. BESPOKE CAMBODIAN & COMEDIC INSTRUMENT SYNTHESIZERS
# ==============================================================================

def khloy_flute(freq: float, dur: float = 0.36, grace_semitones: float = 1.5) -> np.ndarray:
    """Breathy Cambodian bamboo duct/end-blown flute (ខ្លុយឫស្សី) with Khmer grace ornament & warm vibrato."""
    n = max(16, int(dur * SR))
    t = np.arange(n, dtype=np.float32) / SR
    # Quick Khmer finger-slide ornament at note onset + gentle breath vibrato
    grace = (2.0 ** ((grace_semitones / 12.0) * np.exp(-t * 28.0)))
    vib = 1.0 + 0.0055 * np.sin(2.0 * np.pi * 5.6 * t) * np.clip((t - 0.06) * 8.0, 0.0, 1.0)
    inst_f = freq * grace * vib
    ph = 2.0 * np.pi * np.cumsum(inst_f) / SR

    # Cylindrical bamboo bore harmonics + subtle breath chiff
    tone = (
        0.68 * np.sin(ph)
        + 0.24 * np.sin(2.0 * ph + 0.3)
        + 0.14 * np.sin(3.0 * ph + 0.7)
        + 0.05 * np.sin(4.0 * ph)
    )
    chiff = bp_fft(rng.standard_normal(n).astype(np.float32), freq * 0.85, freq * 2.4)
    chiff_env = 0.22 * np.exp(-t * 24.0) + 0.045
    att = np.clip(t / 0.022, 0.0, 1.0)
    rel = np.clip((dur - t) / min(0.055, dur * 0.35), 0.0, 1.0)
    env = att * rel * np.exp(-t * 1.15)
    return ((tone + chiff * chiff_env) * env).astype(np.float32)


def kse_diev_twang(freq: float, dur: float = 0.42) -> np.ndarray:
    """Cambodian Kse Diev gourd monochord (ខ្សែដៀវ) — metallic wire harmonic shimmer + hollow gourd body."""
    n = max(16, int(dur * SR))
    t = np.arange(n, dtype=np.float32) / SR
    bend = 1.0 + 0.012 * np.exp(-t * 14.0)
    ph = 2.0 * np.pi * np.cumsum(freq * bend) / SR
    wire = (
        0.46 * np.sin(ph) * np.exp(-t * 5.2)
        + 0.52 * np.sin(2.0 * ph) * np.exp(-t * 4.4)
        + 0.30 * np.sin(3.01 * ph) * np.exp(-t * 6.8)
        + 0.16 * np.sin(4.03 * ph) * np.exp(-t * 10.5)
        + 0.09 * np.sin(5.05 * ph) * np.exp(-t * 15.0)
    )
    gourd = bp_fft(wire.astype(np.float32), 260.0, 1850.0)
    att = np.clip(t / 0.004, 0.0, 1.0)
    return ((0.62 * wire + 0.55 * gourd) * att).astype(np.float32)


def wood_marimba_bass(freq: float, dur: float = 0.28) -> np.ndarray:
    """Warm resonant rosewood/tuba bass pulse for 6/8 & tiptoe grooves."""
    n = max(16, int(dur * SR))
    t = np.arange(n, dtype=np.float32) / SR
    s = (
        0.78 * np.sin(2.0 * np.pi * freq * t) * np.exp(-t * 7.5)
        + 0.28 * np.sin(2.0 * np.pi * freq * 2.0 * t) * np.exp(-t * 12.0)
        + 0.12 * np.sin(2.0 * np.pi * freq * 3.98 * t) * np.exp(-t * 26.0)
    )
    att = np.clip(t / 0.006, 0.0, 1.0)
    return (s * att).astype(np.float32)


def skor_chhaiyam(kind: str = "oom") -> np.ndarray:
    """Traditional Khmer Skor Chhaiyam goblet drum: warm pitch-dropping 'oom' or crisp rim 'chak'."""
    if kind == "oom":
        dur = 0.24
        n = int(dur * SR)
        t = np.arange(n, dtype=np.float32) / SR
        f = 108.0 + 68.0 * np.exp(-t * 28.0)
        ph = 2.0 * np.pi * np.cumsum(f) / SR
        body = np.sin(ph) * np.exp(-t * 11.5) + 0.25 * np.sin(1.85 * ph) * np.exp(-t * 20.0)
        slap = bp_fft(rng.standard_normal(n).astype(np.float32), 180.0, 950.0) * np.exp(-t * 55.0) * 0.25
        return (body + slap).astype(np.float32)
    else:
        dur = 0.09
        n = int(dur * SR)
        t = np.arange(n, dtype=np.float32) / SR
        rim = np.sin(2.0 * np.pi * 430.0 * t) * np.exp(-t * 42.0) * 0.55
        snap = bp_fft(rng.standard_normal(n).astype(np.float32), 900.0, 4200.0) * np.exp(-t * 68.0) * 0.48
        return (rim + snap).astype(np.float32)


def brass_horn_chord(freqs, dur: float = 0.48) -> np.ndarray:
    """Heroic brass fanfare chord for Superhero Khmer Mom's arrival!"""
    n = max(16, int(dur * SR))
    t = np.arange(n, dtype=np.float32) / SR
    out = np.zeros(n, np.float32)
    for f in freqs:
        ph = 2.0 * np.pi * f * (t + 0.0008 * np.sin(2.0 * np.pi * 5.2 * t))
        horn = (
            0.50 * np.sin(ph)
            + 0.38 * np.sin(2.0 * ph)
            + 0.26 * np.sin(3.0 * ph)
            + 0.16 * np.sin(4.0 * ph)
            + 0.09 * np.sin(5.0 * ph)
        )
        out += horn.astype(np.float32)
    out = lp_fft(out / max(1, len(freqs)), 2600.0)
    att = np.clip(t / 0.025, 0.0, 1.0)
    rel = np.clip((dur - t) / 0.06, 0.0, 1.0)
    return (out * att * rel * np.exp(-t * 1.4)).astype(np.float32)


def tragic_tro_bow(freq: float, dur: float = 0.55) -> np.ndarray:
    """Sobbing bowed Cambodian Tro fiddle with wide melodramatic vibrato for the fake floor-flop cry!"""
    n = max(16, int(dur * SR))
    t = np.arange(n, dtype=np.float32) / SR
    sob = 1.0 - 0.018 * np.clip(t / max(dur, 0.1), 0.0, 1.0) + 0.011 * np.sin(2.0 * np.pi * 6.4 * t)
    ph = 2.0 * np.pi * np.cumsum(freq * sob) / SR
    saw = sum(((-1) ** (k + 1)) * (1.0 / k) * np.sin(k * ph) for k in range(1, 8))
    nasal = bp_fft(saw.astype(np.float32), 420.0, 3100.0)
    att = np.clip(t / 0.05, 0.0, 1.0)
    rel = np.clip((dur - t) / 0.08, 0.0, 1.0)
    return (nasal * att * rel * 0.72).astype(np.float32)


# ==============================================================================
# 2. BUILD 5-ACT STORY-SYNCED SCORE
# ==============================================================================

def build_music() -> np.ndarray:
    mus = np.zeros(N, np.float32)

    # --------------------------------------------------------------------------
    # ACT 1 (0.00s - 10.55s): D Mixolydian 6/8 Khmer Household Comedy Lilt
    # Dotted-quarter = 96 BPM -> eighth-note unit u8 = 60 / (96 * 3) = 0.2083s
    # --------------------------------------------------------------------------
    u8 = 0.2083
    t = 0.04
    # D7 - G - C - D Mixolydian folk progression (6 eighth-notes per bar)
    act1_bars = [
        (50, [62, 66, 69, 72, 69, 66]),  # D Mixolydian
        (55, [67, 71, 74, 71, 67, 64]),  # G Major
        (48, [60, 64, 67, 72, 69, 67]),  # C Major
        (50, [62, 69, 66, 62, 64, 66]),  # D turnaround
        (50, [62, 66, 69, 74, 72, 69]),
        (55, [67, 69, 71, 74, 71, 67]),
        (48, [64, 67, 72, 69, 67, 64]),
        (50, [62, None, 69, 74, None, None]),  # Pause for Gavel Slam at ~9.1s!
    ]
    bar_idx = 0
    while t < 10.45:
        bass_m, mel = act1_bars[bar_idx % len(act1_bars)]
        for s in range(6):
            ts = t + s * u8
            if ts >= 10.45:
                break
            #Pause music slightly right around the Gavel Slam (9.00 - 9.40s) for comic punch!
            if 8.95 <= ts <= 9.35:
                continue
            if s == 0:
                place(mus, wood_marimba_bass(midi(bass_m), 0.32), ts, 0.52)
                place(mus, skor_chhaiyam("oom"), ts, 0.34)
            elif s == 3:
                place(mus, wood_marimba_bass(midi(bass_m + 7), 0.26), ts, 0.44)
                place(mus, skor_chhaiyam("chak"), ts, 0.28)
            elif s in (2, 5):
                place(mus, kse_diev_twang(midi(bass_m + 12), 0.22), ts, 0.28)
            m_note = mel[s]
            if m_note is not None and s in (0, 2, 3, 5):
                place(mus, khloy_flute(midi(m_note), u8 * 1.45, grace_semitones=1.0), ts, 0.42)
        t += 6 * u8
        bar_idx += 1

    # --------------------------------------------------------------------------
    # ACT 2 (10.60s - 18.30s): E Dorian / Phrygian Staccato Ninja-Krama Heist!
    # 138 BPM -> sixteenth/eighth asymmetrical 3+3+2 stealth groove (step = 0.217s)
    # --------------------------------------------------------------------------
    st = 60.0 / 138.0 / 2.0  # 0.2174s eighth-note
    t = 10.65
    ninja_bass = [40, 40, 43, 45, 47, 45, 43, 42]  # E - G - A - B - A - G - F#
    ninja_mel = [64, None, 67, 69, 71, None, 70, 67, 64, None, 76, 74, 71, None, 69, 67]
    step_i = 0
    while t < 18.25:
        if step_i % 8 in (0, 3, 6):
            bm = ninja_bass[(step_i // 2) % len(ninja_bass)]
            place(mus, wood_marimba_bass(midi(bm), 0.19), t, 0.48)
            place(mus, kse_diev_twang(midi(bm + 12), 0.20), t, 0.36)
        if step_i % 4 == 2:
            place(mus, skor_chhaiyam("chak"), t, 0.26)
        mn = ninja_mel[step_i % len(ninja_mel)]
        if mn is not None:
            place(mus, khloy_flute(midi(mn), 0.18, grace_semitones=-1.0), t, 0.36)
        t += st
        step_i += 1

    # --------------------------------------------------------------------------
    # ACT 3A (18.40s - 20.15s): Rising Whole-Tone Kettle-Steam Rage Tremolo!
    # --------------------------------------------------------------------------
    for i, ts in enumerate(np.linspace(18.42, 19.95, 10)):
        m0 = 56 + i  # Rising chromatic/whole-tone tension!
        place(mus, wood_marimba_bass(midi(m0 - 12), 0.18), float(ts), 0.45)
        place(mus, kse_diev_twang(midi(m0 + 12), 0.20), float(ts), 0.38)

    # ACT 3B (20.20s - 22.85s): Feather-Light Delicate Tiptoe Plucks («រុញវាថ្នមៗមួយដៃប៉ុណ្ណោះ...»)
    for ts, mn in [(20.35, 74), (20.95, 76), (21.55, 79), (22.15, 81)]:
        place(mus, kse_diev_twang(midi(mn), 0.30), ts, 0.24)

    # ACT 3C (23.15s - 26.50s): Melodramatic D-Minor 3/4 Tragic Opera Sobbing Tro Solo!
    beat3 = 60.0 / 104.0  # 0.577s
    sob_bars = [
        (50, [(74, 1.8), (73, 0.9)]),   # Dm: D5 -> C#5
        (55, [(70, 1.8), (69, 0.9)]),   # Gm: Bb4 -> A4
    ]
    t = 23.20
    for bass_m, notes in sob_bars:
        place(mus, wood_marimba_bass(midi(bass_m - 12), 0.45), t, 0.48)
        place(mus, kse_diev_twang(midi(bass_m + 3), 0.28), t + beat3, 0.28)
        place(mus, kse_diev_twang(midi(bass_m + 7), 0.28), t + 2 * beat3, 0.28)
        cur = t
        for mn, beats in notes:
            place(mus, tragic_tro_bow(midi(mn), beats * beat3 * 0.95), cur, 0.46)
            cur += beats * beat3
        t += 3 * beat3

    # --------------------------------------------------------------------------
    # ACT 4 (26.65s - 35.45s): Superhero Mom Brass Fanfare & Authoritative Scold March!
    # --------------------------------------------------------------------------
    # Heroic Bb -> C -> D Major Brass Fanfare on Mom's arrival (28.02s - 30.15s)
    fanfare = [
        (28.04, [58, 62, 65, 70], 0.38),  # Bb Major!
        (28.44, [58, 62, 65, 70], 0.22),
        (28.68, [60, 64, 67, 72], 0.42),  # C Major!
        (29.14, [62, 66, 69, 74], 0.88),  # Glorious D Major Superhero Landing!
    ]
    for ts, ch, d in fanfare:
        place(mus, brass_horn_chord([midi(m) for m in ch], d), ts, 0.58)
        place(mus, skor_chhaiyam("oom"), ts, 0.42)

    # Stern Courtroom Scold March in D Minor (30.25s - 35.35s, 134 BPM)
    mb = 60.0 / 134.0  # 0.448s
    t = 30.28
    march_roots = [50, 57, 53, 57, 55, 50, 57, 50]
    march_mel = [62, 65, 69, 67, 65, 64, 62, 69]
    mi = 0
    while t < 35.30:
        r_m = march_roots[mi % len(march_roots)]
        place(mus, wood_marimba_bass(midi(r_m - 12), 0.26), t, 0.48)
        place(mus, skor_chhaiyam("oom" if mi % 2 == 0 else "chak"), t, 0.32)
        place(mus, kse_diev_twang(midi(r_m + 7), 0.22), t + mb * 0.5, 0.28)
        place(mus, khloy_flute(midi(march_mel[mi % len(march_mel)]), 0.28, -1.0), t, 0.36)
        t += mb
        mi += 1

    # --------------------------------------------------------------------------
    # ACT 5A (35.60s - 40.50s): Cheeky G-Mixolydian Blues Smirk & Eyebrow-Wiggle!
    # --------------------------------------------------------------------------
    sb = 60.0 / 118.0  # 0.508s
    t = 35.62
    blues_walk = [43, 47, 50, 52, 53, 52, 50, 47]
    blues_riff = [67, 70, 71, 74, 76, 74, 70, 67]
    bi = 0
    while t < 40.48:
        bm = blues_walk[bi % len(blues_walk)]
        place(mus, wood_marimba_bass(midi(bm), 0.28), t, 0.46)
        place(mus, kse_diev_twang(midi(bm + 12), 0.24), t + sb * 0.66, 0.32)
        place(mus, khloy_flute(midi(blues_riff[bi % len(blues_riff)]), 0.32, 2.0), t, 0.40)
        place(mus, skor_chhaiyam("chak"), t + sb * 0.5, 0.24)
        t += sb
        bi += 1

    # --------------------------------------------------------------------------
    # ACT 5B (40.60s - 45.40s): Warm Sunny D-Major 6/8 Khmer Village Sunset Finale!
    # --------------------------------------------------------------------------
    u8_end = 0.200
    t = 40.62
    end_bars = [
        (50, [66, 69, 74, 78, 76, 74]),  # D Major
        (55, [71, 74, 79, 76, 74, 71]),  # G Major
        (57, [69, 73, 76, 78, 76, 73]),  # A Major
        (50, [74, 78, 81, 78, 74, 74]),  # D Major warm resolution!
    ]
    eb_i = 0
    while t < DUR - 0.15:
        bass_m, mel = end_bars[eb_i % len(end_bars)]
        for s in range(6):
            ts = t + s * u8_end
            if ts >= DUR - 0.08:
                break
            if s == 0:
                place(mus, wood_marimba_bass(midi(bass_m - 12), 0.34), ts, 0.52)
                place(mus, skor_chhaiyam("oom"), ts, 0.34)
            elif s == 3:
                place(mus, wood_marimba_bass(midi(bass_m - 5), 0.28), ts, 0.44)
                place(mus, skor_chhaiyam("chak"), ts, 0.26)
            if s in (1, 4):
                place(mus, kse_diev_twang(midi(bass_m + 12), 0.26), ts, 0.30)
            if s in (0, 2, 3, 5):
                place(mus, khloy_flute(midi(mel[s]), u8_end * 1.5, 1.5), ts, 0.44)
        t += 6 * u8_end
        eb_i += 1

    return mus


# ==============================================================================
# 3. BESPOKE EPISODE-SPECIFIC FOLEY & COMEDY SFX SUITE (20 FRAME-SYNCED CUES)
# ==============================================================================

def sfx_ladle_scold_whoosh() -> np.ndarray:
    n = int(0.24 * SR)
    t = np.arange(n, dtype=np.float32) / SR
    whoosh = bp_fft(rng.standard_normal(n).astype(np.float32), 450.0, 2600.0) * np.sin(np.pi * t / 0.24) ** 2
    ping = np.sin(2.0 * np.pi * (620.0 + 380.0 * t / 0.24) * t) * np.exp(-t * 18.0) * 0.4
    return (whoosh * 0.55 + ping).astype(np.float32)


def sfx_angel_halo_hum() -> np.ndarray:
    n = int(0.55 * SR)
    t = np.arange(n, dtype=np.float32) / SR
    env = np.clip(t / 0.04, 0.0, 1.0) * np.exp(-t * 4.5)
    triad = (
        np.sin(2.0 * np.pi * midi(74) * t)
        + 0.75 * np.sin(2.0 * np.pi * midi(78) * t)
        + 0.65 * np.sin(2.0 * np.pi * midi(81) * t)
    )
    return (triad * env * 0.30).astype(np.float32)


def sfx_question_tilt_slide() -> np.ndarray:
    n = int(0.32 * SR)
    t = np.arange(n, dtype=np.float32) / SR
    f = 340.0 + 380.0 * (t / 0.32) ** 1.6
    ph = 2.0 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * np.sin(np.pi * t / 0.32) * 0.48).astype(np.float32)


def sfx_scroll_cross_rip() -> np.ndarray:
    n = int(0.28 * SR)
    t = np.arange(n, dtype=np.float32) / SR
    paper = bp_fft(rng.standard_normal(n).astype(np.float32), 1200.0, 5800.0) * np.exp(-t * 16.0) * 0.45
    thud = np.sin(2.0 * np.pi * (210.0 - 90.0 * t / 0.28) * t) * np.exp(-t * 20.0) * 0.48
    return (paper + thud).astype(np.float32)


def sfx_wooden_gavel_slam() -> np.ndarray:
    """Heavy hardwood courtroom gavel SLAM + low resonant verdict bell («បងធំខុសគ្រប់ករណី»!)."""
    n = int(0.65 * SR)
    t = np.arange(n, dtype=np.float32) / SR
    crack = bp_fft(rng.standard_normal(n).astype(np.float32), 350.0, 3800.0) * np.exp(-t * 45.0) * 0.85
    wood = np.sin(2.0 * np.pi * (165.0 * np.exp(-t * 18.0) + 68.0) * t) * np.exp(-t * 12.0) * 0.80
    bell = (np.sin(2.0 * np.pi * 293.66 * t) + 0.4 * np.sin(2.0 * np.pi * 440.0 * t)) * np.exp(-t * 4.2) * 0.28
    return (crack + wood + bell).astype(np.float32)


def sfx_mischief_bulb_plink() -> np.ndarray:
    n = int(0.26 * SR)
    t = np.arange(n, dtype=np.float32) / SR
    s = (np.sin(2.0 * np.pi * 1318.5 * t) + 0.45 * np.sin(2.0 * np.pi * 2637.0 * t)) * np.exp(-t * 16.0)
    return (s * 0.42).astype(np.float32)


def sfx_ninja_krama_snap() -> np.ndarray:
    """Cloth Krama headband whip-tie + stealthy shinobi bamboo zip!"""
    n = int(0.25 * SR)
    t = np.arange(n, dtype=np.float32) / SR
    cloth = bp_fft(rng.standard_normal(n).astype(np.float32), 900.0, 4800.0) * np.exp(-((t - 0.05) ** 2) / 0.0012) * 0.65
    zip_f = 950.0 + 1450.0 * np.exp(-t * 22.0)
    ph = 2.0 * np.pi * np.cumsum(zip_f) / SR
    return (cloth + np.sin(ph) * np.exp(-t * 22.0) * 0.34).astype(np.float32)


def sfx_snack_chomp_gulp() -> np.ndarray:
    """Two quick crunchy cake chomps + happy gulp («ម្តងលួចញ៉ាំនំ»)!"""
    out = np.zeros(int(0.45 * SR), np.float32)
    for t0 in (0.0, 0.14):
        n = int(0.11 * SR)
        t = np.arange(n, dtype=np.float32) / SR
        crunch = bp_fft(rng.standard_normal(n).astype(np.float32), 500.0, 3400.0) * np.exp(-t * 28.0) * 0.58
        i0 = int(t0 * SR)
        out[i0 : i0 + n] += crunch
    ng = int(0.14 * SR)
    tg = np.arange(ng, dtype=np.float32) / SR
    ph = 2.0 * np.pi * np.cumsum(260.0 + 280.0 * tg / 0.14) / SR
    i0 = int(0.28 * SR)
    out[i0 : i0 + ng] += np.sin(ph) * np.exp(-tg * 18.0) * 0.42
    return out


def sfx_hair_yank_twang() -> np.ndarray:
    """Stretchy hair-pull tension + sharp upward 'ow!' twang («ម្តងទាញសក់»)!"""
    n = int(0.34 * SR)
    t = np.arange(n, dtype=np.float32) / SR
    f = 240.0 + 520.0 * np.clip(t / 0.16, 0.0, 1.0) - 120.0 * np.clip((t - 0.16) / 0.18, 0.0, 1.0)
    ph = 2.0 * np.pi * np.cumsum(f) / SR
    s = (np.sin(ph) + 0.38 * np.sin(2.0 * ph)) * np.exp(-t * 7.5)
    return (s * 0.54).astype(np.float32)


def sfx_open_palm_back_slap() -> np.ndarray:
    """Crisp comedic open-palm back SMACK («លួចវាយខ្នងអ្នកមួយដៃ»)!"""
    n = int(0.22 * SR)
    t = np.arange(n, dtype=np.float32) / SR
    smack = bp_fft(rng.standard_normal(n).astype(np.float32), 650.0, 4600.0) * np.exp(-t * 52.0) * 0.88
    body = np.sin(2.0 * np.pi * (190.0 * np.exp(-t * 24.0) + 85.0) * t) * np.exp(-t * 22.0) * 0.65
    return (smack + body).astype(np.float32)


def sfx_flipflop_scamper_whistle() -> np.ndarray:
    """Rapid rubber flip-flop footsteps + innocent 2-note whistle («រួចរត់គេចធ្វើព្រងើយ»)!"""
    out = np.zeros(int(0.72 * SR), np.float32)
    for k in range(6):
        n = int(0.06 * SR)
        t = np.arange(n, dtype=np.float32) / SR
        pat = bp_fft(rng.standard_normal(n).astype(np.float32), 400.0, 2400.0) * np.exp(-t * 48.0) * 0.42
        i0 = int(k * 0.085 * SR)
        out[i0 : i0 + n] += pat
    for t0, f0, f1 in [(0.36, 980.0, 1240.0), (0.52, 1180.0, 1480.0)]:
        nw = int(0.14 * SR)
        tw = np.arange(nw, dtype=np.float32) / SR
        ph = 2.0 * np.pi * np.cumsum(f0 + (f1 - f0) * tw / 0.14) / SR
        i0 = int(t0 * SR)
        out[i0 : i0 + nw] += np.sin(ph) * np.sin(np.pi * tw / 0.14) * 0.36
    return out


def sfx_kettle_ear_steam_blast() -> np.ndarray:
    """Boiling tea-kettle whistle + twin pressurized ear-steam hiss («ហុយផ្សែងតាមត្រចៀក»)!"""
    n = int(0.95 * SR)
    t = np.arange(n, dtype=np.float32) / SR
    env = np.clip(t / 0.08, 0.0, 1.0) * np.clip((0.95 - t) / 0.18, 0.0, 1.0)
    hiss = bp_fft(rng.standard_normal(n).astype(np.float32), 1600.0, 6800.0) * env * 0.42
    kettle_f = 1050.0 + 480.0 * np.clip(t / 0.55, 0.0, 1.0)
    ph = 2.0 * np.pi * np.cumsum(kettle_f) / SR
    whistle = (np.sin(ph) + 0.25 * np.sin(2.0 * ph)) * env * 0.28
    return (hiss + whistle).astype(np.float32)


def sfx_feather_finger_tap() -> np.ndarray:
    """Delicate feather-soft 1-finger tap («រុញវាថ្នមៗមួយដៃប៉ុណ្ណោះ...»)!"""
    n = int(0.18 * SR)
    t = np.arange(n, dtype=np.float32) / SR
    drop = np.sin(2.0 * np.pi * (880.0 + 260.0 * np.exp(-t * 35.0)) * t) * np.exp(-t * 24.0) * 0.42
    return drop.astype(np.float32)


def sfx_tile_floor_body_boom() -> np.ndarray:
    """Short cartoon dive whistle -> MASSIVE ceramic patio tile BOOM («ដួលតូងទៅលើឥដ្ឋ»)!"""
    n = int(0.75 * SR)
    t = np.arange(n, dtype=np.float32) / SR
    out = np.zeros(n, np.float32)
    # 0.00 - 0.16s quick falling whistle
    nd = int(0.16 * SR)
    td = np.arange(nd, dtype=np.float32) / SR
    phd = 2.0 * np.pi * np.cumsum(920.0 - 540.0 * (td / 0.16)) / SR
    out[:nd] += np.sin(phd) * 0.36
    # 0.16s: Heavy tile floor impact BOOM!
    nb = n - nd
    tb = np.arange(nb, dtype=np.float32) / SR
    f_boom = 52.0 + 95.0 * np.exp(-tb * 22.0)
    phb = 2.0 * np.pi * np.cumsum(f_boom) / SR
    boom = np.sin(phb) * np.exp(-tb * 6.8) * 0.92
    clatter = bp_fft(rng.standard_normal(nb).astype(np.float32), 300.0, 2800.0) * np.exp(-tb * 20.0) * 0.55
    out[nd:] += boom + clatter
    return out


def sfx_siren_tear_fountain() -> np.ndarray:
    """Melodramatic comedy wail-siren + tear-fountain spray («ស្រែកយំដូចគេចាក់ក»)!"""
    n = int(0.70 * SR)
    t = np.arange(n, dtype=np.float32) / SR
    f = 680.0 + 190.0 * np.sin(2.0 * np.pi * 4.5 * t)
    ph = 2.0 * np.pi * np.cumsum(f) / SR
    siren = (np.sin(ph) + 0.3 * np.sin(2.0 * ph)) * np.sin(np.pi * t / 0.70) * 0.28
    spray = bp_fft(rng.standard_normal(n).astype(np.float32), 1400.0, 5200.0) * np.sin(np.pi * t / 0.70) * 0.22
    return (siren + spray).astype(np.float32)


def sfx_turbo_stopwatch_ticks() -> np.ndarray:
    """Rapid mechanical <3s stopwatch ticks + urgent bell («មិនដល់បីវិនាទីផង»)!"""
    out = np.zeros(int(1.15 * SR), np.float32)
    for k in range(10):
        nt = int(0.035 * SR)
        tt = np.arange(nt, dtype=np.float32) / SR
        freq = 1450.0 if k % 2 == 0 else 1180.0
        tick = np.sin(2.0 * np.pi * freq * tt) * np.exp(-tt * 85.0) * 0.44
        i0 = int(k * 0.092 * SR)
        out[i0 : i0 + nt] += tick
    nb = int(0.22 * SR)
    tb = np.arange(nb, dtype=np.float32) / SR
    ding = (np.sin(2.0 * np.pi * 1760.0 * tb) + 0.4 * np.sin(2.0 * np.pi * 2637.0 * tb)) * np.exp(-tb * 14.0) * 0.48
    i0 = int(0.92 * SR)
    out[i0 : i0 + nb] += ding
    return out


def sfx_superhero_cape_landing() -> np.ndarray:
    """Supersonic Krama cape swoosh + heroic landing impact («ដូចកំពូលវីរបុរស»)!"""
    n = int(0.68 * SR)
    out = np.zeros(n, np.float32)
    ns = int(0.24 * SR)
    ts = np.arange(ns, dtype=np.float32) / SR
    swoosh = bp_fft(rng.standard_normal(ns).astype(np.float32), 350.0, 3600.0) * np.sin(np.pi * ts / 0.24) * 0.65
    out[:ns] += swoosh
    nl = n - int(0.20 * SR)
    tl = np.arange(nl, dtype=np.float32) / SR
    ph = 2.0 * np.pi * np.cumsum(64.0 + 82.0 * np.exp(-tl * 20.0)) / SR
    thoom = np.sin(ph) * np.exp(-tl * 7.5) * 0.82
    out[int(0.20 * SR) :] += thoom
    return out


def sfx_buzzer_stamp_x() -> np.ndarray:
    """Comedic 'Request Denied' stamp-buzz («ក៏គ្មានប្រយោជន៍ដែរ»)!"""
    n = int(0.36 * SR)
    t = np.arange(n, dtype=np.float32) / SR
    buzz = (
        np.sin(2.0 * np.pi * 138.59 * t)
        + 0.7 * np.sin(2.0 * np.pi * 146.83 * t)
        + 0.5 * np.sin(2.0 * np.pi * 277.18 * t)
    ) * np.exp(-t * 6.5) * 0.36
    return buzz.astype(np.float32)


def sfx_eyebrow_wiggle_ratchet() -> np.ndarray:
    """Hilarious rapid alternating marimba/slide-whistle eyebrow-wiggle + wink zing («លួចញាក់ចិញ្ចើម»)!"""
    out = np.zeros(int(0.85 * SR), np.float32)
    notes = [74, 79, 74, 79, 74, 79, 83]
    for idx, m in enumerate(notes):
        nn = int(0.085 * SR)
        tn = np.arange(nn, dtype=np.float32) / SR
        tone = (np.sin(2.0 * np.pi * midi(m) * tn) + 0.35 * np.sin(4.0 * np.pi * midi(m) * tn)) * np.exp(-tn * 28.0) * 0.45
        i0 = int(idx * 0.085 * SR)
        out[i0 : i0 + nn] += tone
    # Cheeky sparkle wink at end!
    nw = int(0.22 * SR)
    tw = np.arange(nw, dtype=np.float32) / SR
    wink = (np.sin(2.0 * np.pi * 1975.5 * tw) + 0.5 * np.sin(2.0 * np.pi * 2637.0 * tw)) * np.exp(-tw * 16.0) * 0.42
    i0 = int(0.62 * SR)
    out[i0 : i0 + nw] += wink
    return out


def sfx_like_pop_bell() -> np.ndarray:
    """Crisp UI Like pop + warm bamboo chime («ចុចឡៃ និងខមិនប្រាប់ផង»)!"""
    out = np.zeros(int(0.55 * SR), np.float32)
    npop = int(0.08 * SR)
    tp = np.arange(npop, dtype=np.float32) / SR
    ph = 2.0 * np.pi * np.cumsum(320.0 + 620.0 * tp / 0.08) / SR
    out[:npop] += np.sin(ph) * np.exp(-tp * 32.0) * 0.52
    for idx, m in enumerate([74, 78, 81, 86]):
        nc = int(0.28 * SR)
        tc = np.arange(nc, dtype=np.float32) / SR
        ch = np.sin(2.0 * np.pi * midi(m) * tc) * np.exp(-tc * 11.0) * 0.32
        i0 = int((0.08 + idx * 0.055) * SR)
        out[i0 : min(len(out), i0 + nc)] += ch[: min(len(out), i0 + nc) - i0]
    return out


def build_sfx() -> np.ndarray:
    sfx = np.zeros(N, np.float32)
    cues = [
        (0.73,  sfx_ladle_scold_whoosh(),     0.85),  # f0022 "ត្រូវម៉ែស្តីឲ្យ"
        (1.65,  sfx_angel_halo_hum(),         0.80),  # f0050 "មិនបានធ្វើអ្វីខុសសោះ"
        (3.98,  sfx_question_tilt_slide(),    0.80),  # f0119 "កើតមុនប្អូនទេ?"
        (6.68,  sfx_scroll_cross_rip(),       0.80),  # f0200 "មិនបាច់សរសេរលើក្រដាស"
        (9.08,  sfx_wooden_gavel_slam(),      1.00),  # f0273 "«បងធំខុសគ្រប់ករណី»!"
        (10.88, sfx_mischief_bulb_plink(),    0.85),  # f0326 "ពេលប្អូនអ្នកអផ្សុក"
        (12.42, sfx_ninja_krama_snap(),       0.90),  # f0373 "ដូចនីនចា!"
        (13.58, sfx_snack_chomp_gulp(),       0.92),  # f0408 "ម្តងលួចញ៉ាំនំ"
        (14.52, sfx_hair_yank_twang(),        0.92),  # f0436 "ម្តងទាញសក់"
        (16.05, sfx_open_palm_back_slap(),    0.95),  # f0482 "លួចវាយខ្នងអ្នកមួយដៃ"
        (17.42, sfx_flipflop_scamper_whistle(), 0.88),# f0523 "រួចរត់គេចធ្វើព្រងើយ"
        (18.88, sfx_kettle_ear_steam_blast(), 0.88),  # f0566 "ហុយផ្សែងតាមត្រចៀក"
        (21.84, sfx_feather_finger_tap(),     0.85),  # f0655 "រុញវាថ្នមៗមួយដៃប៉ុណ្ណោះ"
        (22.92, sfx_tile_floor_body_boom(),   1.00),  # f0688->f0692 "ស្រាប់តែវាដួលតូងទៅលើឥដ្ឋ"
        (24.65, sfx_siren_tear_fountain(),    0.82),  # f0740 "ស្រែកយំដូចគេចាក់ក"
        (26.68, sfx_turbo_stopwatch_ticks(),  0.86),  # f0800 "មិនដល់បីវិនាទីផង"
        (28.34, sfx_superhero_cape_landing(), 0.96),  # f0850->f0856 "បង្ហាញខ្លួនដូចកំពូលវីរបុរស!"
        (31.42, sfx_buzzer_stamp_x(),         0.85),  # f0943 "ក៏គ្មានប្រយោជន៍ដែរ"
        (38.56, sfx_eyebrow_wiggle_ratchet(), 0.94),  # f1157 "តែលួចញាក់ចិញ្ចើមឌឺដាក់អ្នក!"
        (43.62, sfx_like_pop_bell(),          0.90),  # f1309 "កុំភ្លេចចុចឡៃ និងខមិនប្រាប់ផង!"
    ]
    for t0, sig, gain in cues:
        place(sfx, sig, t0, gain)
    return sfx


if __name__ == "__main__":
    voice = load_voice("voice.mp3", N, SR)
    music = build_music()
    sfx = build_sfx()
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
