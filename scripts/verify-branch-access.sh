#!/bin/bash

# Script to verify branch existence and repository access
# Usage: ./scripts/verify-branch-access.sh [branch-name]

set -e

REPO_URL="https://github.com/chickenloop3845-commits/chickenloop"

echo "========================================="
echo "ChickenLoop - Branch Verification Tool"
echo "========================================="
echo ""

# Function to check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo "❌ Error: Not in a git repository"
        echo "   Please run this script from the repository root"
        exit 1
    fi
    echo "✅ Git repository detected"
}

# Function to check repository access
check_repo_access() {
    echo ""
    echo "📡 Checking repository access..."
    
    if git ls-remote --exit-code origin HEAD &>/dev/null; then
        echo "✅ Repository access confirmed"
        REMOTE_URL=$(git remote get-url origin)
        echo "   Remote URL: $REMOTE_URL"
        return 0
    else
        echo "❌ Cannot access repository"
        echo "   Please check your network connection and repository permissions"
        return 1
    fi
}

# Function to list all branches
list_branches() {
    echo ""
    echo "📋 Available branches:"
    echo ""
    echo "Local branches:"
    git branch --list | sed 's/^/  /'
    
    echo ""
    echo "Remote branches:"
    git branch -r | grep -v "HEAD" | sed 's/^/  /'
}

# Function to check if a specific branch exists
check_branch() {
    local branch_name="$1"
    
    echo ""
    echo "🔍 Searching for branch: '$branch_name'"
    echo ""
    
    # Check local branches
    if git show-ref --verify --quiet "refs/heads/$branch_name"; then
        echo "✅ Found in local branches"
        echo "   Branch: $branch_name"
        echo "   Type: local"
        return 0
    fi
    
    # Check remote branches
    if git show-ref --verify --quiet "refs/remotes/origin/$branch_name"; then
        echo "✅ Found in remote branches"
        echo "   Branch: origin/$branch_name"
        echo "   Type: remote"
        echo ""
        echo "💡 To checkout this branch, run:"
        echo "   git checkout -b $branch_name origin/$branch_name"
        return 0
    fi
    
    # Try fuzzy search for similar branch names
    echo "❌ Branch '$branch_name' not found"
    echo ""
    echo "🔍 Searching for similar branch names..."
    
    local similar_branches=$(git branch -a | grep -iF "$branch_name" | head -5)
    if [ -n "$similar_branches" ]; then
        echo ""
        echo "   Similar branches found:"
        echo "$similar_branches" | sed 's/^/     /'
    else
        echo "   No similar branches found"
    fi
    
    return 1
}

# Function to check user access
check_user_access() {
    echo ""
    echo "👤 Checking user access..."
    
    # Get git config with error handling
    local git_user=$(git config --get user.name 2>/dev/null || echo "")
    local git_email=$(git config --get user.email 2>/dev/null || echo "")
    
    if [ -n "$git_user" ] && [ -n "$git_email" ]; then
        echo "✅ Git user configured"
        echo "   Name: $git_user"
        echo "   Email: $git_email"
    else
        echo "⚠️  Git user not fully configured"
        echo ""
        echo "   To configure git user, run:"
        echo "   git config user.name \"Your Name\""
        echo "   git config user.email \"your.email@example.com\""
    fi
}

# Function to provide helpful suggestions
provide_suggestions() {
    echo ""
    echo "========================================="
    echo "💡 Helpful Suggestions:"
    echo "========================================="
    echo ""
    echo "1. Fetch latest changes from remote:"
    echo "   git fetch origin"
    echo ""
    echo "2. Create a new branch:"
    echo "   git checkout -b your-branch-name"
    echo ""
    echo "3. View all branches (including remote):"
    echo "   git branch -a"
    echo ""
    echo "4. Check repository on GitHub:"
    echo "   $REPO_URL"
    echo ""
    echo "5. Verify you have repository access:"
    echo "   - Check if you're a collaborator"
    echo "   - Ensure your SSH keys are set up (if using SSH)"
    echo "   - Verify your GitHub credentials"
    echo ""
}

# Main execution
main() {
    check_git_repo
    check_repo_access || exit 1
    check_user_access
    
    if [ -n "$1" ]; then
        # Branch name provided
        # Capture result without triggering set -e
        set +e
        check_branch "$1"
        result=$?
        set -e
        
        list_branches
        
        if [ $result -ne 0 ]; then
            provide_suggestions
            echo ""
            echo "========================================="
            echo "❌ Branch not found"
            echo "========================================="
            exit 1
        fi
    else
        # No branch name provided - list all branches
        list_branches
        provide_suggestions
    fi
    
    echo ""
    echo "========================================="
    echo "✅ Verification complete"
    echo "========================================="
}

# Run main function with all arguments
main "$@"
