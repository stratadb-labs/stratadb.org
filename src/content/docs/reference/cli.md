---
title: "CLI Reference"
section: "reference"
---

# CLI Reference

The StrataDB CLI (`strata`) provides an interactive command-line interface for interacting with StrataDB databases.

## Installation

```bash
# From crates.io
cargo install strata-cli

# From source
git clone https://github.com/stratadb-labs/strata-core
cd strata-core
cargo install --path crates/cli
```

## Quick Start

```bash
# Open a database
strata /path/to/data

# Or use an in-memory database
strata --memory

# Run a single command
strata /path/to/data -c "kv put greeting hello"
```

## Command Line Options

| Option | Description |
|--------|-------------|
| `<PATH>` | Path to the database directory |
| `--memory` | Use ephemeral in-memory database |
| `-c, --command <CMD>` | Execute command and exit |
| `--json` | Output in JSON format |
| `--raw` | Output raw values (no formatting) |
| `-h, --help` | Show help |
| `-V, --version` | Show version |

---

## Command Reference

### Database Commands

| Command | Description |
|---------|-------------|
| `ping` | Check database connectivity |
| `info` | Get database statistics |
| `flush` | Flush pending writes to disk |
| `compact` | Trigger database compaction |

### KV Store Commands

| Command | Description |
|---------|-------------|
| `kv put <key> <value>` | Store a value (supports multiple pairs) |
| `kv get <key>` | Retrieve a value (supports multiple keys) |
| `kv del <key>` | Delete a key (supports multiple keys) |
| `kv list [--prefix <p>]` | List keys with optional prefix |
| `kv history <key>` | Get version history |

**Options:**
- `--with-version`, `-v` — Include version and timestamp with get
- `--prefix`, `-p` — Filter by prefix
- `--limit`, `-n` — Maximum results
- `--all`, `-a` — Fetch all (auto-pagination)

### State Cell Commands

| Command | Description |
|---------|-------------|
| `state set <cell> <value>` | Set a state cell |
| `state get <cell>` | Get a state cell |
| `state init <cell> <value>` | Initialize if not exists |
| `state cas <cell> <value> [--expect <v>]` | Compare-and-swap |
| `state del <cell>` | Delete a state cell |
| `state list [--prefix <p>]` | List state cells |
| `state history <cell>` | Get version history |

### Event Log Commands

| Command | Description |
|---------|-------------|
| `event append <type> <payload>` | Append an event |
| `event get <sequence>` | Get event by sequence |
| `event list <type>` | List events by type |
| `event len` | Get total event count |

**Options:**
- `--file`, `-f` — Read payload from file (use `-` for stdin)
- `--limit`, `-n` — Maximum events
- `--after`, `-a` — Return events after sequence

### JSON Store Commands

| Command | Description |
|---------|-------------|
| `json set <key> <path> <value>` | Set value at JSONPath |
| `json get <key> <path>` | Get value at JSONPath |
| `json del <key> <path>` | Delete at JSONPath |
| `json list [--prefix <p>]` | List document keys |
| `json history <key>` | Get version history |

### Vector Store Commands

| Command | Description |
|---------|-------------|
| `vector create <coll> <dim>` | Create collection |
| `vector drop <coll>` | Delete collection |
| `vector list` | List collections |
| `vector stats <coll>` | Collection statistics |
| `vector upsert <coll> <key> <vector>` | Insert/update vector |
| `vector get <coll> <key>` | Get vector by key |
| `vector del <coll> <key>` | Delete vector |
| `vector search <coll> <query> <k>` | Search similar vectors |

**Options:**
- `--metric`, `-m` — Distance metric (cosine, euclidean, dot_product)
- `--filter`, `-f` — Metadata filter (JSON array)
- `--metadata` — Attach metadata to vector

### Branch Commands

| Command | Description |
|---------|-------------|
| `branch create <name>` | Create new branch |
| `branch info <name>` | Get branch metadata |
| `branch list` | List all branches |
| `branch exists <name>` | Check if branch exists |
| `branch del <name>` | Delete branch |
| `branch fork <src> <dst>` | Fork with all data |
| `branch diff <a> <b>` | Compare two branches |
| `branch merge <src> <tgt>` | Merge branches |
| `branch use <name>` | Switch to branch |
| `branch export <name> <path>` | Export to bundle file |
| `branch import <path>` | Import from bundle file |

### Space Commands

| Command | Description |
|---------|-------------|
| `space create <name>` | Create new space |
| `space list` | List all spaces |
| `space exists <name>` | Check if space exists |
| `space del <name>` | Delete empty space |
| `space del-force <name>` | Delete space and all data |
| `space use <name>` | Switch to space |

### Transaction Commands

| Command | Description |
|---------|-------------|
| `txn begin` | Start transaction |
| `txn commit` | Commit transaction |
| `txn rollback` | Rollback transaction |
| `txn info` | Get transaction info |
| `txn active` | Check if transaction active |

### Search Command

```bash
search <query> [--k <n>] [--primitives <list>]
```

Search across multiple primitives (kv, json, events, state).

---

## Output Formats

### Human (default)

Redis-style output optimized for readability:

```
> kv put name "Alice"
(integer) 1

> kv get name
"Alice"

> kv list
1) "name"
```

### JSON (`--json`)

Machine-readable JSON output:

```bash
strata /data --json -c "kv get name"
# {"value": "Alice"}
```

### Raw (`--raw`)

Unformatted values only:

```bash
strata /data --raw -c "kv get name"
# Alice
```

---

## REPL Commands

These commands are only available in interactive mode:

| Command | Description |
|---------|-------------|
| `help [command]` | Show help for a command |
| `clear` | Clear the screen |
| `quit` / `exit` | Exit the REPL |

Press `TAB` to autocomplete command names, subcommands, flags, and branch/space names.
