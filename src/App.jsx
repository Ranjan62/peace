import { useEffect, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { Intro, Warning, Final } from './components/Screens'
import CameraScreen from './components/CameraScreen'
import { isMuted, setMuted, unlockAudio, playTap } from './lib/feedback'

export default function App() {
  const [screen, setScreen] = useState('intro')
  const [muted, setMutedState] = useState(isMuted())

  useEffect(() => {
    // Unlock audio on the first tap; soft tap sound on every button press.
    const onClick = (e) => {
      unlockAudio()
      if (e.target.closest('button:not(.mute)')) playTap()
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  const toggle = () => { const v = !muted; setMuted(v); setMutedState(v) }

  return (
    <main className="app">
      <button className="mute" onClick={toggle} aria-label={muted ? 'Turn sound on' : 'Turn sound off'}>
        {muted ? <VolumeX size={18} aria-hidden /> : <Volume2 size={18} aria-hidden />}
      </button>
      <div key={screen} className="enter">
        {screen === 'intro' && <Intro onNext={() => setScreen('warning')} />}
        {screen === 'warning' && <Warning onNext={() => setScreen('camera')} />}
        {screen === 'camera' && <CameraScreen onDone={() => setScreen('final')} />}
        {screen === 'final' && <Final onNext={() => setScreen('intro')} />}
      </div>
    </main>
  )
}
