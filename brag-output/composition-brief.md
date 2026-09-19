# Hyperframes Composition Brief: HSA Plus

## Objective
Create a short launch-style brag video for HSA Plus — a premium, restrained product film
that reframes a medical receipt as a compounding asset and then shows the app doing the work.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 21 seconds

## Source Material
- Project root: `/home/user/hsa_app`
- Primary files read: `src/app/page.tsx` (landing), `src/app/globals.css` (tokens),
  `src/app/layout.tsx` (fonts), `README.md`, `docs/design-philosophy.md`,
  `src/components/dashboard/receipt-scanner.tsx`, `reimbursement-optimizer.tsx`,
  `growth-projection.tsx`, `dashboard-shell.tsx`
- Product name: **HSA Plus**
- Tagline / strongest claim: "Turn medical expenses into tax-free wealth"
- Key UI to recreate: the **Scan a Receipt** panel mid-scan with fields auto-populating and
  the `Audit Ready · 100%` badge landing; and the emerald **growth projection curve**
  climbing to `$172,400`
- Copy that must appear verbatim (all of it is the project's own copy):
  - `Most people file this away.` *(written for the hook — the only non-source line)*
  - `It's an investment.` *(written for the hook)*
  - `HSA + LPFSA + HCFSA`
  - `Turn medical expenses into tax-free wealth`
  - `Scan a Receipt` / `Upload or take a photo` / `Uploading receipt…` / `Scanning with AI…`
  - `Audit Ready` · `100%`
  - `20-year projection` · `$172,400` · `Today`
  - `Reimburse yourself. Any year you want.` *(compressed from "No expiration on reimbursement")*
  - `Tax-free in.` / `Tax-free growth.` / `Tax-free out.` *(from the triple tax advantage section:
    "Tax-free contributions / Tax-free growth / Tax-free withdrawals")*
  - `HSA Plus` · `hsa.plus` · `Free forever. No credit card required.`

## Creative Direction
- Tone preset: `polished`
- Creative direction: quiet premium fintech product film — a serious money product, shown seriously
- Interpretation: Restraint is the flex. Long settled holds (1.2–2.2s per read), soft
  crossfades (0.5–0.6s), no hype verbs, no jokes. Motion is architectural and deliberate —
  entrances are short (0.4–0.6s) and then things *stop*. The repo's own design philosophy
  ("Verdant Precision": emerald corridor, near-black gravity, geometry placed deliberately,
  negative space as oxygen) is the governing style. This is a product about other people's
  money; confidence sells it, not volume.
- Angle: The product's real insight isn't "expense tracker" — it's that a medical receipt is a
  financial instrument with no expiration date. The IRS lets you reimburse yourself for a
  qualified expense any year you want, so a receipt you file today and *don't* cash keeps
  compounding tax-free until you do. Most people file the receipt in a drawer. HSA Plus treats
  it as an asset with a future value. That inversion — trash → asset — is the whole video, and
  it is specific to this project because it's literally what `reimbursement-optimizer.tsx`
  computes (`amount * (1 + rate) ^ yearsRemaining`).
- Hook: A single medical receipt on near-black. "Most people file this away." Beat. The receipt
  ignites emerald: "It's an investment."
- Outro / punchline: Triple tax-free as three staggered lines, then the wordmark, `hsa.plus`,
  and "Free forever. No credit card required."
- Avoid:
  - Generic SaaS language ("streamline", "supercharge", "effortless")
  - Abstract filler visuals — no orbs, particles, or motion-graphics wash
  - Any redesign of the brand; the emerald/near-black system is fixed
  - Anything that makes a financial product feel like a mobile game ad

## Visual Identity
- Background (light): `#FAFAF8` · Surface `#FFFFFF` · Border `#E2E8F0` · Subtle `#F8FAFC` / `#F1F5F9`
- Background (dark): `#0C1220`
- Text: `#0C1220` primary · `#64748B` muted · `#94A3B8` faint · `#FFFFFF` on dark
- Accent: `#059669` emerald · secondary `#34d399`
- Display font: Calistoga (ship a local `@font-face`; fallback Georgia/serif)
- Body font: Plus Jakarta Sans (ship local; fallback system sans)
- Numeric font: JetBrains Mono (ship local) — **every dollar figure in this product is mono.
  Keep that.** It is the product's signature and must not be replaced with a proportional face.
- Visual references from the project:
  - Dashboard stat-card row: HSA Balance `$47,280` / Unreimbursed `$18,640` / Audit Score `100%`
  - The hero's emerald gradient headline treatment with the soft underline bar
  - The mono uppercase pill badge with the pulsing emerald dot
  - The emerald growth curve with gradient fill and milestone dots (5/10/15/20 yr)
  - The plus/cross mark as the signature geometry (accumulation, compounding)

## Storyboard
Use the storyboard in `brag-output/brag-plan.md` as the creative contract.

Scene summary:
1. **"File it away"** — 4.2s — angled receipt card (`Dr. Smith Visit · $340.00 · Mar 12, 2026`)
   on near-black; "Most people file this away." holds, then the receipt ignites emerald on the
   4.23s cue and the line swaps to "It's an investment."
2. **The promise** — 4.2s — light frame; `HSA + LPFSA + HCFSA` pill, then the real hero headline
   "Turn medical expenses into tax-free wealth" at display scale, emerald gradient on the last
   two words. Single confident reveal, holds ~2.2s.
3. **The scan (centerpiece)** — 4.8s — the working app. Cursor clicks `Scan Receipt` →
   `Uploading receipt…` → `Scanning with AI…` with progress → four fields populate one per beat
   (Provider / Amount / Date / Category) → `Audit Ready · 100%` badge lands on the 12.65s cue →
   whole set holds ~1.5s.
4. **What it becomes** — 4.2s — emerald curve draws, milestone dots pop, mono counter ticks
   `$18,640 → $172,400` under `20-year projection`; line settles:
   "Reimburse yourself. Any year you want."
5. **Triple tax-free** — 3.6s — back to near-black; three lines stagger
   ("Tax-free in." / "Tax-free growth." / "Tax-free out."), then wordmark + `hsa.plus` +
   "Free forever. No credit card required." Final still hold ~1.0s.

## Audio
- Audio role: warm, restrained professional bed — support, never drive
- Audio arc: quiet and curious → opens on the promise → crisp and mechanical through the scan →
  one gentle swell on the growth curve → three quiet beats → near-dry final frame
- Music: `happy-beats-business-moves-vol-9-by-ende-dot-app.mp3` (114.84 BPM), from 0:00
- Music treatment: fade in ~0.4s; sit low as a bed for the whole piece; gentle lift entering
  Scene 4; fade out across the final ~1.2s so the wordmark lands nearly dry. Use the
  `data-automation` volume lane for the fades rather than a flat `data-volume`.
- Music cue guidance: bundled preset read at
  `<skill-dir>/assets/music/cues/happy-beats-business-moves-vol-9-by-ende-dot-app.music-cues.md`.
  Strong cues to target: **4.23s** (hook text swap + receipt ignition), **8.44s**
  (reveal → product), **12.65s** (audit badge lands). Beat grid for the four field reveals:
  ~10.54 / 11.06 / 11.60 / 12.12. Those are ~0.52s apart, which is acceptable *here* because the
  fields are 2–3 word labels revealed as a set and held together ~1.5s after the last one — they
  are not read one at a time. Do not put any other readable line on that spacing.
- Audio-reactive treatment: **subtle**. Use RMS/bass to let the emerald radial glow behind the
  receipt (S1) and the growth curve's gradient fill (S4) breathe, and a soft treble lift on the
  wordmark (S5). 3–6% scale variation on anything near text. No waveform, equalizer, spectrum,
  particle, or strobe visuals. Nothing that moves or rescales the copy itself.
- Audio-coupled moments:
  - S1 receipt ignition (4.23s) — single soft interface tone; silence before it
  - S3 cursor press on `Scan Receipt` — UI click, matched to the press frame
  - S3 four field arrivals — four very light interface ticks on the beat grid
  - S3 `Audit Ready` badge (12.65s) — one clean confirm tone
  - S4 counter tick — low continuous presence under the count-up; warm low tone as the curve tops out
  - S5 three tax-free lines — same soft low accent three times; one final warm tone on the wordmark
- SFX selection guidance: sparse and motion-matched, roughly 5–7 cues across 21s. Every SFX must
  correspond to something visibly happening. No risers, no braams, no whoosh on every cut, no
  stinger on plain text. It must not sound like a game ad.
- SFX analysis guidance: `<skill-dir>/assets/sfx/sfx-analysis.md` / `.json`. Prefer **low
  high-frequency-risk** files — this edit is polished and repeated ticks will get harsh fast.
- Exact SFX choice: Hyperframes chooses filenames, timestamps, density, and volume based on the
  implemented animation.
- Audio files: copy the chosen music and any selected SFX into `brag-output/composition/assets/`.

## Hyperframes Instructions
Load `hyperframes-core`, `hyperframes-animation`, `hyperframes-creative`, `hyperframes-keyframes`,
`hyperframes-cli`. This is the `/brag` workflow — do not enter the `hyperframes` entry-point intent
interview or route into its generic promo / launch-video workflow. Prefer native Hyperframes
conventions over anything in `/brag`.

Requirements:
- Show at least one real UI element from the source project (Scene 3 is the contract).
- Keep all text readable — honor the settled-hold floors in the storyboard.
- Total duration 21s (within 15–25s).
- Include the music + SFX layer.
- Treat `/brag` audio notes as guidance; choose SFX after the visual animation exists.
- Treat cue metadata as optional hints; ignore any cue that hurts readability or pacing.
  Lock 3 strong cues (4.23 / 8.44 / 12.65), mark them `// beat-locked`.
- Snap the four Scene-3 field reveals to consecutive beats, mark them `// beat-grid`.
- Ship local `@font-face` files — a named `font-family` without one fails lint.
- Use local assets for audio and runtime deps where possible.
- Run `npx hyperframes check` before render — it is brag's single gate.
