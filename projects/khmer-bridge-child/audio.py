"""100% Unique Multi-Act Score & Bespoke Foley/SFX Suite for 'khmer-bridge-child' (47.60s, 1428 frames).
Distinct from all prior episodes (NO Roneat/Kong-Gong/Chhing 4/4 loop, NO reused stock chimes/boings):
- Lead Voice: Plucked Cambodian Chapei Dang Veng (ចាប៉ីដងវែង, Karplus-Strong acoustic lute with grace slides)
- Groove: Cheeky Pizzicato Walking Bass + Warm Reed Accordion Off-Beat Chords + Bamboo Claves & Brushed Shaker
- 5 Dynamic Story Acts:
  1. Cheeky Sibling Swing (0.0-10.9s, 128 BPM C/Am swing)
  2. Sneaky Prank Tiptoe & Timpani Hush (10.9-18.6s, A harmonic minor spy walk)
  3. Gentle Creek-Bridge Lullaby (18.6-22.4s, Warm Fmaj7->Cmaj7 Chapei arpeggios)
  4. Melodramatic Sad Waltz -> Frantic 154 BPM Gate Chase (22.4-36.9s)
  5. Sunny Snack-Bribe & Generational Twist Finale (36.9-47.6s)
- 17 Freshly Synthesized Prop-Specific Foley & Comedic SFX.
Mastered strictly via audio_mix.py (-6.0 dB music, <= -6.0 dB SFX, peaks <= 0.70x voice peak)."""
import numpy as np
from audio_mix import SR, load_voice, master_mix

DUR = 1428 / 30.0
N = int(round(DUR * SR))
rng = np.random.default_rng(90421)


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


# ==============================================================================
# 1. BRAND-NEW INSTRUMENT PALETTE (Chapei Lute, Pizzicato Bass, Reed Accordion, Wood Claves)
# ==============================================================================
def chapei_pluck(freq, dur=0.48, slide_semi=0.0):
    """Authentic Karplus-Strong plucked acoustic Khmer Chapei Dang Veng lute string
    with warm wooden soundbox resonance and optional fret-bend grace slide."""
    n = int(round(dur * SR))
    period = max(8, int(round(SR / freq)))
    # Plucked plectrum burst shaped for warm woody nylon/gut twang
    seed_burst = rng.uniform(-1.0, 1.0, period).astype(np.float32)
    seed_burst = lp_fast(seed_burst, min(3600.0, freq * 7.5))
    out = np.zeros(n, np.float32)
    out[:period] = seed_burst
    decay = 0.9945
    for i in range(period, n):
        out[i] = decay * 0.5 * (out[i - period] + out[i - period + 1])

    # Optional traditional Chapei pitch bend / fret grace slide in first 65ms
    if abs(slide_semi) > 0.01:
        t = np.arange(n) / SR
        ratio = 2.0 ** ((slide_semi * np.exp(-t * 26.0)) / 12.0)
        src_idx = np.clip(np.cumsum(ratio) - 1.0, 0, n - 1)
        i0 = src_idx.astype(np.int32)
        frac = src_idx - i0
        i1 = np.minimum(n - 1, i0 + 1)
        out = (out[i0] * (1.0 - frac) + out[i1] * frac).astype(np.float32)

    # Warm wooden soundbox body resonance around 290 Hz
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * 288.0 * t) * np.exp(-t * 28.0) * 0.14
    env = np.clip((dur - t) / 0.04, 0.0, 1.0)
    return ((out * 0.85 + body) * env).astype(np.float32)


def pizz_bass(freq, dur=0.30):
    """Punchy acoustic upright pizzicato walking bass for cheeky cartoon mischief."""
    n = int(round(dur * SR))
    t = np.arange(n) / SR
    f_env = freq * (1.0 + 0.03 * np.exp(-t * 45.0))
    ph = 2 * np.pi * np.cumsum(f_env) / SR
    s = (
        np.sin(ph) * np.exp(-t * 7.5)
        + 0.48 * np.sin(2 * ph) * np.exp(-t * 13.0)
        + 0.20 * np.sin(3 * ph) * np.exp(-t * 22.0)
    )
    pluck_thump = lp_fast(rng.standard_normal(n).astype(np.float32), 420) * np.exp(-t * 65.0) * 0.25
    atk = np.minimum(1.0, t / 0.004)
    return ((s * atk + pluck_thump) * 0.62).astype(np.float32)


