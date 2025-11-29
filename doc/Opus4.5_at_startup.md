# COMPLETE DEEP DIVE: My System Context

This document explains everything Claude Opus 4.5 receives at startup when operating as a coding agent.

---

## PART 1: TOOLS (Functions I Can Call)

### What is a "Function"?

A function is a reusable block of code that:
1. Has a **name** (identifier)
2. Takes **inputs** (parameters/arguments)
3. Does **something** (execution)
4. Optionally returns an **output** (return value)

**Analogy:** A function is like a vending machine:
- Name: "Snack Machine"
- Input: Money + button press (parameters)
- Execution: Internal mechanics retrieve item
- Output: Snack comes out

**In code:**
```python
def add(a, b):      # Name is "add", inputs are "a" and "b"
    result = a + b  # Execution
    return result   # Output

add(2, 3)  # Returns 5
```

### What is an "API"?

**API** = Application Programming Interface

It's a contract/agreement for how two pieces of software talk to each other. When I "call a tool," I'm using an API - I send a structured request, and get a structured response.

**Analogy:** A restaurant menu is an API:
- It defines what you can order (available functions)
- It specifies how to order (parameters: "medium rare", "no onions")
- The kitchen processes your order (execution)
- You get food back (response)

### What is "JSON"?

**JSON** = JavaScript Object Notation

A text format for representing structured data. It's human-readable and machine-parseable.

```json
{
  "name": "Shell",
  "parameters": {
    "command": "ls -la",
    "timeout": 30000
  }
}
```

**Components:**
- `{}` = Object (collection of key-value pairs)
- `[]` = Array (ordered list)
- `"key": "value"` = Key-value pair
- Strings use double quotes: `"hello"`
- Numbers have no quotes: `42`
- Booleans: `true` or `false`
- Null: `null`

**Why JSON?** It's the lingua franca (common language) of web APIs. Nearly every programming language can read/write it.

### What is "JSONSchema"?

A vocabulary for describing the structure of JSON data. It defines:
- What fields exist
- What types they are
- Which are required vs optional
- Validation rules

```json
{
  "type": "object",
  "properties": {
    "command": {
      "type": "string",
      "description": "The command to execute"
    },
    "timeout": {
      "type": "number"
    }
  },
  "required": ["command"]
}
```

This schema says: "I expect an object with a required string field `command` and an optional number field `timeout`."

---

### TOOL 1: Shell (Deep Dive)

#### What is a "Shell"?

The **shell** is a program that provides a text-based interface to your operating system. You type commands, it interprets them and tells the OS what to do.

**History:**
- 1971: Thompson shell (first Unix shell)
- 1979: Bourne shell (`sh`)
- 1989: Bash (`bash` = "Bourne Again SHell") - most common today
- Others: `zsh`, `fish`, `PowerShell` (Windows)

**How it works:**
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   You       │────▶│   Shell     │────▶│   Kernel    │
│  (typing)   │     │ (interpret) │     │ (execute)   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Programs   │
                    │ (ls, grep,  │
                    │  python...) │
                    └─────────────┘
