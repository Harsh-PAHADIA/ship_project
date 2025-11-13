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
