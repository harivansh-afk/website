// every thought, newest first: /writing/ groups them by year. a local href is
// a route under src/routes/thoughts/; an external one is an x post.
// tools/views.mjs counts each one's views: site reads from the hit log, plus
// the x post's views when `x` names one, plus `seed` for reads from before
// the counter existed
export const thoughts = [
  {
    title: "ai psychosis",
    href: "https://x.com/HarivanshRathi/status/2105361997776794095",
    year: 2026,
    x: "2105361997776794095",
  },
  // also posted as an x article
  { title: "deterministic state machines", href: "/thoughts/sans-io/", year: 2026, x: "2103582703027163455", seed: 15000 },
  { title: "the autonomy radius", href: "/thoughts/the-autonomy-radius/", year: 2026, seed: 7812 },
  {
    title: "the self-cleaning codebase",
    href: "https://x.com/HarivanshRathi/status/2069088950241907089",
    year: 2026,
    x: "2069088950241907089",
  },
  { title: "core principles", href: "/thoughts/my-core-principles/", year: 2025, seed: 3336 },
];
