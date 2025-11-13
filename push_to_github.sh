#!/usr/bin/env bash
#set -e for safety
set -euo pipefail

# push_to_github.sh
# Create a new GitHub repository for the authenticated user and mirror-push
# the current local git repository (all branches & tags).
# Usage:
#   GITHUB_TOKEN=ghp_xxx ./push_to_github.sh my-new-repo-name
# If no name is provided, defaults to '<current-folder>-mirror'.

API_BASE="https://api.github.com"

# Ensure required tools are available
for cmd in git curl jq; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Error: required command '$cmd' not found. Install it and retry."
    exit 1
  fi
done

# Ensure we're inside a git repo
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "No git repository detected in $(pwd). Initialize one? [y/N]"
  read -r INIT_ANS
  if [[ "$INIT_ANS" == "y" || "$INIT_ANS" == "Y" ]]; then
    git init
    echo "Initialized empty git repository."
  else
    echo "Aborting. Run this script from a git repository."
    exit 1
  fi
fi

# Create or update .gitignore to exclude node_modules and other common large artifacts
GITIGNORE_FILE=".gitignore"
GITIGNORE_ENTRIES=(
  "node_modules/"
  "dist/"
  "build/"
  "*.log"
  ".DS_Store"
)

mkdir -p "$(git rev-parse --show-toplevel 2>/dev/null || echo .)"
if [[ -f "$GITIGNORE_FILE" ]]; then
  echo "Updating existing $GITIGNORE_FILE with recommended entries..."
else
  echo "Creating $GITIGNORE_FILE with recommended entries..."
fi

for entry in "${GITIGNORE_ENTRIES[@]}"; do
  if ! grep -Fxq "$entry" "$GITIGNORE_FILE" 2>/dev/null; then
    echo "$entry" >> "$GITIGNORE_FILE"
  fi
done

# Detect large tracked files (>10MB) and offer to remove them from index
SIZE_LIMIT_BYTES=$((10 * 1024 * 1024))
echo "Scanning for tracked files larger than 10MB..."
LARGE_FILES=$(git ls-files -z | xargs -0 -I{} bash -c 'if [ -f "{}" ]; then stat -c "%s %n" "{}"; fi' 2>/dev/null | awk -v lim=$SIZE_LIMIT_BYTES '$1 > lim {print substr($0, index($0,$2))}')

