import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'

// WASM runtime is bundled in /public/wasm (no CDN needed). Only the model file is fetched.
const WASM = `${import.meta.env.BASE_URL}wasm`
const MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'

const timeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('Hand model timed out')), ms))])

let pending = null // singleton: the model is only ever initialised once

async function create(delegate) {
  const fileset = await FilesetResolver.forVisionTasks(WASM)
  return HandLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: MODEL, delegate },
    runningMode: 'VIDEO',
    numHands: 2,
    minHandDetectionConfidence: 0.4,
    minHandPresenceConfidence: 0.4,
    minTrackingConfidence: 0.4,
  })
}

export function loadDetector() {
  if (!pending) {
    pending = timeout(
      timeout(create('GPU'), 10000).catch(() => create('CPU')),
      40000,
    ).catch((e) => { pending = null; throw e })
  }
  return pending
}
