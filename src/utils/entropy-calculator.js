/**
 * Entropy Calculator Utility
 * Calculates system entropy based on user interactions and state changes
 */

class EntropyCalculator {
  constructor() {
    this.interactionHistory = [];
    this.stateHistory = [];
    this.entropyCache = new Map();
    this.lastCalculation = 0;
  }
  
  /**
   * Calculate entropy from user interaction coordinates
   */
  calculate(x, y) {
    // Add current interaction to history
    this.interactionHistory.push({
      x,
      y,
      timestamp: Date.now()
    });
    
    // Limit history size
    if (this.interactionHistory.length > 100) {
      this.interactionHistory.shift();
    }
    
    // Calculate entropy based on movement patterns
    return this.calculateMovementEntropy();
  }
  
  /**
   * Calculate entropy based on movement patterns
   */
  calculateMovementEntropy() {
    if (this.interactionHistory.length < 2) {
      return 0;
    }
    
    // Calculate velocity and acceleration patterns
    const velocities = [];
    const accelerations = [];
    
    for (let i = 1; i < this.interactionHistory.length; i++) {
      const prev = this.interactionHistory[i - 1];
      const curr = this.interactionHistory[i];
      
      const deltaTime = (curr.timestamp - prev.timestamp) / 1000; // Convert to seconds
      if (deltaTime === 0) continue;
      
      const deltaX = curr.x - prev.x;
      const deltaY = curr.y - prev.y;
      
      const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime;
      velocities.push(velocity);
      
      if (velocities.length > 1) {
        const prevVelocity = velocities[velocities.length - 2];
        const acceleration = Math.abs(velocity - prevVelocity) / deltaTime;
        accelerations.push(acceleration);
      }
    }
    
    if (velocities.length === 0) {
      return 0;
    }
    
    // Calculate entropy from velocity distribution
    const avgVelocity = velocities.reduce((sum, v) => sum + v, 0) / velocities.length;
    const velocityVariance = velocities.reduce((sum, v) => sum + Math.pow(v - avgVelocity, 2), 0) / velocities.length;
    
    // Normalize entropy to 0-1 range
    const normalizedEntropy = Math.min(1, velocityVariance / 10000);
    
    return normalizedEntropy;
  }
  
  /**
   * Calculate entropy from state transitions
   */
  calculateStateEntropy(states) {
    if (states.length < 2) {
      return 0;
    }
    
    // Count state transitions
    const transitions = new Map();
    let totalTransitions = 0;
    
    for (let i = 1; i < states.length; i++) {
      const from = states[i - 1];
      const to = states[i];
      const key = `${from}->${to}`;
      
      transitions.set(key, (transitions.get(key) || 0) + 1);
      totalTransitions++;
    }
    
    // Calculate Shannon entropy
    let entropy = 0;
    for (const [key, count] of transitions) {
      const probability = count / totalTransitions;
      if (probability > 0) {
        entropy -= probability * Math.log2(probability);
      }
    }
    
    // Normalize to 0-1 range (max entropy for n states is log2(n))
    const maxEntropy = Math.log2(states.length);
    const normalizedEntropy = maxEntropy > 0 ? entropy / maxEntropy : 0;
    
    return normalizedEntropy;
  }
  
