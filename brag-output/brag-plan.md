# Brag Plan: HSA Plus

## What is this app?
HSA Plus is a full-stack web app for HSA / LPFSA / HCFSA power users — it tracks medical
expenses with IRS audit-ready documentation, scans receipts with AI, models investment
growth, and optimizes *when* you reimburse yourself so the money compounds tax-free first.

## The angle
The product's real insight isn't "expense tracker." It's that **a medical receipt is a
financial instrument with no expiration date.** The IRS lets you reimburse yourself for a
qualified expense any year you want — so a receipt you file today and *don't* cash keeps
compounding tax-free until you do. Most people file the receipt in a drawer. HSA Plus
treats it as an asset with a future value.

That inversion — trash → asset — is the whole video. It is specific to this project
because it's what the reimbursement optimizer literally computes
(`amount * (1 + rate) ^ yearsRemaining`), not a generic fintech claim.

## Hook (first 2-3 seconds)
A single medical receipt on near-black. "Most people file this away." Beat. The receipt
lights emerald: "It's an investment." No product, no logo, no UI yet — just the reframe.

## Key moments (the middle)
- **The scan actually running.** Cursor hits "Scan Receipt" → "Uploading receipt…" →
  "Scanning with AI…" → provider / amount / date / category populate themselves, then a
  green `Audit Ready · 100%` badge lands. This is the product doing its thing.
- **The compounding payoff.** The growth curve draws up and a counter ticks
  $18,640 → $172,400 against "20-year projection" — the unreimbursed pile becoming the
  number the landing page promises.
- **The permission slip.** "Reimburse yourself. Any year you want." — the mechanic that
  makes the first two moments matter.

## Outro / punchline
The triple tax advantage as three staggered lines — "Tax-free in. / Tax-free growth. /
Tax-free out." — then the wordmark, hsa.plus, and the actual site promise:
"Free forever. No credit card required."

## User flow worth showing
Entry → key action → result, pulled from `receipt-scanner.tsx`, `expense-form-page.tsx`,
`reimbursement-optimizer.tsx`, `growth-projection.tsx`:
1. **Entry** — user opens the dashboard and taps *Scan a Receipt* ("Upload or take a photo").
2. **Key action** — AI scan runs ("Uploading receipt…" → "Scanning with AI…") and
   auto-populates the expense fields.
3. **Result** — the expense lands audit-ready and unreimbursed, and its future value shows
   up on the growth projection.

Scene 3 is the centerpiece and shows beats 1–2. Scene 4 shows beat 3. The landing-page
hero appears once, in Scene 2, purely as a frame around the flow.

## Tone
- Preset: `polished`
- Creative direction: quiet premium fintech product film — a serious money product, shown seriously
- Interpretation: Restraint is the flex. Long settled holds, soft crossfades, no jokes, no
  hype verbs. Motion is architectural and deliberate, matching the repo's own
  "Verdant Precision" design philosophy (emerald corridor, near-black gravity, geometry
  placed like a watchmaker). The product is about other people's money — confidence, not
  volume, sells it.

## Format: landscape — 1920x1080
## Duration: 21 seconds

## Visual identity (from the project)
- Background (light): `#FAFAF8` · Surface: `#FFFFFF` · Border: `#E2E8F0`
- Background (dark): `#0C1220` (landing "problem" section) / `#0F172A` (app dark theme)
- Accent: `#059669` emerald · Accent secondary: `#34d399`
- Text: `#0C1220` primary · `#64748B` muted · `#94A3B8` faint
- Display font: Calistoga (`--font-display`)
- Body font: Plus Jakarta Sans (`--font-jakarta`)
- Numeric font: JetBrains Mono (`--font-jetbrains-mono`) — every dollar figure is mono in
  this product; keep that, it's the product's signature
- Strongest visual element: the dashboard stat-card row (HSA Balance / Unreimbursed /
  This Year / Audit Score) and the emerald growth curve climbing to $172,400
- Signature geometry: the plus/cross mark — accumulation and compounding

## Share copy (draft)
Built HSA Plus — it treats every medical receipt as an asset with a future value, because
the IRS never put an expiration date on reimbursing yourself. Scan it, stay audit-ready,
let it compound tax-free.

## Audio direction
- Role: warm, restrained professional bed — support, never drive
- Music: `happy-beats-business-moves-vol-9-by-ende-dot-app.mp3` (114.84 BPM), starting at 0:00
- Music treatment: fade in over ~0.4s, sit low under the whole piece (bed, not feature),
  gentle lift entering Scene 4's counter, fade out over the last ~1.2s to land the outro clean
- Music cue guidance: preset cue file read (`cues/…vol-9….music-cues.md`). Target strong
  cues at **4.23s** (hook→reveal), **8.44s** (reveal→product), **12.65s** (audit badge lands).
  Beat grid for sequential field reveals in Scene 3: ~10.54 / 11.06 / 11.60 / 12.12 — that's
  every beat at ~0.52s, which is fine here because the fields are 2-3 word labels revealed
  as a *set* and held together for ~1.6s after the last one, not read one at a time.
- Audio-reactive treatment: subtle; use music RMS/bass to let the emerald hero glow and the
  stat-card presence breathe. No waveform, equalizer, or visualizer graphics. Nothing that
  moves text.
- SFX posture: sparse and motion-matched. Roughly 5-7 cues across 21s. Every SFX must
  correspond to something visibly happening.
- Audio-coupled moments: the receipt lighting up (Scene 1), the cursor click on Scan Receipt,
  the field-by-field population, the audit badge landing, the counter ticking, the wordmark.