def reed_chord(midi_notes, dur=0.28, warm=False):
    """Cheeky French/Khmer theatre accordion-reed staccato chord (or warm pad on sad/bridge scenes)."""
    n = int(round(dur * SR))
    t = np.arange(n) / SR
    sig = np.zeros(n, np.float32)
    for m in midi_notes:
        f = midi(m)
        # Dual slightly detuned musette reeds
        for det in (0.9985, 1.0015):
            ph = 2 * np.pi * (f * det) * t
            sig += (np.sin(ph) + 0.42 * np.sin(2 * ph) + 0.24 * np.sin(3 * ph) + 0.10 * np.sin(5 * ph))
    sig /= max(1, len(midi_notes) * 2)
    if warm:
        env = np.minimum(1.0, t / 0.07) * np.clip((dur - t) / 0.10, 0, 1)
        return lp_fast((sig * env * 0.34).astype(np.float32), 1850)
    env = np.minimum(1.0, t / 0.012) * np.exp(-t * 6.5) * np.clip((dur - t) / 0.03, 0, 1)
    return lp_fast((sig * env * 0.36).astype(np.float32), 2300)


def wood_perc(kind="clave"):
    """Crisp bamboo woodblock claves, soft brushed shaker, & warm cajon tap (zero gong/chhing!)."""
    if kind == "clave":
        n = int(0.055 * SR); t = np.arange(n) / SR
        s = (np.sin(2 * np.pi * 1680 * t) + 0.35 * np.sin(2 * np.pi * 2690 * t)) * np.exp(-t * 78.0)
        return (s * 0.24).astype(np.float32)
    if kind == "shaker":
        n = int(0.075 * SR); t = np.arange(n) / SR
        nz = hp_fast(lp_fast(rng.standard_normal(n).astype(np.float32), 7500), 2600)
        return (nz * np.sin(np.pi * t / 0.075) * 0.14).astype(np.float32)
    # Soft warm cajon palm-thump
    n = int(0.16 * SR); t = np.arange(n) / SR
    f = 68 + 48 * np.exp(-t * 34.0)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 15.0) * 0.44).astype(np.float32)


def weeping_strings(freq, dur=0.85):
    """Melodramatic comedy solo violin with wide theatrical vibrato for the sad gate walk."""
    n = int(round(dur * SR)); t = np.arange(n) / SR
    vib = 1.0 + 0.008 * np.sin(2 * np.pi * 6.0 * t)
    ph = 2 * np.pi * np.cumsum(np.full(n, freq) * vib) / SR
    s = sum((0.62 ** k) * np.sin((k + 1) * ph) for k in range(5)).astype(np.float32)
    env = np.minimum(1.0, t / 0.08) * np.clip((dur - t) / 0.12, 0, 1)
    return lp_fast(s * env, 2500) * 0.30


# ==============================================================================
# 2. MULTI-ACT STORYTELLING SCORE (47.60s — Dynamic Tempo & Style Shifts!)
# ==============================================================================
music = np.zeros(N, np.float32)

