import { useState, useRef, useEffect } from 'react';

interface ReplState {
  db: Record<string, any>;
  branches: Record<string, Record<string, any>>;
  currentBranch: string;
  events: Record<string, any[]>;
  state: Record<string, { value: any; version: number }>;
  vectors: Record<string, { dimension: number; vectors: Record<string, any> }>;
}

const initialState: ReplState = {
  db: {},
  branches: { main: {} },
  currentBranch: 'main',
  events: {},
  state: {},
  vectors: {},
};

// Simple command interpreter
function executeCommand(input: string, state: ReplState): { output: string; newState: ReplState } {
  const trimmed = input.trim();

  // Skip empty or comment lines
  if (!trimmed || trimmed.startsWith('#')) {
    return { output: '', newState: state };
  }

  try {
    // KV operations
    if (trimmed.startsWith('db.kv_put(')) {
      const match = trimmed.match(/db\.kv_put\(["']([^"']+)["'],\s*(.+)\)$/);
      if (match) {
        const key = match[1];
        const valueStr = match[2];
        let value;
        try {
          value = JSON.parse(valueStr.replace(/'/g, '"'));
        } catch {
          value = valueStr.replace(/^["']|["']$/g, '');
        }
        const newDb = { ...state.branches[state.currentBranch], [key]: value };
        const newBranches = { ...state.branches, [state.currentBranch]: newDb };
        return {
          output: String(Object.keys(newDb).length),
          newState: { ...state, branches: newBranches }
        };
      }
    }

    if (trimmed.startsWith('db.kv_get(')) {
      const match = trimmed.match(/db\.kv_get\(["']([^"']+)["']\)/);
      if (match) {
        const key = match[1];
        const value = state.branches[state.currentBranch][key];
        if (value === undefined) {
          return { output: 'None', newState: state };
        }
        return { output: JSON.stringify(value, null, 2).replace(/"/g, "'"), newState: state };
      }
    }

    if (trimmed.startsWith('db.kv_list(')) {
      const keys = Object.keys(state.branches[state.currentBranch]);
      return { output: JSON.stringify(keys).replace(/"/g, "'"), newState: state };
    }

    if (trimmed.startsWith('db.kv_delete(')) {
      const match = trimmed.match(/db\.kv_delete\(["']([^"']+)["']\)/);
      if (match) {
        const key = match[1];
        const existed = key in state.branches[state.currentBranch];
        const { [key]: _, ...newDb } = state.branches[state.currentBranch];
        const newBranches = { ...state.branches, [state.currentBranch]: newDb };
        return { output: String(existed), newState: { ...state, branches: newBranches } };
      }
    }

    // Branch operations
    if (trimmed.startsWith('db.branch_create(')) {
      const match = trimmed.match(/db\.branch_create\(["']([^"']+)["']\)/);
      if (match) {
        const name = match[1];
        if (state.branches[name]) {
          return { output: "RuntimeError: Branch already exists", newState: state };
        }
        const newBranches = { ...state.branches, [name]: {} };
        return { output: 'None', newState: { ...state, branches: newBranches } };
      }
    }

    if (trimmed.startsWith('db.branch_use(')) {
      const match = trimmed.match(/db\.branch_use\(["']([^"']+)["']\)/);
      if (match) {
        const name = match[1];
        if (!state.branches[name]) {
          return { output: `RuntimeError: Branch not found: ${name}`, newState: state };
        }
        return { output: 'None', newState: { ...state, currentBranch: name } };
      }
    }

    if (trimmed.startsWith('db.branch_list(')) {
      const branches = Object.keys(state.branches);
      return { output: JSON.stringify(branches).replace(/"/g, "'"), newState: state };
    }

    if (trimmed.startsWith('db.branch_fork(')) {
      const match = trimmed.match(/db\.branch_fork\(["']([^"']+)["'],\s*["']([^"']+)["']\)/);
      if (match) {
        const source = match[1];
        const dest = match[2];
        if (!state.branches[source]) {
          return { output: `RuntimeError: Branch not found: ${source}`, newState: state };
        }
        const newBranches = { ...state.branches, [dest]: { ...state.branches[source] } };
        const keyCount = Object.keys(state.branches[source]).length;
        return {
          output: `{'source': '${source}', 'destination': '${dest}', 'keys_copied': ${keyCount}}`,
          newState: { ...state, branches: newBranches }
        };
      }
    }

    if (trimmed.startsWith('db.current_branch(')) {
      return { output: `'${state.currentBranch}'`, newState: state };
    }

    // State operations
    if (trimmed.startsWith('db.state_set(')) {
      const match = trimmed.match(/db\.state_set\(["']([^"']+)["'],\s*(.+)\)$/);
      if (match) {
        const cell = match[1];
        const valueStr = match[2];
        let value;
        try {
          value = JSON.parse(valueStr.replace(/'/g, '"'));
        } catch {
          value = isNaN(Number(valueStr)) ? valueStr : Number(valueStr);
        }
        const existing = state.state[cell];
        const version = existing ? existing.version + 1 : 1;
        const newState = { ...state.state, [cell]: { value, version } };
        return { output: String(version), newState: { ...state, state: newState } };
      }
    }

    if (trimmed.startsWith('db.state_get(')) {
      const match = trimmed.match(/db\.state_get\(["']([^"']+)["']\)/);
      if (match) {
        const cell = match[1];
        const entry = state.state[cell];
        if (!entry) {
          return { output: 'None', newState: state };
        }
        return { output: String(entry.value), newState: state };
      }
    }

    if (trimmed.startsWith('db.state_cas(')) {
      const match = trimmed.match(/db\.state_cas\(["']([^"']+)["'],\s*([^,]+),\s*expected=(\d+)\)/);
      if (match) {
        const cell = match[1];
        const newValue = isNaN(Number(match[2])) ? match[2] : Number(match[2]);
        const expected = Number(match[3]);
        const existing = state.state[cell];
        if (!existing || existing.version !== expected) {
          return { output: 'RuntimeError: CAS failed', newState: state };
        }
        const newVersion = existing.version + 1;
        const newStateObj = { ...state.state, [cell]: { value: newValue, version: newVersion } };
        return { output: String(newVersion), newState: { ...state, state: newStateObj } };
      }
    }

    // Event operations
    if (trimmed.startsWith('db.event_append(')) {
      const match = trimmed.match(/db\.event_append\(["']([^"']+)["'],\s*(.+)\)$/);
      if (match) {
        const eventType = match[1];
        const payloadStr = match[2];
        let payload;
        try {
          payload = JSON.parse(payloadStr.replace(/'/g, '"'));
        } catch {
          payload = payloadStr;
        }
        const events = state.events[eventType] || [];
        const seq = events.length;
        const newEvents = { ...state.events, [eventType]: [...events, { seq, value: payload }] };
        return { output: String(seq), newState: { ...state, events: newEvents } };
      }
    }

    if (trimmed.startsWith('db.event_list(')) {
      const match = trimmed.match(/db\.event_list\(["']([^"']+)["']/);
      if (match) {
        const eventType = match[1];
        const events = state.events[eventType] || [];
        return { output: JSON.stringify(events, null, 2).replace(/"/g, "'"), newState: state };
      }
    }

    if (trimmed.startsWith('db.event_len(')) {
      const total = Object.values(state.events).reduce((sum, arr) => sum + arr.length, 0);
      return { output: String(total), newState: state };
    }

    // Vector operations
    if (trimmed.startsWith('db.vector_create_collection(')) {
      const match = trimmed.match(/db\.vector_create_collection\(["']([^"']+)["'],\s*(\d+)/);
      if (match) {
        const name = match[1];
        const dim = Number(match[2]);
        const newVectors = { ...state.vectors, [name]: { dimension: dim, vectors: {} } };
        return { output: '1', newState: { ...state, vectors: newVectors } };
      }
    }

    if (trimmed.startsWith('db.vector_list_collections(')) {
      const collections = Object.entries(state.vectors).map(([name, c]) => ({
        name,
        dimension: c.dimension,
        count: Object.keys(c.vectors).length,
      }));
      return { output: JSON.stringify(collections, null, 2).replace(/"/g, "'"), newState: state };
    }

    // Help
    if (trimmed === 'help()' || trimmed === 'db.help()') {
      return {
        output: `Available methods:
  db.kv_put(key, value)     - Store a value
  db.kv_get(key)            - Get a value
  db.kv_list()              - List all keys
  db.kv_delete(key)         - Delete a key
  db.branch_create(name)    - Create a branch
  db.branch_use(name)       - Switch to a branch
  db.branch_list()          - List all branches
  db.branch_fork(src, dst)  - Fork a branch
  db.current_branch()       - Get current branch
  db.state_set(cell, value) - Set state
  db.state_get(cell)        - Get state
  db.event_append(type, v)  - Append event
  db.event_list(type)       - List events
  db.vector_create_collection(name, dim)
  help()                    - Show this help`,
        newState: state,
      };
    }

    // Variable assignment (simple)
    if (trimmed.includes(' = ')) {
      const [_varName, expr] = trimmed.split(' = ');
      const result = executeCommand(expr.trim(), state);
      return { output: '', newState: result.newState };
    }

    return { output: `NameError: name '${trimmed.split('(')[0]}' is not defined`, newState: state };
  } catch (e) {
    return { output: `Error: ${e}`, newState: state };
  }
}

export default function PythonRepl() {
  const [history, setHistory] = useState<{ input: string; output: string }[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [state, setState] = useState<ReplState>(initialState);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    const { output, newState } = executeCommand(currentInput, state);
    setState(newState);
    setHistory([...history, { input: currentInput, output }]);
    setCurrentInput('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setCurrentInput(history[history.length - 1 - newIndex]?.input || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(history[history.length - 1 - newIndex]?.input || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentInput('');
      }
    }
  };

  const focusInput = () => inputRef.current?.focus();

  return (
    <div className="terminal w-full max-w-4xl mx-auto shadow-2xl" onClick={focusInput}>
      {/* Terminal header */}
      <div className="terminal-header">
        <div className="terminal-dot terminal-dot-red" />
        <div className="terminal-dot terminal-dot-yellow" />
        <div className="terminal-dot terminal-dot-green" />
        <span className="ml-4 text-gray-400 text-sm font-mono">
          python — stratadb playground
        </span>
        <span className="ml-auto text-gray-500 text-xs">
          Branch: {state.currentBranch}
        </span>
      </div>

      {/* Terminal body */}
      <div
        ref={containerRef}
        className="terminal-body h-[500px] overflow-y-auto scrollbar-thin cursor-text"
      >
        {/* Welcome message */}
        <div className="text-gray-400 mb-4">
          <div>StrataDB Python REPL (simulated)</div>
          <div className="text-sm">Type help() for available commands</div>
        </div>

        {/* History */}
        {history.map((entry, i) => (
          <div key={i} className="mb-2">
            <div className="flex">
              <span className="text-terracotta font-semibold">{'>>> '}</span>
              <span className="text-gray-100">{entry.input}</span>
            </div>
            {entry.output && (
              <div className={`ml-0 whitespace-pre-wrap ${
                entry.output.startsWith('RuntimeError') || entry.output.startsWith('Error') || entry.output.startsWith('NameError')
                  ? 'text-red-400'
                  : entry.output.startsWith("'") || entry.output.startsWith('{') || entry.output.startsWith('[')
                  ? 'text-emerald-400'
                  : 'text-amber-400'
              }`}>
                {entry.output}
              </div>
            )}
          </div>
        ))}

        {/* Current input */}
        <form onSubmit={handleSubmit} className="flex">
          <span className="text-terracotta font-semibold">{'>>> '}</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-gray-100 outline-none font-mono"
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </form>
      </div>

      {/* Quick actions */}
      <div className="bg-gray-800 px-4 py-2 flex gap-2 text-xs border-t border-gray-700">
        <button
          onClick={() => {
            setState(initialState);
            setHistory([]);
          }}
          className="px-2 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
        >
          Reset
        </button>
        <span className="text-gray-500 ml-auto">
          {Object.keys(state.branches[state.currentBranch]).length} keys in {state.currentBranch}
        </span>
      </div>
    </div>
  );
}
