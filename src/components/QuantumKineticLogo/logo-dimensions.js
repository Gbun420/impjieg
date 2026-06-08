/**
 * Quantum Dimensional State Definitions
 * 11-dimensional morph states for the Impjieg logo
 * Enhanced with Nature Distilled aesthetic
 */

export const DIMENSIONAL_STATES = {
  // Quantum Potential State: Particle field representing infinite possibilities
  potential: {
    id: 'potential',
    name: 'Quantum Potential',
    description: 'Infinite career possibilities visualized as particle field',
    probability: 1.0,
    complexity: 0.3,
    color: '#6EE7B7', // Neon Mint
    natureColor: '#8B7355', // Warm Stone Brown
    symbol: 'potential-symbol',
    animation: {
      type: 'particle-field',
      duration: 3000,
      easing: 'easeInOutQuad'
    },
    transitions: {
      focus: 0.8,
      community: 0.6,
      growth: 0.4
    }
  },
  
  // Neural Focus State: Synaptic connections during job search
  focus: {
    id: 'focus',
    name: 'Neural Focus',
    description: 'Concentrated attention during job search and evaluation',
    probability: 0.9,
    complexity: 0.7,
    color: '#0EA5E9', // Azure Depth
    natureColor: '#A89475', // Lighter Stone
    symbol: 'focus-symbol',
    animation: {
      type: 'synaptic-network',
      duration: 2000,
      easing: 'easeOutCubic'
    },
    transitions: {
      connection: 0.9,
      application: 0.7,
      insight: 0.5
    }
  },
  
  // Resonance Connection State: Harmonic alignment with companies
  connection: {
    id: 'connection',
    name: 'Resonance Connection',
    description: 'Harmonic frequency alignment with potential employers',
    probability: 0.8,
    complexity: 0.6,
    color: '#8B5CF6', // Violet Insight
    natureColor: '#CBB99A', // Light Stone
    symbol: 'connection-symbol',
    animation: {
      type: 'harmonic-waves',
      duration: 2500,
      easing: 'easeInOutSine'
    },
    transitions: {
      application: 0.9,
      community: 0.7,
      leadership: 0.4
    }
  },
  
  // Temporal Application State: Time-dilation during submissions
  application: {
    id: 'application',
    name: 'Temporal Application',
    description: 'Time-dilated experience during job application process',
    probability: 0.7,
    complexity: 0.8,
    color: '#F97316', // Sunset Orange
    natureColor: '#DCC9AB', // Very Light Stone
    symbol: 'application-symbol',
    animation: {
      type: 'time-dilation',
      duration: 1500,
      easing: 'easeOutExpo'
    },
    transitions: {
      success: 0.9,
      focus: 0.6,
      transition: 0.3
    }
  },
  
  // Success Cascade State: Particle bloom upon successful application
  success: {
    id: 'success',
    name: 'Success Cascade',
    description: 'Particle bloom effect representing successful outcomes',
    probability: 0.6,
    complexity: 0.9,
    color: '#10B981', // Emerald Growth
    natureColor: '#E0D5C0', // Off-White Stone
    symbol: 'success-symbol',
    animation: {
      type: 'particle-bloom',
      duration: 2000,
      easing: 'easeOutBack'
    },
    transitions: {
      growth: 0.9,
      insight: 0.7,
      community: 0.5
    }
  },
  
  // Growth Spiral State: Fibonacci expansion for career progression
  growth: {
    id: 'growth',
    name: 'Growth Spiral',
    description: 'Fibonacci-based expansion representing career progression',
    probability: 0.5,
    complexity: 0.7,
    color: '#10B981',
    natureColor: '#8B7355',
    symbol: 'growth-symbol',
    animation: {
      type: 'fibonacci-spiral',
      duration: 3000,
      easing: 'easeInOutQuart'
    },
    transitions: {
      leadership: 0.8,
      insight: 0.6,
      infinite: 0.4
    }
  },
  
  // Community Network State: Graph visualization of professional networks
  community: {
    id: 'community',
    name: 'Community Network',
    description: 'Real-time graph visualization of professional networks',
    probability: 0.4,
    complexity: 0.8,
    color: '#8B5CF6',
    natureColor: '#A89475',
    symbol: 'community-symbol',
    animation: {
      type: 'network-graph',
      duration: 2500,
      easing: 'easeOutCirc'
    },
    transitions: {
      leadership: 0.7,
      connection: 0.6,
      potential: 0.5
    }
  },
  
  // Insight Revelation State: Data particles forming meaningful patterns
  insight: {
    id: 'insight',
    name: 'Insight Revelation',
    description: 'Data particles forming meaningful career insights',
    probability: 0.3,
    complexity: 0.9,
    color: '#F59E0B',
    natureColor: '#CBB99A',
    symbol: 'insight-symbol',
    animation: {
      type: 'data-formation',
      duration: 2000,
      easing: 'easeInOutElastic'
    },
    transitions: {
      growth: 0.8,
      leadership: 0.6,
      infinite: 0.3
    }
  },
  
  // Transition Vortex State: Dimensional fold for career pivots
  transition: {
    id: 'transition',
    name: 'Transition Vortex',
    description: 'Dimensional fold effect for career transitions and pivots',
    probability: 0.2,
    complexity: 1.0,
    color: '#F87171',
    natureColor: '#DCC9AB',
    symbol: 'transition-symbol',
    animation: {
      type: 'dimensional-fold',
      duration: 3000,
      easing: 'easeInOutExpo'
    },
    transitions: {
      potential: 0.9,
      focus: 0.7,
      community: 0.5
    }
  },
  
  // Leadership Constellation State: Stellar formation for influence
  leadership: {
    id: 'leadership',
    name: 'Leadership Constellation',
    description: 'Stellar formation representing leadership and influence',
    probability: 0.1,
    complexity: 0.9,
    color: '#F59E0B',
    natureColor: '#E0D5C0',
    symbol: 'leadership-symbol',
    animation: {
      type: 'stellar-formation',
      duration: 3500,
      easing: 'easeOutQuint'
    },
    transitions: {
      community: 0.8,
      growth: 0.6,
      infinite: 0.4
    }
  },
  
  // Infinite Loop State: Fractal recursion for continuous learning
  infinite: {
    id: 'infinite',
    name: 'Infinite Loop',
    description: 'Fractal recursion symbolizing continuous learning',
    probability: 0.05,
    complexity: 1.0,
    color: '#6EE7B7',
    natureColor: '#8B7355',
    symbol: 'infinite-symbol',
    animation: {
      type: 'fractal-recursion',
      duration: 4000,
      easing: 'easeInOutQuint'
    },
    transitions: {
      potential: 1.0,
      insight: 0.8,
      leadership: 0.6
    }
  }
};

// Export state categories for easier grouping
export const STATE_CATEGORIES = {
  exploration: ['potential', 'focus', 'connection'],
  action: ['application', 'success', 'transition'],
  progression: ['growth', 'insight', 'leadership'],
  community: ['community', 'infinite']
};

// Export probability weights for state transitions
export const TRANSITION_WEIGHTS = {
  potential: { focus: 0.8, community: 0.6, growth: 0.4 },
  focus: { connection: 0.9, application: 0.7, insight: 0.5 },
  connection: { application: 0.9, community: 0.7, leadership: 0.4 },
  application: { success: 0.9, focus: 0.6, transition: 0.3 },
  success: { growth: 0.9, insight: 0.7, community: 0.5 },
  growth: { leadership: 0.8, insight: 0.6, infinite: 0.4 },
  community: { leadership: 0.7, connection: 0.6, potential: 0.5 },
  insight: { growth: 0.8, leadership: 0.6, infinite: 0.3 },
  transition: { potential: 0.9, focus: 0.7, community: 0.5 },
  leadership: { community: 0.8, growth: 0.6, infinite: 0.4 },
  infinite: { potential: 1.0, insight: 0.8, leadership: 0.6 }
};