# --- ACT 1 (0.00s - 10.85s): Cheeky Sibling Swing (128 BPM, shuffled 8ths in C / Am) ---
beat1 = 60.0 / 128.0
swing_prog = [
    ([36, 40, 43, 45], [60, 64, 67], [72, 76, 79, 76, 74, 72]),  # C6 bouncy swing
    ([45, 48, 52, 50], [57, 60, 64], [69, 72, 76, 81, 79, 76]),  # Am7 mischievous turn
    ([38, 41, 45, 43], [62, 65, 69], [74, 77, 81, 77, 76, 74]),  # Dm7 playful step
    ([43, 47, 50, 48], [59, 62, 67], [79, 76, 74, 71, 74, 79]),  # G7 cheeky turnaround
]
t_cur = 0.05
bar = 0
while t_cur < 10.85:
    bass_walk, chord_voicing, lick = swing_prog[bar % 4]
    for b in range(4):
        tb = t_cur + b * beat1
        if tb >= 10.85:
            break
        place(music, pizz_bass(midi(bass_walk[b]), 0.30), tb, 0.42)
        if b in (0, 2):
            place(music, wood_perc("cajon"), tb, 0.32)
        else:
            # Off-beat staccato accordion skank + woodblock clave!
            place(music, reed_chord(chord_voicing, 0.20), tb, 0.34)
            place(music, wood_perc("clave"), tb, 0.32)
        place(music, wood_perc("shaker"), tb + beat1 * 0.64, 0.28)
        # Swung Chapei Dang Veng lute melody with cheeky slides!
        m_note = lick[(b + bar) % len(lick)]
        slide = -2.0 if (b == 0 and bar % 2 == 1) else 0.0
        place(music, chapei_pluck(midi(m_note), 0.38, slide), tb, 0.36)
        if b in (1, 3):
            place(music, chapei_pluck(midi(lick[(b + 2) % len(lick)]), 0.24), tb + beat1 * 0.64, 0.24)
    bar += 1
    t_cur += beat1 * 4

# --- ACT 2 (10.95s - 18.60s): Sneaky Older-Brother Prank Tiptoe (A Harmonic Minor, hush at 14.8-16.4s) ---
beat2 = 60.0 / 118.0
sneak_prog = [
    ([45, 48, 52, 51], [57, 60, 64], [69, 72, 76, 75]),  # Am sneaky chromatics
    ([40, 44, 47, 44], [56, 59, 64], [68, 71, 76, 74]),  # E7 scheming dominant
]
t_cur = 10.95
bar = 0
while t_cur < 18.55:
    bass_walk, chord_voicing, lick = sneak_prog[bar % 2]
    for b in range(4):
        tb = t_cur + b * beat2
        if tb >= 18.55:
            break
        # Dramatic hush right on Older Bro's ultra-serious deadpan face (14.80s - 16.40s)!
        if 14.80 <= tb <= 16.40:
            if b == 0 and tb < 15.35:
                place(music, reed_chord([52, 56, 59, 64], 1.35, warm=True), tb, 0.24)
            continue
        place(music, pizz_bass(midi(bass_walk[b]), 0.22), tb, 0.38)
        if b in (1, 3):
            place(music, wood_perc("clave"), tb, 0.22)
        if b in (0, 2):
            place(music, chapei_pluck(midi(lick[b]), 0.30, -1.0 if b == 2 else 0.0), tb + beat2 * 0.5, 0.30)
    bar += 1
    t_cur += beat2 * 4

# --- ACT 3 (18.65s - 22.35s): Gentle Creek-Bridge Flashback Lullaby (Warm Fmaj7 -> Cmaj7 Chapei Arpeggios) ---
lullaby_bars = [
    (18.68, [53, 57, 60, 64], [65, 69, 72, 76, 79, 76]),
    (20.52, [48, 55, 60, 64], [67, 72, 76, 79, 84, 79]),
]
for t0, pad_notes, arp in lullaby_bars:
    place(music, reed_chord(pad_notes, 1.75, warm=True), t0, 0.30)
    place(music, pizz_bass(midi(pad_notes[0] - 12), 0.55), t0, 0.30)
    for k, mn in enumerate(arp):
        place(music, chapei_pluck(midi(mn), 0.52, -1.0 if k == 0 else 0.0), t0 + k * 0.28, 0.32)

