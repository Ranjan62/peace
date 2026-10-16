// MediaPipe hand landmark indices
const WRIST = 0, THUMB_TIP = 4, INDEX_TIP = 8, MIDDLE_MCP = 9
const CURLED_FINGERS = [[12, 10], [16, 14], [20, 18]] // [tip, pip] for middle, ring, pinky

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

/**
 * Korean finger heart: thumb tip and index tip pinched together (crossed),
 * while the remaining three fingers are curled into the palm.
 * Distances are normalised by hand size so it works at any camera distance.
 */
export function isFingerHeart(lm) {
  if (!lm || lm.length < 21) return false
  const size = dist(lm[WRIST], lm[MIDDLE_MCP])
  if (size < 0.02) return false
  const pinched = dist(lm[THUMB_TIP], lm[INDEX_TIP]) / size < 0.55
  if (!pinched) return false
  const curled = CURLED_FINGERS.filter(([tip, pip]) => dist(lm[tip], lm[WRIST]) < dist(lm[pip], lm[WRIST]) * 1.15).length
  return curled >= 2
}
