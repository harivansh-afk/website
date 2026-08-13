#!/usr/bin/env sh
set -eu

# link-preview screenshots bake into static/ (only missing ones are fetched)
sh tools/screenshots.sh || echo "screenshots step failed, keeping existing shots" >&2

# sveltekit + adapter-static prerenders everything into dist/
if command -v bun >/dev/null 2>&1; then
  bun run build
else
  npm run build
fi

# the commit heatmap regenerates every build so the hover chart stays current
mkdir -p dist/previews
node tools/heatmap.mjs > dist/previews/heatmap.json || {
  echo "heatmap generation failed, shipping without it" >&2
  rm -f dist/previews/heatmap.json
}

# Caddy serves this dir (bind-mounted at /srv/harivan.sh) as user caddy;
# normalize perms so a restrictive umask cannot 403 the site.
chmod -R a+rX dist
