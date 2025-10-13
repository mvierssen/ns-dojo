---
description: "Commit and push changes in the current or a specified directory"
argument-hint: "[message] [--type <type>] [--path <path>] [--remote <remote>] [--branch <branch>] [--no-push] [--dry-run]"
allowed-tools: ["Bash"]
---

# /git-commit – Commit and Push Changes

Checks for changes in a directory, commits them with a conventional commit message, and pushes to a remote branch.

## Goal

- Check for uncommitted changes in a specified directory.
- Commit changes using a consistent conventional commit format.
- Push the commits to the specified remote and branch.

## Usage

```
# Commit changes in the current directory with a custom message
/git-commit "implement csrf security fixes" --type feat

# Commit changes in a specific worktree and push to a different branch
/git-commit "update client configurations" --path ./services --remote origin --branch main

# Commit without pushing
/git-commit "fix linting issues" --type fix --no-push

# See what would be committed
/git-commit --dry-run
```

## Arguments

- `message` (optional): The commit description. Defaults to "wip".
- `--type` (optional): The conventional commit type. Defaults to `chore`.
- `--path` (optional): The path to the directory to run git commands in. Defaults to the current directory.
- `--remote` (optional): The git remote to push to. Defaults to `origin`.
- `--branch` (optional): The remote branch to push to. Defaults to the current branch name.
- `--no-push` (optional): If set, the command will commit but not push the changes.
- `--dry-run` (optional): Show the git commands that would be run without executing them.

## Workflow

1.  **Navigate**: Change directory to the specified `--path`.
2.  **Status Check**: Run `git status` to check for changes.
3.  **Commit**: If there are changes, stage them (`git add .`) and commit them using the format `<type>: <message>`.
4.  **Push**: If `--no-push` is not set, push the changes to the specified remote and branch.
