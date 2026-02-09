---
title: "Node.js SDK Reference"
section: "reference"
---

# Node.js SDK Reference

The StrataDB Node.js SDK provides native bindings via NAPI-RS with full TypeScript support.

## Installation

```bash
npm install stratadb
# or
yarn add stratadb
```

## Quick Start

```typescript
import { Strata } from 'stratadb';

// Open a database
const db = Strata.open('/path/to/data');

// Store and retrieve data
db.kvPut('greeting', 'Hello, World!');
console.log(db.kvGet('greeting'));  // "Hello, World!"

// Use transactions
db.begin();
try {
  db.kvPut('a', 1);
  db.kvPut('b', 2);
  db.commit();
} catch (e) {
  db.rollback();
  throw e;
}

// Vector search
db.vectorCreateCollection('embeddings', 384);
db.vectorUpsert('embeddings', 'doc-1', new Array(384).fill(0.1));
const results = db.vectorSearch('embeddings', new Array(384).fill(0.1), 5);
```

---

## Opening a Database

### Strata.open(path)

Open a database at the given path.

```typescript
const db = Strata.open('/path/to/data');
```

**Returns:** `Strata` instance

### Strata.cache()

Create an ephemeral in-memory database.

```typescript
const db = Strata.cache();
```

---

## KV Store

| Method | Returns | Description |
|--------|---------|-------------|
| `kvPut(key, value)` | `number` | Store value, returns version |
| `kvGet(key)` | `JsonValue \| null` | Get value |
| `kvDelete(key)` | `boolean` | Delete key |
| `kvList(prefix?)` | `string[]` | List keys |
| `kvHistory(key)` | `VersionedValue[] \| null` | Version history |
| `kvGetVersioned(key)` | `VersionedValue \| null` | Get with version info |
| `kvListPaginated(prefix?, limit?, cursor?)` | `KvListResult` | Paginated list |

**Example:**

```typescript
// Store complex values
db.kvPut('user:123', { name: 'Alice', age: 30 });

// Get with version info
const result = db.kvGetVersioned('user:123');
if (result) {
  console.log(`v${result.version}: ${JSON.stringify(result.value)}`);
}

// Paginate large key sets
const page = db.kvListPaginated('user:', 100);
for (const key of page.keys) {
  console.log(key);
}
```

---

## State Cell

| Method | Returns | Description |
|--------|---------|-------------|
| `stateSet(cell, value)` | `number` | Set value |
| `stateGet(cell)` | `JsonValue \| null` | Get value |
| `stateInit(cell, value)` | `number` | Initialize if not exists |
| `stateCas(cell, value, expected?)` | `number` | Compare-and-swap |
| `stateDelete(cell)` | `boolean` | Delete cell |
| `stateList(prefix?)` | `string[]` | List cells |
| `stateHistory(cell)` | `VersionedValue[] \| null` | Version history |

**Example:**

```typescript
// Atomic counter
db.stateInit('counter', 0);
const current = db.stateGet('counter') as number;
try {
  db.stateCas('counter', current + 1, current);
} catch (e) {
  console.log('Concurrent modification!');
}
```

---

## Event Log

| Method | Returns | Description |
|--------|---------|-------------|
| `eventAppend(eventType, payload)` | `number` | Append, returns sequence |
| `eventGet(sequence)` | `VersionedValue \| null` | Get by sequence |
| `eventList(eventType, limit?, after?)` | `VersionedValue[]` | List events |
| `eventLen()` | `number` | Total count |

**Example:**

```typescript
// Append events
const seq = db.eventAppend('user_action', { action: 'click', target: 'button' });

// Read events by type
const events = db.eventList('user_action', 10);
for (const event of events) {
  console.log(`[${event.timestamp}] ${JSON.stringify(event.value)}`);
}
```

---

## JSON Store

| Method | Returns | Description |
|--------|---------|-------------|
| `jsonSet(key, path, value)` | `number` | Set at JSONPath |
| `jsonGet(key, path)` | `JsonValue \| null` | Get at JSONPath |
| `jsonDelete(key, path)` | `number` | Delete at JSONPath |
| `jsonList(prefix?, limit?)` | `string[]` | List documents |
| `jsonHistory(key)` | `VersionedValue[] \| null` | Version history |

**Example:**

