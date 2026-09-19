# Hyperframes Composition Brief: HSA Plus

## Objective
A short launch-style brag video for HSA Plus — a premium, restrained product film whose job
is to make one mechanic obvious: pay out of pocket, save the receipt, let the HSA compound,
claim the reimbursement whenever you want.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080 · Duration: 23.3s

## Source Material
- Project root: `/home/user/hsa_app`
- Primary files read: `src/app/page.tsx`, `src/app/globals.css`, `src/app/layout.tsx`,
  `README.md`, `docs/design-philosophy.md`, `src/components/dashboard/receipt-scanner.tsx`,
  `reimbursement-optimizer.tsx`, `growth-projection.tsx`, `public/logo.png`
- Product name: **HSA Plus** · Tagline: "Turn medical expenses into tax-free wealth"
- Key UI to recreate: the **Scan a Receipt** panel mid-scan; the claim-now-vs-claim-later
  comparison derived from the reimbursement optimizer
- Copy that must appear verbatim:
  - `You paid this one out of pocket.` / `Don't reimburse yourself yet.` *(written for the hook)*
  - `Paid with your own card` *(written — the premise the video hangs on)*
  - `HSA + LPFSA + HCFSA` · `Turn medical expenses into tax-free wealth`
  - `Scan a Receipt` / `Upload or take a photo` / `Uploading receipt…` / `Scanning with AI…`
  - `Saved — claim it any time` *(written; states the mechanic inside the product UI)*
  - `Audit Ready` · `100%`
  - `Reimburse today` / `Or claim it in 20 years` / `Compounding the whole time — at 7% a year`
  - `Same receipt. Your HSA grows until you claim it.`
  - `Tax-free in.` / `Tax-free growth.` / `Tax-free out.` *(from the triple tax advantage section)*
  - `HSA Plus` · `hsa.plus` · `Built for the HSA power user.`

## Hard constraint: no pricing claims
**Nothing in this video may state or imply a price, a free tier, or "no credit card".**
Pricing is expected to change. The earlier cut closed on "Free forever. No credit card
required." — that line is removed and must not come back. The outro closes on
`Built for the HSA power user.` instead.

## Creative Direction
- Tone preset: `polished` · Direction: quiet premium fintech product film
- Interpretation: restraint is the flex — long settled holds, soft crossfades, no hype verbs.
  The repo's "Verdant Precision" philosophy governs: emerald corridor, near-black gravity,
  deliberate geometry, negative space as oxygen.
- Angle: everyone reflexively takes the money back out of the HSA. That reflex is the
  expensive part, because the IRS sets no deadline on reimbursing yourself. Pay out of
  pocket, file the receipt, leave the balance alone, claim it whenever. The video shows the
  fork explicitly rather than describing it.
- Hook: a receipt marked "paid with your own card" → "Don't reimburse yourself yet."
- Outro: triple tax-free, then the wordmark. No pricing.
- Avoid: generic SaaS language; abstract filler; brand redesign; anything that makes a
  financial product feel like a mobile game ad.

## Visual Identity
- Light `#FAFAF8` / Surface `#FFFFFF` / Border `#E2E8F0` / Subtle `#F8FAFC`, `#F1F5F9`
- Dark `#0C1220` · Text `#0C1220`, muted `#64748B`
- Graphic accent `#059669`, secondary `#34d399`
- **Contrast deviation from the app:** faint text `#6A7483` (app: `#94A3B8`) and emerald
  *text* `#047C57` (app: `#059669`), so all 33 text checks clear WCAG AA at video scale.
  Graphic emerald is the app's value, unchanged.
- Calistoga (display) · Plus Jakarta Sans (body) · JetBrains Mono (all currency — the
  product's signature; do not substitute a proportional face)
- The plus/cross mark from `public/logo.png` is the real product mark; use it directly.

## Storyboard
`brag-output/brag-plan.md` is the creative contract.

1. **You paid it yourself** — 5.4s — receipt + "paid with your own card" chip on near-black;
   "You paid this one out of pocket." → ignition at 3.70 → "Don't reimburse yourself *yet.*"
2. **The promise** — 3.4s — pill + hero headline, emerald gradient, single reveal.
3. **Where the receipt goes** — 5.1s — cursor clicks Scan Receipt → scanning → four fields on
   the beat grid → "Saved — claim it any time" → `Audit Ready · 100%` at 12.65.
4. **Claim now, or let it grow** — 5.4s — the fork. $340 flat vs $340→$1,316 with the curve,
   then "Same receipt. Your HSA grows until you claim it."
5. **Triple tax-free** — 4.0s — three staggered lines, then wordmark + hsa.plus + "Built for
   the HSA power user."

## Audio
- Role: warm restrained bed. Arc: quiet → opens on the promise → crisp through the scan →
  one lift on the fork → three quiet beats → near-dry final frame.
- Music: `happy-beats-business-moves-vol-9-by-ende-dot-app.mp3` (114.84 BPM) from 0:00, fades
  and the Scene-4 lift drawn on the `data-automation` volume lane. Target ≈ −18 LUFS with
  peak ≤ −2 dB (an earlier cut shipped at −27 LUFS and was inaudible).
- Cue guidance: bundled preset. Lock 4 strong cues — 3.70 (ignition), 6.34 (headline),
  12.65 (audit badge), 15.28 (the "claim it in 20 years" card). Beat-grid the four field
  reveals at 10.54 / 11.06 / 11.60 / 12.12 and hold the set afterwards.
- Audio-reactive: subtle. RMS/bass on the emerald glows and the chart presence; soft treble
  on the wordmark. No waveform/equalizer/strobe. Nothing that moves copy.
- SFX: sparse, motion-matched, low high-frequency risk (`sfx-analysis.md`). Every cue maps to
  a visible event. No risers, braams, or per-cut whooshes.
- Assets live in `brag-output/composition/assets/`.

## Hyperframes Instructions
Load `hyperframes-core`, `hyperframes-animation`, `hyperframes-creative`,
`hyperframes-keyframes`, `hyperframes-cli`. This is the `/brag` workflow — do not enter the
`hyperframes` entry-point intent interview or its generic promo workflow.

Requirements:
- Show real UI from the source project (Scene 3 is the contract).
- Honor the settled-hold floors in the plan; keep every line readable.
- Stay within 15–25s.
- No pricing or free-tier claim, per the hard constraint above.
- Ship local `@font-face` files — a named `font-family` without one fails lint.
- `npx hyperframes check` must pass with zero errors before render.
