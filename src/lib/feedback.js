// Tiny synthesized sounds (no audio files) + vibration. All gated by one mute switch.
let ctx = null
let muted = false
try { muted = localStorage.getItem('muted') === '1' } catch { /* ignore */ }

export const isMuted = () => muted
export function setMuted(v) {
  muted = v
  try { localStorage.setItem('muted', v ? '1' : '0') } catch { /* ignore */ }
}

// Browsers only allow audio after a user gesture, so call this on the first tap.
export function unlockAudio() {
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return
  if (!ctx) ctx = new AC()
  if (ctx.state === 'suspended') ctx.resume()
}

function tone({ type = 'sine', from, to = from, start = 0, dur = 0.2, gain = 0.3 }) {
  if (!ctx || muted) return
  const t = ctx.currentTime + start
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.setValueAtTime(from, t)
  o.frequency.exponentialRampToValueAtTime(to, t + dur)
  g.gain.setValueAtTime(gain, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(ctx.destination)
  o.start(t)
  o.stop(t + dur + 0.05)
}

export function playTap() {
  tone({ type: 'triangle', from: 520, to: 380, dur: 0.08, gain: 0.12 })
}

// lub-dub heartbeat + sparkle chime
export function playHeart() {
  tone({ from: 160, to: 55, dur: 0.2, gain: 0.55 })
  tone({ from: 140, to: 50, start: 0.22, dur: 0.24, gain: 0.5 })
  tone({ type: 'triangle', from: 988, start: 0.12, dur: 0.6, gain: 0.12 })
  tone({ type: 'triangle', from: 1318, start: 0.2, dur: 0.7, gain: 0.1 })
  tone({ type: 'triangle', from: 1760, start: 0.3, dur: 0.8, gain: 0.07 })
}

export function buzz(pattern = [60, 40, 60, 40, 140]) {
  if (muted) return
  try { navigator.vibrate?.(pattern) } catch { /* unsupported */ }
}
