# REY — Visual System & Effects Reference

Everything that makes the site *look* like REY: the retro/CRT layers, the pixel
cursor, the colour tokens, and the animation components. Read this before
touching visuals, so effects stay consistent and nothing gets "modernised" by
accident.

**Design rule:** the aesthetic is retro pixel/CRT — chunky, square, blocky.
Square corners over rounded, square markers over radio dots, `font-pixel`
uppercase labels for anything chrome-like. Rounded corners and soft shadows
read as generic-modern and are wrong here.

---

## 1. Post-processing / full-screen layers

Mounted globally in `app/layout.tsx`, stacked over the whole app. Order and
z-index matter.

| Layer | Class | z-index | What it does |
|---|---|---|---|
| Scanlines + RGB split | `.retro-overlay` | `z-[100]` | CRT scanlines (4px) plus a faint RGB vertical split. Animated: `scanline 10s linear infinite`, scrolling `background-position`. |
| Vignette | `.retro-vignette` | `z-[101]` | Static radial darkening at the edges. No animation. |
| Dark-matter texture | inline in layout | `z-[100]` | `/textures/dark-matter.png` at 3% opacity, static grain. |

All are `fixed inset-0 pointer-events-none` — purely visual, never intercept
clicks. Definitions live in `app/globals.css` under `@layer components`.

### Removed: `.retro-flicker`

A fourth layer used to sit at `z-[102]`: a full-screen white div animating
opacity every `0.15s` forever. **Deleted deliberately** — it repainted the
entire viewport ~7×/second, which read as the site lagging. Don't reintroduce
a full-screen animated-opacity layer; if a flicker effect is ever wanted
again, scope it to a single small element.

### Reduced motion

`prefers-reduced-motion: reduce` stops the scanline animation. Any new
always-running animation should be added to that media query too.

---

## 2. Custom cursor

`components/ui/CustomCursor.tsx`, mounted once in `app/layout.tsx`. The native
cursor is hidden globally via `cursor: none` in `globals.css`.

Three modes, driven by a `mousemove` + `mouseover` listener pair:

| Mode | Trigger | Rendered |
|---|---|---|
| `default` | anything else | 24×24 pixel arrow (classic RPG pointer), white body, black outline, grey shading |
| `pointer` | `<a>`, `<button>`, or computed `cursor: pointer` | same arrow, scaled 125% |
| `text` | text inputs, `textarea`, `contenteditable` | 17×26 pixel I-beam, blinking on a 1.1s cycle |

Plus three spring-lagged trail particles (orange / green / blue) that follow
the cursor with increasing damping.

**Gotcha that caused a bug:** `cursor: none` on `body` is *inherited*, but
browsers' UA stylesheet sets `cursor: text` **directly** on form controls,
and a direct rule beats an inherited one. That's why inputs showed the stock
macOS I-beam. The fix is the explicit selector list in `globals.css`:

```css
a, button, [role="button"], .cursor-pointer,
input, textarea, select, [contenteditable] { cursor: none !important; }
```

Any new element type that shows a native cursor needs adding to that list.

**Mode detection order matters:** text is checked *before* pointer, because an
input inside a `<label>` would otherwise match the label's pointer style. The
text selector deliberately excludes button/submit/checkbox/radio/file inputs
so they keep the arrow.

---

## 3. Colour tokens

Defined in `app/globals.css` (`:root`) and mirrored in `tailwind.config.js`.

### Rank accents — used consistently across login, register and admin Config

| Rank | Token | Hex | Feel |
|---|---|---|---|
| Spectator | *(see note)* | `#949494` | grey, entry level |
| Respawner | `sky` | `#5BC0EB` | blue, member |
| Architect | `lava` | `#FF6B35` | orange/red, elite |

**Note on spectator:** `login`/`register` name the `stone` token for it, but
`stone` is `#242424` (near-black) and is invisible as a *selected* state. The
admin Config modal uses `text-secondary` (`#949494`) instead. Prefer the grey.

### Other tokens

- Base: `background #0a0a0a`, `card #141414`, `border #1f1f1f`
- Text: `text-primary #ffffff`, `text-secondary #949494`
- Accents: `grass #4CAF50`, `sand #FFD166`
- Admin console namespace: `architect-bg #050505`, `architect-surface #111111`,
  `architect-green #52d053`, `architect-orange #ff6b2c`,
  `architect-blue #57c7ff`, `architect-gold #f6c453`

### Tailwind gotcha

Tailwind only emits classes it can see **literally** in source. Building them
dynamically (`` `border-${accent}` ``) produces no CSS and silently renders
unstyled. Spell out full class strings per variant.

`app/register/page.tsx` still builds rank accents this way (`` `border-${r.accent}` ``),
so its rank colours likely aren't rendering — **known outstanding issue.**

---

## 4. Effect utility classes

In `app/globals.css`:

- `.pixel-border` — chunky stepped border, the core pixel look
- `.glow-grass` / `.glow-lava` / `.glow-sky` / `.glow-sand` — coloured glow on hover
- `.glass` — frosted blur panel
- `.text-glow` — text shadow bloom
- `.glitch` — RGB-split glitch text; `glitch-anim`, `glitch-anim2` and `glitch`
  keyframes drive clip-path jitter on `::before`/`::after`
- `.animate-loading-progress` — indeterminate loading bar

Fonts: `Inter` (`--font-inter`, body) and `Press Start 2P` (`--font-pixel`,
all chrome/labels), both via `next/font/google`.

---

## 5. Animation components

- `components/layout/PageTransition.tsx` — route-change transitions
- `components/layout/ScrollReveal.tsx` — reveal-on-scroll
- `components/ui/FallingText.tsx` + `FallingText.css` — physics text via `matter-js`
- `components/ui/AchievementPopup.tsx` — achievement toast
- `framer-motion` throughout for springs, `AnimatePresence` for modals

Framer Motion and `lucide-react` are in `optimizePackageImports` in
`next.config.ts` — keep them there, they're large barrel imports.

---

## 6. Performance notes

Learned the hard way, worth preserving:

1. **Never animate opacity/colour on a full-screen fixed layer.** It repaints
   the whole viewport every frame. That was `.retro-flicker`.
2. **Animating `background-position`** (the scanline) can't be GPU-composited
   either. It's kept because it's slow (10s) and central to the look — but
   don't add more of them.
3. Prefer `transform` and `opacity` on *small* elements; those composite on
   the GPU.
4. The cursor uses `useSpring` motion values rather than React state for
   position, so movement doesn't re-render the tree. Keep it that way.
