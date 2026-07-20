#!/usr/bin/env bash
set -euo pipefail

REPOSITORY="Shadovv909/cse3cwa-assessment-1"
REMOTE_URL="https://github.com/${REPOSITORY}.git"

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI is required: https://cli.github.com/" >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "A browser window will open for the one-time GitHub sign-in."
  gh auth login --hostname github.com --git-protocol https --web
fi

if gh repo view "$REPOSITORY" >/dev/null 2>&1; then
  echo "Repository already exists: https://github.com/${REPOSITORY}"
else
  gh repo create "$REPOSITORY" --public --description "CSE3CWA Assessment 1 phoneme activity frontend" --confirm
fi

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REMOTE_URL"
else
  git remote add origin "$REMOTE_URL"
fi

git branch -M main
git push -u origin main

echo "Published: https://github.com/${REPOSITORY}"
