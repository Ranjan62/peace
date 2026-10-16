import { useCallback, useEffect, useRef, useState } from 'react'
import { CameraOff, Camera, Hand } from 'lucide-react'
import HeartBurst from './HeartBurst'
import { loadDetector } from '../lib/handDetector'
import { isFingerHeart } from '../lib/gesture'
import { playHeart, buzz } from '../lib/feedback'

const MESSAGES = [
  'CAUGHT. You made a heart. We have evidence.',
  'Affection detected. Denial will not be accepted.',
  'Breaking news: Local human displays 0.4 seconds of softness.',
  'Heart received. Your reputation is in danger.',
  'SYSTEM ERROR: Too much cuteness, insufficient brain cells.',
  "Relax. It's just a finger. Don't start planning the wedding.",
  'This incident will be used against you in future arguments.',
  'Congratulations. You have unlocked absolutely nothing.',
]
const GOAL = 3           // successful hearts before the final screen
const HOLD_FRAMES = 5    // gesture must persist this many detections (debounce)
const COOLDOWN_MS = 2800 // a held gesture can't retrigger inside this window

export default function CameraScreen({ onDone }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const detectorRef = useRef(null)
  const lastTrigger = useRef(-Infinity)
  const lastMsg = useRef(-1)
  const timers = useRef([])
  const handsSeen = useRef(false)

  const [phase, setPhase] = useState('idle') // idle | starting | live | error
  const [error, setError] = useState('')
  const [modelState, setModelState] = useState('loading') // loading | ready | failed
  const [hands, setHands] = useState(false)
  const [count, setCount] = useState(0)
  const [burst, setBurst] = useState(0)
  const [message, setMessage] = useState('')
  const [flash, setFlash] = useState(false)

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  useEffect(() => () => { stopCamera(); timers.current.forEach(clearTimeout) }, [stopCamera])

  const fire = useCallback(() => {
    const now = performance.now()
    if (now - lastTrigger.current < COOLDOWN_MS) return
    lastTrigger.current = now
    let i
    do { i = Math.floor(Math.random() * MESSAGES.length) } while (i === lastMsg.current)
    lastMsg.current = i
    setMessage(MESSAGES[i])
    setBurst((b) => b + 1)
    playHeart()
    buzz()
    setFlash(true)
    timers.current.push(setTimeout(() => setFlash(false), 1800))
    setCount((c) => {
      const next = c + 1
      if (next === GOAL) timers.current.push(setTimeout(() => { stopCamera(); onDone() }, 3200))
      return next
    })
  }, [onDone, stopCamera])

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser can't open a camera here. Camera access needs HTTPS (or localhost) and a modern browser. The manual button still works.")
      setPhase('error'); setModelState('failed'); return
    }
    setPhase('starting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false,
      })
      streamRef.current = stream
      const v = videoRef.current
      v.srcObject = stream
      await v.play()
      setPhase('live')
      loadDetector()
        .then((d) => { detectorRef.current = d; setModelState('ready') })
        .catch((e) => { console.error('Hand model failed to load:', e); setModelState('failed') })
    } catch (e) {
      stopCamera()
      const denied = e?.name === 'NotAllowedError' || e?.name === 'SecurityError'
      setError(denied
        ? 'Camera permission was denied. Allow it in your browser settings and try again, or use the manual button.'
        : e?.name === 'NotFoundError' ? 'No camera found on this device. Use the manual button instead.'
        : 'The camera failed to start. Use the manual button instead.')
      setPhase('error'); setModelState('failed')
    }
  }

  const close = () => { stopCamera(); setPhase('idle'); setHands(false); handsSeen.current = false }

  useEffect(() => {
    if (phase !== 'live' || modelState !== 'ready') return
    const det = detectorRef.current
    const v = videoRef.current
    let raf, lastTime = -1, hold = 0
    const tick = () => {
      if (v.readyState >= 2 && v.currentTime !== lastTime) {
        lastTime = v.currentTime
        try {
          const lms = det.detectForVideo(v, performance.now()).landmarks || []
          const seen = lms.length > 0
          if (seen !== handsSeen.current) { handsSeen.current = seen; setHands(seen) }
          hold = lms.some(isFingerHeart) ? hold + 1 : 0
          if (hold >= HOLD_FRAMES) { hold = 0; fire() }
        } catch { /* skip a bad frame */ }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase, modelState, fire])

  let status = 'Camera warming up…'
  if (flash) status = 'Gesture detected. Absolutely suspicious.'
  else if (phase === 'live' && modelState === 'ready') status = hands ? 'Hands detected. Interesting.' : 'Show me a hand. Slowly.'
  else if (modelState === 'failed') status = 'Detector unavailable. Manual mode engaged.'

  const live = phase === 'live'
  const manual = modelState === 'failed' || phase === 'error'

  return (
    <section className="screen">
      <h2>Make a Korean heart. Don't embarrass yourself.</h2>
      <p className="lede small">Finger-heart detection system v1.0 — accuracy not guaranteed, dignity definitely not included.</p>

      <div className="viewport">
        <video ref={videoRef} playsInline muted className={live ? 'on' : ''} />
        {phase === 'idle' && (
          <div className="overlay">
            <Camera size={30} aria-hidden />
            <p>Your camera runs only in this tab to spot a hand. Nothing is recorded, uploaded or saved.</p>
            <button className="btn" onClick={start}>Turn on camera</button>
          </div>
        )}
        {phase === 'starting' && <div className="overlay"><p>Asking your browser nicely…</p></div>}
        {phase === 'error' && (
          <div className="overlay">
            <p>{error}</p>
            <button className="btn ghost" onClick={start}>Try camera again</button>
          </div>
        )}
        {live && <button className="close" onClick={close} aria-label="Turn camera off"><CameraOff size={18} aria-hidden /></button>}
        <HeartBurst trigger={burst} />
        {live && <div className="pill" role="status" aria-live="polite"><span className={`dot ${hands ? 'hot' : ''}`} />{status}</div>}
      </div>

      <p className={`msg ${message ? 'has' : ''}`} role="status" aria-live="polite">{message || 'Hearts collected: ' + count + ' / ' + GOAL}</p>
      {message && <p className="tiny">Hearts collected: {count} / {GOAL}</p>}

      {manual && (
        <button className="btn ghost" onClick={fire}><Hand size={18} aria-hidden /> Trigger the heart manually</button>
      )}
    </section>
  )
}
