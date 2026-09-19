# HSA Plus — brand mark

**Nothing here is live.** These files sit alongside the current logo; adopting
them is a deliberate step (see *Adopting it*).

## Brand brief

Held for this project so every asset stays consistent:

- **Name & one-liner** — HSA Plus. Turn medical expenses into tax-free wealth.
- **Audience** — US professionals on high-deductible plans who already max the
  HSA and treat it as an investment account, not a spending account.
  Financially literate, optimiser instincts, spreadsheet-adjacent.
- **Voice** — precise, restrained, confident. The product speaks for itself; no
  hype verbs, no "streamline your workflow". Currency always set in mono.
- **Visual** — "Verdant Precision": a narrow emerald corridor (`#065f46` →
  `#34d399`) against near-black `#0C1220`, architectural type, negative space as
  oxygen, Swiss-watchmaker geometry.
- **Key messages** — Triple tax-free. The receipt never expires.

## The mark: Ascender

The **H of HSA, built to climb** — the right stem stands taller than the left and
the crossbar is pitched up between them. Corners are milled nearly square
(r=2) rather than rounded, for the precision the design philosophy asks for.

It is a letterform, not a symbol, which is the point: it carries no medical
read at all, it is unmistakably *yours* rather than a stock icon, and the rise is
built into the structure instead of bolted on.

| File | Use |
|---|---|
| `logo.svg` | Master. Standalone mark, emerald gradient, transparent. |
| `logo-mono.svg` | Single-colour, takes `currentColor` — on emerald fills, photos, or anywhere the gradient would fight. |
| `logo-1024/512/256/64/48/32/16.png` | Raster, transparent |
| `app-icon.svg` | Mark on a filled emerald plate, for contexts that cannot be transparent |
| `app-icon-1024/512/192/180.png` | App icons, PWA manifest, Apple touch icon |
| `favicon.ico` | 16/32/48, PNG-encoded |

## How it got here

The first four directions were all plus/cross marks — four versions of one idea,
and rejected as a set. `explorations-territories.png` is the reset: four
territories with no cross in them at all.

- **Delta** — the area between a flat line and a rising one. Filled, it collapsed
  into a generic sail shape and lost the two-lines idea entirely.
- **Ledger** — a receipt with a climbing torn edge. Best concept of the four,
  since nobody in the category owns "receipt", but it read as a bookmark and
  turned to mush by 16px.
- **Meridian** — a rising line crossing its baseline. The node made it read as a
  pin or a skewer.
- **Ascender** — the only one that held at every size. Taken forward.

`explorations-the-h.png` then tested five versions of the H. Steep gained motion
but stopped reading as a letter; Two-tone lost the deep stems against a dark
background; Level read cleanest but barely rose at all. **Milled** — square
corners — won for the architectural quality, and holds at 16px.

## Adopting it

```bash
cp brand/app-icon-1024.png public/logo.png
cp brand/app-icon-512.png  src/app/icon.png
cp brand/app-icon-180.png  src/app/apple-icon.png
cp brand/favicon.ico       src/app/favicon.ico
```

Use `logo.svg` (transparent, no plate) anywhere in-app where the mark sits on
your own background — nav, dashboard header, auth screens. The plated versions
are only for OS-level icons.

**Fix the aspect ratio at the same time.** The mark is square but is rendered at
non-square sizes in seven places, which squashes it — true of the current logo
today, not just this one:

| File | Current |
|---|---|
| `src/app/page.tsx` | `width={56} height={37}` |
| `src/components/dashboard/dashboard-shell.tsx` | `width={56} height={37}` |
| `src/components/dashboard/profile-form.tsx` | `width={56} height={37}` |
| `src/components/dashboard/login-settings-form.tsx` | `width={56} height={37}` |
| `src/components/dashboard/expense-form-page.tsx` | `width={48} height={32}` |
| `src/app/forgot-password/page.tsx` | `width={72} height={48}` |
| `src/app/verify-mfa/page.tsx` | `width={64} height={42}` |

Each wants equal width and height. `verify-mfa` also applies `brightness-200` to
lift the old logo on dark; the new mark holds its own contrast, so that filter
can come off.
