# Projects mockup 2

A full-width brutalist grid for the projects page, served at `/mockup2/`.
The live `/projects/` page is unchanged.

Build from this worktree with `MOCKUP_BUILD=1 bun run build`; the flag moves
SvelteKit's hashed assets to `_mockup2/` so the preview coexists with the
live `_app/`. Publish by copying two dirs into the served checkout:

```sh
cp -R dist/_mockup2 dist/mockup2 /home/rathi/Documents/Git/website/dist/
```

A full `./build.sh` in the main checkout wipes `dist/` and removes it.

Direction: monotone, Berkeley Mono, hard 1px shared grid lines, no radii.
A top bar replaces the sidebar. Masthead is the word at display size with a
spec sheet beside it. Cell 1 is an index (table of contents) that makes 3x3
even and hovers into the tiles. Every project sits on an identical 16:9 plate
(graph-paper dots) with its media contained at its own ratio and a hairline
window edge, so portrait recordings tile with landscape shots. Caption:
number, name, destination host, description, status. Click a plate to expand
(the existing lightbox), esc closes. 2 columns under 1400px (index spans),
1 column under 700px.

The supplied Figma was unreachable (403 headless; the desktop browser needs
a one-time "Allow remote debugging" click), so this is built from the brief
and the site's existing language.
