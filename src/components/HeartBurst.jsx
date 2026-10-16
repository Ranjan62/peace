import { useEffect, useState } from 'react'

const rand = (a, b) => a + Math.random() * (b - a)
let uid = 0

function Heart({ size }) {
  return (
    <svg width={size} height={size * 0.9} viewBox="0 0 100 90" className="hb-svg">
      <path d="M50 88C20 62 4 46 4 26 4 12 15 2 29 2c9 0 17 5 21 12C54 7 62 2 71 2c14 0 25 10 25 24 0 20-16 36-46 62z" fill="url(#hb-fill)" />
      <ellipse cx="30" cy="22" rx="13" ry="7" transform="rotate(-32 30 22)" fill="#fff" opacity=".5" />
    </svg>
  )
}

/** FaceTime-style reaction: one big beating pink heart + a rising swarm of smaller ones. */
export default function HeartBurst({ trigger }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    if (!trigger) return
    const hearts = Array.from({ length: 16 }, () => ({
      id: ++uid,
      size: rand(30, 90),
      style: {
        left: `${rand(15, 85)}%`,
        '--dx': `${rand(-60, 60)}px`,
        '--dy': `${rand(-420, -220)}px`,
        animationDuration: `${rand(1.9, 2.8)}s`,
        animationDelay: `${rand(0.15, 0.8)}s`,
      },
    }))
    const batch = [{ id: ++uid, hero: true }, ...hearts]
    setItems((p) => [...p, ...batch])
    const ids = new Set(batch.map((b) => b.id))
    const t = setTimeout(() => setItems((p) => p.filter((x) => !ids.has(x.id))), 3800)
    return () => clearTimeout(t)
  }, [trigger])

  return (
    <div className="hb" aria-hidden="true">
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <radialGradient id="hb-fill" cx="35%" cy="25%" r="85%">
            <stop offset="0" stopColor="#ff9fc0" />
            <stop offset=".55" stopColor="#ff4f86" />
            <stop offset="1" stopColor="#e11d5f" />
          </radialGradient>
        </defs>
      </svg>
      {items.map((p) =>
        p.hero ? (
          <span key={p.id} className="hb-hero"><span className="hb-beat"><Heart size={170} /></span></span>
        ) : (
          <span key={p.id} className="hb-rise" style={p.style}><span className="hb-beat small"><Heart size={p.size} /></span></span>
        ),
      )}
    </div>
  )
}
