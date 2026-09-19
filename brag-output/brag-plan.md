# Brag Plan: HSA Plus

## What is this app?
HSA Plus is a full-stack web app for HSA / LPFSA / HCFSA power users — it stores medical
expenses with IRS audit-ready documentation, scans receipts with AI, models investment
growth, and optimizes *when* you reimburse yourself so the money compounds tax-free first.

## The angle
Almost everyone pays a medical bill and immediately takes the money back out — from the HSA
card, or by reimbursing themselves for what they put on a personal card. That reflex is the
expensive part. The IRS puts **no deadline** on reimbursing yourself for a qualified expense,
so if you pay out of pocket, save the receipt, and *leave the HSA alone*, the balance keeps
compounding tax-free until you decide to claim it. The receipt is the claim ticket, and it
never expires.

So the video is not "we track your expenses." It's **don't take the money out yet — here's
what waiting is worth, and here's where you park the receipt in the meantime.** It's specific
to this project because it's literally what `reimbursement-optimizer.tsx` computes:
`amount * (1 + rate) ^ yearsRemaining`.

## Hook (first 2-3 seconds)
A medical receipt on near-black, stamped "paid with your own card." *"You paid this one out
of pocket."* Beat. The receipt ignites emerald: *"Don't reimburse yourself yet."* — advice
that sounds wrong for two seconds and then pays off for the rest of the video.

## Key moments (the middle)
- **Where the receipt goes.** The scan actually running: cursor hits **Scan Receipt**,
  "Scanning with AI…", provider / amount / date / category populate themselves, the status
  resolves to **"Saved — claim it any time"**, and `Audit Ready · 100%` lands. The mechanic
  gets stated inside the product UI, not just in a caption.
- **The fork — this is the scene the whole video exists for.** The same $340 receipt, two
  outcomes side by side. Left: *Reimburse today → $340*, flat dashed line, "The money leaves
  your HSA. Done growing." Right: *Or claim it in 20 years → $340 counting up to $1,316*, an
  emerald curve drawing beneath it, "Compounding the whole time — at 7% a year."
- **The line that names it.** "Same receipt. Your HSA grows until you claim it."

## Outro / punchline
The triple tax advantage as three staggered lines — "Tax-free in. / Tax-free growth. /
Tax-free out." — then the wordmark, hsa.plus, and "Built for the HSA power user."

**No pricing or free-tier claim anywhere in this video.** Pricing may change; the video
should not have to be re-cut when it does.

## User flow worth showing
Entry → key action → result, from `receipt-scanner.tsx`, `expense-form-page.tsx`,
`reimbursement-optimizer.tsx`:
1. **Entry** — you've paid a bill personally; you open the dashboard and tap *Scan a Receipt*.
2. **Key action** — the AI scan populates the expense and files it audit-ready.
3. **Result** — the expense sits unreimbursed and claimable, and the optimizer shows what
   claiming later is worth versus claiming now.

Scenes 3 and 4 are the centerpiece and carry all three beats. The landing-page hero appears
once, in Scene 2, purely as a frame around the flow.

## Tone
- Preset: `polished`
- Creative direction: quiet premium fintech product film — a serious money product, shown seriously
- Interpretation: Restraint is the flex. Long settled holds (1.2–2.5s per read), soft
  crossfades (0.5s), no hype verbs, no jokes. The repo's own "Verdant Precision" philosophy
  (emerald corridor, near-black gravity, deliberate geometry, negative space as oxygen) is the
  governing style. This is a product about other people's money; confidence sells it.

## Format: landscape — 1920x1080
## Duration: 25.6 seconds

## Visual identity (from the project)
- Background (light): `#FAFAF8` · Surface `#FFFFFF` · Border `#E2E8F0` · Subtle `#F8FAFC` / `#F1F5F9`
- Background (dark): `#0C1220`
- Text: `#0C1220` primary · `#64748B` muted · `#FFFFFF` on dark
- Accent (graphic): `#059669` emerald · secondary `#34d399`
- **Contrast deviation:** faint text runs at `#6A7483` and emerald *text* at `#047C57`,
  darker than the app's `#94A3B8` / `#059669`, so every line clears WCAG AA at video scale.
  Graphic emerald is unchanged.
- Display font: Calistoga · Body: Plus Jakarta Sans · Numerals: JetBrains Mono
  (every dollar figure in this product is mono — that's kept, it's the signature)
- Signature geometry: the plus/cross mark from `public/logo.png` — accumulation, compounding

## Share copy (draft)
Introducing HSA Plus: turn medical expenses into tax-free wealth. Pay for care out of pocket,
save the receipt in the app, and let your HSA keep compounding. Claim the reimbursement
whenever you want — the IRS never put an expiration date on it.

