import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ShieldAlert } from 'lucide-react'
import Countdown from './Countdown'

export function Intro({ onNext }) {
  return (
    <section className="screen">
      <p className="eyebrow">CLASSIFIED FRIENDSHIP BUSINESS</p>
      <h1>15 days of peace.<br />For you. Unfortunately.</h1>
      <p className="lede">Congratulations. You have temporarily been granted freedom from my nonsense.</p>
      <p className="lede">Please use this time responsibly. We both know you won't.</p>
      <div className="stamp" role="status"><span className="dot" />TEMPORARY FREEDOM: ACTIVE</div>
      <button className="btn" onClick={onNext}>Okay, what's the catch? <ArrowRight size={18} aria-hidden /></button>
      <p className="tiny">Proceeding means accepting absolutely no terms and conditions.</p>
      <Countdown />
    </section>
  )
}

export function Warning({ onNext }) {
  return (
    <section className="screen">
      <div className="card warn">
        <ShieldAlert size={28} aria-hidden className="accent" />
        <h2>WAIT. ONE IMPORTANT TEST.</h2>
        <p className="lede">Before you enjoy your 15-day VIP freedom package, we need to verify one thing.</p>
        <p className="tiny">Nothing suspicious. Probably.</p>
      </div>
      <button className="btn" onClick={onNext}>Start the highly scientific test</button>
    </section>
  )
}

export function Final({ onNext }) {
  const [toast, setToast] = useState(false)
  const timer = useRef()
  useEffect(() => () => clearTimeout(timer.current), [])
  const click = () => { setToast(true); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(false), 6000) }
  return (
    <section className="screen">
      <div className="badge">FRIENDSHIP SUBSCRIPTION: TEMPORARILY PAUSED</div>
      <Countdown />
      <h1>Okay, emotional quota completed.</h1>
      <p className="lede">Now go enjoy your freedom.</p>
      <p className="lede">I'll return after 15 days to resume disturbing your peace.</p>
      <button className="btn" onClick={click}>Fine, go be annoying somewhere else</button>
      <button className="link" onClick={onNext}>Replay the test</button>
      <div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">
        {toast && 'Request accepted. Missing-you privileges remain active in the background. Unfortunately. 🗿'}
      </div>
    </section>
  )
}
