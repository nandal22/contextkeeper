# ContextKeeper

ContextKeeper is a developer tool that persists and generates AI coding context based on features, ensuring you never lose your train of thought across sessions or different AI tools.

## Features
- **Feature-Based Persistence:** Context is tracked per-feature and stored locally alongside your code.
- **Auto-Extraction (WIP):** Automatically parses the context from Cline, Claude Code, and Antigravity logs.
- **Cross-Platform HTTP API:** Spin up a local server to read/write context programmatically.
- **VS Code Extension:** Built-in extension provides real-time context management straight from the IDE.

## Installation
\`\`\`bash
npm install -g contextkeeper
\`\`\`

## Quickstart

Initialize ContextKeeper in your repository:
\`\`\`bash
ck init
\`\`\`

Create a new feature to start tracking context against:
\`\`\`bash
ck feature create "login-page-refactor"
\`\`\`

Save your progress and state before stepping away:
\`\`\`bash
ck save "Just finished the layout structure" --state "Need to connect API endpoints next"
\`\`\`

Resume where you left off. Output is copied straight to your clipboard for easy pasting into AI tools:
\`\`\`bash
ck resume
\`\`\`

View your context history:
\`\`\`bash
ck log
\`\`\`

View recent changes since your last save:
\`\`\`bash
ck diff
\`\`\`

Start the local server for cross-platform context access:
\`\`\`bash
ck serve --port 4040
\`\`\`

## VS Code Extension
To install the VS Code extension, open the extension panel and load the generated `.vsix` from `contextkeeper/vscode-extension`.

## Collaboration
Because ContextKeeper stores history in a local `.contextkeeper/` JSON folder, sharing your context with another developer is as easy as pushing your `.contextkeeper/` folder to Git.
