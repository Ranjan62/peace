import { useEffect, useState } from 'react'
import { RETURN_DATE } from '../config'

const pad = (n) => String(n).padStart(2, '0')

export default function Countdown() {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const left = RETURN_DATE - now
  if (left <= 0) return <div className="count done">Peace expired. I'm back. Unfortunately.</div>

  const s = Math.floor(left / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  return (
    <div className="count" role="timer" aria-label="Peace remaining">
      <span className="dot" />
      Peace remaining: <b>{d}d {pad(h)}h {pad(m)}m {pad(s % 60)}s</b>
    </div>
  )
}
