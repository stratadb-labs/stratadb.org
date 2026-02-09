import { useRef, useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';

interface Layer {
  id: string;
  name: string;
  color: string;
  description: string;
  details: string[];
  link: string;
}

const layers: Layer[] = [
  {
    id: 'api',
    name: 'API Layer',
    color: '#E07A5F',
    description: 'The public interface — CLI, SDKs, and MCP protocol handlers.',
    details: [
      'CLI REPL with command parsing',
      'Python and Node.js SDK bindings',
      'MCP (Model Context Protocol) server',
      'Input validation and serialization',
    ],
    link: '/architecture/crate-structure',
  },
  {
    id: 'executor',
    name: 'Executor Layer',
    color: '#81B29A',
    description: 'Command routing and orchestration across primitives.',
    details: [
      'Command dispatch to primitives',
      'Session management',
      'Transaction coordination',
      'Error aggregation and mapping',
    ],
    link: '/architecture/session-transaction-completeness',
  },
  {
    id: 'primitives',
    name: 'Primitives Layer',
    color: '#F2CC8F',
    description: 'The six data structures — KV, Events, State, JSON, Vectors, Branches.',
    details: [
      'KV Store with prefix scanning',
      'Event Log with sequence numbers',
      'State Cell with CAS operations',
      'JSON Store with path access',
      'Vector Store with HNSW index',
      'Branch Manager for isolation',
    ],
    link: '/architecture/kv-primitive',
  },
  {
    id: 'transactions',
    name: 'Transaction Layer',
    color: '#3D405B',
    description: 'Optimistic concurrency control with snapshot isolation.',
    details: [
      'OCC with read/write sets',
      'Snapshot isolation semantics',
      'Conflict detection on commit',
      'Automatic retry support',
    ],
    link: '/architecture/concurrency-model',
  },
  {
    id: 'storage',
    name: 'Storage Engine',
    color: '#E07A5F',
    description: 'ShardedStore with MVCC, versioning, and key structure.',
    details: [
      'MVCC for concurrent access',
      'Sharded architecture for parallelism',
      'Versioned key structure',
      'Copy-on-write for branches',
    ],
    link: '/architecture/storage-engine',
  },
  {
    id: 'durability',
    name: 'Durability Layer',
    color: '#81B29A',
    description: 'WAL, snapshots, and three durability modes.',
    details: [
      'Write-ahead logging (WAL)',
      'Periodic snapshots',
      'Sync, Async, and Cache modes',
      'Crash recovery protocol',
    ],
    link: '/architecture/durability-and-recovery',
  },
];

export default function LayerScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeLayer, setActiveLayer] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Update active layer based on scroll position
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (value) => {
      const layerIndex = Math.min(
        Math.floor(value * layers.length),
        layers.length - 1
      );
      setActiveLayer(layerIndex);
    });
    return unsubscribe;
  }, [scrollYProgress]);

  return (
    <div ref={containerRef} className="relative" style={{ height: `${layers.length * 100}vh` }}>
      {/* Fixed layer visualization */}
      <div className="sticky top-24 h-[calc(100vh-8rem)] flex">
        {/* Layer stack */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-full max-w-md">
            {layers.map((layer, index) => {
              const isActive = index === activeLayer;
              const isPast = index < activeLayer;

              return (
                <motion.div
                  key={layer.id}
                  className="absolute w-full"
                  style={{
                    top: `${index * 50}px`,
                    zIndex: layers.length - index,
                  }}
                  animate={{
                    opacity: isPast ? 0.3 : 1,
                    scale: isActive ? 1.02 : 1,
                    y: isPast ? -20 : 0,
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <div
                    className={`
                      rounded-xl p-6 shadow-lg border-2 transition-all duration-300
                      ${isActive ? 'border-terracotta shadow-xl' : 'border-transparent'}
                    `}
                    style={{
                      backgroundColor: layer.color + '15',
                      borderColor: isActive ? layer.color : 'transparent',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: layer.color }}
                      />
                      <span className="font-semibold text-text-primary">
                        {layer.name}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Layer details panel */}
        <div className="w-96 pl-8 flex items-center">
          <motion.div
            key={activeLayer}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-background border border-border rounded-xl p-6 shadow-lg"
          >
            <div
              className="w-3 h-3 rounded-full mb-4"
              style={{ backgroundColor: layers[activeLayer].color }}
            />
            <h3 className="text-xl font-bold text-text-primary mb-2">
              {layers[activeLayer].name}
            </h3>
            <p className="text-text-secondary mb-4">
              {layers[activeLayer].description}
            </p>
            <ul className="space-y-2 mb-4">
              {layers[activeLayer].details.map((detail, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4 mt-0.5 text-terracotta flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {detail}
                </li>
              ))}
            </ul>
            <a
              href={layers[activeLayer].link}
              className="inline-flex items-center text-sm text-terracotta hover:text-terracotta-dark font-medium"
            >
              Learn more
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </motion.div>
        </div>
      </div>

      {/* Scroll progress indicator */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50">
        {layers.map((layer, index) => (
          <button
            key={layer.id}
            onClick={() => {
              const scrollTarget = (index / layers.length) * (containerRef.current?.scrollHeight || 0);
              window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              index === activeLayer
                ? 'w-3 h-3'
                : 'opacity-50 hover:opacity-100'
            }`}
            style={{ backgroundColor: layer.color }}
            title={layer.name}
          />
        ))}
      </div>
    </div>
  );
}
