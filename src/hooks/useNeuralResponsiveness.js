/**
 * Neural Responsiveness Hook
 * Implements emotional AI synchronization for the Impjieg logo
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { biometricAdapter } from '../components/QuantumKineticLogo/biometric-adapter';

export const useNeuralResponsiveness = (enabled = false) => {
  const [emotionalState, setEmotionalState] = useState({
    attention: 0.5,
    stress: 0.3,
    focus: 0.7,
    engagement: 0.6,
    confidence: 0.5
  });
  
  const [cognitiveLoad, setCognitiveLoad] = useState(0.4);
  const [userPreference, setUserPreference] = useState('balanced');
  const [adaptationHistory, setAdaptationHistory] = useState([]);
  
  const emotionalHistory = useRef([]);
  const adaptationTimer = useRef(null);
  const isInitialized = useRef(false);
  
  /**
   * Initialize neural responsiveness
   */
  const initNeuralResponsiveness = useCallback(async () => {
    if (!enabled || isInitialized.current) return;
    
    try {
      // Initialize biometric adapter if enabled
      if (biometricAdapter.isSupported.webapi) {
        await biometricAdapter.init();
        setupBiometricListeners();
      }
      
      isInitialized.current = true;
    } catch (error) {
      console.warn('Neural responsiveness initialization failed:', error);
    }
  }, [enabled]);
  
  /**
   * Setup biometric listeners
   */
  const setupBiometricListeners = useCallback(() => {
    if (!biometricAdapter.isActive) return;
    
    biometricAdapter.addCallback((sensorType, data) => {
      updateEmotionalStateFromBiometric(sensorType, data);
    });
  }, []);
  
  /**
   * Update emotional state from biometric data
   */
  const updateEmotionalStateFromBiometric = useCallback((sensorType, data) => {
    setEmotionalState(prev => {
      const newState = { ...prev };
      
      switch (sensorType) {
        case 'eeg':
          newState.attention = data.attention;
          newState.confidence = 1 - data.meditation; // Inverse relationship
          break;
          
        case 'eye':
          newState.focus = data.focus;
          newState.engagement = data.focus; // Assuming focus indicates engagement
          break;
          
        case 'heart':
          newState.stress = data.stress;
          newState.engagement = 1 - data.stress; // Inverse relationship
          break;
      }
      
      // Add to emotional history
      emotionalHistory.current.push({
        timestamp: Date.now(),
        ...newState
      });
      
      // Limit history size
      if (emotionalHistory.current.length > 100) {
        emotionalHistory.current.shift();
      }
      
      return newState;
    });
  }, []);
  
  /**
   * Update emotional state from interaction patterns
   */
  const updateFromInteraction = useCallback((x, y, eventType = 'move') => {
    if (!enabled) return;
    
    setEmotionalState(prev => {
      const newState = { ...prev };
      
      // Calculate movement velocity and patterns
      const velocity = Math.sqrt(x * x + y * y) / 1000; // Normalize
      const acceleration = Math.abs(velocity - prev.engagement);
      
      // Update based on interaction type
      switch (eventType) {
        case 'move':
          newState.engagement = Math.min(1, velocity * 2);
          newState.focus = Math.min(1, 0.5 + acceleration);
          break;
          
        case 'click':
          newState.confidence = Math.min(1, prev.confidence + 0.1);
          newState.attention = Math.min(1, prev.attention + 0.05);
          break;
          
        case 'hover':
          newState.engagement = Math.min(1, prev.engagement + 0.02);
          break;
      }
      
      return newState;
    });
  }, [enabled]);
  
  /**
   * Calculate cognitive load from emotional state
   */
  const calculateCognitiveLoad = useCallback(() => {
    const { attention, stress, focus } = emotionalState;
    
    // Cognitive load is a function of attention demand and stress
    const load = (attention * 0.4) + (stress * 0.3) + ((1 - focus) * 0.3);
    
    setCognitiveLoad(Math.min(1, Math.max(0, load)));
  }, [emotionalState]);
  
  /**
   * Adapt animation style based on user preferences
   */
  const adaptToUserPreference = useCallback(() => {
    const recentStates = emotionalHistory.current.slice(-20);
    
    if (recentStates.length < 5) return;
    
    // Calculate averages
    const avgAttention = recentStates.reduce((sum, state) => sum + state.attention, 0) / recentStates.length;
    const avgStress = recentStates.reduce((sum, state) => sum + state.stress, 0) / recentStates.length;
    const avgFocus = recentStates.reduce((sum, state) => sum + state.focus, 0) / recentStates.length;
    
    // Determine preference based on patterns
    let preference = 'balanced';
    
    if (avgAttention > 0.7 && avgFocus > 0.7) {
      preference = 'dynamic';
    } else if (avgStress > 0.6) {
      preference = 'calm';
    } else if (avgAttention < 0.4 && avgFocus < 0.4) {
      preference = 'simple';
    }
    
    setUserPreference(preference);
    
    // Add to adaptation history
    setAdaptationHistory(prev => [
      ...prev.slice(-9), // Keep last 10 adaptations
      {
        timestamp: Date.now(),
        preference,
        metrics: { avgAttention, avgStress, avgFocus }
      }
    ]);
  }, []);
  
  /**
   * Get animation parameters based on emotional state
   */
  const getAnimationParameters = useCallback(() => {
    const { attention, stress, focus, engagement, confidence } = emotionalState;
    
    // Base parameters
    const params = {
      complexity: 0.5,
      speed: 1.0,
      intensity: 0.5,
      smoothness: 0.7,
      responsiveness: 1.0
    };
    
    // Adjust based on emotional state
    params.complexity = Math.min(1, (attention + engagement) / 2);
    params.speed = Math.max(0.5, 1.5 - stress);
    params.intensity = Math.min(1, (confidence + engagement) / 2);
    params.smoothness = Math.max(0.3, 1 - stress);
    params.responsiveness = Math.min(1.5, 0.8 + focus);
    
    // Apply user preference
    switch (userPreference) {
      case 'dynamic':
        params.complexity *= 1.3;
        params.speed *= 1.2;
        params.intensity *= 1.2;
        break;
        
      case 'calm':
        params.complexity *= 0.7;
        params.speed *= 0.8;
        params.intensity *= 0.6;
        params.smoothness *= 1.2;
        break;
        
      case 'simple':
        params.complexity *= 0.5;
        params.speed *= 0.9;
        params.intensity *= 0.7;
        break;
    }
    
    return params;
  }, [emotionalState, userPreference]);
  
  /**
   * Reset emotional state
   */
  const resetEmotionalState = useCallback(() => {
    setEmotionalState({
      attention: 0.5,
      stress: 0.3,
      focus: 0.7,
      engagement: 0.6,
      confidence: 0.5
    });
    
    setCognitiveLoad(0.4);
    setUserPreference('balanced');
    emotionalHistory.current = [];
  }, []);
  
  // Effects
  useEffect(() => {
    initNeuralResponsiveness();
  }, [initNeuralResponsiveness]);
  
  useEffect(() => {
    calculateCognitiveLoad();
  }, [calculateCognitiveLoad]);
  
  useEffect(() => {
    if (adaptationTimer.current) {
      clearTimeout(adaptationTimer.current);
    }
    
    adaptationTimer.current = setTimeout(() => {
      adaptToUserPreference();
    }, 5000); // Adapt every 5 seconds
    
    return () => {
      if (adaptationTimer.current) {
        clearTimeout(adaptationTimer.current);
      }
    };
  }, [adaptToUserPreference]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (biometricAdapter.isActive) {
        biometricAdapter.disconnectAll();
      }
    };
  }, []);
  
  return {
    emotionalState,
    cognitiveLoad,
    userPreference,
    adaptationHistory,
    update: updateFromInteraction,
    getAnimationParameters,
    reset: resetEmotionalState,
    isInitialized: isInitialized.current
  };
};

