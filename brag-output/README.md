# brag-output

A 22-second launch video for HSA Plus, generated with the
[`/brag`](https://github.com/latent-spaces/brag) skill and rendered with
[Hyperframes](https://hyperframes.heygen.com/).

| File | What it is |
|---|---|
| `brag.mp4` | The video — 1920x1080, 25.6s, H.264 + AAC. The poster is baked as frame 0 so platform thumbnail grabbers pick it up. |
| `brag.jpg` | Poster still (the $976 hook at 3.4s). Use as `poster=` on a `<video>`, or as the custom thumbnail where a platform accepts an upload. |
| `share-copy.txt` | The share caption. |
| `brag-plan.md` | Creative plan and beat-by-beat storyboard. |
| `composition-brief.md` | The handoff brief given to Hyperframes. |
| `composition/` | The Hyperframes project. Re-render with `npm run check && npm run render`. |

## Re-rendering

```bash
cd composition
npm install
npx hyperframes check      # lint + runtime + layout + motion + contrast
npx hyperframes render --quality high --output ../brag.mp4
```

Requires Node 22+, FFmpeg on `PATH`, and Chrome (`npx hyperframes browser ensure`).

## A note on the figures and the claim

The dollar amounts on screen are illustrative, not real user data:

- The **$340 receipt** and the 100% audit score are example values in the shape
  of the app's own landing-page mockups.
- **$340 → $1,316** is 20 years at 7% a year (`340 * 1.07^20 = 1315.7`), the same
  compounding `reimbursement-optimizer.tsx` uses. 7% is the return assumption the
  landing page already states, and it is shown on screen next to the number.
- **$976** (the hook, and the closing line) is `1316 - 340` — the growth forgone
  by reimbursing yourself immediately instead of letting the balance ride. The
  on-screen footnote says `20 years at 7%` so the number is never unqualified.
- The claim flow shows `Submitted → Processing → Reimbursed`, the real statuses
  in `claim-status-badge.tsx`. Actual timing depends on your HSA administrator;
  the video compresses it for the edit.

The video deliberately makes **no pricing or free-tier claim** — pricing may
change, and the video should not need re-cutting when it does. The outro closes
on "Built for the HSA power user." If you re-cut this, keep that constraint.

Investment returns are not guaranteed, and whether delaying a reimbursement is
right depends on the individual. Add a disclaimer wherever this is used in a
context that needs one.

## Credits

- **Music** — "Happy Beats / Business Moves Vol. 1" by [ende.app](https://ende.app/en).
  `assets/music/bed-vol1-energetic.mp3` is a 27s excerpt starting at 49.94s, cut
  because that section sustains energy without the breakdown at 30-40s.
- **Sound effects** — [Kenney](https://kenney.nl/) (CC0, public domain)
- **Fonts** — Plus Jakarta Sans, Calistoga, JetBrains Mono (SIL Open Font License), the
  same faces the app itself loads
- **Animation runtime** — [GSAP](https://gsap.com/) (standard "no charge" license)
- **Video generation** — [Hyperframes](https://hyperframes.heygen.com/)
