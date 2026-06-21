// DRAFT - not wired into build.sh or index.typ yet.
// Move into thoughts/<slug>/ + add to index.typ when ready to publish.
#import "../_layout.typ": *

#thought(
  title: "the self-sustaining codebase",
  description: "loops are just well-built systems optimizing a stateless function",
  date: "June 2026",
)[
  #elem("p")[Right now everyone on the timeline is losing their mind over loops: wrap an agent in a loop, point it at the repo, walk away.]
  #elem("p")[The dirty secret is that the loop is the easy part. What makes it actually work is all the boring shit underneath it.]
  #elem("p")[That boring shit is what I wrote about in #link("/thoughts/the-self-cleaning-codebase/")[the self-cleaning codebase]: docs as the map, opinions as the house style, and a structural gate that lets small PRs merge themselves. This is what you build on top of it.]

  #elem("hr")
  #elem("h2")[a loop is just a system]

  #elem("p")[Here's the part that should click: these are the same basics you'd use to build one of the quote-unquote "loops" everyone won't shut up about.]
  #elem("p")[A loop is just a well-built system optimizing for a stateless function and if you can engineer it well enough these things can fall into place quite deterministically.]
  #elem("p")[Throw enough determinism at that stateless function and the loop more or less builds itself, and once you have all the foundations down you can do some genuinely crazy shit, like this:]

  ```text
  ┌──────────────────────────────────────────────────────────┐
  │ generate ideas  ·  prior art on the web + codebase scan  │
  └──────────────────────────────────────────────────────────┘
                                │
                                ▼
  ┌──────────────────────────────────────────────────────────┐
  │ research  ·  deep-search the codebase, scope the work    │
  └──────────────────────────────────────────────────────────┘
                                │
                                ▼
  ┌──────────────────────────────────────────────────────────┐
  │ implement  ·  worker on a branch, self-test              │ ◀──┐
  └──────────────────────────────────────────────────────────┘    │
                                │                                 │
                                ▼                                 │
  ┌──────────────────────────────────────────────────────────┐    │
  │ review  ·  benchmark, validate, suggest fixes            │ ───┘
  └──────────────────────────────────────────────────────────┘
                                │
                                ▼
  ┌──────────────────────────────────────────────────────────┐
  │ open PR  ·  auto-merged into main                        │
  └──────────────────────────────────────────────────────────┘
  ```

  #elem("p")[That's the self-cleaning machinery, extrapolated.]
  #elem("p")[Keep the docs, the opinions, and the gate, then bolt on a couple more deterministic pieces: a testing harness, and prior art - real research through your own codebase and across the web.]
  #elem("p")[Stack enough of those and you get a system that functions deterministically enough to loop on its own and ship code to prod.]
]
