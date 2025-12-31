# Branch Verification and Access Guide

This guide helps you verify branch existence and troubleshoot access issues in the ChickenLoop repository.

## Quick Branch Verification

To verify if a branch exists or check your repository access, use our verification script:

```bash
# Check repository access and list all branches
./scripts/verify-branch-access.sh

# Check if a specific branch exists
./scripts/verify-branch-access.sh "branch-name"
```

## Common Issues and Solutions

### Issue: "Branch does not exist"

**Symptoms:**
- Error message: "Branch 'X' does not exist"
- Cannot find a branch you're looking for
- Git shows "fatal: 'branch-name' is not a commit"

**Solutions:**

1. **Fetch latest changes from remote:**
   ```bash
   git fetch origin
   git branch -r  # View all remote branches
   ```

2. **Check if branch name is correct:**
   - Branch names are case-sensitive
   - Special characters may cause issues
   - Use quotes for branch names with spaces (not recommended)
   
   ```bash
   # List all branches to find the correct name
   git branch -a
   ```

3. **Branch may be on remote but not local:**
   ```bash
   # Checkout remote branch
   git checkout -b local-branch-name origin/remote-branch-name
   ```

### Issue: "Lack permission to access this repository"

**Symptoms:**
- Cannot push or pull from repository
- Authentication errors
- "Permission denied" messages

**Solutions:**

1. **Verify you're a collaborator:**
   - Check repository settings on GitHub
   - Contact repository owner to add you as a collaborator
   - Repository: https://github.com/chickenloop3845-commits/chickenloop

2. **Check your GitHub authentication:**
   
   For HTTPS:
   ```bash
   # Use Personal Access Token (PAT)
   # Generate at: https://github.com/settings/tokens
   git remote set-url origin https://YOUR_TOKEN@github.com/chickenloop3845-commits/chickenloop.git
   ```
   
   For SSH:
   ```bash
   # Ensure SSH key is added to GitHub
   ssh -T git@github.com
   
   # If needed, set remote to SSH
   git remote set-url origin git@github.com:chickenloop3845-commits/chickenloop.git
   ```

3. **Verify your Git configuration:**
   ```bash
   git config user.name
   git config user.email
   
   # If not set, configure:
   git config user.name "Your Name"
   git config user.email "your.email@example.com"
   ```

## Current Repository Information

**Repository:** https://github.com/chickenloop3845-commits/chickenloop

**Collaborators:**
- jhegedus42 (Owner - Joco)
- Tzwengali (Sven Kelling - sven.kelling@gmail.com)

**Main Branches:**
- `main` - Production branch (auto-deploys to Vercel)
- Feature branches for development work

## Branch Naming Conventions

For this project, we recommend:

```bash
# Feature branches
feature/your-feature-name

# Bug fixes
fix/bug-description

# Copilot-created branches
copilot/task-description

# Personal development branches
dev/your-name/feature-name
```

**Avoid:**
- Branch names with spaces (use hyphens or underscores)
- Special characters like apostrophes ('), quotes ("), or slashes in the middle
- Very long branch names (keep under 50 characters)

## Viewing Branches

### List all local branches:
```bash
git branch
```

### List all remote branches:
```bash
git branch -r
```

### List all branches (local and remote):
```bash
git branch -a
```

### View branch details:
```bash
# Show current branch
git branch --show-current

# Show all branches with last commit
git branch -v

# Show branches merged into current branch
git branch --merged

# Show branches not yet merged
git branch --no-merged
```

## Creating and Switching Branches

### Create a new branch:
```bash
git checkout -b new-branch-name
```

### Switch to existing branch:
```bash
git checkout branch-name
```

### Create branch from specific commit:
```bash
git checkout -b new-branch-name commit-sha
```

### Push new branch to remote:
```bash
git push -u origin branch-name
```

## Troubleshooting Steps

### Step 1: Verify Repository Access

```bash
# Test connection to repository
git ls-remote origin

# Should show list of refs if you have access
```

### Step 2: Update Local Repository

```bash
# Fetch all changes from remote
git fetch origin

# Pull changes for current branch
git pull origin main
```

### Step 3: Check Git Configuration

```bash
# View all git config
git config --list

# Check remote URL
git remote -v

# Verify user settings
git config user.name
git config user.email
```

### Step 4: Use the Verification Script

```bash
# Run comprehensive verification
./scripts/verify-branch-access.sh

# Check specific branch
./scripts/verify-branch-access.sh "your-branch-name"
```

## Getting Help

If you continue to experience issues:

1. **Check GitHub Status:**
   - Visit https://www.githubstatus.com/

2. **Review Git Output:**
   - Run git commands with verbose flag: `git fetch -v`
   - Check error messages carefully

3. **Contact Repository Maintainers:**
   - Open an issue on GitHub
   - Contact via email (see SESSION_MEMORY.md for contacts)

4. **Verify Network and Firewall:**
   - Ensure you can access github.com
   - Check if corporate firewall blocks git operations

## Common Error Messages

### Error: "fatal: couldn't find remote ref branch-name"
**Solution:** Branch doesn't exist on remote. Check branch name and fetch latest changes.

### Error: "Permission denied (publickey)"
**Solution:** SSH key not configured. Set up SSH key or use HTTPS with PAT.

### Error: "remote: Repository not found"
**Solution:** Check repository URL and verify you have access.

### Error: "Your branch is up to date with 'origin/branch-name'"
**Solution:** This is informational, not an error. You're synced with remote.

## Repository-Specific Notes

### Special Characters in Branch Names

If you encounter a branch name with special characters (like apostrophes):

```bash
# Avoid creating branches with special characters
# Instead of: "Sven's-branch"
# Use: "svens-branch" or "sven-branch"

# If such a branch exists and you need to reference it:
git branch -r | grep "special-char"  # Find the exact name
git checkout -b local-name origin/remote-exact-name
```

### Branch Protection

The `main` branch may have protection rules:
- Require pull request reviews
- Require status checks to pass
- Restrict who can push

Always create feature branches for development work.

## Additional Resources

- [Git Branch Documentation](https://git-scm.com/docs/git-branch)
- [GitHub Authentication](https://docs.github.com/en/authentication)
- [Git Remote Documentation](https://git-scm.com/docs/git-remote)
- Project Contributing Guide: [CONTRIBUTING.md](./CONTRIBUTING.md)

---

**Last Updated:** December 31, 2024
**Maintainers:** jhegedus42, Tzwengali
