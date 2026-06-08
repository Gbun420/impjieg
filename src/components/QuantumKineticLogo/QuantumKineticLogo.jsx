import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useQuantumBehavior } from '../../hooks/useQuantumBehavior';
import { useTemporalPhysics } from '../../hooks/useTemporalPhysics';
import { useNeuralResponsiveness } from '../../hooks/useNeuralResponsiveness';
import { useCognitiveAdaptation } from '../../hooks/useCognitiveAdaptation';
import { dimensionShifter } from '../../utils/dimension-shifter';
import { entropyCalculator } from '../../utils/entropy-calculator';
import { DIMENSIONAL_STATES } from './logo-dimensions';
import styles from './QuantumKineticLogo.module.scss';

/**
 * Quantum Kinetic Logo - The most advanced logo system ever built
 * Implements 11-dimensional morph states with neural responsiveness
 */
const QuantumKineticLogo = ({
  size = 100,
  className = '',
  initialState = 'potential',
  interactive = true,
  biometricEnabled = false,
  mlEnabled = true,
  natureMode = false
}) => {
  // State management
  const [currentState, setCurrentState] = useState(initialState);
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);
  const [entropy, setEntropy] = useState(0);
  const [quantumSuperposition, setQuantumSuperposition] = useState([]);
  
  // Refs
  const logoRef = useRef();
  const particleRef = useRef();
  const lastMousePos = useRef({ x: 0, y: 0 });
  
  // Custom hooks
  const quantumBehavior = useQuantumBehavior(mlEnabled);
  const temporalPhysics = useTemporalPhysics();
  const neuralResponse = useNeuralResponsiveness(biometricEnabled);
  const cognitiveAdaptation = useCognitiveAdaptation();
  
  // Destructure neural response
  const { cognitiveLoad } = neuralResponse;
  
  // Animation springs
  const [{ scale, rotation, opacity }, api] = useSpring(() => ({
    scale: 1,
    rotation: 0,
    opacity: 1,
    config: config.gentle
  }));
  
  // Particle system for quantum effects
  const particles = useMemo(() => {
    const count = natureMode ? 1200 : 1000;
    const temp = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      if (natureMode) {
        // Organic Fibonacci spiral distribution
        const golden_ratio = (1 + Math.sqrt(5)) / 2;
        const theta = i * 2 * Math.PI * golden_ratio;
        const radius = Math.sqrt(i / count) * 2;
        
        const x = radius * Math.cos(theta);
        const y = radius * Math.sin(theta);
        const z = (Math.random() - 0.5) * 0.5;
        
        temp[i * 3] = x;
        temp[i * 3 + 1] = y;
        temp[i * 3 + 2] = z;
      } else {
        // Original distribution
        const t = Math.random() * 2 * Math.PI;
        const r = Math.sqrt(Math.random()) * 2;
        const x = r * Math.cos(t);
        const y = r * Math.sin(t);
        
        temp[i * 3] = x;
        temp[i * 3 + 1] = y;
        temp[i * 3 + 2] = Math.random() * 2 - 1;
      }
    }
    return temp;
  }, [natureMode]);
  
  // Native mouse event handlers
  const handleMouseMove = useCallback((e) => {
    const rect = logoRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate entropy based on movement patterns
    const newEntropy = entropyCalculator.calculate(x, y);
    setEntropy(newEntropy);
    
    // Update neural response
    if (biometricEnabled) {
      neuralResponse.update(x, y);
    }
    
    lastMousePos.current = { x, y };
  }, [biometricEnabled, neuralResponse]);
  
  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);
  const handleMouseDown = useCallback(() => setActive(true), []);
  const handleMouseUp = useCallback(() => setActive(false), []);
  
  // State transition handler
  const transitionToState = useCallback((newState, options = {}) => {
    const { duration = 800, delay = 0 } = options;
    
    // Update quantum behavior model
    if (mlEnabled) {
      quantumBehavior.recordTransition(currentState, newState);
    }
    
    // Calculate temporal physics
    const temporalEffect = temporalPhysics.calculateTransition(currentState, newState);
    
    // Animate to new state
    api.start({
      scale: 1.1,
      rotation: Math.PI * 2,
      opacity: 0.8,
      config: { ...config.wobbly, duration: duration / 2 }
    });
    
    setTimeout(() => {
      setCurrentState(newState);
      
      api.start({
        scale: 1,
        rotation: 0,
        opacity: 1,
        config: { ...config.gentle, duration: duration / 2 }
      });
    }, duration / 2 + delay);
    
    // Update quantum superposition
    const superposition = dimensionShifter.getSuperposition(newState, temporalEffect);
    setQuantumSuperposition(superposition);
  }, [currentState, api, quantumBehavior, temporalPhysics, mlEnabled, biometricEnabled]);
  
  // Cognitive adaptation effect
  useEffect(() => {
    if (cognitiveAdaptation.shouldSimplify()) {
      // Simplify animations for cognitive load
      api.start({ config: config.slow });
    } else {
      api.start({ config: config.gentle });
    }
  }, [cognitiveLoad, api]); // Fixed: cognitiveLoad dependency
  
  // Entropy-based effects
  useEffect(() => {
    if (entropy > 0.8) {
      // High entropy - chaotic state
      transitionToState('transition');
    } else if (entropy > 0.5) {
      // Medium entropy - dynamic state
      transitionToState('focus');
    }
  }, [entropy, transitionToState]);
  
  // Render quantum particle system
  const QuantumParticles = () => {
    const mesh = useRef();
    const light = useRef();
    
    useFrame((state, delta) => {
      if (mesh.current) {
        // Organic movement patterns for nature mode
        if (natureMode) {
          mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
          mesh.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.25;
          mesh.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
        } else {
          // Original movement
          mesh.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1;
          mesh.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
        }
      }
      
      if (light.current) {
        // Gentle, natural light movement
        light.current.position.x = Math.sin(state.clock.elapsedTime * 0.4) * 4;
        light.current.position.y = Math.cos(state.clock.elapsedTime * 0.3) * 3;
        light.current.position.z = Math.sin(state.clock.elapsedTime * 0.2) * 2;
      }
    });
    
    return (
      <>
        <ambientLight 
          intensity={natureMode ? 0.5 : 0.4} 
          color={natureMode ? "#F8F9FA" : "#ffffff"} 
        />
        <pointLight 
          ref={light} 
          position={[3, 3, 3]} 
          intensity={natureMode ? 0.9 : 1} 
          color={natureMode ? "#8B7355" : "#ffffff"} 
        />
        <Points ref={mesh} positions={particles} stride={3}>
          <PointMaterial
            transparent
            color={natureMode ? 
              (currentState === 'success' ? "#6EE7B7" : "#8B7355") : 
              (currentState === 'success' ? "#6EE7B7" : "#0EA5E9")
            }
            size={natureMode ? 0.035 : 0.025}
            sizeAttenuation={true}
            depthWrite={false}
            opacity={natureMode ? 0.7 : 0.8}
          />
        </Points>
      </>
    );
  };
  
  // Render dimensional SVG based on current state
  const renderDimensionalSVG = () => {
    const dimensionProps = {
      className: styles.quantumSvg,
      style: {
        transform: `scale(${scale.get()}) rotate(${rotation.get()}rad)`,
        opacity: opacity.get()
      }
    };
    
    // Nature Distilled color palette
    const colors = natureMode
      ? { primary: '#8B7355', secondary: '#A89475', tertiary: '#CBB99A', accent: '#6EE7B7' }
      : { primary: '#6EE7B7', secondary: '#0EA5E9', tertiary: '#F87171', accent: '#6EE7B7' };
    
    switch (currentState) {
      case 'potential':
        if (natureMode) {
          // Organic ripple — concentric circles like water ripples
          return (
            <animated.svg {...dimensionProps} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke={colors.primary} strokeWidth="1.5" opacity="0.4">
                <animate attributeName="r" values="38;42;38" dur="4s" repeatCount="indefinite" />
              </circle>
              <circle cx="50" cy="50" r="32" fill="none" stroke={colors.secondary} strokeWidth="1" opacity="0.5">
                <animate attributeName="r" values="28;32;28" dur="3.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="50" cy="50" r="22" fill="none" stroke={colors.tertiary} strokeWidth="1" opacity="0.6">
                <animate attributeName="r" values="18;22;18" dur="3s" repeatCount="indefinite" />
              </circle>
              {/* Growth ring detail */}
              <circle cx="50" cy="50" r="12" fill="none" stroke={colors.accent} strokeWidth="0.5" opacity="0.3">
                <animate attributeName="r" values="10;12;10" dur="2.5s" repeatCount="indefinite" />
              </circle>
            </animated.svg>
          );
        }
        return (
          <animated.svg {...dimensionProps} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#6EE7B7" strokeWidth="2">
              <animate attributeName="r" values="40;45;40" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="50" cy="50" r="35" fill="none" stroke="#0EA5E9" strokeWidth="1">
              <animate attributeName="r" values="30;35;30" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="50" cy="50" r="25" fill="none" stroke="#F87171" strokeWidth="1">
              <animate attributeName="r" values="20;25;20" dur="5s" repeatCount="indefinite" />
            </circle>
          </animated.svg>
        );
        
      case 'focus':
        if (natureMode) {
          // Fibonacci spiral — golden ratio path
          const phi = 1.618;
          const spiralPoints = [];
          for (let t = 0; t < 4 * Math.PI; t += 0.15) {
            const r = 3 * Math.pow(phi, t / (2 * Math.PI));
            const x = 50 + r * Math.cos(t);
            const y = 50 + r * Math.sin(t);
            if (x >= 2 && x <= 98 && y >= 2 && y <= 98) {
              spiralPoints.push(`${x},${y}`);
            }
          }
          const spiralPath = `M${spiralPoints.join(' L')}`;
          return (
            <animated.svg {...dimensionProps} viewBox="0 0 100 100">
              <path d={spiralPath} fill="none" stroke={colors.primary} strokeWidth="1.5" strokeLinecap="round" opacity="0.7">
                <animate attributeName="stroke-dasharray" values="0,500;500,0" dur="4s" repeatCount="indefinite" />
              </path>
              <circle cx="50" cy="50" r="3" fill={colors.accent} opacity="0.8">
                <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
              </circle>
            </animated.svg>
          );
        }
        return (
          <animated.svg {...dimensionProps} viewBox="0 0 100 100">
            <polygon points="50,15 85,85 15,85" fill="none" stroke="#0EA5E9" strokeWidth="2">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 50 50"
                to="360 50 50"
                dur="10s"
                repeatCount="indefinite"
              />
            </polygon>
            <line x1="50" y1="30" x2="50" y2="70" stroke="#6EE7B7" strokeWidth="2">
              <animate attributeName="y2" values="70;50;70" dur="2s" repeatCount="indefinite" />
            </line>
            <line x1="30" y1="50" x2="70" y2="50" stroke="#6EE7B7" strokeWidth="2">
              <animate attributeName="x2" values="70;50;70" dur="2s" repeatCount="indefinite" />
            </line>
          </animated.svg>
        );
        
      case 'success':
        if (natureMode) {
          // Organic leaf vein — branching paths
          return (
            <animated.svg {...dimensionProps} viewBox="0 0 100 100">
              <path 
                d="M20,80 Q50,20 80,80" 
                fill="none" 
                stroke={colors.accent} 
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.8"
              >
                <animate attributeName="stroke-dasharray" values="0,200;200,0" dur="1.5s" fill="freeze" />
              </path>
              <path 
                d="M30,75 Q50,35 70,75" 
                fill="none" 
                stroke={colors.secondary} 
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.5"
              >
                <animate attributeName="stroke-dasharray" values="0,150;150,0" dur="1.2s" fill="freeze" />
              </path>
              <circle cx="50" cy="50" r="3" fill={colors.accent} opacity="0.9">
                <animate attributeName="r" values="2;5;2" dur="2s" repeatCount="indefinite" />
              </circle>
            </animated.svg>
          );
        }
        return (
          <animated.svg {...dimensionProps} viewBox="0 0 100 100">
            <path 
              d="M20,50 L40,70 L80,30" 
              fill="none" 
              stroke="#6EE7B7" 
              strokeWidth="4"
              strokeLinecap="round"
            >
              <animate 
                attributeName="stroke-dasharray" 
                values="0,100;100,0" 
                dur="1s" 
                fill="freeze"
              />
            </path>
            <circle cx="50" cy="50" r="45" fill="none" stroke="#6EE7B7" strokeWidth="1" opacity="0.3">
              <animate attributeName="r" values="45;50;45" dur="3s" repeatCount="indefinite" />
            </circle>
          </animated.svg>
        );
        
      default:
        if (natureMode) {
          // Organic seed — expanding growth rings
          return (
            <animated.svg {...dimensionProps} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="35" fill="none" stroke={colors.secondary} strokeWidth="1" opacity="0.4">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 50 50"
                  to="360 50 50"
                  dur="20s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="50" cy="50" r="25" fill="none" stroke={colors.primary} strokeWidth="1" opacity="0.5">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="360 50 50"
                  to="0 50 50"
                  dur="15s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="50" cy="50" r="15" fill="none" stroke={colors.accent} strokeWidth="1" opacity="0.6">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 50 50"
                  to="360 50 50"
                  dur="10s"
                  repeatCount="indefinite"
                />
              </circle>
            </animated.svg>
          );
        }
        return (
          <animated.svg {...dimensionProps} viewBox="0 0 100 100">
            <rect x="10" y="10" width="80" height="80" rx="10" fill="none" stroke="#0EA5E9" strokeWidth="2">
              <animate attributeName="width" values="80;90;80" dur="4s" repeatCount="indefinite" />
              <animate attributeName="height" values="80;90;80" dur="4s" repeatCount="indefinite" />
            </rect>
            <circle cx="50" cy="50" r="30" fill="none" stroke="#6EE7B7" strokeWidth="1">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 50 50"
                to="360 50 50"
                dur="8s"
                repeatCount="indefinite"
              />
            </circle>
          </animated.svg>
        );
    }
  };
  
  return (
    <div 
      ref={logoRef}
      className={`${styles.quantumKineticLogo} ${natureMode ? styles.natureMode : ''} ${className}`}
      style={{ width: size, height: size }}
      onMouseMove={interactive ? handleMouseMove : undefined}
      onMouseEnter={interactive ? handleMouseEnter : undefined}
      onMouseLeave={interactive ? handleMouseLeave : undefined}
      onMouseDown={interactive ? handleMouseDown : undefined}
      onMouseUp={interactive ? handleMouseUp : undefined}
    >
      {/* Quantum Particle Background */}
      <div className={styles.quantumParticles}>
        <Canvas camera={{ position: [0, 0, 1] }}>
          <QuantumParticles />
        </Canvas>
      </div>
      
      {/* Dimensional SVG */}
      <div className={styles.dimensionalContainer}>
        {renderDimensionalSVG()}
      </div>
      
      {/* Quantum Superposition Overlay */}
      {quantumSuperposition.length > 0 && (
        <div className={styles.superpositionOverlay}>
          {quantumSuperposition.map((state, index) => (
            <div 
              key={index} 
              className={styles.superpositionState}
              style={{
                opacity: state.probability,
                transform: `scale(${1 + state.intensity * 0.2})`
              }}
            >
              {state.icon}
            </div>
          ))}
        </div>
      )}
      
      {/* Entropy Visualization */}
      <div 
        className={styles.entropyIndicator}
        style={{
          opacity: entropy,
          background: `radial-gradient(circle, #F87171 ${entropy * 100}%, transparent)`
        }}
      />
      
      {/* State Indicator */}
      <div className={styles.stateIndicator}>
        {currentState.replace('-', ' ')}
      </div>
    </div>
  );
};

export default QuantumKineticLogo;
