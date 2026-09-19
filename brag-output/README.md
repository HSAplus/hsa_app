# brag-output

A 22-second launch video for HSA Plus, generated with the
[`/brag`](https://github.com/latent-spaces/brag) skill and rendered with
[Hyperframes](https://hyperframes.heygen.com/).

| File | What it is |
|---|---|
| `brag.mp4` | The video — 1920x1080, 22s, H.264 + AAC. The poster is baked as frame 0 so platform thumbnail grabbers pick it up. |
| `brag.jpg` | Poster still (the hero beat at 7.6s). Use as `poster=` on a `<video>`, or as the custom thumbnail where a platform accepts an upload. |
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

## A note on the figures

The dollar amounts on screen — the $340 receipt, $18,640 → $172,400, the 100%
audit score — are the landing page's own illustrative mockup values, not real
user data. The 20-year projection follows the same compounding the
reimbursement optimizer uses. Add a disclaimer if this is used anywhere that
needs one.

## Credits

- **Music** — "Happy Beats / Business Moves Vol. 9" by [ende.app](https://ende.app/en)
- **Sound effects** — [Kenney](https://kenney.nl/) (CC0, public domain)
- **Fonts** — Plus Jakarta Sans, Calistoga, JetBrains Mono (SIL Open Font License), the
  same faces the app itself loads
- **Animation runtime** — [GSAP](https://gsap.com/) (standard "no charge" license)
- **Video generation** — [Hyperframes](https://hyperframes.heygen.com/)