- Restraint rule: no risers, no braams, no whooshes on every cut, no stingers on plain text.
  If a sound isn't matched to an on-screen event, it doesn't go in. This is a financial
  product — it must not sound like a mobile game ad.

## Storyboard

### Scene 1 — "File it away" — 4.2s
Near-black `#0C1220`. Centered, slightly angled: a medical receipt card in white, showing
real expense-shaped data — `Dr. Smith Visit · $340.00 · Mar 12, 2026`. Faint emerald radial
glow behind it, very low.
Line 1 settles under it: **"Most people file this away."** (holds ~1.6s)
On the 4.23s strong cue the receipt edge ignites emerald `#059669` and Line 1 swaps for
**"It's an investment."** (holds ~1.3s)
Sequential/interaction: yes — two-stage text swap; the receipt glow ignition is the beat event.
Audio intent: quiet, curious, a held breath. The ignition is the first real sound.
Audio-coupled idea: one soft interface tone on the emerald ignition at 4.23s. Nothing before it.
Music: warm low bed, just entering.
Transition mood: soft crossfade (0.6s) → Scene 2

### Scene 2 — The promise — 4.2s
Cut to light `#FAFAF8`. The pill badge from the real hero: `HSA + LPFSA + HCFSA` in mono,
uppercase, `#059669`, with the pulsing dot. Below it, the actual hero headline at display
scale in Calistoga:
**"Turn medical expenses into tax-free wealth"** — with "tax-free wealth" carrying the
emerald gradient treatment and the soft underline bar the site uses.
Headline holds fully settled ~2.2s.
Sequential/interaction: none — single confident reveal, headline rises ~16px and settles.
Audio intent: open up. The bed gains a little air.
Audio-coupled idea: none. Let this one land silent over the music — restraint.
Music: bed continues, slight lift.
Transition mood: soft crossfade (0.5s) → Scene 3

### Scene 3 — The scan (centerpiece) — 4.8s
The working app. White card on `#FAFAF8` with the product's border `#E2E8F0` and
`shadow-surface-lg`. Header reads `Scan a Receipt` with the subtitle `Upload or take a photo`.
Beat A (~8.6s): a cursor moves in and clicks the emerald **Scan Receipt** button.
Beat B (~9.2s): status line cycles `Uploading receipt…` → `Scanning with AI…` with a thin
emerald progress bar filling.
Beat C (10.54 / 11.06 / 11.60 / 12.12): four expense fields populate themselves one per beat —
`Provider: Dr. Smith` · `Amount: $340.00` · `Date: Mar 12, 2026` · `Category: Office Visit`.
Values type/fade in; mono for the amount and date.
Beat D (12.65s strong cue): the green **`Audit Ready · 100%`** badge lands with a check.
All four fields plus the badge hold together ~1.5s before the cut.
Sequential/interaction: yes — simulated cursor click, then four field reveals one per beat,
then the badge. This scene must feel like a demo, not a slide.
Audio intent: competent machinery. Crisp, light, precise — the sound of something working.
Audio-coupled idea: soft UI click on the cursor press; four very light interface ticks on the
field arrivals (quieter each time, or identical and low); one clean confirm tone on the badge.
Music: bed holds steady underneath, doesn't compete with the ticks.
Transition mood: soft crossfade (0.5s) → Scene 4

### Scene 4 — What it becomes — 4.2s
`#FAFAF8`. The emerald growth curve from the real projection chart draws left→right with the
`#059669` → `#34d399` gradient fill beneath it, milestone dots at 5 / 10 / 15 / 20 years.
A mono counter above it ticks **$18,640 → $172,400** over ~1.6s, easing out.
Axis labels stay faint `#94A3B8`: `Today` … `20-year projection`.
As the curve tops out, one line settles bottom-left:
**"Reimburse yourself. Any year you want."** (holds ~1.5s)
Sequential/interaction: yes — curve draw and counter tick run together; milestone dots pop
as the curve passes each one.
Audio intent: lift and arrival. This is the emotional peak — still restrained, but it opens.
Audio-coupled idea: low continuous tick or soft rising presence under the counter; four
near-inaudible dot pops as milestones pass; one warm low tone as the curve tops out.
Music: gentle swell here — the one place the bed is allowed forward.
Transition mood: soft crossfade (0.6s) → Scene 5

### Scene 5 — Triple tax-free — 3.6s
Back to near-black `#0C1220`, closing the loop with Scene 1. Three short lines stagger up,
~0.45s apart, each in white with an emerald plus-mark:
**"Tax-free in." / "Tax-free growth." / "Tax-free out."** — full set holds ~1.2s.
Then they recede and the HSA Plus wordmark + plus-mark settles center, with
`hsa.plus` in mono `#34d399` beneath, and faint below that:
`Free forever. No credit card required.`
Final frame holds ~1.0s, still, before the fade.
Sequential/interaction: yes — three-line stagger, then logo resolve.
Audio intent: close with certainty. Three quiet beats, then rest.
Audio-coupled idea: one soft low accent per tax-free line (same sound, three times); one
final warm tone on the wordmark. Then silence under the last ~0.5s.
Music: fade out across the final ~1.2s so the last frame is nearly dry.
Transition mood: fade to final hold — end.

**Music mood for this video:** upbeat-restrained corporate warmth, used as a bed
**Audio summary:** A quiet emerald-toned bed that stays out of the way, punctuated only by
sounds matched to real on-screen events — an ignition, a click, four field ticks, a confirm,
a counter swell — opening slightly for the growth curve and fading to near-silence on the
wordmark.
