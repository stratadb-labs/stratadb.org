import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DataNode {
  id: string;
  branch: string;
  key: string;
  value: string;
  x: number;
  y: number;
}

interface Branch {
  name: string;
  color: string;
  y: number;
}

const BRANCHES: Branch[] = [
  { name: 'main', color: '#E07A5F', y: 80 },
  { name: 'experiment', color: '#8B5CF6', y: 160 },
  { name: 'feature', color: '#3B82F6', y: 240 },
];

const INITIAL_NODES: DataNode[] = [
  { id: '1', branch: 'main', key: 'user', value: '{"name": "Alice"}', x: 100, y: 80 },
  { id: '2', branch: 'main', key: 'config', value: '{"theme": "dark"}', x: 200, y: 80 },
  { id: '3', branch: 'main', key: 'state', value: '{"step": 1}', x: 300, y: 80 },
];

export default function BranchVisualization() {
  const [nodes, setNodes] = useState<DataNode[]>(INITIAL_NODES);
  const [activeBranch, setActiveBranch] = useState('main');
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animation sequence
  useEffect(() => {
    if (!isPlaying) return;

    const steps = [
      // Step 0: Initial state
      () => setNodes(INITIAL_NODES),

      // Step 1: Create experiment branch (fork from main)
      () => {
        setActiveBranch('experiment');
        setNodes(prev => [
          ...prev,
          { id: '4', branch: 'experiment', key: 'user', value: '{"name": "Alice"}', x: 300, y: 160 },
        ]);
      },

      // Step 2: Modify data on experiment
      () => {
        setNodes(prev => [
          ...prev,
          { id: '5', branch: 'experiment', key: 'user', value: '{"name": "Bob"}', x: 400, y: 160 },
        ]);
      },

      // Step 3: Create feature branch
      () => {
        setActiveBranch('feature');
        setNodes(prev => [
          ...prev,
          { id: '6', branch: 'feature', key: 'config', value: '{"theme": "dark"}', x: 400, y: 240 },
        ]);
      },

      // Step 4: Modify feature branch
      () => {
        setNodes(prev => [
          ...prev,
          { id: '7', branch: 'feature', key: 'config', value: '{"theme": "light"}', x: 500, y: 240 },
        ]);
      },

      // Step 5: Back to main, add more data
      () => {
        setActiveBranch('main');
        setNodes(prev => [
          ...prev,
          { id: '8', branch: 'main', key: 'state', value: '{"step": 2}', x: 400, y: 80 },
        ]);
      },

      // Step 6: Merge experiment to main
      () => {
        setNodes(prev => [
          ...prev,
          { id: '9', branch: 'main', key: 'user', value: '{"name": "Bob"}', x: 500, y: 80 },
        ]);
      },
    ];

    const timer = setTimeout(() => {
      if (step < steps.length) {
        steps[step]();
        setStep(prev => prev + 1);
      } else {
        // Reset animation
        setStep(0);
        setNodes(INITIAL_NODES);
        setActiveBranch('main');
      }
    }, step === 0 ? 1000 : 1500);

    return () => clearTimeout(timer);
  }, [step, isPlaying]);

  const getBranchColor = (branchName: string) => {
    return BRANCHES.find(b => b.name === branchName)?.color || '#E07A5F';
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 text-sm text-text-muted font-mono">branch visualization</span>
        </div>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-3 py-1 text-xs font-medium text-text-muted hover:text-text-secondary border border-white/10 rounded hover:border-white/20 transition-colors"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>

      {/* Visualization area */}
      <div className="relative h-80 overflow-hidden">
        {/* Branch lines */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="line-gradient-main" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E07A5F" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#E07A5F" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="line-gradient-experiment" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="line-gradient-feature" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Main branch line */}
          <motion.line
            x1="50"
            y1="80"
            x2="100%"
            y2="80"
            stroke="url(#line-gradient-main)"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1 }}
          />

          {/* Experiment branch line */}
          <motion.path
            d="M 300 80 Q 300 120 350 160 L 100% 160"
            fill="none"
            stroke="url(#line-gradient-experiment)"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: step >= 1 ? 1 : 0,
              opacity: step >= 1 ? 1 : 0
            }}
            transition={{ duration: 0.8 }}
          />

          {/* Feature branch line */}
          <motion.path
            d="M 400 80 Q 400 160 450 240 L 100% 240"
            fill="none"
            stroke="url(#line-gradient-feature)"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: step >= 3 ? 1 : 0,
              opacity: step >= 3 ? 1 : 0
            }}
            transition={{ duration: 0.8 }}
          />

          {/* Merge line from experiment to main */}
          {step >= 6 && (
            <motion.path
              d="M 400 160 Q 450 120 500 80"
              fill="none"
              stroke="#8B5CF6"
              strokeWidth="2"
              strokeDasharray="4 4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </svg>

        {/* Branch labels */}
        <div className="absolute left-4 top-[68px] text-xs font-mono text-terracotta">main</div>
        {step >= 1 && (
          <motion.div
            className="absolute left-4 top-[148px] text-xs font-mono text-[#8B5CF6]"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            experiment
          </motion.div>
        )}
        {step >= 3 && (
          <motion.div
            className="absolute left-4 top-[228px] text-xs font-mono text-[#3B82F6]"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            feature
          </motion.div>
        )}

        {/* Data nodes */}
        <AnimatePresence>
          {nodes.map((node) => (
            <motion.div
              key={node.id}
              className="absolute"
              style={{ left: node.x, top: node.y - 16 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <div
                className="relative group"
                style={{
                  '--node-color': getBranchColor(node.branch)
                } as React.CSSProperties}
              >
                {/* Node dot */}
                <div
                  className="w-4 h-4 rounded-full border-2"
                  style={{
                    borderColor: getBranchColor(node.branch),
                    backgroundColor: `${getBranchColor(node.branch)}33`,
                  }}
                />

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-background-elevated rounded text-xs font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 shadow-xl z-10">
                  <span className="text-text-muted">{node.key}:</span>{' '}
                  <span className="text-text-primary">{node.value}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Step indicator */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < step ? 'bg-terracotta' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Code preview */}
      <div className="border-t border-white/5 p-4 font-mono text-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2"
          >
            <span className="text-terracotta">{'>>>'}</span>
            <span className="text-text-secondary">
              {step === 0 && 'db.kv.put("user", {"name": "Alice"})'}
              {step === 1 && 'db.branches.create("experiment")'}
              {step === 2 && 'db.kv.put("user", {"name": "Bob"})'}
              {step === 3 && 'db.branches.create("feature")'}
              {step === 4 && 'db.kv.put("config", {"theme": "light"})'}
              {step === 5 && 'db.checkout("main")'}
              {step === 6 && 'db.merge("experiment")'}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
