/**
 * Quantum Animation Engine
 * Advanced animation system for the Impjieg kinetic logo
 */

import { DIMENSIONAL_STATES } from './logo-dimensions';
import { temporalPhysics } from '../../hooks/useTemporalPhysics';

class QuantumAnimationEngine {
  constructor() {
    this.animations = new Map();
    this.activeAnimations = new Set();
    this.performanceMonitor = null;
    this.quantumState = 'potential';
  }
  
  /**
   * Initialize the animation engine
   */
  init(performanceMonitor) {
    this.performanceMonitor = performanceMonitor;
    this.setupAnimationSystem();
  }
  
  /**
   * Setup core animation system
   */
  setupAnimationSystem() {
    // Initialize Web Animations API if available
    if (typeof window !== 'undefined' && window.Animation) {
      this.useWebAnimations = true;
    }
    
    // Setup performance monitoring
    if (this.performanceMonitor) {
      this.performanceMonitor.subscribe(this.handlePerformanceUpdate.bind(this));
    }
  }
  
  /**
   * Handle performance updates
   */
  handlePerformanceUpdate(metrics) {
    if (metrics.fps < 30) {
      this.reduceAnimationComplexity();
    } else if (metrics.fps > 90) {
      this.increaseAnimationComplexity();
    }
  }
  
  /**
   * Reduce animation complexity for performance
   */
  reduceAnimationComplexity() {
    // Reduce particle count
    // Simplify easing functions
    // Lower animation durations
  }
  
  /**
   * Increase animation complexity when performance allows
   */
  increaseAnimationComplexity() {
    // Increase particle count
    // Add more complex easing
    // Extend animation durations
  }
  
  /**
   * Create quantum particle animation
   */
  createQuantumParticles(count = 1000) {
    const particles = [];
    
    for (let i = 0; i < count; i++) {
      const particle = {
        id: `particle-${i}`,
        x: Math.random() * 100,
        y: Math.random() * 100,
        z: Math.random() * 100,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        vz: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        color: this.getQuantumColor(),
        phase: Math.random() * Math.PI * 2
      };
      
      particles.push(particle);
    }
    
    return particles;
  }
  
  /**
   * Get quantum color based on current state
   */
  getQuantumColor() {
    const state = DIMENSIONAL_STATES[this.quantumState];
    return state ? state.color : '#6EE7B7';
  }
  
  /**
   * Create dimensional transition animation
   */
  createDimensionalTransition(fromState, toState, options = {}) {
    const {
      duration = 1000,
      easing = 'easeInOutQuad',
      temporalEffect = 1.0
    } = options;
    
    // Calculate temporal physics effect
    const timeDilation = temporalPhysics.calculateTimeDilation(fromState, toState);
    
    // Adjust duration based on temporal effect
    const adjustedDuration = duration * timeDilation * temporalEffect;
    
    // Create animation keyframes
    const keyframes = this.generateTransitionKeyframes(fromState, toState);
    
    // Create animation object
    const animation = {
      id: `transition-${Date.now()}`,
      from: fromState,
      to: toState,
      keyframes,
      duration: adjustedDuration,
      easing,
      startTime: performance.now(),
      progress: 0
    };
    
    this.animations.set(animation.id, animation);
    this.activeAnimations.add(animation.id);
    
    return animation.id;
  }
  
  /**
   * Generate transition keyframes between states
   */
  generateTransitionKeyframes(fromState, toState) {
    const fromDef = DIMENSIONAL_STATES[fromState];
    const toDef = DIMENSIONAL_STATES[toState];
    
    if (!fromDef || !toDef) return [];
    
    // Generate intermediate states for smooth transition
    const keyframes = [];
    const steps = 10;
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      
      keyframes.push({
        progress,
        state: this.interpolateStates(fromDef, toDef, progress),
        properties: this.interpolateProperties(fromDef, toDef, progress)
      });
    }
    
    return keyframes;
  }
  
  /**
   * Interpolate between two state definitions
   */
  interpolateStates(from, to, progress) {
    return {
      id: progress < 0.5 ? from.id : to.id,
      name: progress < 0.5 ? from.name : to.name,
      probability: from.probability + (to.probability - from.probability) * progress,
      complexity: from.complexity + (to.complexity - from.complexity) * progress,
      color: this.interpolateColors(from.color, to.color, progress)
    };
  }
  
  /**
   * Interpolate between two color values
   */
  interpolateColors(color1, color2, progress) {
    // Parse hex colors
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);
    
    // Interpolate RGB values
    const r = Math.round(c1.r + (c2.r - c1.r) * progress);
    const g = Math.round(c1.g + (c2.g - c1.g) * progress);
    const b = Math.round(c1.b + (c2.b - c1.b) * progress);
    
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  /**
   * Convert hex to RGB
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }
  
  /**
   * Interpolate animation properties
   */
  interpolateProperties(from, to, progress) {
    return {
      scale: 1 + (to.complexity - from.complexity) * progress * 0.5,
      rotation: Math.PI * 2 * progress,
      opacity: 0.5 + (to.probability - from.probability) * progress * 0.5
    };
  }
  
  /**
   * Update active animations
   */
  updateAnimations(deltaTime) {
    const now = performance.now();
    
    for (const animationId of this.activeAnimations) {
      const animation = this.animations.get(animationId);
      
      if (!animation) continue;
      
      // Calculate progress
      const elapsed = now - animation.startTime;
      const progress = Math.min(elapsed / animation.duration, 1.0);
      
      animation.progress = progress;
      
      // Apply animation
      this.applyAnimation(animation, progress);
      
      // Remove completed animations
      if (progress >= 1.0) {
        this.activeAnimations.delete(animationId);
        this.animations.delete(animationId);
      }
    }
  }
  
  /**
   * Apply animation to elements
   */
  applyAnimation(animation, progress) {
    // This would typically update DOM elements or WebGL objects
    // For now, we'll just log the progress
    console.debug(`Animation ${animation.id}: ${Math.round(progress * 100)}%`);
  }
  
  /**
   * Cancel animation
   */
  cancelAnimation(animationId) {
    this.activeAnimations.delete(animationId);
    this.animations.delete(animationId);
  }
  
  /**
   * Cancel all animations
   */
  cancelAllAnimations() {
    this.activeAnimations.clear();
    this.animations.clear();
  }
  
  /**
   * Set quantum state
   */
  setQuantumState(state) {
    if (DIMENSIONAL_STATES[state]) {
      this.quantumState = state;
    }
  }
  
  /**
   * Get current quantum state
   */
  getQuantumState() {
    return this.quantumState;
  }
}

// Export singleton instance
export const quantumAnimationEngine = new QuantumAnimationEngine();

// Export utility functions
export const createQuantumWave = (frequency, amplitude, phase) => {
  return {
    frequency,
    amplitude,
    phase,
    calculate: (time) => {
      return amplitude * Math.sin(frequency * time + phase);
    }
  };
};

export const createQuantumPulse = (intensity, duration) => {
  return {
    intensity,
    duration,
    calculate: (elapsed) => {
      if (elapsed > duration) return 0;
      const progress = elapsed / duration;
      return intensity * Math.sin(progress * Math.PI);
    }
  };
};
