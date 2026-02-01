---
name: Browser Tab Management
description: Enforce the Fixed 4-Tab Browser Model - maintain exactly 4 tabs, navigate within them, never open/close.
---

# Browser Tab Management Skill

## Overview

This skill enforces the **Fixed 4-Tab Browser Model** for all browser interactions. The user requires that browser sessions maintain exactly 4 tabs throughout their lifecycle.

## Transparency

**When applying this skill, always mention it in your response.** For example:

> *"Applying the **Browser Tab Management** skill — I'll navigate within the existing 4 tabs rather than opening new ones."*

This ensures the user knows you're following their browser management preferences.

---

## Core Rules

### 1. Fixed Tab Count
- **Always maintain exactly 4 browser tabs**
- Never open new tabs beyond the initial 4
- Never close tabs (except to recover from violations)

### 2. Navigation Strategy
- To visit a new URL, **switch to an existing tab** and navigate to the new URL
- Use `mcp_chrome-devtools_navigate_page` or `mcp_chrome-devtools_select_page` followed by navigation
- Do NOT use `mcp_chrome-devtools_new_page`

### 3. Allowed Actions
- ✅ Switch between existing tabs (`select_page`)
- ✅ Navigate to a URL within a tab (`navigate_page`)
- ✅ Refresh a page (`navigate_page` with `type: reload`)
- ✅ Take screenshots and interact with page content
- ❌ Open new tabs (`new_page`)
- ❌ Close tabs arbitrarily (`close_page`)

## Implementation

### Before Browser Interactions

1. **Check current tab count**:
   ```
   mcp_chrome-devtools_list_pages
   ```

2. **If more than 4 tabs exist**, close excess tabs to restore compliance:
   ```
   mcp_chrome-devtools_close_page (pageId: N)
   ```

3. **If fewer than 4 tabs exist**, this is acceptable — do not open new ones.

### Navigating to a New URL

Instead of opening a new tab:

1. **Select an appropriate existing tab**:
   ```
   mcp_chrome-devtools_select_page (pageId: N)
   ```

2. **Navigate within that tab**:
   ```
   mcp_chrome-devtools_navigate_page (url: "https://example.com", type: "url")
   ```

### Using Browser Subagent

When invoking `browser_subagent`, include explicit instructions in the Task:

> **IMPORTANT**: Do NOT open new browser tabs. You must work within the existing tabs. 
> Use `select_page` to switch tabs and `navigate_page` to change URLs.
> If you need to visit multiple URLs, navigate sequentially within the same tab.

### Recovery from Violations

If a violation occurs (too many tabs open):

1. List all pages: `mcp_chrome-devtools_list_pages`
2. Identify which tabs to keep (prioritize active work)
3. Close excess tabs until exactly 4 remain
4. Document the recovery in your response

## Example: Checking a Website

**Bad approach** (opens new tab):
```
mcp_chrome-devtools_new_page (url: "https://example.com")  ❌
```

**Good approach** (navigates within existing tab):
```
mcp_chrome-devtools_select_page (pageId: 2)
mcp_chrome-devtools_navigate_page (url: "https://example.com", type: "url")  ✅
```

## Rationale

This constraint:
- Reduces browser resource usage
- Keeps the workspace organized
- Prevents tab sprawl during complex tasks
- Makes it easier for the user to track what's happening
