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

Direction: the normal sidebar shell, content column widened to 60rem for
this page only. Eight projects as a two-column grid of identical 16:9 tiles.
Shots near enough 16:9 cover their tile edge to edge (the lightbox shows the
whole frame). The three that cannot fit inside on a background of their own
(projects.js `bg`): mixbridge on a blue-to-orange gradient echoing the clip,
nap and deskctl on white. Captions are
name and status on one line and a single description that reserves two
lines, so every row ends level. Videos autoplay as they near the viewport,
as on the live page. No stagger animation, one gap value. Click a tile to
expand, esc closes. One column on mobile. betternas.webp was recropped to
center the window (media version bumped to 13). The layout and SideNav treat
/mockup2/ as the projects page; when adopted, the grid replaces
Projects.svelte on /projects/ and that special-casing goes away.

The supplied Figma was unreachable (403 headless; the desktop browser needs
a one-time "Allow remote debugging" click), so this is built from the brief
and the site's existing language.
