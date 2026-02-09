---
title: "StrataDB Documentation"
---


Welcome to the StrataDB documentation. StrataDB is an embedded database for AI agents, providing six data primitives with branch-based isolation, OCC transactions, and three durability modes.

## Quick Links

| I want to... | Go to |
|---|---|
| Install StrataDB and run my first example | [Getting Started](/docs/getting-started/installation) |
| Understand what branches are and how data isolation works | [Concepts: Branches](/docs/concepts/branches) |
| Organize data within branches using spaces | [Guide: Spaces](/docs/guides/spaces) |
| Learn how to use a specific primitive | [Guides](/docs/guides/index) |
| See every method at a glance | [API Quick Reference](/docs/reference/api-quick-reference) |
| Build a real-world pattern (agent state, RAG, etc.) | [Cookbook](/docs/cookbook/index) |
| Understand the architecture | [Architecture Overview](/architecture/index) |
| Contribute to StrataDB | [Contributing](https://github.com/stratadb-labs/strata-core/blob/main/CONTRIBUTING.md) |

## For Users

### [Getting Started](/docs/getting-started/installation)

Installation, feature flags, and a step-by-step tutorial that covers all six primitives.

### [Concepts](/docs/concepts/index)

Core ideas you need to understand: [branches](/docs/concepts/branches), [primitives](/docs/concepts/primitives), [value types](/docs/concepts/value-types), [transactions](/docs/concepts/transactions), and [durability](/docs/concepts/durability).

### [Guides](/docs/guides/index)

Per-primitive walkthroughs: [KV Store](/docs/guides/kv-store), [Event Log](/docs/guides/event-log), [State Cell](/docs/guides/state-cell), [JSON Store](/docs/guides/json-store), [Vector Store](/docs/guides/vector-store), [Branch Management](/docs/guides/branch-management). Plus cross-cutting guides on [spaces](/docs/guides/spaces), [observability](/docs/guides/observability), [search](/docs/guides/search), [sessions and transactions](/docs/guides/sessions-and-transactions), [branch bundles](/docs/guides/branch-bundles), [configuration](/docs/guides/database-configuration), and [error handling](/docs/guides/error-handling).

### [Cookbook](/docs/cookbook/index)

Recipes for real-world patterns: [agent state management](/docs/cookbook/agent-state-management), [multi-agent coordination](/docs/cookbook/multi-agent-coordination), [RAG with vectors](/docs/cookbook/rag-with-vectors), [deterministic replay](/docs/cookbook/deterministic-replay), and [A/B testing with branches](/docs/cookbook/ab-testing-with-branches).

### [Reference](/docs/reference/index)

Complete specifications: [API quick reference](/docs/reference/api-quick-reference), [value types](/docs/reference/value-type-reference), [errors](/docs/reference/error-reference), [commands](/docs/reference/command-reference), and [configuration](/docs/reference/configuration-reference).

### [Troubleshooting](troubleshooting) and [FAQ](faq)

Common issues, error messages, and frequently asked questions.

## For Contributors

### [Contributing](https://github.com/stratadb-labs/strata-core/blob/main/CONTRIBUTING.md)

Development setup, workspace structure, running tests, code style, and pull request process.

### [Architecture](/architecture/index)

How StrataDB works internally: [crate structure](/architecture/crate-structure), [storage engine](/architecture/storage-engine), [durability and recovery](/architecture/durability-and-recovery), and [concurrency model](/architecture/concurrency-model).

### [Changelog](/changelog)

Release history and notable changes.
