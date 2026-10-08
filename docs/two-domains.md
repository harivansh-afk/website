# Two domains: hari.cafe and harivan.sh

Design note, October 2026. Nothing here is implemented.

## Summary

hari.cafe and harivan.sh are different *sites* (different eTLD+1), and the
browser treats a jump between them as a cold start: the HTTP cache,
connection pool, service worker and view-transition machinery are all keyed
or scoped by top-level site, so nothing hari.cafe loads can warm harivan.sh.
The one thing that crosses the line is a Speculation Rules `prefetch` of the
*document* (Chrome only, no cookies, no subresources). Cross-document view
transitions are same-origin only, so the CRT must be two animations: a
power-off on the page you leave and a power-on on first paint of the page you
land on.

The recommendation is to embrace that: one SvelteKit codebase, two builds
(`dist/cafe`, `dist/sh`), two Caddy vhosts, each face's first paint made
self-sufficient (inline CSS, one 19-40 KB font preloaded, no JS needed), HTML
cached at Cloudflare's edge and purged on build, plus a cross-site prefetch
rule for the sibling root. In Chrome the hop is prefetched; in Safari and
Firefox it is one edge round-trip. Both are hidden under a 160 ms power-off.
The two-faces-one-origin alternative gives a pixel-perfect transition but
cannot show `harivan.sh` in the address bar, which is the whole point.

## 1. What works cross-site