# --- ACT 4A (22.45s - 29.80s): Gullible Shock -> Melodramatic 3/4 Sad Runaway Waltz! ---
beat3 = 60.0 / 106.0
waltz_prog = [
    (45, [57, 60, 64], 76),  # Am
    (38, [57, 62, 65], 74),  # Dm
    (40, [56, 59, 64], 71),  # E7
    (45, [57, 60, 64], 69),  # Am
]
t_cur = 22.50
bar = 0
while t_cur < 29.80:
    b_root, w_chord, v_mel = waltz_prog[bar % 4]
    # 3/4 Oom-pah-pah waltz!
    place(music, pizz_bass(midi(b_root), 0.35), t_cur, 0.38)
    for wb in (1, 2):
        if t_cur + wb * beat3 < 29.80:
            place(music, reed_chord(w_chord, 0.24), t_cur + wb * beat3, 0.30)
    if t_cur >= 27.60:
        # Theatrical weeping solo violin as Kid You cries toward the gate!
        place(music, weeping_strings(midi(v_mel), beat3 * 2.7), t_cur, 0.34)
    else:
        place(music, chapei_pluck(midi(v_mel), 0.42, -2.0), t_cur + beat3 * 0.5, 0.32)
    bar += 1
    t_cur += beat3 * 3

# Brief suspense pulse as Younger Bro steps through the real gate (29.85s - 32.05s)
for k, st in enumerate([29.90, 30.55, 31.20]):
    place(music, pizz_bass(midi(40 + k), 0.25), st, 0.34)

# --- ACT 4B (32.12s - 36.88s): Frantic 154 BPM Older-Brother Panic & Gate Sprint Polka! ---
beat4 = 60.0 / 154.0
chase_notes = [76, 77, 76, 74, 72, 74, 76, 79]
t_cur = 32.12
step_i = 0
while t_cur < 36.85:
    b_note = 45 if (step_i // 2) % 2 == 0 else 40
    if step_i % 2 == 0:
        place(music, pizz_bass(midi(b_note), 0.20), t_cur, 0.44)
        place(music, wood_perc("cajon"), t_cur, 0.36)
    else:
        place(music, reed_chord([57, 60, 64] if b_note == 45 else [56, 59, 64], 0.15), t_cur, 0.36)
        place(music, wood_perc("clave"), t_cur, 0.34)
    place(music, chapei_pluck(midi(chase_notes[step_i % len(chase_notes)]), 0.22), t_cur, 0.34)
    step_i += 1
    t_cur += beat4

# --- ACT 5 (36.92s - 47.45s): Joyous C-Major Snack-Bribe & Generational Callback Swing Finale! ---
t_cur = 36.95
bar = 0
while t_cur < 46.85:
    bass_walk, chord_voicing, lick = swing_prog[bar % 4]
    # Brief cheeky dip right when Grown-Up You puts on the deadpan face (41.5s - 42.4s)
    dip = 0.42 if (41.50 <= t_cur <= 42.35) else 1.0
    for b in range(4):
        tb = t_cur + b * beat1
        if tb >= 46.85:
            break
        place(music, pizz_bass(midi(bass_walk[b]), 0.28), tb, 0.42 * dip)
        if b in (0, 2):
            place(music, wood_perc("cajon"), tb, 0.32 * dip)
        else:
            place(music, reed_chord(chord_voicing, 0.20), tb, 0.35 * dip)
            place(music, wood_perc("clave"), tb, 0.30 * dip)
        place(music, wood_perc("shaker"), tb + beat1 * 0.64, 0.26 * dip)
        m_note = lick[(b * 2 + bar) % len(lick)]
        place(music, chapei_pluck(midi(m_note), 0.36, 2.0 if b == 0 else 0.0), tb, 0.38 * dip)
    bar += 1
    t_cur += beat1 * 4

# Crisp final acoustic Chapei + Upright Bass button chord at 46.95s!
for k, mn in enumerate([60, 64, 67, 72, 76]):
    place(music, chapei_pluck(midi(mn), 0.72), 46.92 + k * 0.028, 0.34)
place(music, pizz_bass(midi(36), 0.65), 46.92, 0.46)
place(music, wood_perc("clave"), 47.02, 0.36)


# ==============================================================================
# 3. 100% BESPOKE PROP & GAG FOLEY / SFX SUITE (ZERO reused functions!)
# ==============================================================================
sfx = np.zeros(N, np.float32)
noise = lambda d: rng.standard_normal(int(round(d * SR))).astype(np.float32)


def sniffle_whimper():
    """Double nasal cartoon sniff-sniff + trembling vocal-formant whimper (យំសស្រាក់)."""
    d = 0.68; n = int(round(d * SR)); t = np.arange(n) / SR
    sn1 = hp_fast(lp_fast(noise(d), 3400), 1100) * np.exp(-((t - 0.08) ** 2) / 0.0012) * 0.58
    sn2 = hp_fast(lp_fast(noise(d), 3600), 1200) * np.exp(-((t - 0.20) ** 2) / 0.0012) * 0.62
    f = 490 - 110 * np.clip((t - 0.28) / 0.38, 0, 1) + 18 * np.sin(2 * np.pi * 14 * t)
    whim = (t >= 0.28) * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-np.maximum(0, t - 0.28) * 6.5) * 0.38
    return (sn1 + sn2 + lp_fast(whim.astype(np.float32), 1400)).astype(np.float32)


