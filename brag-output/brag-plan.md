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
## Duration: 23.3 seconds

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

## Storyboard

### Scene 1 — "You paid it yourself" — 5.4s
Near-black. A white medical receipt, centered: `Dr. Smith Visit · $340.00 · Mar 12, 2026`,
with a grey chip reading **"Paid with your own card"** — the detail the whole video hangs on.
Emerald radial glow behind it, low.
Line A settles at ~1.15: **"You paid this one out of pocket."** (holds 2.55s)
At the 3.70s strong cue the receipt border ignites emerald and the line flips to
**"Don't reimburse yourself *yet.*"** ("yet" in emerald; holds ~1.2s)
Sequential/interaction: two-stage text swap; the ignition is the beat event.
Audio intent: quiet, curious, a held breath. The ignition is the first real sound.
Transition: soft crossfade (0.5s) → Scene 2

### Scene 2 — The promise — 3.4s
Light frame. The real hero pill `HSA + LPFSA + HCFSA`, then the actual hero headline at
display scale: **"Turn medical expenses into tax-free wealth"**, emerald gradient and soft
underline bar on the last two words. Single confident reveal, holds ~1.9s.
Sequential/interaction: none.
Audio intent: open up; the bed gains air. No SFX — restraint.
Transition: soft crossfade (0.5s) → Scene 3

### Scene 3 — Where the receipt goes — 5.1s
The working app. `Scan a Receipt` / `Upload or take a photo`.
Cursor moves in and presses the emerald **Scan Receipt** button (~9.65s).
Status cycles `Uploading receipt…` → `Scanning with AI…` with the progress bar filling.
Four fields populate one per beat (10.54 / 11.06 / 11.60 / 12.12): Provider, Amount, Date,
Category. Status resolves to **`Saved — claim it any time`**.
At 12.65 the **`Audit Ready · 100%`** badge lands. Full set holds ~1.25s.
Sequential/interaction: simulated cursor click, four beat-grid field reveals, then the badge.
Audio intent: competent machinery — crisp, light, precise.
Transition: soft crossfade (0.5s) → Scene 4

### Scene 4 — Claim now, or let it grow — 5.4s  *(the point of the video)*
The saved receipt as a chip at top: `Dr. Smith Visit | $340.00 | saved in HSA Plus`.
Two cards land one beat apart:
- **Left (14.76s, muted):** `REIMBURSE TODAY` · **$340** · flat dashed rule ·
  "The money leaves your HSA. Done growing."
- **Right (15.28s strong cue, emerald):** `OR CLAIM IT IN 20 YEARS` · **$340 → $1,316**
  counting up over 1.35s while an emerald curve draws beneath it and the tip dot pops ·
  "Compounding the whole time — at 7% a year."
Then the line settles at ~16.79 and holds 2.5s:
**"Same receipt. Your HSA grows until you claim it."**
Sequential/interaction: staggered card arrival, count-up and curve draw together.
Audio intent: the one place the bed comes forward. Lift, then arrival.
Transition: soft crossfade (0.5s) → Scene 5

### Scene 5 — Triple tax-free — 4.0s
Back to near-black, closing the loop with Scene 1. Three lines stagger up 0.25s apart, each
with an emerald plus-mark: **"Tax-free in." / "Tax-free growth." / "Tax-free out."** — set
holds ~1.16s. They recede; the HSA Plus mark and wordmark settle centre with `hsa.plus` in
mono emerald and, beneath, `Built for the HSA power user.` Final still holds ~1.0s.
Sequential/interaction: three-line stagger, then logo resolve.
Audio intent: close with certainty. Three quiet beats, then rest.

**Music mood:** upbeat-restrained corporate warmth, used as a bed
**Audio summary:** A quiet emerald-toned bed that stays out of the way, punctuated only by
sounds matched to real on-screen events, opening slightly for the fork and fading to
near-silence on the wordmark.
