PUSH_INSTRUCTIONS.md

This document describes how to create a GitHub repository and push the entire project from your local machine using a personal access token (PAT). The repository root includes a helper script `push_to_github.sh` that automates the process.

Security note
- Never share your PAT. Prefer using the GitHub CLI (`gh`) or a credential helper. The helper script requests confirmation before pushing.

Prerequisites
- git installed and the project already checked out locally.
- `jq` installed (script uses `jq` to parse GitHub API responses). Install with: `brew install jq` (macOS) or your platform package manager.
- A GitHub Personal Access Token (PAT) with the `repo` scope.

Quick steps (recommended)
1. Export your PAT as an environment variable locally:

```bash
export GITHUB_TOKEN=ghp_xxx
```

2. Run the helper script to create a repository and mirror-push everything:

```bash
# from the repository root
./push_to_github.sh my-new-repo-name
```

- If you omit the repo name, it defaults to `<folder-name>-mirror`.
- The script will detect your GitHub username from the token, create the repo via the API, then add a remote and run `git push --mirror` after confirmation.

Alternative: Using the GitHub CLI (`gh`)
If you have `gh` installed and authenticated, you can create a repo and push manually:

```bash
# create repo (interactive or non-interactive)
gh repo create my-new-repo-name --public --source=. --remote=origin --push
```

This single command will create the repo and push current branch; to push all refs:

```bash
git remote add origin https://github.com/<your-username>/my-new-repo-name.git
git push --mirror origin
```

Manual API + git commands (if you prefer)

1. Create repo using curl (replace token):

```bash
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user/repos -d '{"name":"my-new-repo-name","private":false}'
```

2. Add remote and push mirror:

```bash
git remote add origin https://github.com/<your-username>/my-new-repo-name.git
git push --mirror origin
```

Troubleshooting
- Authentication errors: ensure the token is valid and has `repo` scope.
- `git push --mirror` refused: confirm you have permissions on the target repo and that you really want to overwrite remote refs.
- If the script fails to create a repo because the name already exists, you can use a different name or push to the existing repo with caution.

After push
- Visit the GitHub URL printed by the script.
- Enable CI / workflows as needed.
- Open PRs or enable branch protections.

If you'd like, I can also prepare a small PR template, or — once you run the script and push — I can watch the PR/CI logs and help triage build/test failures.