/**
 * Temporal Physics System
 * Implements time-dilation and entropy effects for the Impjieg logo
 */

class TemporalPhysicsSystem {
  constructor() {
    this.timeDilationFactor = 1.0;
    this.entropyLevel = 0.0;
    this.quantumCoherence = 1.0;
    this.temporalObservers = new Set();
  }
  
  /**
   * Calculate time dilation between two states
   */
  calculateTimeDilation(fromState, toState) {
    // Base time dilation factor
    let dilation = 1.0;
    
    // Complexity-based dilation
    const fromComplexity = this.getStateComplexity(fromState);
    const toComplexity = this.getStateComplexity(toState);
    
    // More complex transitions take longer (time dilates)
    const complexityDelta = Math.abs(toComplexity - fromComplexity);
    dilation += complexityDelta * 0.5;
    
    // Entropy-based dilation
    dilation *= (1 + this.entropyLevel * 0.3);
    
    // Quantum coherence effect
    dilation *= this.quantumCoherence;
    
    return Math.max(0.1, dilation);
  }
  
  /**
   * Get state complexity value
   */
  getStateComplexity(state) {
    // This would reference the actual state definitions
    // For now, we'll use a simple mapping
    const complexityMap = {
      potential: 0.3,
      focus: 0.7,
      connection: 0.6,
      application: 0.8,
      success: 0.9,
      growth: 0.7,
      community: 0.8,
      insight: 0.9,
      transition: 1.0,
      leadership: 0.9,
      infinite: 1.0
    };
    
    return complexityMap[state] || 0.5;
  }
  
  /**
   * Calculate entropy for a transition
   */
  calculateTransitionEntropy(fromState, toState) {
    // Base entropy calculation
    let entropy = 0.0;
    
    // State distance contributes to entropy
    const stateDistance = this.calculateStateDistance(fromState, toState);
    entropy += stateDistance * 0.3;
    
    // Complexity difference contributes to entropy
    const fromComplexity = this.getStateComplexity(fromState);
    const toComplexity = this.getStateComplexity(toState);
    const complexityDiff = Math.abs(toComplexity - fromComplexity);
    entropy += complexityDiff * 0.4;
    
    // Random quantum fluctuation
    entropy += Math.random() * 0.2;
    
    return Math.min(1.0, entropy);
  }
  
  /**
   * Calculate distance between two states
   */
  calculateStateDistance(state1, state2) {
    // This would use a more sophisticated distance metric
    // For now, we'll use a simple category-based approach
    const categories = {
      potential: 0,
      focus: 1,
      connection: 2,
      application: 3,
      success: 4,
      growth: 5,
      community: 6,
      insight: 7,
      transition: 8,
      leadership: 9,
      infinite: 10
    };
    
    const dist = Math.abs((categories[state1] || 0) - (categories[state2] || 0));
    return dist / 10; // Normalize to 0-1 range
  }
  
  /**
   * Calculate transition with temporal effects
   */
  calculateTransition(fromState, toState) {
    const timeDilation = this.calculateTimeDilation(fromState, toState);
    const entropy = this.calculateTransitionEntropy(fromState, toState);
    
    return {
      timeDilation,
      entropy,
      coherence: this.quantumCoherence,
      durationMultiplier: timeDilation * (1 + entropy * 0.5)
    };
  }
  
  /**
   * Update entropy level
   */
  updateEntropy(level) {
    this.entropyLevel = Math.max(0.0, Math.min(1.0, level));
    this.notifyObservers('entropy', this.entropyLevel);
  }
  
  /**
   * Update quantum coherence
   */
  updateCoherence(level) {
    this.quantumCoherence = Math.max(0.1, Math.min(1.0, level));
    this.notifyObservers('coherence', this.quantumCoherence);
  }
  
  /**
   * Add temporal observer
   */
  addObserver(observer) {
    this.temporalObservers.add(observer);
  }
  
  /**
   * Remove temporal observer
   */
  removeObserver(observer) {
    this.temporalObservers.delete(observer);
  }
  
  /**
   * Notify observers of temporal changes
   */
  notifyObservers(event, data) {
    for (const observer of this.temporalObservers) {
      if (typeof observer === 'function') {
        observer(event, data);
      } else if (observer && typeof observer.onTemporalEvent === 'function') {
        observer.onTemporalEvent(event, data);
      }
    }
  }
  
  /**
   * Simulate temporal fluctuation
   */
  simulateTemporalFluctuation() {
    // Random small fluctuations in time dilation
    const fluctuation = (Math.random() - 0.5) * 0.1;
    this.timeDilationFactor = Math.max(0.5, Math.min(2.0, this.timeDilationFactor + fluctuation));
    
    return this.timeDilationFactor;
  }
  
  /**
   * Get current temporal metrics
   */
  getTemporalMetrics() {
    return {
      timeDilation: this.timeDilationFactor,
      entropy: this.entropyLevel,
      coherence: this.quantumCoherence
    };
  }
}

// Export singleton instance
export const temporalPhysics = new TemporalPhysicsSystem();

// Export utility functions
export const createTimeDilationEffect = (baseDuration, dilationFactor) => {
  return baseDuration * dilationFactor;
};

export const createEntropyVisualization = (entropyLevel) => {
  // Create visual representation of entropy
  const intensity = Math.floor(entropyLevel * 255);
  return `radial-gradient(circle, rgba(248, 113, 113, ${entropyLevel}) 0%, transparent 70%)`;
};
