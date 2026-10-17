// MediaPipe hand landmark indices
const WRIST = 0, THUMB_TIP = 4, INDEX_TIP = 8, MIDDLE_MCP = 9
const CURLED_FINGERS = [[12, 10], [16, 14], [20, 18]] // [tip, pip] for middle, ring, pinky

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

/** ratio = thumb-index gap relative to hand size; curled = how many of the other 3 fingers are folded (0-3). */
export function measure(lm) {
  if (!lm || lm.length < 21) return { ratio: 9, curled: 0 }
  const size = dist(lm[WRIST], lm[MIDDLE_MCP]) || 1
  const ratio = dist(lm[THUMB_TIP], lm[INDEX_TIP]) / size
  const curled = CURLED_FINGERS.filter(([tip, pip]) => dist(lm[tip], lm[WRIST]) < dist(lm[pip], lm[WRIST]) * 1.2).length
  return { ratio, curled }
}

/**
 * Korean finger heart: thumb tip and index tip pinched together,
 * while at least two of the remaining three fingers are curled into the palm.
 */
export function isFingerHeart(lm) {
  const { ratio, curled } = measure(lm)
  return ratio < 0.6 && curled >= 2
}