  /**
   * Calculate temporal entropy
   */
  calculateTemporalEntropy(timestamps) {
    if (timestamps.length < 2) {
      return 0;
    }
    
    // Calculate time intervals between interactions
    const intervals = [];
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1]);
    }
    
    // Calculate entropy from interval distribution
    const avgInterval = intervals.reduce((sum, t) => sum + t, 0) / intervals.length;
    const intervalVariance = intervals.reduce((sum, t) => sum + Math.pow(t - avgInterval, 2), 0) / intervals.length;
    
    // Normalize entropy
    const normalizedEntropy = Math.min(1, intervalVariance / 1000000);
    
    return normalizedEntropy;
  }
  
  /**
   * Calculate combined entropy from multiple sources
   */
  calculateCombinedEntropy(options = {}) {
    const {
      movement = true,
      state = false,
      temporal = false,
      weights = { movement: 0.5, state: 0.3, temporal: 0.2 }
    } = options;
    
    let totalEntropy = 0;
    let totalWeight = 0;
    
    // Movement entropy
    if (movement) {
      const movementEntropy = this.calculateMovementEntropy();
      totalEntropy += movementEntropy * weights.movement;
      totalWeight += weights.movement;
    }
    
    // State entropy
    if (state && this.stateHistory.length > 1) {
      const stateEntropy = this.calculateStateEntropy(this.stateHistory);
      totalEntropy += stateEntropy * weights.state;
      totalWeight += weights.state;
    }
    
    // Temporal entropy
    if (temporal && this.interactionHistory.length > 1) {
      const timestamps = this.interactionHistory.map(i => i.timestamp);
      const temporalEntropy = this.calculateTemporalEntropy(timestamps);
      totalEntropy += temporalEntropy * weights.temporal;
      totalWeight += weights.temporal;
    }
    
    return totalWeight > 0 ? totalEntropy / totalWeight : 0;
  }
  
  /**
   * Add state to history for entropy calculation
   */
  addState(state) {
    this.stateHistory.push({
      state,
      timestamp: Date.now()
    });
    
    // Limit history size
    if (this.stateHistory.length > 50) {
      this.stateHistory.shift();
    }
  }
  
  /**
   * Get entropy trend over time
   */
  getEntropyTrend(windowSize = 10) {
    if (this.interactionHistory.length < windowSize) {
      return [];
    }
    
    const trend = [];
    const startIndex = Math.max(0, this.interactionHistory.length - windowSize);
    
    for (let i = startIndex; i < this.interactionHistory.length; i++) {
      const endIndex = Math.min(i + 5, this.interactionHistory.length);
      const windowHistory = this.interactionHistory.slice(i, endIndex);
      
      if (windowHistory.length >= 2) {
        const windowEntropy = this.calculateWindowEntropy(windowHistory);
        trend.push({
          timestamp: windowHistory[windowHistory.length - 1].timestamp,
          entropy: windowEntropy
        });
      }
    }
    
    return trend;
  }
  
  /**
   * Calculate entropy for a specific window
   */
  calculateWindowEntropy(windowHistory) {
    // Create temporary instance to avoid affecting main history
    const tempCalculator = new EntropyCalculator();
    tempCalculator.interactionHistory = windowHistory;
    return tempCalculator.calculateMovementEntropy();
  }
  
  /**
   * Predict next entropy level
   */
  predictNextEntropy() {
    const trend = this.getEntropyTrend(5);
    
    if (trend.length < 2) {
      return this.calculateCombinedEntropy();
    }
    
    // Simple linear prediction based on recent trend
    const last = trend[trend.length - 1];
    const secondLast = trend[trend.length - 2];
    
    const delta = last.entropy - secondLast.entropy;
    const predicted = last.entropy + delta;
    
    // Clamp to valid range
    return Math.max(0, Math.min(1, predicted));
  }
  
  /**
   * Reset entropy calculator
   */
  reset() {
    this.interactionHistory = [];
    this.stateHistory = [];
    this.entropyCache.clear();
  }
  
  /**
   * Cache entropy calculation for performance
   */
  getCachedEntropy(key, calculationFn) {
    const now = Date.now();
    
    // Check if cached result is still valid (500ms cache)
    if (this.entropyCache.has(key) && now - this.lastCalculation < 500) {
      return this.entropyCache.get(key);
    }
    
    // Calculate new value
    const value = calculationFn();
    this.entropyCache.set(key, value);
    this.lastCalculation = now;
    
    return value;
  }
}

// Export singleton instance
export const entropyCalculator = new EntropyCalculator();

// Export utility functions
export const createEntropyVisualization = (entropy) => {
  // Create visual representation of entropy level
  const intensity = Math.floor(entropy * 255);
  const size = 20 + (entropy * 30);
  
  return {
    background: `radial-gradient(circle, rgba(248, 113, 113, ${entropy}) 0%, transparent 70%)`,
    width: `${size}px`,
    height: `${size}px`,
    filter: `blur(${entropy * 5}px)`,
    opacity: entropy * 0.8
  };
};

export const getEntropyColor = (entropy) => {
  // Map entropy to color spectrum
  // Low entropy = blue/green, High entropy = red/orange
  const hue = 240 - (entropy * 240); // 240° (blue) to 0° (red)
  return `hsl(${hue}, 80%, 60%)`;
};
