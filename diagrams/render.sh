#!/usr/bin/env sh
# Render mermaid diagram sources (*.mmd) to themed PNGs under static/diagrams/.
# Requires mermaid-cli (via nix: `nix run nixpkgs#mermaid-cli`).
set -eu
cd "$(dirname "$0")/.."

if command -v mmdc >/dev/null 2>&1; then
  mmdc="mmdc"
else
  mmdc="nix run nixpkgs#mermaid-cli --"
fi

mkdir -p static/diagrams
for src in diagrams/*.mmd; do
  [ -e "$src" ] || continue
  name=$(basename "$src" .mmd)
  # shellcheck disable=SC2086
  $mmdc -i "$src" -o "static/diagrams/$name.png" \
    -b transparent -s 3 \
    -c diagrams/mermaid-config.json \
    -p diagrams/puppeteer.json
done
