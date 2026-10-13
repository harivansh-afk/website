#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"

# Caddy serves dist/ straight from this checkout, so a build never writes
# into it: sveltekit + adapter-static prerender everything into .build/,
# which then takes dist/'s place in one atomic rename
rm -rf .build
if command -v bun >/dev/null 2>&1; then
  SITE_OUT=.build bun run build
else
  SITE_OUT=.build npm run build
fi

if [ -d dist ]; then
  # tabs opened before this deploy still fetch the chunks they were built
  # with: carry the old hashed assets over (they never collide), dropping
  # any unused for a fortnight
  if [ -d dist/_app/immutable ]; then
    cp -rn --preserve=timestamps dist/_app/immutable/. .build/_app/immutable/
    find .build/_app/immutable -type f -mtime +14 -delete
  fi
  # the last counts, until views.mjs refreshes them below
  [ -f dist/views.json ] && cp dist/views.json .build/
fi

# Caddy reads dist/ as user caddy; normalize perms so a restrictive umask
# cannot 403 the site
chmod -R a+rX .build

if [ -d dist ]; then
  mv --exchange -T .build dist
  rm -rf .build
else
  mv .build dist
fi

# view counts: the caddy hit log + x views, baked to dist/views.json. a timer
# on spark re-runs this every few minutes between builds
node tools/views.mjs || echo "views generation failed, shipping without counts" >&2
