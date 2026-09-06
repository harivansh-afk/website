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

Direction: the normal sidebar shell, with the content column widened to
60rem for this page only. Eight projects as a two-column grid of identical
16:9 plates in the site's panel fill (the code-block tint, 2px radius), each
media centered and contained at its own ratio, so portrait recordings tile
with landscape shots. Captions are the existing rows' name, description and
note. Click a plate to expand (the existing lightbox), esc closes. One
column on mobile. The layout and SideNav treat /mockup2/ as the projects
page; when adopted, the grid replaces Projects.svelte on /projects/ and that
special-casing goes away.

The supplied Figma was unreachable (403 headless; the desktop browser needs
a one-time "Allow remote debugging" click), so this is built from the brief
and the site's existing language.
