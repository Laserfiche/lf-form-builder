#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/release.sh <major|minor|patch>
# Bumps both published packages, commits, and creates a git tag.

BUMP="${1:-}"

if [[ -z "$BUMP" ]] || [[ ! "$BUMP" =~ ^(major|minor|patch)$ ]]; then
  if command -v whiptail >/dev/null 2>&1; then
    CHOICE=$(whiptail --title "Menu" --menu "Choose an option" 15 60 4 \
      "1" "Major" \
      "2" "Minor" \
      "3" "Patch" 3>&1 1>&2 2>&3)
    case "$CHOICE" in
      "1") BUMP="major" ;;
      "2") BUMP="minor" ;;
      "3") BUMP="patch" ;;
      *) echo "Aborted."; exit 0 ;;
    esac
  else
    echo "Please type the release type:"
    echo "1) Major"
    echo "2) Minor"
    echo "3) Patch"
    read -rp "Enter choice [1-3]: " CHOICE
    case "$CHOICE" in
      "1") BUMP="major" ;;
      "2") BUMP="minor" ;;
      "3") BUMP="patch" ;;
      *) echo "Aborted."; exit 0 ;;
    esac
  fi
fi

# Ensure working directory is clean
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Error: Working directory is not clean. Commit or stash changes first."
  exit 1
fi

# Ensure we're on main
BRANCH=$(git branch --show-current)
if [[ "$BRANCH" != "main" ]]; then
  read -rp "You're on branch '$BRANCH', not 'main'. Continue? [y/N] " confirm
  if [[ "$confirm" != [yY] ]]; then
    echo "Aborted."
    exit 1
  fi
fi

# Read current version from core package
CURRENT=$(node -p "require('./packages/core/package.json').version")
echo "Current version: $CURRENT"

# Calculate new version
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"

case "$BUMP" in
  major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
  minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
  patch) PATCH=$((PATCH + 1)) ;;
esac

NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"
TAG="v${NEW_VERSION}"

echo "New version:     $NEW_VERSION ($BUMP)"
echo ""
read -rp "Proceed? [y/N] " confirm
if [[ "$confirm" != [yY] ]]; then
  echo "Aborted."
  exit 1
fi

# Bump versions in both published packages
cd packages/types
npm version "$NEW_VERSION" --no-git-tag-version
cd ../core
npm version "$NEW_VERSION" --no-git-tag-version
cd ../..

# Keep internal dependency ranges aligned with the released version.
# This updates any dependency/devDependency/peerDependency/optionalDependency
# entries if they exist.
set_package_dep_version() {
  local package_json_path="$1"
  local dep_name="$2"
  local dep_version="$3"

  node -e '
const fs = require("fs");
const file = process.argv[1];
const depName = process.argv[2];
const depVersion = process.argv[3];
const pkg = JSON.parse(fs.readFileSync(file, "utf8"));

let changed = false;
for (const section of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
  if (pkg[section] && Object.prototype.hasOwnProperty.call(pkg[section], depName)) {
    if (pkg[section][depName] !== depVersion) {
      pkg[section][depName] = depVersion;
      changed = true;
    }
  }
}

if (changed) {
  fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + "\n");
}
' "$package_json_path" "$dep_name" "$dep_version"
}

INTERNAL_RANGE="^${NEW_VERSION}"

# core depends on types
set_package_dep_version "packages/core/package.json" "@lf/lf-form-types" "$INTERNAL_RANGE"

# examples consume both published packages
set_package_dep_version "packages/examples/package.json" "@lf/lf-form-builder" "$INTERNAL_RANGE"
set_package_dep_version "packages/examples/package.json" "@lf/lf-form-types" "$INTERNAL_RANGE"

# template should point at current released ranges
set_package_dep_version "template/package.json" "@lf/lf-form-builder" "$INTERNAL_RANGE"
set_package_dep_version "template/package.json" "@lf/lf-form-types" "$INTERNAL_RANGE"

# Commit and tag
git add \
  packages/core/package.json \
  packages/types/package.json \
  packages/examples/package.json \
  template/package.json
git commit -m "release: $TAG"
git tag "$TAG"

echo ""
echo "Done! Version bumped to $NEW_VERSION and tagged $TAG."
echo ""
echo "Next steps:"
echo "  git push && git push origin $TAG"
echo "  Then create a GitHub release from the $TAG tag to trigger publishing."