if [[ -n "$LARGE_FILES" ]]; then
  echo "The following tracked files are larger than 10MB:"
  echo "$LARGE_FILES"
  echo
  read -r -p "Remove these files from the git index (they will remain on disk) and add patterns to .gitignore? [y/N] " REMOVE_ANS
  if [[ "$REMOVE_ANS" == "y" || "$REMOVE_ANS" == "Y" ]]; then
    # Remove each large file from index
    while IFS= read -r f; do
      # if file is inside node_modules, we already ignore the directory; otherwise add path to .gitignore
      if [[ "$f" == node_modules/* ]]; then
        git rm -r --cached node_modules || true
      else
        git rm --cached -- "$f" || true
        # Add parent directory as a pattern to .gitignore where appropriate
        parent=$(dirname "$f")
        if ! grep -Fxq "$parent/" "$GITIGNORE_FILE" 2>/dev/null; then
          echo "$parent/" >> "$GITIGNORE_FILE"
        fi
      fi
    done <<< "$LARGE_FILES"
    echo "Removed large files from index and updated $GITIGNORE_FILE."
  else
    echo "Left large files tracked. Pushing may fail or be slow."
  fi
else
  echo "No tracked files over 10MB detected."
fi

# If node_modules is tracked, remove from index (safe no-op if not tracked)
if git ls-files --error-unmatch node_modules >/dev/null 2>&1; then
  echo "Removing tracked node_modules from index..."
  git rm -r --cached node_modules || true
fi

# If there are unstaged changes from .gitignore edits, stage them
if git status --porcelain | grep -q "^?? $GITIGNORE_FILE\|^[ AMD]"; then
  git add "$GITIGNORE_FILE" || true
fi

# If the repository has no commits yet, make an initial commit so remote push will succeed
if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  echo "No commits detected. Creating an initial commit..."
  # Add everything except ignored files
  git add -A
  git commit -m "chore: initial commit (add .gitignore and project files)" || true
fi

# If the first argument looks like a full GitHub HTTPS URL, use it directly and skip API creation.
ARG1=${1:-}
if [[ "$ARG1" == https://github.com/* ]]; then
  REMOTE_URL="$ARG1"
  echo "Using existing remote URL: $REMOTE_URL"
else
  REPO_NAME=${1:-$(basename "$(pwd)")-mirror}

  if [[ -z "${GITHUB_TOKEN:-}" ]]; then
    echo "Error: GITHUB_TOKEN environment variable is not set."
    echo "Create a Personal Access Token with 'repo' scope and export it:"
    echo "  export GITHUB_TOKEN=ghp_xxx"
    exit 1
  fi

  # Discover authenticated username
  echo "Detecting GitHub username from token..."
  GH_USER=$(curl -s -H "Authorization: token $GITHUB_TOKEN" $API_BASE/user | jq -r .login)
  if [[ "$GH_USER" == "null" ]] || [[ -z "$GH_USER" ]]; then
    echo "Failed to determine GitHub user. Is the token valid and does it have 'repo' scope?"
    exit 1
  fi

  echo "Authenticated as $GH_USER"

  # Create the repository under the authenticated user's account
  echo "Creating repository '$REPO_NAME' under user '$GH_USER'..."
  CREATE_RESP=$(curl -s -H "Authorization: token $GITHUB_TOKEN" -d "{\"name\": \"$REPO_NAME\", \"private\": false}" $API_BASE/user/repos)

  # detect errors
  if echo "$CREATE_RESP" | grep -q "errors" || echo "$CREATE_RESP" | grep -q "message" && echo "$CREATE_RESP" | grep -q ""; then
    MSG=$(echo "$CREATE_RESP" | jq -r .message // empty)
    if [[ -n "$MSG" ]]; then
      if [[ "$MSG" == "Repository creation failed." ]] || echo "$CREATE_RESP" | jq -r .errors[0].message 2>/dev/null | grep -q "already exists"; then
        echo "Repository likely exists or creation failed: $MSG"
        echo "You can still mirror-push to an existing repo if you want."
      else
        echo "API response: $MSG"
      fi
    fi
  fi

  REMOTE_URL="https://github.com/$GH_USER/$REPO_NAME.git"
fi

# Add remote if not present
if git remote | grep -q "^origin$"; then
  echo "Remote 'origin' already exists. Adding temporary remote 'github-mirror' instead."
  git remote add github-mirror "$REMOTE_URL"
  MIRROR_REMOTE=github-mirror
else
  git remote add origin "$REMOTE_URL"
  MIRROR_REMOTE=origin
fi

# Push mirror (all refs). This will push branches, tags and refs exactly as-is.
# Note: pushing mirror may overwrite the remote. Confirm with user.

read -r -p "About to push --mirror to $MIRROR_REMOTE ($REMOTE_URL). This may overwrite remote refs. Continue? [y/N] " ANSWER
if [[ "$ANSWER" != "y" && "$ANSWER" != "Y" ]]; then
  echo "Aborting push. No changes made to remote."
  exit 0
fi

# Use credential helper for tokenless authentication; embed token in URL only if necessary
# Use the HTTPS URL without embedding token; git will reuse cached credentials or ask.
# For non-interactive use, user can configure a credential helper or use gh CLI.

# If user wants fully non-interactive push, they can run:
#   git push --mirror https://<USERNAME>:<TOKEN>@github.com/<USERNAME>/<REPO>.git
# We avoid embedding tokens in commands by default.

echo "Pushing mirror (this may take a while for large repos)..."

git push --mirror "$REMOTE_URL"

if [[ $? -eq 0 ]]; then
  echo "Mirror push completed successfully to $REMOTE_URL"
  echo "Repository URL: $REMOTE_URL"
else
  echo "Mirror push failed. Review git output above for details."
  exit 1
fi

# Provide next steps
TARGET_DISPLAY_URL=${REMOTE_URL:-}
if [[ -n "${GH_USER:-}" && -n "${REPO_NAME:-}" ]]; then
  TARGET_DISPLAY_URL="https://github.com/$GH_USER/$REPO_NAME"
fi

cat <<EOF
Done.
Next steps:
  - Visit: $TARGET_DISPLAY_URL
  - Enable CI, adjust branch protections, or open PRs as needed.
EOF