def creek_frogs_ambience():
    """Babbling creek water gurgle + authentic Cambodian paddy frog double-croak (ក្រោមស្ពាន)."""
    d = 0.92; n = int(round(d * SR)); t = np.arange(n) / SR
    bub = np.sin(2 * np.pi * (520 + 180 * np.sin(2 * np.pi * 19 * t)) * t) * np.sin(np.pi * t / d) ** 2 * 0.16
    # Ribbit-ribbit!
    cr = np.zeros(n, np.float32)
    for t0 in (0.14, 0.34):
        idx = int(t0 * SR); ln = int(0.11 * SR)
        ts = np.arange(ln) / SR
        pulse = (0.5 + 0.5 * np.sin(2 * np.pi * 58 * ts)) * np.sin(2 * np.pi * 285 * ts) * np.sin(np.pi * ts / 0.11)
        cr[idx : idx + ln] += pulse * 0.42
    return (bub + lp_fast(cr, 1600)).astype(np.float32)


def spy_mystery_chord():
    """Mischievous plucked Chapei mystery sting + wood-ratchet click for «អាវុធសម្ងាត់មួយ»!"""
    d = 0.78; n = int(round(d * SR))
    out = np.zeros(n, np.float32)
    for k, m in enumerate([64, 67, 70, 75]):  # Diminished-7th cheeky prank reveal!
        pl = chapei_pluck(midi(m), 0.55)
        i = int(k * 0.045 * SR)
        ln = min(len(pl), n - i)
        out[i : i + ln] += pl[:ln] * 0.42
    return out


def hollow_wood_nuh_uh():
    """Dry double hollow bamboo/woodblock 'uh-uh' headshake («គាត់មិនប្រើកម្លាំងទេ»)."""
    d = 0.38; n = int(round(d * SR))
    out = np.zeros(n, np.float32)
    for t0, f0 in [(0.02, 740.0), (0.17, 560.0)]:
        i = int(t0 * SR); ln = int(0.12 * SR); ts = np.arange(ln) / SR
        knock = (np.sin(2 * np.pi * f0 * ts) + 0.45 * np.sin(2 * np.pi * f0 * 1.58 * ts)) * np.exp(-ts * 38.0) * 0.55
        out[i : i + ln] += knock
    return out


def timpani_serious_hit():
    """Deep theatrical timpani drum pitch-bend + tense low string shadow («ទឹកមុខម៉ឺងម៉ាត់បំផុត»)."""
    d = 0.88; n = int(round(d * SR)); t = np.arange(n) / SR
    f = 96.0 - 22.0 * np.exp(-t * 8.0)
    timp = (np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.35 * np.sin(3 * np.pi * np.cumsum(f) / SR)) * np.exp(-t * 4.5) * 0.58
    mallet = lp_fast(noise(0.05), 900) * np.exp(-np.arange(int(round(0.05 * SR))) / SR * 75) * 0.45
    timp[: len(mallet)] += mallet
    return timp.astype(np.float32)