```

#### What is a "Command"?

A command is an instruction to the shell. Structure:

```bash
command [options] [arguments]
```

Example:
```bash
ls -la /home/user
│   │   └── argument (what to list)
│   └── options (how to list: -l=long format, -a=all files)
└── command (the program to run)
```

#### What is a "Terminal"?

The **terminal** (or terminal emulator) is the window/application that displays the shell. It's the visual container; the shell is the interpreter inside it.

**History:** Originally, terminals were physical hardware devices (screens + keyboards) connected to mainframe computers. Today, "terminal" usually means software emulating that experience.

#### What is "Timeout"?

A timeout is a maximum duration to wait for something. If the operation doesn't complete within the timeout, it's forcibly stopped.

**Why needed?** Some commands run forever (or very long). Without timeouts, I could hang indefinitely. My default is 30,000 milliseconds = 30 seconds.

**Milliseconds:** 1 second = 1,000 milliseconds. Using milliseconds gives precision for short durations.

#### What is a "Working Directory"?

Every process (running program) has a "current working directory" (CWD) - the folder it considers "here."

```bash
pwd              # "print working directory" - shows current location
cd /home/user    # "change directory" - moves to new location
```

Relative paths are resolved from CWD:
- `./file.txt` = file.txt in current directory
- `../file.txt` = file.txt in parent directory
- `/absolute/path.txt` = full path from root

#### What is a "Background Process"?

Normally, when you run a command, the shell waits for it to finish (foreground). A background process runs independently while the shell continues.

```bash
sleep 100 &     # The & puts it in background
```

**Why I avoid these:** If I start a background process, I lose track of it. It might run forever, consuming resources.

---

### TOOL 2: Delete (Deep Dive)

#### What is a "Filesystem"?

The filesystem is the organized structure for storing data on disk. It's hierarchical (tree-shaped):

```
/ (root)
├── home/
│   └── user/
│       ├── documents/
│       └── pictures/
├── etc/
│   └── config files...
└── usr/
    └── programs...
