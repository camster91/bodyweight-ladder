#!/usr/bin/env bash
# Files every draft in .github/issue-drafts as a GitHub issue, then you can delete the drafts.
# Needs the GitHub CLI: brew install gh && gh auth login
set -euo pipefail
cd "$(dirname "$0")"
REPO="camster91/bodyweight-ladder"
for label in images brand ui bug enhancement backend accessibility; do
  gh label create "$label" --repo "$REPO" --force >/dev/null 2>&1 || true
done
for f in .github/issue-drafts/*.md; do
  title=$(sed -n 's/^title: //p' "$f" | head -1)
  labels=$(sed -n 's/^labels: //p' "$f" | head -1)
  body=$(awk 'BEGIN{n=0} /^---$/{n++; next} n>=2' "$f")
  if gh issue list --repo "$REPO" --state all --search "in:title \"$title\"" --json title -q '.[].title' | grep -Fxq "$title"; then
    echo "skip (exists): $title"; continue
  fi
  gh issue create --repo "$REPO" --title "$title" --label "$labels" --body "$body" >/dev/null
  echo "filed: $title"
done