def timber_bridge_steps():
    """Hollow wooden plank footsteps + timber creak as Mom walks across the creek bridge."""
    d = 1.05; n = int(round(d * SR))
    out = np.zeros(n, np.float32)
    for k in range(4):
        i = int(k * 0.24 * SR); ln = int(0.14 * SR); ts = np.arange(ln) / SR
        thud = np.sin(2 * np.pi * (145 + (k % 2) * 22) * ts) * np.exp(-ts * 28.0) * 0.46
        creak = np.sin(2 * np.pi * (410 + 45 * np.sin(2 * np.pi * 16 * ts)) * ts) * np.exp(-ts * 18.0) * 0.16
        out[i : i + ln] += thud + creak
    return out


def baby_happy_coo():
    """Cute soft baby two-note 'coo-coo!' chirp when Mom cradles the rescued baby."""
    d = 0.58; n = int(round(d * SR))
    out = np.zeros(n, np.float32)
    for t0, f0, f1 in [(0.04, 580, 740), (0.26, 640, 820)]:
        i = int(t0 * SR); ln = int(0.20 * SR); ts = np.arange(ln) / SR
        f = f0 + (f1 - f0) * (ts / 0.20)
        ph = 2 * np.pi * np.cumsum(f) / SR
        coo = (np.sin(ph) + 0.3 * np.sin(2 * ph)) * np.sin(np.pi * ts / 0.20) ** 1.2 * 0.36
        out[i : i + ln] += coo
    return out


def record_scratch_gasp():
    """Crisp vinyl record-scratch halt + shocked intake gasp («ក៏ជឿស្លុង!»)."""
    d = 0.48; n = int(round(d * SR)); t = np.arange(n) / SR
    scr_f = 950 - 720 * np.clip(t / 0.22, 0, 1) + 140 * np.sin(2 * np.pi * 28 * t)
    scr = (t < 0.22) * np.sin(2 * np.pi * np.cumsum(scr_f) / SR) * 0.42
    gasp = (t >= 0.20) * hp_fast(lp_fast(noise(d), 2900), 700) * np.exp(-((t - 0.31) ** 2) / 0.0045) * 0.55
    return (scr + gasp).astype(np.float32)


def clothes_pop_and_cinch():
    """Soft fabric pops tossing shirts + crisp tight cotton Krama knot cinch («រើខោអាវ ចងជាបង្វេចក្រមា»)."""
    d = 1.25; n = int(round(d * SR))
    out = np.zeros(n, np.float32)
    for t0, f0 in [(0.05, 310), (0.32, 390), (0.58, 340)]:
        i = int(t0 * SR); ln = int(0.15 * SR); ts = np.arange(ln) / SR
        fl = hp_fast(lp_fast(noise(0.15), 2400), 500) * np.sin(np.pi * ts / 0.15) * 0.45
        pop = np.sin(2 * np.pi * f0 * ts) * np.exp(-ts * 32) * 0.32
        out[i : i + ln] += fl + pop
    # Tight Krama knot zip-cinch at 0.88s!
    i = int(0.88 * SR); ln = int(0.30 * SR); ts = np.arange(ln) / SR
    zip_f = 380 + 520 * (ts / 0.30)
    cinch = np.sin(2 * np.pi * np.cumsum(zip_f) / SR) * np.sin(np.pi * ts / 0.30) * 0.34
    out[i : i + ln] += cinch
    return out


def wooden_gate_creak():
    """Authentic wooden yard gate hinge squeak-creak as Little Bro steps out («ដើរចេញមែនទែន»)."""
    d = 0.62; n = int(round(d * SR)); t = np.arange(n) / SR
    f = 460 + 85 * np.sin(2 * np.pi * 4.2 * t) + 18 * np.sin(2 * np.pi * 31 * t)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = (np.sin(ph) + 0.55 * np.sin(2 * ph) + 0.30 * np.sin(3 * ph)) * np.sin(np.pi * t / d) ** 1.1 * 0.28
    return lp_fast(s.astype(np.float32), 2100)


