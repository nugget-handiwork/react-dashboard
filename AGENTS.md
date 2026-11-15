# React data dashboard artifact

A dashboard of panels, each drawing either data committed beside the code
or SQL run at view time. Your launch prompt says which you were given:
staged files, pinned datasets, or both. This template is built — the
platform runs `npm ci && npm run build` and serves `dist/index.html`; you
never run the build yourself, and rendering does it for you.

## What you edit

- `src/panels/*.tsx` — the panels. One file per panel, default-exporting a
  React component. This is where almost all of your work goes.
- `src/app.tsx` — the layout: which panels render and in what order.
- `src/style.css` — styling. The `.dashboard` grid, `.panel`,
  `.panel-loading`, and `.panel-error` classes already exist; extend them
  rather than restyling from scratch.

Do not edit `src/main.tsx`, `src/lib/`, `index.html`, `vite.config.ts`,
or `package.json`'s `build` script. They are the template's wiring —
error boundary, data access, relative-path config — and editing them is
how a dashboard stops rendering. You may add dependencies to
`package.json` when a panel genuinely needs one; never add or edit
`package-lock.json`, which the platform generates.

## Where your data comes from

Two sources, two hooks with the same shape. Both return their value, an
`error`, or neither while loading — render all three states, in that
order.

`useFile(fileName)` reads a file committed beside your code in `data/`.
Your launch prompt names each staged file, describes it, and shows its
columns and first rows. Prefer this: the result was computed and checked
before the build began, it costs no round trip, and the panel shows the
same numbers a year from now.

```tsx
import useFile from '../lib/use_file'

export default function RevenuePanel() {
  const { data, error } = useFile('revenue_by_month.json')
  if (error) return <section className="panel panel-error">{error}</section>
  if (data === undefined) {
    return <section className="panel panel-loading">Loading…</section>
  }
  // render data
}
```

`useRows(sql)` runs SQL at the moment someone views the dashboard,
returning column-keyed row objects. It works only when your launch prompt
names datasets, and only for those datasets. Use it for the panels that
genuinely have to be current, or that answer a question the reader poses
by filtering.

```tsx
import useRows from '../lib/use_rows'

const { rows, error } = useRows('SELECT month, revenue FROM ...')
```

A dashboard can mix the two freely — a staged historical series beside a
live current figure. For one-off use outside a component, `query(sql)` and
`dataFile(fileName)` in `src/lib/data.ts` are the same calls without the
hooks.

Never call `fetch` yourself, never read the token, and never invent
another data path. Queries may only reference the datasets named in the
launch prompt: anything else fails with an error, by design — surface it
in the panel rather than swallowing it.

## SQL

- Aggregate in SQL, not in JavaScript. A panel should select the exact
  shape it renders; pulling raw tables into the browser is the failure
  mode this template exists to avoid.
- Always bound result sizes: `GROUP BY` to a sensible grain and `LIMIT`
  anything that could be long.
- Interpolating a user-visible filter value into SQL is fine — the scope
  is enforced server-side per request — but keep queries readable: one
  template literal per panel, near the top of the file.

## Charts

D3 v7 is a dependency of this template: `import * as d3 from 'd3'`. Draw
into a ref rather than letting D3 own the document, and redraw when the
data changes:

```tsx
const ref = React.useRef<SVGSVGElement>(null)

React.useEffect(() => {
  if (!rows) return
  const svg = d3.select(ref.current)
  svg.selectAll('*').remove()
  // draw
}, [rows])

return (
  <section className="panel">
    <svg ref={ref} viewBox="0 0 400 240" />
  </section>
)
```

Clear the SVG before redrawing — an effect that runs twice otherwise
draws twice. Size with `viewBox` and let CSS scale it.

## Type and colour

The platform serves the typefaces and sets the body font, so a panel
inherits it without asking. Where a rule needs to name a family — tick
labels, printed values — use `var(--family-mono)`.

Every colour is a CSS custom property defined in the `:root` block at the
top of `src/style.css`, and each one carries both its light and its dark
value in a `light-dark()` pair, so a panel that uses the tokens is legible
in both themes and one with hard-coded hexes is not.

From CSS use `var(--categorical-1)` directly. From a chart, pass the token
itself, never its value — the embedding app can switch theme while the
dashboard is on screen, and a `var()` reference re-resolves where a colour
read into JavaScript would stay whatever it was when the panel rendered:

```ts
const color = (name: string, step: number) => `var(--${name}-${step})`
```

So: never `getComputedStyle(...).getPropertyValue('--categorical-1')`, and
never a `prefers-color-scheme` rule — the theme is the app's to decide,
not the operating system's.

- `categorical`, steps 1–6 — unordered categories: series in a chart,
  slices of a breakdown. Beyond six, group the tail into "Other" rather
  than inventing a seventh colour.
- `sequential`, steps 1–6 — one ordered measure, dark to light. Step 1 is
  the brand orange and is also the right fill for a single-series chart.
- `secondary`, steps 1–6 — the same ramp in blue, for a second ordered
  measure.
- `diverging`, steps 1–6 — orange through pale to blue, for a measure
  with a meaningful midpoint.

`--ink`, `--muted`, `--grid`, and `--axis` cover text and rules.
`--surface` is the colour of the page, for filling a shape that has to
read as the page. The page itself is never painted: the app supplies the
ground the dashboard sits on.

## Rules

- Every panel handles its loading and error states. A dashboard with one
  broken panel should show one broken panel, not a blank page.
- Render statically: no entry animations, no transitions on first paint.
- Never use viewport units (`vh`, `vw`) — the artifact is rendered in an
  iframe whose height is derived from its content.
- No chart junk: no gradients, no drop shadows, no borders around the
  whole dashboard, and no dashboard title inside it — the title renders
  outside the frame.
- Where a reader would want the exact value behind a mark, provide it — a
  tooltip, or the number written next to the mark.

## What to check in the render

- Every panel shows data, not a spinner: the screenshot is taken after
  load, so a stuck "Loading…" means a query failed or never resolved.
- Error panels: if one shows, read its message — it is the server's real
  reason, usually a misspelled column or a dataset outside the pin.
- The grid at 800px wide: panels should not overflow or collapse.