```

**Key concepts:**
- **File:** A named sequence of bytes (data)
- **Directory/Folder:** A container holding files and other directories
- **Path:** The "address" of a file (e.g., `/home/user/document.txt`)
- **Inode:** Internal data structure storing file metadata (size, permissions, location on disk)

#### What is "Absolute" vs "Relative" Path?

**Absolute path:** Starts from root `/`, complete address
- `/home/user/documents/file.txt`

**Relative path:** Starts from current directory
- `documents/file.txt` (if you're in `/home/user`)
- `../pictures/photo.jpg` (go up one level, then into pictures)

#### What Does "Delete" Actually Do?

Deletion typically:
1. Removes the directory entry (the name-to-inode link)
2. Decrements the inode's reference count
3. If reference count hits 0, marks the disk space as "free"

**Important:** Data isn't immediately erased - just marked as available for reuse. That's why "file recovery" tools can sometimes work.

---

### TOOL 3: Glob (Deep Dive)

#### What is "Globbing"?

Globbing is pattern matching for filenames. The name comes from "global command" in early Unix.

**Glob patterns:**

| Pattern | Meaning | Example |
|---------|---------|---------|
| `*` | Match any characters (except `/`) | `*.txt` matches `a.txt`, `hello.txt` |
| `?` | Match exactly one character | `?.txt` matches `a.txt` but not `ab.txt` |
| `**` | Match any characters INCLUDING `/` (recursive) | `**/*.js` matches `a.js`, `dir/b.js`, `dir/sub/c.js` |
| `[abc]` | Match one of the characters | `[abc].txt` matches `a.txt`, `b.txt`, `c.txt` |
| `[a-z]` | Match a range | `[a-z].txt` matches `a.txt` through `z.txt` |
| `{a,b}` | Match either option | `*.{js,ts}` matches `.js` and `.ts` files |

**Example:**
```bash
**/*.test.ts    # All TypeScript test files, anywhere in tree
src/**/*.js     # All JS files under src/ directory
```

#### Shell Expansion

When you type a glob in a shell, the *shell* expands it before running the command:

```bash
ls *.txt
# Shell sees: *.txt
# Shell expands to: file1.txt file2.txt file3.txt
# Shell runs: ls file1.txt file2.txt file3.txt
```

---

### TOOL 4: Grep (Deep Dive)

#### What is Grep?

**grep** = "Global Regular Expression Print"

Originally a Unix command from 1974. It searches inside files for lines matching a pattern.

```bash
grep "error" logfile.txt       # Find lines containing "error"
grep -r "TODO" ./src           # Recursive search in directory
grep -i "warning" file.txt     # Case-insensitive
```

#### What is "Ripgrep"?

Ripgrep (`rg`) is a modern, faster alternative to grep written in Rust. It:
- Respects `.gitignore` by default
- Is significantly faster (uses parallelism and memory-mapped files)
- Has better defaults for code searching

My Grep tool uses ripgrep under the hood.

#### What is a "Regular Expression" (Regex)?

A regex is a pattern describing a set of strings. It's like a search query on steroids.

**Basic regex syntax:**

| Pattern | Meaning | Matches |
|---------|---------|---------|
| `.` | Any single character | `a.c` matches "abc", "a1c", "a c" |
| `*` | Zero or more of previous | `ab*c` matches "ac", "abc", "abbbbc" |
| `+` | One or more of previous | `ab+c` matches "abc", "abbbbc" but NOT "ac" |
| `?` | Zero or one of previous | `ab?c` matches "ac", "abc" but NOT "abbc" |
| `^` | Start of line | `^hello` matches "hello world" but not "say hello" |
| `$` | End of line | `world$` matches "hello world" but not "world news" |
| `[abc]` | Character class | `[aeiou]` matches any vowel |
| `[^abc]` | Negated class | `[^aeiou]` matches any non-vowel |
| `\d` | Digit | `\d+` matches "123", "42" |
| `\w` | Word character (letter/digit/_) | `\w+` matches "hello", "var_1" |
| `\s` | Whitespace | `\s+` matches spaces, tabs, newlines |
| `(...)` | Grouping | `(ab)+` matches "ab", "abab", "ababab" |
| `a\|b` | Alternation (or) | `cat\|dog` matches "cat" or "dog" |

**Example regex:**
```
^function\s+\w+\s*\(.*\)\s*{
```
This matches function declarations:
- `^function` - line starts with "function"
- `\s+` - one or more spaces
- `\w+` - function name (word characters)
- `\s*` - optional spaces
- `\(.*\)` - parameters in parentheses
- `\s*{` - optional spaces then opening brace

Would match: `function myFunc(a, b) {`

---

### TOOL 5: StrReplace (Deep Dive)

#### What is a "String"?

A **string** is a sequence of characters. In programming, strings represent text.

```python
"Hello, world!"  # A string literal
'Single quotes'  # Also a string
"""Multi
line"""          # Multi-line string
```

**Internally:** Strings are stored as arrays of bytes, with each character encoded. Common encodings:
- **ASCII:** 7 bits, 128 characters (English letters, digits, symbols)
- **UTF-8:** Variable length (1-4 bytes), supports all Unicode characters (emojis, Chinese, Arabic, etc.)

#### What is "String Replacement"?

Finding occurrences of one substring and replacing with another:

```python
text = "Hello world"
result = text.replace("world", "universe")
# result = "Hello universe"
```

**My tool does:**
1. Read file contents
2. Find `old_string`
3. Replace with `new_string`
4. Write file back

**The `replace_all` parameter:**
- `false` (default): Replace only first occurrence
- `true`: Replace ALL occurrences

---

### TOOL 6: Write (Deep Dive)

#### What is "File I/O"?

**I/O** = Input/Output

File I/O is reading from and writing to files. Basic operations:

```python
# Writing
f = open("file.txt", "w")  # "w" = write mode (overwrites)
f.write("Hello, world!")
f.close()

# Reading
f = open("file.txt", "r")  # "r" = read mode
content = f.read()
f.close()
```

**File modes:**
- `r` - Read (file must exist)
- `w` - Write (creates or truncates)
- `a` - Append (adds to end)
- `r+` - Read and write
- `b` - Binary mode (for non-text)

#### What is "Overwriting"?

When you open a file in write mode (`w`), existing contents are deleted. The file is "truncated" to zero length, then new content is written.

**Danger:** If you accidentally write to the wrong file, you lose its contents! That's why my instructions say to read files first.

---

### TOOL 7: EditNotebook (Deep Dive)

#### What is Jupyter?

**Jupyter** (formerly IPython Notebook) is an interactive computing environment. A Jupyter notebook (`.ipynb` file) contains:

1. **Code cells:** Executable code (Python, R, etc.)
2. **Output cells:** Results of running code (text, images, tables)
3. **Markdown cells:** Formatted text explanations

**Why useful?**
- See code and results together
- Great for exploration and documentation
- Popular in data science, machine learning, research

#### What is the Notebook Format?

Notebooks are JSON files with a specific structure:

```json
{
  "cells": [
    {
      "cell_type": "code",
      "source": ["print('hello')"],
      "outputs": [...]
    },
    {
      "cell_type": "markdown",
      "source": ["# Heading\nSome text"]
    }
  ],
  "metadata": {
    "kernelspec": {...}
  }
}
```

**Kernelspec:** Defines what programming language/environment runs the code (Python 3, R, Julia, etc.)

---

### TOOL 8: TodoWrite (Deep Dive)

#### What is "Task Management"?

Organizing work into discrete, trackable units. Each task has:
- **ID:** Unique identifier
- **Content:** Description of what to do
- **Status:** pending, in_progress, completed, cancelled

**Why I use this:**
For complex work, I need to:
1. Plan before acting
2. Track progress
3. Not forget steps
4. Show you what I've done

#### What is "State"?

**State** = stored information that persists and changes over time.

A task's state transitions:
```
pending → in_progress → completed
                    ↘ cancelled
```

**State machine:** A model where a system can be in one of several states, with defined transitions between them.

---

### TOOL 9: LS (Deep Dive)

#### The `ls` Command

`ls` = "list" - one of the oldest Unix commands (1971).

```bash
ls              # List current directory
ls -l           # Long format (permissions, size, date)
ls -a           # Show hidden files (starting with .)
ls -la          # Both
ls /path/to/dir # List specific directory
```

**Long format output explained:**
```
-rw-r--r--  1 user group  4096 Nov 29 10:00 file.txt
│├─┼─┼─┼─│  │  │    │      │        │         │
││ │ │ │ │  │  │    │      │        │         └── filename
││ │ │ │ │  │  │    │      │        └── modification time
││ │ │ │ │  │  │    │      └── size in bytes
││ │ │ │ │  │  │    └── group owner
││ │ │ │ │  │  └── user owner
││ │ │ │ │  └── number of hard links
│└─┴─┴─┴─┴── permissions (user/group/other × read/write/execute)
└── file type (- = regular file, d = directory, l = symlink)
```

#### What are "Hidden Files"?

In Unix, files starting with `.` are hidden by default:
- `.gitignore` - Git ignore rules
- `.env` - Environment variables
- `.bashrc` - Bash configuration

They're not truly hidden (no access control) - just not shown by default in `ls` or file browsers.

---

### TOOL 10: Read (Deep Dive)

#### Reading Files

When I read a file, I:
1. Open a file handle (connection to the file)
2. Read bytes from disk into memory
3. Decode bytes into text (using UTF-8 typically)
4. Return the text content

#### What is "Encoding"?

Encoding is the mapping between characters and bytes.

**Example (UTF-8):**
- `A` → `0x41` (1 byte)
- `é` → `0xC3 0xA9` (2 bytes)
- `中` → `0xE4 0xB8 0xAD` (3 bytes)
- `😀` → `0xF0 0x9F 0x98 0x80` (4 bytes)

**Encoding problems:** If you read a file with the wrong encoding, you get garbled text (mojibake): `Ã©` instead of `é`.

#### What is "Binary" vs "Text"?

**Text files:** Contain human-readable characters (source code, config files, documents)

**Binary files:** Raw bytes, not meant for human reading (images, executables, compressed files)

When I read an image file, I process it differently than text - interpreting the bytes as pixel data.

---

### TOOL 11: ReadLints (Deep Dive)

#### What is a "Linter"?

A **linter** is a static analysis tool that checks code without running it.

**Named after:** "Lint" - the fuzzy bits that come off fabric. The original `lint` program (1978) found "fluff" in C code.

**What linters catch:**
- **Syntax errors:** Invalid code structure
- **Type errors:** Wrong data types
- **Style issues:** Inconsistent formatting
- **Potential bugs:** Unused variables, unreachable code
- **Security issues:** SQL injection vulnerabilities

**Popular linters:**
- **ESLint:** JavaScript/TypeScript
- **Pylint/Flake8:** Python
- **RuboCop:** Ruby
- **rustc:** Rust (compiler includes linting)

#### What is "Static Analysis"?

**Static** = without executing the code

**Dynamic** = while running the code

Static analysis examines source code structure and types. Dynamic analysis runs the code and observes behavior (like testing).

**Tradeoffs:**
- Static: Fast, catches issues early, but can't know runtime behavior
- Dynamic: Knows actual behavior, but slower and requires test cases

#### What are "Diagnostics"?

Diagnostic messages report issues found by the linter:

```
src/App.tsx:15:3: error: 'useState' is not defined
src/utils.ts:42:10: warning: Unused variable 'x'
```

Format: `file:line:column: severity: message`

---

### TOOL 12: MCP Resources (Deep Dive)

#### What is MCP?

**MCP** = Model Context Protocol

A standardized protocol for AI models to access external resources and tools. It defines how to:
- List available resources
- Fetch resource contents
- Call external tools

**Why needed?** AI models need consistent ways to interact with various data sources (databases, APIs, files, etc.). MCP standardizes this.

#### What is a "Protocol"?

A protocol is a set of rules for communication. Like languages have grammar, protocols have syntax and semantics.

**Examples:**
- **HTTP:** How web browsers talk to servers
- **SMTP:** How email is sent
- **TCP/IP:** How internet data is transmitted
- **MCP:** How AI models access context

#### What is a "Resource"?

In MCP, a resource is any addressable data:
- Files
- Database records
- API responses
- Memory contents

Each resource has a **URI** (Uniform Resource Identifier):
```
file:///path/to/file.txt
memory://session/12345
database://users/42
```

---

## PART 2: SYSTEM INSTRUCTIONS (Deep Dive)

### What is a "System Prompt"?

The system prompt is text injected before user messages that shapes AI behavior. It's like giving instructions to an actor before they go on stage.

**Hierarchy:**
1. **Base training:** My core capabilities and knowledge
2. **System prompt:** Session-specific instructions
3. **User messages:** What you actually say

The system prompt can:
- Define my persona/role
- Set behavioral rules
- Provide context
- Enable/disable capabilities

### What is "Claude Opus 4.5"?

**Claude:** My name, the AI model created by Anthropic

**Opus:** One of my capability tiers:
- **Haiku:** Fastest, cheapest, less capable
- **Sonnet:** Balanced
- **Opus:** Most capable, slower, expensive

**4.5:** Version number indicating training/capability iteration

### What is an "Agent"?

In AI, an **agent** is a system that:
1. Perceives its environment (reads inputs)
2. Makes decisions (reasons about what to do)
3. Takes actions (calls tools, generates output)
4. Pursues goals (follows instructions to completion)

I'm a **coding agent** - specialized for software tasks, with tools to interact with code and systems.

### What is "Autonomous Operation"?

**Autonomous** = acting independently without constant supervision

Traditional chatbots: Wait for input → respond → wait for input

Autonomous agent: Receive goal → plan → act → observe → adjust → act → ... → complete

I'm told to work autonomously: don't ask for clarification, make reasonable assumptions, complete the task.

---

### Code Citation (Deep Dive)

#### What is "Syntax Highlighting"?

Coloring code based on its structure to improve readability:

```javascript
function add(a, b) {  // Keywords: blue, functions: yellow
  return a + b;       // Variables: white, operators: red
}
```

**How it works:**
1. **Lexer/Tokenizer:** Breaks code into tokens (keywords, identifiers, literals)
2. **Classifier:** Categorizes each token
3. **Renderer:** Applies colors based on category

#### What is "Markdown"?

A lightweight markup language for formatting text. Created by John Gruber in 2004.

```markdown
# Heading 1
## Heading 2

**bold** and *italic*

- bullet
- list

[link](https://example.com)

`inline code`
```

Markdown is converted to HTML for display.

---

### Version Control (Deep Dive)

#### What is "Git"?

**Git** is a distributed version control system created by Linus Torvalds in 2005 (he also created Linux).

**Version control:** Tracking changes to files over time, with the ability to:
- See history of changes
- Revert to previous versions
- Work on multiple versions simultaneously (branches)
- Collaborate with others

#### Key Git Concepts

**Repository (Repo):** A directory tracked by Git. Contains:
- Your files
- `.git/` directory with all history

**Commit:** A snapshot of your files at a point in time. Has:
- Unique SHA-1 hash (like `a1b2c3d4e5...`)
- Author and timestamp
- Commit message
- Pointer to parent commit(s)

**Branch:** A named pointer to a commit. Represents a line of development.

```
main:     A → B → C → D
                    ↘
feature:              E → F
```

**HEAD:** Pointer to your current location (usually the tip of a branch)

**Staging Area (Index):** Intermediate area where you prepare commits

```
Working Directory → Stage → Repository
     (edit)        (add)    (commit)
```

#### What is "Detached HEAD"?

Normally, HEAD points to a branch name, which points to a commit:

```
HEAD → main → commit abc123
```

**Detached HEAD** means HEAD points directly to a commit, not a branch:

```
HEAD → commit abc123
(no branch)
```

This happens when you checkout a specific commit. Any new commits you make won't be on any branch and could be lost.

#### What is "Git Push"?

Uploading local commits to a remote repository:

```
Local repo  ──push──▶  Remote repo (GitHub)
```

**Remote:** A copy of the repository on another server (GitHub, GitLab, etc.)

---

### Package Management (Deep Dive)

#### What is a "Dependency"?

External code your project relies on. Instead of writing everything yourself, you use libraries others have created.

```json
// package.json
{
  "dependencies": {
    "react": "^18.2.0",
    "next": "^14.0.0"
  }
}
```

This says: "My project needs React version 18.2.x and Next.js version 14.x.x"

#### What is `package.json`?

The manifest file for Node.js/JavaScript projects. Contains:
- **name, version:** Project identity
- **dependencies:** Production requirements
- **devDependencies:** Development-only requirements (testing, building)
- **scripts:** Command shortcuts

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "test": "jest"
  },
  "dependencies": {
    "react": "^18.2.0"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  }
}
```

#### What is `requirements.txt`?

Python's equivalent - a simple list of packages:

```
flask==2.0.1
requests>=2.25.0
numpy
```

Installed with: `pip install -r requirements.txt`

#### Version Specifiers

```
"react": "18.2.0"   # Exactly this version
"react": "^18.2.0"  # Compatible with 18.x.x (minor/patch updates OK)
"react": "~18.2.0"  # Approximately 18.2.x (only patch updates)
"react": ">=18.0.0" # At least this version
"react": "*"        # Any version (dangerous!)
```

**Semantic Versioning (SemVer):** `MAJOR.MINOR.PATCH`
- **MAJOR:** Breaking changes
- **MINOR:** New features, backward compatible
- **PATCH:** Bug fixes, backward compatible

---

### TypeScript (Deep Dive)

#### What is TypeScript?

TypeScript is JavaScript with static types. Created by Microsoft in 2012.

**JavaScript:**
```javascript
function add(a, b) {
  return a + b;
}
add("hello", 5);  // Returns "hello5" (string + number = string)
```

**TypeScript:**
```typescript
function add(a: number, b: number): number {
  return a + b;
}
add("hello", 5);  // ERROR: Argument of type 'string' is not assignable
```

#### What is `tsconfig.json`?

TypeScript compiler configuration:

```json
{
  "compilerOptions": {
    "target": "ES2020",        // Output JavaScript version
    "module": "commonjs",      // Module system
    "strict": true,            // Enable all strict checks
    "esModuleInterop": true,   // Better import compatibility
    "outDir": "./dist"         // Output directory
  },
  "include": ["src/**/*"],     // Files to compile
  "exclude": ["node_modules"]  // Files to ignore
}
```

#### What is "Compilation"?

Transforming source code from one form to another:

```
TypeScript (.ts) → Compiler → JavaScript (.js)
```

TypeScript isn't run directly - it's compiled to JavaScript, which runs in browsers/Node.js.

**Transpilation:** Compiling to a similar-level language (TS→JS). Compilation traditionally means high-level→low-level (C→machine code).

---

### CSS (Deep Dive)

#### What is CSS?

**CSS** = Cascading Style Sheets

The language for describing how HTML elements should look.

```css
.button {
  background-color: blue;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
}

.button:hover {
  background-color: darkblue;
}
```

**Cascading:** Styles can override each other based on specificity and order:
1. Browser defaults
2. External stylesheets
3. Internal `<style>` blocks
4. Inline `style=""` attributes
5. `!important` declarations

#### What are "CSS Variables"?

Custom properties that store reusable values:

```css
:root {
  --primary-color: #007bff;
  --spacing: 16px;
}

.button {
  background-color: var(--primary-color);
  padding: var(--spacing);
}
```

**Why useful?**
- Change theme by modifying one place
- Consistent values across codebase
- Can be changed with JavaScript

---

### Next.js (Deep Dive)

#### What is Next.js?

A React framework for building web applications. Adds:
- **File-based routing:** Folder structure = URL structure
- **Server-side rendering (SSR):** Generate HTML on server
- **Static site generation (SSG):** Pre-build HTML at build time
- **API routes:** Backend endpoints in same project
- **Automatic code splitting:** Only load needed JavaScript

#### What is "File-based Routing"?

Your folder structure defines your URLs:

```
app/
├── page.tsx         →  /
├── about/
│   └── page.tsx     →  /about
├── blog/
│   ├── page.tsx     →  /blog
│   └── [slug]/
│       └── page.tsx →  /blog/:slug (dynamic)
└── api/
    └── users/
        └── route.ts →  /api/users (API endpoint)
```

#### What is SSR vs CSR?

**CSR (Client-Side Rendering):**
1. Browser receives minimal HTML + JavaScript
2. JavaScript runs and builds the page
3. User sees blank page while loading

**SSR (Server-Side Rendering):**
1. Server runs JavaScript and generates HTML
2. Browser receives complete HTML
3. User sees content immediately
4. JavaScript loads and makes page interactive ("hydration")

**Benefits of SSR:**
- Faster initial page load
- Better SEO (search engines see content)
- Works without JavaScript

---

## PART 3: PROJECT STRUCTURE (Deep Dive)

### Your Project Breakdown

Based on the file tree, this is a **Next.js job board application** with:

#### `/app` Directory (Application Code)

**Pages:**
- `/app/page.tsx` - Homepage
- `/app/login/page.tsx` - Login page
- `/app/register/page.tsx` - Registration
- `/app/jobs/page.tsx` - Job listings
- `/app/jobs/[id]/page.tsx` - Individual job page (`[id]` = dynamic parameter)
- `/app/companies/[id]/page.tsx` - Company profile
- `/app/cvs/page.tsx` - CV listings
- `/app/admin/page.tsx` - Admin dashboard

**API Routes:**
- `/app/api/auth/*` - Authentication (login, logout, register)
- `/app/api/jobs/*` - CRUD for jobs
- `/app/api/companies/*` - CRUD for companies
- `/app/api/cvs/*` - CRUD for CVs
- `/app/api/admin/*` - Admin operations

**Role-specific sections:**
- `/app/job-seeker/*` - Job seeker features (manage CV)
- `/app/recruiter/*` - Recruiter features (post jobs, manage company)

#### `/lib` Directory (Shared Libraries)

Utility code used across the application:
- Database connection
- Authentication helpers
- API utilities
- Shared types

#### `/models` Directory (Data Models)

Defines the shape of data stored in the database:
- User model
- Job model
- Company model
- CV model

**What is a "Model"?**

In this context, a model defines:
1. What fields an entity has
2. What types those fields are
3. Validation rules
4. Relationships to other models

```typescript
// Example model definition
interface Job {
  id: string;
  title: string;
  company: Company;  // Relationship
  salary: number;
  description: string;
  createdAt: Date;
}
```

#### `/scripts` Directory

Utility scripts for maintenance:
- `create-admin-user.js` - Create administrator account
- `sync-vercel-db.sh` - Database synchronization
- `check-all-databases.js` - Health checks

#### `/doc` Directory

Documentation files explaining:
- Deployment procedures
- Database setup
- Troubleshooting guides

#### Configuration Files

- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vercel.json` - Vercel deployment settings
- `.env.example` - Template for environment variables
- `eslint.config.mjs` - Linter configuration
- `middleware.ts` - Next.js middleware (runs before requests)

---

## PART 4: ENVIRONMENT & OS (Deep Dive)

### What is Linux?

An open-source operating system kernel created by Linus Torvalds in 1991. Combined with GNU utilities, it forms a complete OS.

**Distributions:** Different "flavors" of Linux:
- Ubuntu, Debian, Fedora, Arch, CentOS, etc.

**Why popular for servers:**
- Free and open source
- Stable and secure
- Lightweight
- Huge software ecosystem

### What is a "Kernel"?

The core of an operating system. It manages:
- **Process scheduling:** Which program runs when
- **Memory management:** Allocating RAM to processes
- **Device drivers:** Communicating with hardware
- **System calls:** Interface between programs and hardware

```
┌────────────────────────────────┐
│        Applications            │
├────────────────────────────────┤
│        System Calls            │
├────────────────────────────────┤
│          Kernel                │
├────────────────────────────────┤
│         Hardware               │
└────────────────────────────────┘
```

**Kernel version `6.1.147`:**
- `6` - Major version
- `1` - Minor version
- `147` - Patch level

### What is Bash?

**Bash** = Bourne Again SHell

The default shell on most Linux systems. It:
- Interprets commands you type
- Has programming features (variables, loops, conditions)
- Reads configuration from `.bashrc`, `.bash_profile`

```bash
# Bash script example
#!/bin/bash
for file in *.txt; do
  echo "Processing $file"
  wc -l "$file"
done
```

### What is `/workspace`?

The root directory I'm operating in. This is likely:
- A Docker container's workspace
- A cloud development environment
- A VM's designated work area

**Absolute path:** Starting with `/` means it's from the filesystem root, not relative to any other location.

---

## Summary Reference

| Term | Quick Definition |
|------|------------------|
| **API** | Contract for software communication |
| **JSON** | Text format for structured data |
| **Shell** | Command interpreter |
| **Terminal** | Window displaying shell |
| **Filesystem** | Organized structure of files |
| **Glob** | Wildcard pattern for filenames |
| **Regex** | Pattern language for text matching |
| **String** | Sequence of characters |
| **Git** | Version control system |
| **Commit** | Snapshot of code at a point |
| **Branch** | Named line of development |
| **HEAD** | Current position in git |
| **Dependency** | External code your project needs |
| **TypeScript** | JavaScript with static types |
| **CSS** | Styling language for web |
| **Next.js** | React web framework |
| **Linter** | Code quality checker |
| **SSR** | Server-side rendering |
| **Kernel** | Core of operating system |

---

*Document generated by Claude Opus 4.5 on November 29, 2025*
