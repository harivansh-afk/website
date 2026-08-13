#!/usr/bin/env sh
set -eu

if command -v typst >/dev/null 2>&1; then
  typst_cmd="typst"
else
  typst_cmd="nix run nixpkgs#typst --"
fi

rm -rf dist
mkdir -p dist

# shellcheck disable=SC2086
$typst_cmd compile --root . --features html --format html index.typ dist/index.html
# shellcheck disable=SC2086
$typst_cmd compile --root . --features html --format html 404.typ dist/404.html

for source in thoughts/*.typ; do
  [ -e "$source" ] || continue
  slug=$(basename "$source" .typ)
  mkdir -p "dist/thoughts/$slug"
  # shellcheck disable=SC2086
  $typst_cmd compile --root . --features html --format html "$source" "dist/thoughts/$slug/index.html"
done

for page in dist/index.html dist/thoughts/*/index.html; do
  sed 's#</body>#<script type="module" src="/counter-v1.js"></script></body>#' "$page" > "$page.counter"
  mv "$page.counter" "$page"
done

# link previews: screenshots bake into static/ (only missing ones are fetched);
# the commit heatmap regenerates every build so it stays current
sh tools/screenshots.sh || echo "screenshots step failed, keeping existing shots" >&2

cp style.css dist/style.css
cp -R static/. dist/

mkdir -p dist/previews
node tools/heatmap.mjs > dist/previews/heatmap.txt || {
  echo "heatmap generation failed, shipping without it" >&2
  rm -f dist/previews/heatmap.txt
}

# Caddy serves this dir (bind-mounted at /srv/harivan.sh) as user caddy;
# normalize perms so a restrictive umask cannot 403 the site.
chmod -R a+rX dist