// Export utility functions
export const createEmotionalResponse = (emotionalState) => {
  const { attention, stress, focus, engagement, confidence } = emotionalState;
  
  return {
    scale: 1.0 + (engagement * 0.2),
    rotation: (focus - 0.5) * 0.5,
    opacity: 0.7 + (confidence * 0.3),
    colorIntensity: 0.8 + (attention * 0.2),
    animationSpeed: 1.0 + (stress * 0.5),
    complexity: engagement
  };
};

export const getEmotionalColor = (emotionalState) => {
  const { attention, stress, focus } = emotionalState;
  
  // Base colors
  const calmColor = [110, 231, 183]; // Neon Mint
  const activeColor = [14, 165, 233]; // Azure Depth
  const stressColor = [248, 113, 113]; // Coral Pulse
  
  // Blend based on emotional state
  const blendFactor = stress;
  const baseFactor = 1 - stress;
  
  const r = Math.round(
    (calmColor[0] * baseFactor * (1 - attention) + 
     activeColor[0] * baseFactor * attention + 
     stressColor[0] * blendFactor)
  );
  
  const g = Math.round(
    (calmColor[1] * baseFactor * focus + 
     activeColor[1] * baseFactor * (1 - focus) + 
     stressColor[1] * blendFactor)
  );
  
  const b = Math.round(
    (calmColor[2] * (1 - stress) + 
     activeColor[2] * (1 - stress) + 
     stressColor[2] * stress)
  );
  
  return `rgb(${r}, ${g}, ${b})`;
};
