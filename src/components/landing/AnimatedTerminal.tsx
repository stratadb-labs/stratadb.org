import { useState, useEffect, useRef } from 'react';

interface TerminalLine {
  type: 'prompt' | 'command' | 'output' | 'comment';
  content: string;
  delay?: number;
}

const terminalScript: TerminalLine[] = [
  { type: 'comment', content: '# Store data with automatic versioning', delay: 0 },
  { type: 'prompt', content: '>>> ' },
  { type: 'command', content: 'db.kv_put("user:1", {"name": "Alice", "role": "engineer"})', delay: 40 },
  { type: 'output', content: '1', delay: 300 },
  { type: 'prompt', content: '\n>>> ' },
  { type: 'comment', content: '\n# Create an isolated branch for experiments', delay: 0 },
  { type: 'prompt', content: '\n>>> ' },
  { type: 'command', content: 'db.branch_create("experiment")', delay: 40 },
  { type: 'prompt', content: '\n>>> ' },
  { type: 'command', content: 'db.branch_use("experiment")', delay: 40 },
  { type: 'prompt', content: '\n>>> ' },
  { type: 'command', content: 'db.kv_put("user:1", {"name": "Alice", "role": "lead"})', delay: 40 },
  { type: 'output', content: '2', delay: 300 },
  { type: 'prompt', content: '\n>>> ' },
  { type: 'comment', content: '\n# Switch back - original data is unchanged', delay: 0 },
  { type: 'prompt', content: '\n>>> ' },
  { type: 'command', content: 'db.branch_use("main")', delay: 40 },
  { type: 'prompt', content: '\n>>> ' },
  { type: 'command', content: 'db.kv_get("user:1")', delay: 40 },
  { type: 'output', content: "{'name': 'Alice', 'role': 'engineer'}", delay: 300 },
  { type: 'prompt', content: '\n>>> ' },
  { type: 'command', content: '_', delay: 0 },
];

export default function AnimatedTerminal() {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isTyping) return;

    const currentLine = terminalScript[currentLineIndex];
    if (!currentLine) {
      setIsTyping(false);
      return;
    }

    if (currentCharIndex < currentLine.content.length) {
      const delay = currentLine.type === 'command' ? (currentLine.delay || 30) : 0;

      const timeout = setTimeout(() => {
        setDisplayedContent(prev => prev + currentLine.content[currentCharIndex]);
        setCurrentCharIndex(prev => prev + 1);
      }, currentLine.type === 'command' ? delay : 0);

      return () => clearTimeout(timeout);
    } else {
      // Move to next line
      const nextDelay = currentLine.type === 'output' ? (currentLine.delay || 200) : 100;

      const timeout = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }, nextDelay);

      return () => clearTimeout(timeout);
    }
  }, [currentLineIndex, currentCharIndex, isTyping]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayedContent]);

  const renderContent = () => {
    const lines = displayedContent.split('\n');
    return lines.map((line, index) => {
      const isPrompt = line.startsWith('>>>');
      const isComment = line.startsWith('#');
      const isOutput = !isPrompt && !isComment && line.length > 0 && !line.includes('>>>');

      if (isComment) {
        return (
          <div key={index} className="text-gray-500 italic">
            {line}
          </div>
        );
      }

      if (isPrompt) {
        const parts = line.split('>>> ');
        return (
          <div key={index} className="flex">
            <span className="text-terracotta font-semibold">{'>>> '}</span>
            <span className="text-gray-100">{parts[1]}</span>
          </div>
        );
      }

      if (isOutput) {
        // Check if it's a dict/list
        if (line.startsWith('{') || line.startsWith('[')) {
          return (
            <div key={index} className="text-emerald-400 font-mono">
              {line}
            </div>
          );
        }
        // Check if it's a number (version)
        if (/^\d+$/.test(line.trim())) {
          return (
            <div key={index} className="text-amber-400">
              {line}
            </div>
          );
        }
        return (
          <div key={index} className="text-gray-300">
            {line}
          </div>
        );
      }

      return <div key={index}>{line}</div>;
    });
  };

  return (
    <div className="terminal w-full max-w-2xl mx-auto shadow-2xl">
      {/* Terminal header */}
      <div className="terminal-header">
        <div className="terminal-dot terminal-dot-red" />
        <div className="terminal-dot terminal-dot-yellow" />
        <div className="terminal-dot terminal-dot-green" />
        <span className="ml-4 text-gray-400 text-sm font-mono">python</span>
      </div>

      {/* Terminal body */}
      <div
        ref={containerRef}
        className="terminal-body h-[320px] overflow-y-auto scrollbar-thin"
      >
        <div className="space-y-1">
          {renderContent()}
        </div>
        {isTyping && currentLineIndex < terminalScript.length && (
          <span className="inline-block w-2 h-5 bg-terracotta animate-pulse ml-0.5" />
        )}
      </div>
    </div>
  );
}
