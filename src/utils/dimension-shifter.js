/**
 * Dimension Shifter Utility
 * Manages quantum superposition and dimensional transitions
 */

import { DIMENSIONAL_STATES, TRANSITION_WEIGHTS } from '../components/QuantumKineticLogo/logo-dimensions';
import { temporalPhysics } from '../components/QuantumKineticLogo/temporal-physics-system';

class DimensionShifter {
  constructor() {
    this.currentDimension = 'potential';
    this.superpositionStates = [];
    this.transitionHistory = [];
    this.quantumFluctuations = 0;
  }
  
  /**
   * Get superposition states for current dimension
   */
  getSuperposition(currentState, temporalEffect = {}) {
    const { entropy = 0, coherence = 1 } = temporalEffect;
    
    // Base probability of superposition
    const baseProbability = 0.3 + (entropy * 0.4);
    
    // Apply quantum coherence
    const coherentProbability = baseProbability * coherence;
    
    // Only create superposition if probability threshold is met
    if (Math.random() > coherentProbability) {
      return [];
    }
    
    // Get possible transition states
    const possibleStates = TRANSITION_WEIGHTS[currentState] || {};
    
    // Create superposition of 1-3 states
    const superposition = [];
    const stateCount = Math.floor(Math.random() * 3) + 1;
    
    // Get weighted random states
    const weightedStates = this.getWeightedRandomStates(possibleStates, stateCount);
    
    for (const stateId of weightedStates) {
      const stateDef = DIMENSIONAL_STATES[stateId];
      if (stateDef) {
        // Calculate probability based on transition weight and entropy
        const transitionWeight = possibleStates[stateId] || 0.5;
        const stateProbability = transitionWeight * (1 - entropy * 0.3);
        
        superposition.push({
          ...stateDef,
          probability: stateProbability,
          intensity: Math.random() * coherence,
          phase: Math.random() * Math.PI * 2
        });
      }
    }
    
    this.superpositionStates = superposition;
    return superposition;
  }
  
  /**
   * Get weighted random states from transition possibilities
   */
  getWeightedRandomStates(transitionWeights, count) {
    const states = Object.keys(transitionWeights);
    const weights = Object.values(transitionWeights);
    
    // Normalize weights
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const normalizedWeights = weights.map(w => w / totalWeight);
    
    // Select states based on weights
    const selected = [];
    const availableStates = [...states];
    const availableWeights = [...normalizedWeights];
    
    for (let i = 0; i < count && availableStates.length > 0; i++) {
      // Calculate cumulative weights
      const cumulative = [];
      let sum = 0;
      for (const weight of availableWeights) {
        sum += weight;
        cumulative.push(sum);
      }
      
      // Select random state based on weights
      const random = Math.random();
      let selectedIndex = 0;
      for (let j = 0; j < cumulative.length; j++) {
        if (random <= cumulative[j]) {
          selectedIndex = j;
          break;
        }
      }
      
      selected.push(availableStates[selectedIndex]);
      
      // Remove selected state to avoid duplicates
      availableStates.splice(selectedIndex, 1);
      availableWeights.splice(selectedIndex, 1);
    }
    
    return selected;
  }
  
  /**
   * Calculate dimensional transition path
   */
  calculateTransitionPath(fromState, toState, steps = 5) {
    const path = [];
    
    // Get intermediate states
    const intermediateStates = this.getIntermediateStates(fromState, toState, steps);
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      
      if (i === 0) {
        path.push({ state: fromState, progress: 0 });
      } else if (i === steps) {
        path.push({ state: toState, progress: 1 });
      } else {
        const intermediateState = intermediateStates[i - 1];
        path.push({ 
          state: intermediateState, 
          progress: progress,
          temporalEffect: temporalPhysics.calculateTransition(fromState, intermediateState)
        });
      }
    }
    
