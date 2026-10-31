#!/usr/bin/env bash
set -euo pipefail

OUTPUT_DIR="${1:-_site_brainvomit}"

rm -rf "$OUTPUT_DIR"
bundle exec jekyll build \
  --config _config.yml,_config.brainvomit.yml \
  --destination "$OUTPUT_DIR" \
  --trace

# Portfolio resumes are copied with the shared asset tree but are not part of
# the publication. Remove them from the deploy artifact without touching source.
find "$OUTPUT_DIR/assets" -maxdepth 1 -type f -iname '*.pdf' -delete

python3 scripts/build_contentos_catalog.py "$OUTPUT_DIR"

python3 scripts/validate_brainvomit_build.py "$OUTPUT_DIR"
