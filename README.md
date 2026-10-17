# Operation: 15 Days of Peace (Unfortunately)

## Run it
```bash
npm install
npm run dev        # opens on http://localhost:5173 (also exposed on your LAN)
```
Production: `npm run build` then deploy the `dist/` folder to any static host
(Netlify, Vercel, Cloudflare Pages, GitHub Pages). **Camera access only works on
HTTPS or localhost**, so deploy to one of those before sending her the link.

## Notes
- Hand tracking: MediaPipe Tasks Vision HandLandmarker. The WASM runtime is bundled in public/wasm; only the model file loads from Google storage (needs internet).
  jsDelivr and the model file from Google's storage, once, on first camera start. Needs internet.
- Finger heart = thumb tip + index tip pinched (scaled to hand size) while at least
  two of the other three fingers are curled. Tune it in `src/lib/gesture.js`.
- Debounce: 5 consecutive matching frames. Cooldown: 2.8 s. Final screen after 3 hearts.
  Constants sit at the top of `src/components/CameraScreen.jsx`.
- If the camera is denied/unsupported or the model fails, a manual trigger button appears.
- No frames are recorded, uploaded or stored; tracks are stopped on close and on leaving the screen.

## If hand detection doesn't work
Open the site with `?debug=1` on the end of the URL (e.g. `https://you.github.io/peace/?debug=1`) to see live model status and finger measurements.
If the model can't download (blocked network/ad-blocker), save it locally once:
```bash
curl -L -o public/models/hand_landmarker.task https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task
```
then commit and push; the app tries `public/models/hand_landmarker.task` first.
