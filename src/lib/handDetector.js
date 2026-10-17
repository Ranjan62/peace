import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'

const base = (p) => new URL(`${import.meta.env.BASE_URL}${p}`, window.location.href).href
const WASM = base('wasm')
const LOCAL_MODEL = base('models/hand_landmarker.task') // optional: drop the file here (see README)
const REMOTE_MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'

const timeout = (p, ms, msg) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(msg)), ms))])

let pending = null // singleton: the model is only ever initialised once

async function create(model) {
  const fileset = await FilesetResolver.forVisionTasks(WASM)
  return HandLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: model, delegate: 'CPU' }, // CPU is the most reliable across browsers/laptops
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
      create(LOCAL_MODEL).catch(() => create(REMOTE_MODEL)),
      45000,
      'Hand model timed out (slow or blocked network)',
    ).catch((e) => { pending = null; throw e })
  }
  return pending
}
