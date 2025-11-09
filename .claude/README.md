# Claude Code Configuration

**Directory:** `.claude/`
**Purpose:** Claude Code agent configuration and MCP servers

---

## 📁 Structure

```
.claude/
├── AGENT_RULES.md          # 🔴 Critical rules for AI agents (tracked in git)
├── settings.local.json     # Personal settings (git-ignored)
├── .mcp.json               # MCP servers configuration (tracked in git)
└── README.md               # This file
```

---

## 🤖 AGENT_RULES.md

**Critical rules for Claude Code agents:**
- NEVER SAY "DONE" WITHOUT VERIFICATION
- ACTUAL CODE, NOT HIGH-LEVEL BULLSHIT
- Честная техническая оценка (не соглашайся с плохими решениями)
- Always start with official documentation
- English-only UI and code (internal docs/chat in Russian OK, keep all technical specs/parameters in original language)

**Auto-imported in:** [../CLAUDE.md](../CLAUDE.md) via `@.claude/AGENT_RULES.md`

---

## 🔧 MCP Servers Configuration

**File:** `.mcp.json`

### Currently Configured MCP Servers:

| MCP Server | Purpose | Package | Status |
|------------|---------|---------|--------|
| **playwright** | Browser automation, E2E tests | `@playwright/mcp` (Microsoft official) | ⚠️ Needs approval |
| **filesystem** | Secure file operations | `@modelcontextprotocol/server-filesystem` | ⚠️ Needs approval |
| **git** | Git repository operations | `@modelcontextprotocol/server-git` | ⚠️ Needs approval |
| **memory** | Persistent knowledge graph | `@modelcontextprotocol/server-memory` | ⚠️ Needs approval |
| **sequential-thinking** | Complex problem-solving | `@modelcontextprotocol/server-sequential-thinking` | ⚠️ Needs approval |

### Installation / Approval:

```bash
# Check current MCP status
/mcp

# Approve MCP servers when Claude Code prompts
# MCP servers run via npx (no manual installation needed)
```

**How it works:**
- `.mcp.json` is tracked in git → shared with team
- First use requires approval for security
- Servers run via `npx` automatically

---

## ⚙️ Settings Files

### settings.local.json (git-ignored)

**Personal preferences:**
```json
{
  "outputStyle": "Explanatory",
  "model": "claude-sonnet-4-5-20250929"
}
```

**NOT tracked in git** - safe for experiments and personal settings.

### Settings Precedence:

1. Enterprise managed policies (highest)
2. Command-line arguments
3. `.claude/settings.local.json` (this file)
4. `.claude/settings.json` (team shared)
5. `~/.claude/settings.json` (user global)

---

## 📖 Documentation

**Official Claude Code docs:** https://code.claude.com/docs/en/

**Key pages:**
- [Memory & Imports](https://code.claude.com/docs/en/memory.md)
- [Settings](https://code.claude.com/docs/en/settings.md)
- [MCP Configuration](https://code.claude.com/docs/en/mcp.md)

---

## 🚀 Quick Start for New Agents

1. Read [AGENT_RULES.md](AGENT_RULES.md) first (auto-imported via CLAUDE.md)
2. Check `/mcp` for MCP server status
3. Approve MCP servers when prompted
4. Start coding!

**Production app:** Breaking anything = unacceptable. Always run tests.
