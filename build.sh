#!/usr/bin/env sh
set -eu

# sveltekit + adapter-static prerenders everything into dist/
if command -v bun >/dev/null 2>&1; then
  bun run build
else
  npm run build
fi

# view counts: the caddy hit log + x views, baked to dist/views.json. a timer
# on spark re-runs this every few minutes between builds
node tools/views.mjs || echo "views generation failed, shipping without counts" >&2

# Caddy serves this dir (bind-mounted at /srv/harivan.sh) as user caddy;
# normalize perms so a restrictive umask cannot 403 the site.
chmod -R a+rX dist