def jaw_drop_heartbeat():
    """Cartoon jaw-drop clack + rapid double panic heartbeat («ភ័យស្លន់ស្លោ»)."""
    d = 0.66; n = int(round(d * SR))
    out = np.zeros(n, np.float32)
    # Jaw clack-rattle
    for k, t0 in enumerate([0.02, 0.08, 0.13]):
        i = int(t0 * SR); ln = int(0.045 * SR); ts = np.arange(ln) / SR
        out[i : i + ln] += np.sin(2 * np.pi * (880 - k * 140) * ts) * np.exp(-ts * 75) * 0.48
    # Lub-dub panic heartbeat!
    for t0, f0 in [(0.26, 78), (0.39, 96), (0.52, 82)]:
        i = int(t0 * SR); ln = int(0.11 * SR); ts = np.arange(ln) / SR
        out[i : i + ln] += np.sin(2 * np.pi * f0 * ts) * np.exp(-ts * 24) * 0.62
    return out


def rattan_triple_swish():
    """Three rapid bamboo rattan cane air-whips + sharp smack («ខ្លាចម៉ែដឹងវាយបែកគូទ!»)."""
    d = 0.64; n = int(round(d * SR))
    out = np.zeros(n, np.float32)
    for k, t0 in enumerate([0.03, 0.20, 0.37]):
        i = int(t0 * SR); ln = int(0.16 * SR); ts = np.arange(ln) / SR
        sw = hp_fast(lp_fast(noise(0.16), 4800), 1200) * np.exp(-((ts - 0.07) ** 2) / 0.0014) * 0.62
        out[i : i + ln] += sw
    # Sharp comic cane crack at end!
    i = int(0.46 * SR); ln = int(0.14 * SR); ts = np.arange(ln) / SR
    out[i : i + ln] += np.sin(2 * np.pi * (960 * np.exp(-ts * 42) + 210) * ts) * np.exp(-ts * 28) * 0.48
    return out


def dirt_skid_leg_hug():
    """Gravel dash + gritty red-dirt skid slide + soft knee-hug thump («រត់ទៅឱបជើងប្អូន»)."""
    d = 0.92; n = int(round(d * SR)); t = np.arange(n) / SR
    out = np.zeros(n, np.float32)
    # 5 fast flip-flop gravel taps
    for k in range(5):
        i = int(k * 0.085 * SR); ln = int(0.06 * SR); ts = np.arange(ln) / SR
        tap = hp_fast(lp_fast(noise(0.06), 3600), 900) * np.exp(-ts * 48) * 0.48
        out[i : i + ln] += tap
    # Dirt slide skid (0.44 - 0.72s) + hug thud (0.72s)
    skid = (t >= 0.42) * (t < 0.74) * hp_fast(lp_fast(noise(d), 2600), 650) * np.sin(np.pi * np.clip((t - 0.42) / 0.32, 0, 1)) * 0.52
    thud = (t >= 0.70) * np.sin(2 * np.pi * 115 * np.maximum(0, t - 0.70)) * np.exp(-np.maximum(0, t - 0.70) * 22) * 0.58
    return (out + skid + thud).astype(np.float32)


def snack_crunch_delight():
    """Crisp banana-leaf unwrap + double tasty cake crunch + warm Chapei harmonic chord («ទិញនំមកលួងវិញ»)!"""
    d = 0.85; n = int(round(d * SR))
    out = np.zeros(n, np.float32)
    for t0 in (0.06, 0.24):
        i = int(t0 * SR); ln = int(0.11 * SR); ts = np.arange(ln) / SR
        cr = hp_fast(lp_fast(noise(0.11), 4200), 850) * np.exp(-ts * 26) * 0.46
        out[i : i + ln] += cr
    for k, m in enumerate([67, 71, 74, 79]):
        pl = chapei_pluck(midi(m), 0.45)
        i = int((0.36 + k * 0.04) * SR)
        ln = min(len(pl), n - i)
        out[i : i + ln] += pl[:ln] * 0.38
    return out


def harp_growup_sweep():
    """Bright whole-tone acoustic string sweep upward for growing up («ពេលអ្នកធំឡើង»)."""
    d = 0.90; n = int(round(d * SR))
    out = np.zeros(n, np.float32)
    for k, m in enumerate([60, 62, 64, 66, 68, 70, 72, 76]):
        pl = chapei_pluck(midi(m), 0.36)
        i = int(k * 0.075 * SR)
        ln = min(len(pl), n - i)
        out[i : i + ln] += pl[:ln] * 0.36
    return out


