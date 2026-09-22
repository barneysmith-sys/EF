#!/usr/bin/env bash
# Publish kilo/dist to the gh-pages branch.
#
# The outer repo is rooted at ~/Desktop and its .gitignore ignores everything
# outside kilo/. Committing from a throwaway repo inside dist/ keeps that
# .gitignore out of scope, so the built assets are actually staged.
set -euo pipefail

REMOTE="${1:-https://github.com/barneysmith-sys/EF.git}"
DIST="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/dist"

[ -f "$DIST/index.html" ] || { echo "No build found at $DIST. Run npm run build:pages first." >&2; exit 1; }

cd "$DIST"
touch .nojekyll
rm -rf .git
git init -q -b gh-pages
git add -A
git -c user.name="kilo-deploy" -c user.email="kilo-deploy@users.noreply.github.com" \
  commit -qm "Deploy Kilo prototype"
git push -qf "$REMOTE" gh-pages
rm -rf .git

echo "Deployed to gh-pages."