    return path;
  }
  
  /**
   * Get intermediate states between two dimensions
   */
  getIntermediateStates(fromState, toState, count) {
    // This would implement a more sophisticated pathfinding algorithm
    // For now, we'll use simple linear interpolation between categories
    
    const fromCategory = this.getStateCategory(fromState);
    const toCategory = this.getStateCategory(toState);
    
    if (fromCategory === toCategory) {
      // Same category, return direct transition states
      return Array(count).fill().map(() => this.getRelatedState(fromState));
    }
    
    // Different categories, find bridge states
    const bridgeStates = this.findBridgeStates(fromState, toState);
    
    // Select appropriate number of bridge states
    if (bridgeStates.length <= count) {
      return bridgeStates;
    }
    
    // Sample bridge states evenly
    const step = bridgeStates.length / (count + 1);
    const sampled = [];
    
    for (let i = 1; i <= count; i++) {
      const index = Math.floor(i * step);
      sampled.push(bridgeStates[Math.min(index, bridgeStates.length - 1)]);
    }
    
    return sampled;
  }
  
  /**
   * Get state category
   */
  getStateCategory(state) {
    // This would reference actual category definitions
    // For now, we'll use a simple mapping
    const categories = {
      potential: 'exploration',
      focus: 'exploration',
      connection: 'exploration',
      application: 'action',
      success: 'action',
      transition: 'action',
      growth: 'progression',
      insight: 'progression',
      leadership: 'progression',
      community: 'community',
      infinite: 'community'
    };
    
    return categories[state] || 'exploration';
  }
  
  /**
   * Get related state within same category
   */
  getRelatedState(state) {
    const category = this.getStateCategory(state);
    
    // Category to states mapping
    const categoryStates = {
      exploration: ['potential', 'focus', 'connection'],
      action: ['application', 'success', 'transition'],
      progression: ['growth', 'insight', 'leadership'],
      community: ['community', 'infinite']
    };
    
    const states = categoryStates[category] || ['potential'];
    
    // Return random state from category (excluding current)
    const otherStates = states.filter(s => s !== state);
    if (otherStates.length === 0) return state;
    
    return otherStates[Math.floor(Math.random() * otherStates.length)];
  }
  
  /**
   * Find bridge states between categories
   */
  findBridgeStates(fromState, toState) {
    const fromCategory = this.getStateCategory(fromState);
    const toCategory = this.getStateCategory(toState);
    
    // Define category bridges
    const bridges = {
      exploration: {
        action: ['connection', 'application'],
        progression: ['focus', 'growth'],
        community: ['potential', 'community']
      },
      action: {
        exploration: ['success', 'focus'],
        progression: ['application', 'growth'],
        community: ['success', 'community']
      },
      progression: {
        exploration: ['growth', 'focus'],
        action: ['growth', 'application'],
        community: ['insight', 'community']
      },
      community: {
        exploration: ['community', 'potential'],
        action: ['community', 'success'],
        progression: ['community', 'growth']
      }
    };
    
    return bridges[fromCategory]?.[toCategory] || ['potential'];
  }
  
  /**
   * Simulate quantum fluctuation
   */
  simulateQuantumFluctuation() {
    this.quantumFluctuations += 1;
    
    // Occasionally trigger spontaneous state change
    if (Math.random() < 0.01) { // 1% chance per fluctuation
      const currentState = this.currentDimension;
      const possibleTransitions = TRANSITION_WEIGHTS[currentState] || {};
      const nextState = this.getWeightedRandomStates(possibleTransitions, 1)[0];
      
      if (nextState) {
        return {
          type: 'spontaneous-transition',
          from: currentState,
          to: nextState,
          fluctuation: this.quantumFluctuations
        };
      }
    }
    
    return {
      type: 'fluctuation',
      count: this.quantumFluctuations
    };
  }
  
  /**
   * Record transition in history
   */
  recordTransition(fromState, toState, duration) {
    this.transitionHistory.push({
      from: fromState,
      to: toState,
      duration,
      timestamp: Date.now(),
      fluctuations: this.quantumFluctuations
    });
    
    // Limit history size
    if (this.transitionHistory.length > 100) {
      this.transitionHistory.shift();
    }
    
    this.currentDimension = toState;
  }
  
  /**
   * Get transition statistics
   */
  getTransitionStats() {
    if (this.transitionHistory.length === 0) {
      return {
        totalTransitions: 0,
        averageDuration: 0,
        mostCommonPath: null,
        fluctuationRate: 0
      };
    }
    
    const totalDuration = this.transitionHistory.reduce((sum, t) => sum + t.duration, 0);
    const averageDuration = totalDuration / this.transitionHistory.length;
    
    // Count path frequencies
    const pathCounts = {};
    for (const transition of this.transitionHistory) {
      const path = `${transition.from}->${transition.to}`;
      pathCounts[path] = (pathCounts[path] || 0) + 1;
    }
    
    // Find most common path
    let mostCommonPath = null;
    let maxCount = 0;
    for (const [path, count] of Object.entries(pathCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonPath = path;
      }
    }
    
    const fluctuationRate = this.quantumFluctuations / this.transitionHistory.length;
    
    return {
      totalTransitions: this.transitionHistory.length,
      averageDuration,
      mostCommonPath,
      fluctuationRate
    };
  }
}

// Export singleton instance
export const dimensionShifter = new DimensionShifter();

// Export utility functions
export const createQuantumSuperposition = (states, probabilities) => {
  return states.map((state, index) => ({
    state,
    probability: probabilities[index] || (1 / states.length),
    phase: Math.random() * Math.PI * 2
  }));
};

export const collapseSuperposition = (superposition) => {
  // Collapse quantum superposition to single state based on probabilities
  const random = Math.random();
  let cumulative = 0;
  
  for (const state of superposition) {
    cumulative += state.probability;
    if (random <= cumulative) {
      return state.state;
    }
  }
  
  // Fallback to first state
  return superposition[0]?.state || 'potential';
};