## Audio direction
- Role: warm, restrained professional bed — support, never drive
- Music: `happy-beats-business-moves-vol-9-by-ende-dot-app.mp3` (114.84 BPM), from 0:00
- Music treatment: fade in ~0.4s; low bed throughout; lift entering the fork (Scene 4);
  fade out across the final ~1.2s so the wordmark lands nearly dry. Drawn on the
  `data-automation` volume lane. Delivered at −18.0 LUFS, −2.7 dB peak.
- Music cue guidance: bundled preset. Strong cues locked at **3.70s** (receipt ignition +
  line flip), **6.34s** (hero headline), **12.65s** (audit badge), **15.28s** (the "claim it
  in 20 years" card). Beat grid for the four field reveals: 10.54 / 11.06 / 11.60 / 12.12 —
  ~0.52s apart, acceptable only because they are 2–3 word labels revealed as a set and held
  together ~1.25s afterwards.
- Audio-reactive treatment: subtle. RMS/bass breathe the emerald glows (S1, S5) and the
  growth-chart presence (S4); soft treble lift on the wordmark. No waveform, equalizer or
  strobe. Nothing that moves copy.
- SFX posture: sparse, motion-matched, low high-frequency risk. Every cue corresponds to a
  visible event: the ignition, the cursor press, four field ticks, the audit confirm, the two
  outcome cards, the curve topping out, three outro beats, the wordmark.
- Restraint rule: no risers, no braams, no whoosh per cut, no stinger on plain text. This is a
  financial product — it must not sound like a mobile game ad.

## Storyboard  *(recut — energetic pass)*

Cuts land on bar lines of a 120 BPM bed. Transitions are **hard cuts**, not
crossfades: the outgoing scene's content drops out in one frame while the
incoming scene is already opaque on top.

### Scene 1 — What the reflex costs — 4.08s
Near-black. `ON ONE $340 RECEIPT` in mono, then **$976** SLAMS in at 268px
emerald (scale 1.32 → 1, power4.out — it does not fade up). Sentence lands in
two beats: *"That's the growth you give up"* (1.07) / *"by reimbursing yourself
today."* (2.08). Footnote `20 years at 7%` at 2.58 (beat-locked).
Audio: a heavy soft impact on the number. Full bed from frame one.
→ hard cut

### Scene 2 — Brand sting — 1.99s
Logo + **HSA Plus** punch in (scale 1.18 → 1). At 4.57 (strong cue):
*"Keep the growth."* Short, deliberate — the pivot from problem to product.
→ hard cut

### Scene 3 — Park the receipt — 5.01s
`Scan a Receipt` / *"Pay out of pocket — then park it here"*. Cursor presses
**Scan Receipt** at 6.57; progress fills; four fields land on the beat grid
(7.58 / 8.08 / 8.58 / 9.08); status resolves to **`Saved — claim it any time`**;
`Audit Ready · 100%` at 9.58. Set holds 1.5s.
→ hard cut

### Scene 4 — It grows while it waits — 5.0s
Chip: `Dr. Smith Visit | $340.00 | saved in HSA Plus`. Two cards, one beat
apart: **Reimburse today → $340**, flat dashed rule, "The money leaves your HSA.
Done growing." vs **Leave it invested → $340 counting to $1,316**, emerald curve
drawing beneath, "Compounding the whole time — at 7% a year."
Line at 13.58: *"Same receipt. Your HSA grows until you claim it."* (holds 2.2s)
→ hard cut

### Scene 5 — Claim it in one click — 5.49s
`Submit HSA Claim` / *"Whenever you're ready — one click"*. The expense row and
the connected HSA administrator (channel: Portal). Cursor presses **Submit
Claim** at 17.07 (strong cue). The status marches on the beat —
`Submitted` (17.58) → `Processing` (18.08) → `Reimbursed` (18.58) — with a
`Paid out · $340.00` badge. Connector arrows reveal with the step they point to.
Line at 19.08 (strong cue): *"You get your $340 back. **The $976 it earned stays
invested.**"* — closing the loop on the hook's number.
→ hard cut

### Scene 6 — Outro — 4.0s
Three lines fly in from the left on eighth-notes (21.57 / 21.82 / 22.07, the
third on a strong cue): **"Tax-free in." / "Tax-free growth." / "Tax-free out."**
Set holds 1.18s, then the wordmark punches in (scale 1.1 → 1) with `hsa.plus`
and **"Start with your next receipt."** — an action, not a price.

**Music:** `bed-vol1-energetic.mp3` — 27s cut from 49.94s into Happy Beats Vol. 1
(120.19 BPM), chosen because that section sustains high energy with no
breakdown. Beat grid verified by running the analyzer on the trimmed file, so
every lock is measured rather than extrapolated. Chain: `gain +5dB → limiter
-1.2dB`, delivered at −14.2 LUFS / −1.5 dB peak.
**Audio summary:** A driving bed that is part of the edit rather than a bed
under it, with every SFX matched to a visible event and the wordmark landing on
a heavy impact.
