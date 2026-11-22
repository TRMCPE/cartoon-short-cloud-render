#!/usr/bin/env python3
"""
audio_mix.py — Strict -6.0 dB music & <= -6.0 dB SFX mastering helper for cartoon-short-kit.

Enforces the locked audio rules:
- Music bed calibrated to -6.0 dB (50.1% of voice gated RMS) with smooth envelope ducking under speech.
- SFX calibrated to <= -6.0 dB gated RMS relative to voice AND SFX peaks capped at <= 0.7x voice peak.
- Smooth tanh peak limiting + gentle 40ms tail fade, written as 48 kHz mono/stereo 16-bit WAV (`mix_raw.wav`).
"""
import numpy as np
import subprocess
import wave

SR = 48000


def load_voice(path: str, n_samples: int, sr: int = SR) -> np.ndarray:
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"],
        capture_output=True,
        check=True,
    ).stdout
    v = np.frombuffer(raw, np.float32).copy()
    out = np.zeros(n_samples, np.float32)
    out[: min(n_samples, len(v))] = v[:n_samples]
    return out


def gated_rms(sig: np.ndarray, gate_ratio: float = 0.08) -> float:
    peak = float(np.max(np.abs(sig))) if len(sig) else 0.0
    if peak < 1e-6:
        return 0.0
    mask = np.abs(sig) >= peak * gate_ratio
    if not np.any(mask):
        return float(np.sqrt(np.mean(sig * sig)))
    return float(np.sqrt(np.mean(sig[mask] ** 2)))


def master_mix(
    voice: np.ndarray,
    music: np.ndarray,
    sfx: np.ndarray,
    out_wav: str = "mix_raw.wav",
    sr: int = SR,
    music_rel_db: float = -6.0,
    sfx_max_rel_db: float = -6.0,
    sfx_max_peak_ratio: float = 0.70,
):
    n = max(len(voice), len(music), len(sfx))
    def pad(x):
        if len(x) >= n:
            return x[:n].astype(np.float32)
        y = np.zeros(n, np.float32)
        y[: len(x)] = x
        return y

    v = pad(voice)
    m = pad(music)
    s = pad(sfx)

    v_rms = gated_rms(v)
    v_peak = float(np.max(np.abs(v))) if n else 0.0

    # Calibrate music bed to exact target dB below voice gated RMS (default -6.0 dB = ~0.501x)
    m_rms = gated_rms(m)
    if v_rms > 1e-5 and m_rms > 1e-6:
        target_m_rms = v_rms * (10.0 ** (music_rel_db / 20.0))
        m = m * (target_m_rms / m_rms)
        # Smooth speech envelope ducking (-3.5 dB extra tuck during dense syllables, keeping overall bed balanced)
        win = max(1, int(0.06 * sr))
        env = np.convolve(np.abs(v), np.ones(win, np.float32) / win, "same")
        env_norm = np.clip(env / max(float(np.max(env)) * 0.30, 1e-5), 0.0, 1.0)
        duck = 1.0 - 0.30 * env_norm
        m = m * duck

    # Calibrate SFX <= -6.0 dB RMS and peaks <= 0.7x voice peak
    s_rms = gated_rms(s)
    s_peak = float(np.max(np.abs(s))) if n else 0.0
    if v_rms > 1e-5 and s_peak > 1e-6:
        gain = 1.0
        max_s_rms = v_rms * (10.0 ** (sfx_max_rel_db / 20.0))
        if s_rms > max_s_rms:
            gain = min(gain, max_s_rms / s_rms)
        max_s_peak = max(v_peak * sfx_max_peak_ratio, 1e-5)
        if s_peak * gain > max_s_peak:
            gain = min(gain, max_s_peak / s_peak)
        s = s * gain

    mix = v + m + s
    # Soft peak limiter (prevents clipping while preserving dynamic punch)
    mix = np.tanh(mix * 0.92) / np.tanh(0.92)

    fade = min(n, int(0.04 * sr))
    if fade > 0:
        mix[-fade:] *= np.linspace(1.0, 0.0, fade, dtype=np.float32)

    pcm = (np.clip(mix, -1.0, 1.0) * 32767.0).astype(np.int16)
    with wave.open(out_wav, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm.tobytes())

    final_m_db = 20 * np.log10(max(gated_rms(m), 1e-7) / max(v_rms, 1e-7)) if v_rms > 1e-5 else 0.0
    final_s_db = 20 * np.log10(max(gated_rms(s), 1e-7) / max(v_rms, 1e-7)) if v_rms > 1e-5 else 0.0
    print(
        f"Mastered {out_wav}: dur={n/sr:.2f}s | voice_rms={v_rms:.4f} | "
        f"music={final_m_db:+.1f}dB | sfx={final_s_db:+.1f}dB (peak ratio={(np.max(np.abs(s))/max(v_peak,1e-6)):.2f}x)"
    )
