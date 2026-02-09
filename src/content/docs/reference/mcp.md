---
title: "MCP Server Reference"
section: "reference"
---

# MCP Server Reference

The StrataDB MCP (Model Context Protocol) server exposes StrataDB as a tool provider for AI assistants like Claude.

## Installation

```bash
# From crates.io
cargo install strata-mcp

# From source
git clone https://github.com/stratadb-labs/strata-core
cd strata-core
cargo install --path crates/mcp
```

## Configuration

### Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "stratadb": {
      "command": "strata-mcp",
      "args": ["/path/to/data"]
    }
  }
}
```

### In-Memory Mode

For ephemeral databases:

```json
{
  "mcpServers": {
    "stratadb": {
      "command": "strata-mcp",
      "args": ["--memory"]
    }
  }
}
```

## Command Line Options

| Option | Description |
|--------|-------------|
| `<PATH>` | Path to the database directory |
| `--memory` | Use ephemeral in-memory database |
| `-h, --help` | Show help |
| `-V, --version` | Show version |

---

## Tools

The MCP server exposes 50+ tools to AI assistants, organized by category.

### Database Tools

| Tool | Description |
|------|-------------|
| `strata_ping` | Check connectivity, returns version |
| `strata_info` | Get database statistics |
| `strata_flush` | Flush pending writes to disk |
| `strata_compact` | Trigger database compaction |

### KV Store Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `strata_kv_put` | `key`, `value` | Store a key-value pair |
| `strata_kv_get` | `key` | Get value by key |
| `strata_kv_delete` | `key` | Delete a key |
| `strata_kv_list` | `prefix?`, `limit?`, `cursor?` | List keys |
| `strata_kv_history` | `key` | Get version history |

### State Cell Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `strata_state_set` | `cell`, `value` | Set state cell |
| `strata_state_get` | `cell` | Get state cell |
| `strata_state_init` | `cell`, `value` | Initialize if not exists |
| `strata_state_cas` | `cell`, `value`, `expected_version?` | Compare-and-swap |
| `strata_state_delete` | `cell` | Delete state cell |
| `strata_state_list` | `prefix?` | List state cells |

### Event Log Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `strata_event_append` | `event_type`, `payload` | Append event |
| `strata_event_get` | `sequence` | Get by sequence |
| `strata_event_list` | `event_type`, `limit?`, `after?` | List events |
| `strata_event_len` | — | Get event count |

### JSON Store Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `strata_json_set` | `key`, `path`, `value` | Set at JSONPath |
| `strata_json_get` | `key`, `path` | Get at JSONPath |
| `strata_json_delete` | `key`, `path` | Delete at JSONPath |
| `strata_json_list` | `prefix?`, `limit`, `cursor?` | List documents |

### Vector Store Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `strata_vector_create_collection` | `collection`, `dimension`, `metric?` | Create collection |
| `strata_vector_delete_collection` | `collection` | Delete collection |
| `strata_vector_list_collections` | — | List collections |
| `strata_vector_upsert` | `collection`, `key`, `vector`, `metadata?` | Insert/update |
| `strata_vector_get` | `collection`, `key` | Get vector |
| `strata_vector_delete` | `collection`, `key` | Delete vector |
| `strata_vector_search` | `collection`, `query`, `k`, `filter?` | Search |
| `strata_vector_batch_upsert` | `collection`, `entries` | Batch insert |

### Branch Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `strata_branch_create` | `name` | Create branch |
| `strata_branch_get` | `name` | Get branch info |
| `strata_branch_list` | — | List branches |
| `strata_branch_exists` | `name` | Check existence |
| `strata_branch_delete` | `name` | Delete branch |
| `strata_branch_fork` | `source`, `destination` | Fork branch |
| `strata_branch_diff` | `branch_a`, `branch_b` | Compare branches |
| `strata_branch_merge` | `source`, `target`, `strategy?` | Merge branches |
| `strata_branch_use` | `name` | Switch branch |
| `strata_current_branch` | — | Get current branch |
| `strata_branch_export` | `branch`, `path` | Export to bundle |
| `strata_branch_import` | `path` | Import from bundle |
| `strata_branch_validate` | `path` | Validate bundle |

### Space Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `strata_space_create` | `name` | Create space |
| `strata_space_list` | — | List spaces |
| `strata_space_exists` | `name` | Check existence |
| `strata_space_delete` | `name` | Delete empty space |
| `strata_space_use` | `name` | Switch space |
| `strata_current_space` | — | Get current space |

### Transaction Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `strata_txn_begin` | `read_only?` | Begin transaction |
| `strata_txn_commit` | — | Commit transaction |
| `strata_txn_rollback` | — | Rollback transaction |
| `strata_txn_info` | — | Get transaction info |
| `strata_txn_is_active` | — | Check if active |

### Search Tool

| Tool | Parameters | Description |
|------|------------|-------------|
| `strata_search` | `query`, `k?`, `primitives?` | Cross-primitive search |

---

## Usage with Claude

Once configured, Claude can use StrataDB tools naturally:

**User:** "Store my name as Alice"

**Claude:** I'll store that for you.
*[Calls strata_kv_put with key="name", value="Alice"]*

Done! I've stored your name as "Alice" in the database.

**User:** "Create a branch called 'experiment' and switch to it"

**Claude:** I'll create that branch and switch to it.
*[Calls strata_branch_create with name="experiment"]*
*[Calls strata_branch_use with name="experiment"]*

Done! Created the "experiment" branch and switched to it.

---

## Error Handling

Tool errors are returned in the standard MCP error format:

```json
{
  "error": {
    "code": -32000,
    "message": "Branch not found: nonexistent"
  }
}
```

Common error codes:
- `-32000`: Application error (invalid operation, not found, etc.)
- `-32602`: Invalid parameters
- `-32603`: Internal error
