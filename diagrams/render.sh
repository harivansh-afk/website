#!/usr/bin/env sh
# Render diagram sources to themed PNGs under static/diagrams/.
#   *.svg  -> rsvg-convert (hand-authored diagrams, e.g. the serpentine pipeline)
#   *.mmd  -> mermaid-cli  (auto-laid-out flowcharts; via `nix run nixpkgs#mermaid-cli`)
set -eu
cd "$(dirname "$0")/.."
mkdir -p static/diagrams

for src in diagrams/*.svg; do
  [ -e "$src" ] || continue
  name=$(basename "$src" .svg)
  rsvg-convert -z 2 "$src" -o "static/diagrams/$name.png"
done

if command -v mmdc >/dev/null 2>&1; then mmdc="mmdc"; else mmdc="nix run nixpkgs#mermaid-cli --"; fi
for src in diagrams/*.mmd; do
  [ -e "$src" ] || continue
  name=$(basename "$src" .mmd)
  # shellcheck disable=SC2086
  $mmdc -i "$src" -o "static/diagrams/$name.png" -b transparent -s 2 \
    -c diagrams/mermaid-config.json -p diagrams/puppeteer.json
done