**HTTP cache partitioning.** Chrome keys the cache by top-level site, frame
site and URL; Safari by top-level eTLD+1; Firefox the same direction
([Chrome](https://developer.chrome.com/blog/http-cache-partitioning)). A
shared `assets.harivan.sh` or the same `_app/immutable` served from both
hosts is cached twice; "preloading the other domain's assets" is impossible.
`<link rel=prefetch>` is explicitly "useless for resources intended for use
by different top-level sites. This includes the main document"
([MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/prefetch)).
`modulepreload` is same-partition too. Treat `preconnect` the same way.

**Speculation Rules.** Prefetch of a cross-site document works in Chrome
"only when cookies for the cross-origin domain don't exist"; it is
uncredentialed, needs a strict referrer policy, fetches only the navigation
response (no subresources, early hints ignored), and the record expires five
minutes after completion
([Chrome](https://developer.chrome.com/docs/web-platform/prerender-pages),
[spec](https://wicg.github.io/nav-speculation/prefetch.html)). Prerender is
same-origin, or same-site with `Supports-Loading-Mode: credentialed-prerender`;
"cross-site prerendering is not specified or implemented"
([spec](https://wicg.github.io/nav-speculation/prerendering.html)). Support
(BCD 8.1.4): Chrome 109+; Safari 26.2 prefetch-only behind a preference, and
WebKit disabled it again in April 2026 over 503s being cached
([bug 312221](https://bugs.webkit.org/show_bug.cgi?id=312221)); Firefox none.

**View transitions.** Cross-document transitions are "limited to same-origin
navigations only", with no cross-origin redirect in the chain; `pageswap` and
`pagereveal` are likewise described for same-origin navigations
([Chrome](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document),
[MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using)).
Support: Chrome 126, Safari 18.2, Firefox none (same-document only, 144+).
The feel-alike: an exit animation on A, then `location.assign`, then an
entry animation on B's first paint. bfcache only helps back/forward.

**Service workers** register only for their own origin
([MDN](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register));
no help.

**Cloudflare.** HTML is not cached by default and `Cache-Control: no-cache`
(what Caddy sends now; both hosts show `cf-cache-status: DYNAMIC`) is never
stored, so every HTML hit goes through the tunnel to spark
([defaults](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/),
[cache-control](https://developers.cloudflare.com/cache/concepts/cache-control/)).
Speed Brain is same-site, prefetch-only, needs an edge-cached page, and does
not override an origin `Speculation-Rules` header
([docs](https://developers.cloudflare.com/speed/optimization/content/speed-brain/)).
Early Hints replays cached `Link: rel=preload|preconnect` headers as a 103
([docs](https://developers.cloudflare.com/cache/advanced-configuration/early-hints/));
useful on the non-prefetched path only.

## 2. Alternatives

- **One origin, two faces.** Both domains serve the same build; the button
  navigates same-origin to `/developer` with today's same-document CRT. Flawless
  transition, zero cold start, but the bar reads `hari.cafe/developer`.
  harivan.sh could only be a redirect. Rejected on the brief, kept as the
  fallback if the two-site hop feels too slow.
- **Transition, then swap.** Same-document CRT into `hari.cafe/developer`, then
  `location.replace("https://harivan.sh/")`. Two first-paints of the same
  pixels; any font or layout difference flashes. Not worth it.
- **Two real sites** (below). Cold start, made small enough not to matter.

## 3. Recommended architecture

**Prerequisite.** hari.cafe currently answers with `server: Vercel` and
`x-vercel-id`; point its DNS at the tunnel (terraform `records.nix`) so Caddy
sees both hosts. The tunnel's ingress is a remote-managed `default` to
`127.0.0.1:80`, so nothing changes in `cloudflared.nix`.

**Build: one app, two builds.** Keep `src/lib`, fonts and the shared
stylesheet; split routes into `src/sites/cafe/` (prose, writing, software)
and `src/sites/sh/` (the terminal UI at `/`). `vite.config.js` reads
`process.env.SITE` and sets `files.routes` and `adapter({ pages: "dist/" +
site })`; `build.sh` runs the build twice. Split `style.css` into a base
(fonts, tokens) and one face sheet each, and set `inlineStyleThreshold` high
enough that a face's CSS is inline: the first paint then needs the HTML and
one font, nothing else. Each site's cross links are absolute URLs. Add a
`<link rel=canonical>` per page and a `<link rel=preload>` for the face font
in each `app.html`.

**Speculation rules**, inline in each `app.html` (cafe shown; sh mirrors it):

```html
<script type="speculationrules">
{ "prefetch": [ { "urls": ["https://harivan.sh/"],
                  "eagerness": "immediate",
                  "referrer_policy": "no-referrer" } ] }
</script>
```

The document is ~6 KB; `immediate` keeps it warm, and if the five-minute
record expires the click falls back to an edge hit. Leave Speed Brain off so
behaviour stays explicit.

**Caddy (nix).** Turn `website.nix` into a function `site host face`
producing a vhost with `root * ${mountDir}/dist/${face}`, the same log, the
beacon matcher `header Origin https://${host}`, and two header changes:
`@html` gets `Cache-Control: public, max-age=0, s-maxage=600` plus
`Link: </fonts/<face>.woff2>; rel=preload; as=font; crossorigin` (Cloudflare
turns it into a 103). Instantiate for `hari.cafe`/`cafe` and
`harivan.sh`/`sh`. Add a Cache Rule for both hosts, keep `/views.json` and
`/counter/hit` out of it, and end `build.sh` with
`POST /zones/{zone}/purge_cache {"purge_everything":true}`
([API](https://developers.cloudflare.com/api/resources/cache/methods/purge/)).

**Choreography.** The header link's click handler adds `html.off`, which runs
the existing 160 ms `crt-out`, then `location.assign(href)`. The sibling site
always plays `crt-on` (360 ms) from a class set in an inline head script on a
fresh load; a power-on on every cold entry suits a terminal and needs no
referrer. The result matches today's 160+360 ms same-document transition.
Chrome: B's HTML is already local; the font arrives during the opening line.
Safari/Firefox: B's HTML is one edge round-trip, started when the blackout
begins, with the font behind a 103; typically well inside the 360 ms.

**Measuring.** On B, `performance.getEntriesByType("navigation")[0]`:
`deliveryType === "navigational-prefetch"` and `responseStart - startTime`
near zero mean the prefetch landed; DevTools Application > Speculative loads
explains failures (cookies, expiry). For all browsers, log
`first-contentful-paint` and compare to the `crt-out` start stamped in
`sessionStorage` on A (same-site only, so stamp a wall clock in the URL hash
during testing). Confirm `cf-cache-status: HIT` on both roots.

## 4. Risks and gotchas

- **SEO.** Each path lives on one domain only: `hari.cafe/developer/` 301s to
  `harivan.sh/`, and prose paths on harivan.sh 301 to hari.cafe. `Seo.svelte`
  already derives `og:url` from the page URL. Redirects are fine here because
  cross-document view transitions are not in play.
- **Cookies kill the prefetch** silently. Neither site sets any; keep it so.
  A Cloudflare challenge (`cf_clearance`) or bot cookie would disable it for
  that visitor; check `Set-Cookie` after any zone setting change.
- **Privacy.** The prefetch is cookieless and `no-referrer`, but it is a
  request to harivan.sh for every hari.cafe visit, with `Sec-Purpose:
  prefetch`. Caddy's hits log never sees it (the beacon is JS-driven), and the
  access log drops client IPs already.
- **Counter.** The Origin check must match each host, and the log drops
  `no_hostname`, so `/` on both sites would collide in `views.mjs`; key counts
  by `request>host` plus path. Prefetch never runs JS, so no phantom hits.
- **Caching.** With `s-maxage`, `stale-while-revalidate` is disabled (it
  implies `proxy-revalidate`), so purge on every build or accept a 10-minute
  lag. Never let Caddy answer a prefetch with 503: WebKit cached those.
- **Two builds** double `dist/` and the static copies (~80 KB of fonts); the
  `IMG_V`/`VIDEO_V` busting applies per host.
