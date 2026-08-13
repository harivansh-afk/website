#!/usr/bin/env sh
# bake grayscale link-preview screenshots into static/previews/.
# idempotent: only fetches shots that don't exist yet; delete a webp to refresh it.
set -eu
cd "$(dirname "$0")/.."
out=static/previews
mkdir -p "$out"

chromium_cmd="${CHROMIUM:-chromium}"
if ! command -v "$chromium_cmd" >/dev/null 2>&1; then
  echo "screenshots: chromium not found (set CHROMIUM=...), keeping existing shots" >&2
  exit 0
fi
if ! command -v magick >/dev/null 2>&1; then
  echo "screenshots: imagemagick not found, keeping existing shots" >&2
  exit 0
fi

# headless boxes often only ship dejavu, which makes shots render with the
# wrong font; give fontconfig real ui fonts (inter + noto) for this run
if command -v nix >/dev/null 2>&1; then
  fontroot=$(mktemp -d)
  mkdir -p "$fontroot/fonts"
  for p in $(nix build nixpkgs#inter nixpkgs#noto-fonts --no-link --print-out-paths 2>/dev/null); do
    for d in "$p"/share/fonts/*; do
      ln -s "$d" "$fontroot/fonts/$(basename "$p")-$(basename "$d")" 2>/dev/null || true
    done
  done
  XDG_DATA_HOME="$fontroot"
  export XDG_DATA_HOME
fi

shot() {
  name=$1
  url=$2
  [ -e "$out/$name.webp" ] && return 0
  tmp=$(mktemp -d)
  echo "screenshots: $name <- $url" >&2
  if "$chromium_cmd" --headless=new --disable-gpu --hide-scrollbars \
    --window-size=1280,800 --virtual-time-budget=8000 --timeout=20000 \
    --screenshot="$tmp/shot.png" "$url" >/dev/null 2>&1; then
    magick "$tmp/shot.png" -resize 640x -gravity north -crop 640x400+0+0 +repage \
      -quality 82 "$out/$name.webp"
  else
    echo "screenshots: $name failed, skipping" >&2
  fi
  rm -rf "$tmp"
}

# direct image fetch: for links whose landing page previews worse than a
# source image (README screenshot, og image)
shotimg() {
  name=$1
  url=$2
  [ -e "$out/$name.webp" ] && return 0
  tmp=$(mktemp -d)
  echo "screenshots: $name <- $url (image)" >&2
  if curl -sL -o "$tmp/src" "$url"; then
    magick "$tmp/src" -resize 640x -quality 82 "$out/$name.webp"
  else
    echo "screenshots: $name failed, skipping" >&2
  fi
  rm -rf "$tmp"
}

shot wca "https://www.worldcubeassociation.org/persons/2015RATH01"
shot fll "https://www.facebook.com/roboclubonline/posts/roboclub-team-supercalifragilisticexpialidocious-at-the-first-lego-league-nation/1565656036804624/"
shot ix "https://ix.dev"
shot indexable "https://github.com/indexable-inc/"
shot companion "https://companion.ai"
shot phia "https://phia.com"
shot agentcomputer "https://github.com/AgentComputerAI"
shot betternas "https://betternas.com"

# pierrejo: the diff UI screenshot from its README beats the repo page
shotimg pierrejo "https://github.com/user-attachments/assets/c580bd48-a67a-498b-b914-5aa19d1decc4"

# hand-baked assets (regenerate by hand, then bump IMG_V in previews.js):
# - mixbridge.webp: animated webp cycling through iphone shots from
#   mixbridge.app/prod/Slice*.png, cropped to the phone and crossfaded:
#   magick c1 c2 c4 c5 c1 -resize 400x -morph 6 \
#     -set delay "%[fx:(t%7==0)?170:6]" -loop 0 -quality 70 mixbridge.webp
# - mux.mp4 / deskctl.mp4: README demo videos, re-encoded:
#   ffmpeg -i <demo> -vf "scale=640:-2,fps=24" -an -c:v libx264 -crf 30 \
#     -movflags +faststart static/previews/<name>.mp4
