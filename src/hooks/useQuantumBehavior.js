import { useState, useCallback } from 'react';

class QuantumBehaviorSystem {
  constructor() {
    this.history = [];
  }

  recordTransition(from, to) {
    this.history.push({ from, to, timestamp: Date.now() });
    if (this.history.length > 100) this.history.shift();
    console.debug(`Quantum transition recorded: ${from} -> ${to}`);
  }

  getTransitionStats() {
    return {
      total: this.history.length,
      last: this.history[this.history.length - 1]
    };
  }
}

const quantumBehaviorSystem = new QuantumBehaviorSystem();

export function useQuantumBehavior(enabled = true) {
  const [intensity, setIntensity] = useState(1);

  const recordTransition = useCallback((from, to) => {
    if (!enabled) return;
    quantumBehaviorSystem.recordTransition(from, to);
    setIntensity(prev => Math.min(prev + 0.1, 3));
  }, [enabled]);

  return {
    intensity,
    recordTransition,
    stats: quantumBehaviorSystem.getTransitionStats()
  };
}
