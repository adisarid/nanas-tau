#!/usr/bin/env bash
# Export rendered slide decks to printable PDFs in lectures/pdf/ (one slide per page).
# CI has no browser, so like _freeze/ the PDFs are made locally and committed.
# Uses decktape (via npx) driving the local Chrome; plain Chrome --print-to-pdf
# prints before MathJax and the reveal print layout finish.
#
# Usage, after `quarto render`:   scripts/slides-pdf.sh [lectures/NN-slug.qmd ...]
# With no arguments it exports every deck in _site/lectures/.
set -euo pipefail
cd "$(dirname "$0")/.."

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
[[ -x "$CHROME" ]] || CHROME="$(command -v google-chrome || command -v chromium)"
mkdir -p lectures/pdf

if [[ $# -gt 0 ]]; then
  decks=(); for q in "$@"; do decks+=("_site/lectures/$(basename "$q" .qmd)-slides.html"); done
else
  decks=(_site/lectures/*-slides.html)
fi

for deck in "${decks[@]}"; do
  [[ -f "$deck" ]] || { echo "missing $deck: run quarto render first" >&2; exit 1; }
  out="lectures/pdf/$(basename "$deck" .html).pdf"
  # 1050x700 is the Quarto revealjs slide size; the pauses let web fonts and MathJax settle.
  PUPPETEER_SKIP_DOWNLOAD=1 npx -y decktape@3.15.0 reveal --chrome-path "$CHROME" \
    --size 1050x700 --load-pause 3000 --pause 500 \
    "file://$PWD/$deck" "$out" > /dev/null
  echo "wrote $out"
done
