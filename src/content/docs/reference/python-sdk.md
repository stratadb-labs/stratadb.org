---
title: "Python SDK Reference"
section: "reference"
---

# Python SDK Reference

The StrataDB Python SDK provides native Python bindings via PyO3.

## Installation

```bash
pip install stratadb
```

## Quick Start

```python
from stratadb import Strata

# Open a database
db = Strata.open("/path/to/data")

# Store and retrieve data
db.kv_put("greeting", "Hello, World!")
print(db.kv_get("greeting"))  # "Hello, World!"

# Use transactions
with db.transaction():
    db.kv_put("a", 1)
    db.kv_put("b", 2)
# Auto-commits on success, auto-rollbacks on exception

# Use vector search with NumPy
import numpy as np
embedding = np.random.rand(384).astype(np.float32)
db.vector_create_collection("docs", 384)
db.vector_upsert("docs", "doc-1", embedding)
results = db.vector_search("docs", embedding, k=5)
```

---

## Opening a Database

### Strata.open(path)

Open a database at the given path.

```python
db = Strata.open("/path/to/data")
```

**Returns:** `Strata` instance

### Strata.cache()

Create an ephemeral in-memory database.

```python
db = Strata.cache()
```

---

## KV Store

| Method | Returns | Description |
|--------|---------|-------------|
| `kv_put(key, value)` | `int` | Store value, returns version |
| `kv_get(key)` | `any \| None` | Get value |
| `kv_delete(key)` | `bool` | Delete key |
| `kv_list(prefix=None)` | `list[str]` | List keys |
| `kv_history(key)` | `list[dict] \| None` | Version history |
| `kv_get_versioned(key)` | `dict \| None` | Get with version info |
| `kv_list_paginated(prefix, limit, cursor)` | `dict` | Paginated list |

**Example:**

```python
# Store complex values
db.kv_put("user:123", {"name": "Alice", "age": 30})

# Get with version info
result = db.kv_get_versioned("user:123")
print(f"v{result['version']}: {result['value']}")

# Paginate large key sets
result = db.kv_list_paginated(prefix="user:", limit=100)
for key in result["keys"]:
    print(key)
```

---

## State Cell

| Method | Returns | Description |
|--------|---------|-------------|
| `state_set(cell, value)` | `int` | Set value |
| `state_get(cell)` | `any \| None` | Get value |
| `state_init(cell, value)` | `int` | Initialize if not exists |
| `state_cas(cell, value, expected=None)` | `int` | Compare-and-swap |
| `state_delete(cell)` | `bool` | Delete cell |
| `state_list(prefix=None)` | `list[str]` | List cells |
| `state_history(cell)` | `list[dict] \| None` | Version history |

**Example:**

```python
# Atomic counter
db.state_init("counter", 0)
current = db.state_get("counter")
try:
    db.state_cas("counter", current + 1, expected=current)
except RuntimeError:
    print("Concurrent modification!")
```

---

## Event Log

| Method | Returns | Description |
|--------|---------|-------------|
| `event_append(event_type, payload)` | `int` | Append, returns sequence |
| `event_get(sequence)` | `dict \| None` | Get by sequence |
| `event_list(event_type, limit=None, after=None)` | `list[dict]` | List events |
| `event_len()` | `int` | Total count |

**Example:**

```python
# Append events
seq = db.event_append("user_action", {"action": "click", "target": "button"})

# Read events by type
for event in db.event_list("user_action", limit=10):
    print(f"[{event['timestamp']}] {event['value']}")
```

---

## JSON Store

| Method | Returns | Description |
|--------|---------|-------------|
| `json_set(key, path, value)` | `int` | Set at JSONPath |
| `json_get(key, path)` | `any \| None` | Get at JSONPath |
| `json_delete(key, path)` | `int` | Delete at JSONPath |
| `json_list(prefix=None, limit=None)` | `list[str]` | List documents |
| `json_history(key)` | `list[dict] \| None` | Version history |

**Example:**

```python
# Store document
db.json_set("config", "$", {"debug": True, "timeout": 30})

# Update nested path
db.json_set("config", "$.timeout", 60)

# Read specific path
timeout = db.json_get("config", "$.timeout")
```

---

## Vector Store

| Method | Returns | Description |
|--------|---------|-------------|
| `vector_create_collection(name, dim, metric=None)` | `int` | Create collection |
| `vector_delete_collection(name)` | `bool` | Delete collection |
| `vector_list_collections()` | `list[dict]` | List collections |
| `vector_upsert(coll, key, vector, metadata=None)` | `int` | Insert/update |
| `vector_get(coll, key)` | `dict \| None` | Get vector |
| `vector_delete(coll, key)` | `bool` | Delete vector |
| `vector_search(coll, query, k, metric=None, filters=None)` | `list[dict]` | Search |
| `vector_batch_upsert(coll, entries)` | `list[int]` | Batch insert |

**NumPy Support:**

```python
import numpy as np

# Use NumPy arrays directly
embedding = np.random.rand(384).astype(np.float32)
db.vector_upsert("docs", "doc-1", embedding, {"title": "Hello"})

# Search with filters
results = db.vector_search(
    "docs",
    query_embedding,
    k=10,
    filters=[{"field": "category", "op": "eq", "value": "science"}]
)
```

---

## Branches

| Method | Returns | Description |
|--------|---------|-------------|
| `branch_create(name)` | — | Create branch |
| `branch_get(name)` | `dict \| None` | Get branch info |
| `branch_list()` | `list[str]` | List branches |
| `branch_exists(name)` | `bool` | Check existence |
| `branch_delete(name)` | — | Delete branch |
| `branch_fork(source, dest)` | `dict` | Fork with data |
| `branch_diff(a, b)` | `dict` | Compare branches |
| `branch_merge(source, target, strategy=None)` | `dict` | Merge |
| `branch_use(name)` | — | Switch branch |
| `current_branch()` | `str` | Get current |
| `branch_export(name, path)` | `dict` | Export to bundle |
| `branch_import(path)` | `dict` | Import from bundle |

---

## Spaces

| Method | Returns | Description |
|--------|---------|-------------|
| `space_create(name)` | — | Create space |
| `space_list()` | `list[str]` | List spaces |
| `space_exists(name)` | `bool` | Check existence |
| `space_delete(name)` | — | Delete empty space |
| `space_use(name)` | — | Switch space |
| `current_space()` | `str` | Get current |

---

## Transactions

### Context Manager (Recommended)

```python
with db.transaction():
    db.kv_put("a", 1)
    db.kv_put("b", 2)
# Auto-commits on success, auto-rollbacks on exception
```

### Manual Control

| Method | Description |
|--------|-------------|
| `begin()` | Start transaction |
| `commit()` | Commit transaction |
| `rollback()` | Rollback transaction |
| `in_transaction()` | Check if active |

---

## Search

### search(query, k=10, primitives=None)

Search across multiple primitives.

```python
results = db.search("hello world", k=20, primitives=["kv", "json"])
for hit in results:
    print(f"{hit['primitive']}/{hit['entity']}: {hit['snippet']}")
```

---

## Database Operations

| Method | Description |
|--------|-------------|
| `ping()` | Check connectivity, returns version |
| `info()` | Get database statistics |
| `flush()` | Flush pending writes |
| `compact()` | Trigger compaction |

---

## Value Types

The SDK automatically converts between Python and StrataDB types:

| Python | StrataDB |
|--------|----------|
| `str` | String |
| `int` | Integer |
| `float` | Float |
| `bool` | Bool |
| `None` | Null |
| `list` | Array |
| `dict` | Object |
| `bytes` | Bytes |