def cheeky_cheek_pop():
    """Classic finger-in-cheek 'POP!' + crisp clave wink for the final comment CTA!"""
    d = 0.32; n = int(round(d * SR)); t = np.arange(n) / SR
    f = 340 + 680 * np.minimum(1.0, t / 0.055)
    pop = (t < 0.09) * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * np.clip(t / 0.09, 0, 1)) * 0.65
    cl = wood_perc("clave")
    out = pop.astype(np.float32)
    out[int(0.14 * SR) : int(0.14 * SR) + len(cl)] += cl * 1.2
    return out


F = lambda fr: fr / 30.0

# Frame-accurate placement of all 17 bespoke foley & gag cues across the 27 shots!
place(sfx, sniffle_whimper(), F(6), 0.80)             # Shot 1: Hook crying & Krama bundle trudge
place(sfx, creek_frogs_ambience(), F(106), 0.82)      # Shot 3: Under-bridge creek water & frogs!
place(sfx, spy_mystery_chord(), F(226), 0.84)         # Shot 5: «អាវុធសម្ងាត់មួយ!» secret weapon sting
place(sfx, sniffle_whimper(), F(286), 0.76)           # Shot 6: «ឲ្យយំតាមចិត្ត!» teasing tears
place(sfx, hollow_wood_nuh_uh(), F(405), 0.82)        # Shot 8: «គាត់មិនប្រើកម្លាំងទេ» woodblock 'uh-uh'
place(sfx, timpani_serious_hit(), F(445), 0.86)       # Shot 9: «ទឹកមុខម៉ឺងម៉ាត់បំផុត!» dramatic timpani
place(sfx, timber_bridge_steps(), F(561), 0.82)       # Shot 11: Mom's footsteps across wooden creek bridge
place(sfx, baby_happy_coo(), F(628), 0.84)            # Shot 12: Rescued baby happy 'coo-coo!'
place(sfx, record_scratch_gasp(), F(702), 0.84)       # Shot 13: Gullible record-scratch gasp («ជឿស្លុង!»)
place(sfx, clothes_pop_and_cinch(), F(740), 0.82)     # Shot 14-15: Tossing shirts & knotting Krama bundle
place(sfx, sniffle_whimper(), F(842), 0.78)           # Shot 16: Weeping walk to gate
place(sfx, wooden_gate_creak(), F(904), 0.82)         # Shot 17: Wooden yard gate creaks open!
place(sfx, jaw_drop_heartbeat(), F(964), 0.88)        # Shot 18: Older Bro jaw-drop & panic heartbeat!
place(sfx, rattan_triple_swish(), F(998), 0.86)       # Shot 19: Mom's bamboo rattan switch triple-swish!
place(sfx, dirt_skid_leg_hug(), F(1040), 0.86)        # Shot 20: Laterite dirt skid + knee leg-hug!
place(sfx, snack_crunch_delight(), F(1109), 0.86)     # Shot 21: Banana-leaf snacks unwrap & happy crunch!
place(sfx, harp_growup_sweep(), F(1165), 0.82)        # Shot 22-23: Growing-up Chapei sweep!
place(sfx, timpani_serious_hit(), F(1246), 0.82)      # Shot 24: Grown-Up You reuses the ultra-serious lie!
place(sfx, sniffle_whimper(), F(1276), 0.80)          # Shot 25: Youngest sibling (ប្អូនពៅ) sniffles with mini bundle!
place(sfx, cheeky_cheek_pop(), F(1366), 0.85)         # Shot 27: Cheeky 'POP!' wink for Comment CTA!

voice = load_voice("voice.mp3", N, SR)
master_mix(voice, music, sfx, out_wav="mix_raw.wav", sr=SR, music_rel_db=-6.0, sfx_max_rel_db=-6.0, sfx_max_peak_ratio=0.70)
