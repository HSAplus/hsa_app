# HSA Plus — brand mark

**Nothing here is live yet.** These files sit alongside the current logo rather
than replacing it, so adopting the new mark is a deliberate step (see *Adopting
it* below).

## The mark: Ascent Vault

A squircle with a plus knocked out, where the plus's top arm comes to a point.
The design philosophy calls the plus "sacred geometry — accumulation, addition,
and the quiet power of compounding"; this keeps that, and lets the same glyph
also read as growth, so the mark says *health* and *wealth* at once rather than
hiding a bar chart inside a cross.

The point is deliberately restrained — 24 units wide against a 14-unit arm. An
earlier version flared to 38 and read as an arrow with a crossbar through it
rather than as a plus (`proportion-study.png` shows the four widths side by
side). Plus first, ascent second.

| File | Use |
|---|---|
| `logo.svg` | Master vector. Scale from this for anything new. |
| `logo-mono.svg` | Flat single-colour glyph, no container. Takes `currentColor` — use on emerald fills, photos, or anywhere the squircle would fight the background. |
| `logo-1024.png` | Source raster / store listings |
| `logo-512.png` | `src/app/icon.png` |
| `logo-192.png` | PWA manifest |
| `logo-180.png` | `src/app/apple-icon.png` |
| `logo-48/32/16.png` | Raster fallbacks |
| `favicon.ico` | `src/app/favicon.ico` — 16/32/48, PNG-encoded |

All PNGs have transparent backgrounds, so the squircle sits cleanly on light and
dark without a plate behind it.

## Why this one

Four directions were drawn and tested at true pixel sizes (`explorations-round1.png`):

- **Ascent** — plus resolving into a chevron. Best idea, but free-standing it is
  thin at 16px and an unhoused arrow can read as "upload".
- **Strata** — plus stacked from emerald bands. Beautiful large, but the bands
  vanish below 32px, so the concept is invisible exactly where a favicon lives.
- **Vault** — plain plus knocked out of a squircle. Strongest small, but a white
  cross on green is close to a pharmacy mark.
- **Facet** — chamfered plus. Too close to the existing logo to be worth a change.

`explorations-round2.png` narrows to the finalists, then two tests decided the
final geometry:

- `small-size-test.png` — the first hybrid used 10-unit arms and filled in at
  16px. Thickened to 14, it survives.
- `proportion-study.png` — at 38 units the point dominated and the mark read as
  an arrow. Pulled back to 24, the plus leads again.

Both are in this folder because they are the argument for why the mark looks the
way it does, not decoration.

## Adopting it

```bash
cp brand/logo-1024.png public/logo.png
cp brand/logo-512.png  src/app/icon.png
cp brand/logo-180.png  src/app/apple-icon.png
cp brand/favicon.ico   src/app/favicon.ico
```

**Fix the aspect ratio at the same time.** The mark is square, but it is
currently rendered at non-square sizes in six places, which squashes it:

| File | Current |
|---|---|
| `src/components/dashboard/dashboard-shell.tsx` | `width={56} height={37}` |
| `src/components/dashboard/profile-form.tsx` | `width={56} height={37}` |
| `src/components/dashboard/login-settings-form.tsx` | `width={56} height={37}` |
| `src/components/dashboard/expense-form-page.tsx` | `width={48} height={32}` |
| `src/app/forgot-password/page.tsx` | `width={72} height={48}` |
| `src/app/verify-mfa/page.tsx` | `width={64} height={42}` |
| `src/app/page.tsx` | `width={56} height={37}` |

Each should use equal width and height (e.g. `width={40} height={40}`). This is
true of the existing logo too — it is being distorted today.

`verify-mfa/page.tsx` also applies `brightness-200` to lift the old logo on a
dark background. The new mark has its own contrast on dark, so that filter can
come off.

## Colour

The gradient runs `#047857` → `#34d399` bottom-left to top-right — the emerald
corridor from the design philosophy, unchanged from the app's tokens. The
knockout is transparent, not white, so the mark adapts to whatever sits behind it.
