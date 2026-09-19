# brag-output

A 22-second launch video for HSA Plus, generated with the
[`/brag`](https://github.com/latent-spaces/brag) skill and rendered with
[Hyperframes](https://hyperframes.heygen.com/).

| File | What it is |
|---|---|
| `brag.mp4` | The video — 1920x1080, 23.3s, H.264 + AAC. The poster is baked as frame 0 so platform thumbnail grabbers pick it up. |
| `brag.jpg` | Poster still (the claim-now-vs-claim-later comparison at 17.6s — it explains the product on its own). Use as `poster=` on a `<video>`, or as the custom thumbnail where a platform accepts an upload. |
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

The video deliberately makes **no pricing or free-tier claim** — pricing may
change, and the video should not need re-cutting when it does. The outro closes
on "Built for the HSA power user." If you re-cut this, keep that constraint.

Investment returns are not guaranteed, and whether delaying a reimbursement is
right depends on the individual. Add a disclaimer wherever this is used in a
context that needs one.

## Credits

- **Music** — "Happy Beats / Business Moves Vol. 9" by [ende.app](https://ende.app/en)
- **Sound effects** — [Kenney](https://kenney.nl/) (CC0, public domain)
- **Fonts** — Plus Jakarta Sans, Calistoga, JetBrains Mono (SIL Open Font License), the
  same faces the app itself loads
- **Animation runtime** — [GSAP](https://gsap.com/) (standard "no charge" license)
- **Video generation** — [Hyperframes](https://hyperframes.heygen.com/)
