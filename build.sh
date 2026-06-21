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

cp style.css dist/style.css
cp -R static/. dist/

# --- content-hash cache-busting -----------------------------------------------
# Rename assets to embed a short content hash, then rewrite the references in the
# generated HTML. Content changes -> hash changes -> URL changes, so neither the
# CDN nor a browser can ever serve a stale asset. No manual ?v= versioning, ever.
# HTML itself is served uncached (Cloudflare DYNAMIC), so it always points at the
# current hashes.
hash_of() { sha256sum "$1" | cut -c1-10; }
rewrite_html() { find dist -name '*.html' -type f -exec sed -i "s#$1#$2#g" {} +; }

# style.css
csshash=$(hash_of dist/style.css)
mv dist/style.css "dist/style.$csshash.css"
rewrite_html "style\.css" "style.$csshash.css"

# diagram pngs (and any future diagrams under static/diagrams/)
for png in dist/diagrams/*.png; do
  [ -e "$png" ] || continue
  base=$(basename "$png" .png)
  h=$(hash_of "$png")
  mv "$png" "dist/diagrams/$base.$h.png"
  rewrite_html "$base\.png" "$base.$h.png"
done
