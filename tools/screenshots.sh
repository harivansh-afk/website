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
      -colorspace Gray -quality 82 "$out/$name.webp"
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
shot mixbridge "https://mixbridge.app/"
shot pierrejo "https://git.harivan.sh/harivansh-afk/pierrejo"
shot agentcomputer "https://github.com/AgentComputerAI"
shot betternas "https://betternas.com"
shot deskctl "https://deskctl.dev"
