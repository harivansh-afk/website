#!/usr/bin/env sh
set -eu

if command -v typst >/dev/null 2>&1; then
  typst_cmd="typst"
else
  typst_cmd="nix run nixpkgs#typst --"
fi

rm -rf dist
mkdir -p dist/fonts

# shellcheck disable=SC2086
$typst_cmd compile --features html --format html index.typ dist/index.html

cp style.css dist/style.css
cp static/fonts/BerkeleyMono-Regular.otf dist/fonts/BerkeleyMono-Regular.otf