```typescript
// Store document
db.jsonSet('config', '$', { debug: true, timeout: 30 });

// Update nested path
db.jsonSet('config', '$.timeout', 60);

// Read specific path
const timeout = db.jsonGet('config', '$.timeout');
```

---

## Vector Store

| Method | Returns | Description |
|--------|---------|-------------|
| `vectorCreateCollection(name, dim, metric?)` | `number` | Create collection |
| `vectorDeleteCollection(name)` | `boolean` | Delete collection |
| `vectorListCollections()` | `CollectionInfo[]` | List collections |
| `vectorUpsert(coll, key, vector, metadata?)` | `number` | Insert/update |
| `vectorGet(coll, key)` | `object \| null` | Get vector |
| `vectorDelete(coll, key)` | `boolean` | Delete vector |
| `vectorSearch(coll, query, k, metric?, filters?)` | `VectorMatch[]` | Search |
| `vectorBatchUpsert(coll, entries)` | `number[]` | Batch insert |

**Example:**

```typescript
// Create and populate
db.vectorCreateCollection('docs', 384, 'cosine');
db.vectorUpsert('docs', 'doc-1', embedding, { title: 'Hello' });

// Search with filters
const results = db.vectorSearch(
  'docs',
  queryEmbedding,
  10,
  undefined,
  [{ field: 'category', op: 'eq', value: 'science' }]
);
```

---

## Branches

| Method | Returns | Description |
|--------|---------|-------------|
| `branchCreate(name)` | `void` | Create branch |
| `branchGet(name)` | `BranchInfo \| null` | Get branch info |
| `branchList()` | `string[]` | List branches |
| `branchExists(name)` | `boolean` | Check existence |
| `branchDelete(name)` | `void` | Delete branch |
| `branchFork(source, dest)` | `ForkResult` | Fork with data |
| `branchDiff(a, b)` | `DiffResult` | Compare branches |
| `branchMerge(source, target, strategy?)` | `MergeResult` | Merge |
| `branchUse(name)` | `void` | Switch branch |
| `currentBranch()` | `string` | Get current |
| `branchExport(name, path)` | `ExportResult` | Export to bundle |
| `branchImport(path)` | `ImportResult` | Import from bundle |

---

## Spaces

| Method | Returns | Description |
|--------|---------|-------------|
| `spaceCreate(name)` | `void` | Create space |
| `spaceList()` | `string[]` | List spaces |
| `spaceExists(name)` | `boolean` | Check existence |
| `spaceDelete(name)` | `void` | Delete empty space |
| `spaceUse(name)` | `void` | Switch space |
| `currentSpace()` | `string` | Get current |

---

## Transactions

| Method | Returns | Description |
|--------|---------|-------------|
| `begin(readOnly?)` | `void` | Start transaction |
| `commit()` | `number` | Commit, returns version |
| `rollback()` | `void` | Rollback transaction |
| `inTransaction()` | `boolean` | Check if active |
| `transactionInfo()` | `TransactionInfo \| null` | Get transaction info |

**Example:**

```typescript
db.begin();
try {
  db.kvPut('a', 1);
  db.kvPut('b', 2);
  const version = db.commit();
  console.log(`Committed at version ${version}`);
} catch (e) {
  db.rollback();
  throw e;
}
```

---

## Search

### search(query, k?, primitives?)

Search across multiple primitives.

```typescript
const results = db.search('hello world', 20, ['kv', 'json']);
for (const hit of results) {
  console.log(`${hit.primitive}/${hit.entity}: ${hit.snippet}`);
}
```

---

## Database Operations

| Method | Returns | Description |
|--------|---------|-------------|
| `ping()` | `string` | Check connectivity, returns version |
| `info()` | `DatabaseInfo` | Get database statistics |
| `flush()` | `void` | Flush pending writes |
| `compact()` | `void` | Trigger compaction |

---

## TypeScript Types

```typescript
interface VersionedValue {
  value: JsonValue;
  version: number;
  timestamp: number;
}

interface KvListResult {
  keys: string[];
}

interface TransactionInfo {
  id: string;
  status: string;
  started_at: number;
}

interface MetadataFilter {
  field: string;
  op: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: JsonValue;
}

interface SearchHit {
  entity: string;
  primitive: string;
  score: number;
  rank: number;
  snippet: string;
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
```
