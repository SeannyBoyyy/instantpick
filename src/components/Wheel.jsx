import { useRef, useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

// Color theme palettes
export const COLOR_THEMES = {
  teal: {
    name: 'Teal & Cyan',
    colors: [
      '#0d9488', '#14b8a6', '#5eead4', '#99f6e4',
      '#0891b2', '#06b6d4', '#67e8f9', '#a5f3fc',
      '#0284c7', '#0ea5e9', '#7dd3fc', '#bae6fd',
    ]
  },
  rainbow: {
    name: 'Rainbow',
    colors: [
      '#ef4444', '#f97316', '#eab308', '#22c55e',
      '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
      '#f43f5e', '#fb923c', '#facc15', '#4ade80',
    ]
  },
  purple: {
    name: 'Purple & Pink',
    colors: [
      '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd',
      '#db2777', '#ec4899', '#f472b6', '#f9a8d4',
      '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe',
    ]
  },
  ocean: {
    name: 'Ocean Blue',
    colors: [
      '#1e40af', '#2563eb', '#3b82f6', '#60a5fa',
      '#0e7490', '#0891b2', '#22d3ee', '#67e8f9',
      '#0f766e', '#14b8a6', '#2dd4bf', '#5eead4',
    ]
  },
  sunset: {
    name: 'Sunset',
    colors: [
      '#dc2626', '#ea580c', '#d97706', '#ca8a04',
      '#f87171', '#fb923c', '#fbbf24', '#facc15',
      '#b91c1c', '#c2410c', '#b45309', '#a16207',
    ]
  },
  forest: {
    name: 'Forest',
    colors: [
      '#166534', '#15803d', '#22c55e', '#4ade80',
      '#365314', '#3f6212', '#65a30d', '#84cc16',
      '#14532d', '#166534', '#16a34a', '#22c55e',
    ]
  },
  monochrome: {
    name: 'Monochrome',
    colors: [
      '#1f2937', '#374151', '#4b5563', '#6b7280',
      '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6',
      '#111827', '#1f2937', '#374151', '#4b5563',
    ]
  },
};

// Create realistic roulette tick sound - soft wooden click
const createTickSound = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  return (volume = 0.15) => {
    // Create a short noise burst for a natural click sound
    const bufferSize = audioContext.sampleRate * 0.015; // 15ms click
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate filtered noise that sounds like a wooden click
    for (let i = 0; i < bufferSize; i++) {
      // Quick attack, fast decay
      const envelope = Math.exp(-i / (bufferSize * 0.1));
      data[i] = (Math.random() * 2 - 1) * envelope;
    }
    
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    
    // Filter to make it sound more like wood/plastic click
    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000; // Focus on mid frequencies
    filter.Q.value = 1;
    
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    source.start();
  };
};

// Gentle win chime - softer and more pleasant
const createWinSound = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  return () => {
    // Softer, more pleasant bell-like tones
    const notes = [880, 1108.73, 1318.51]; // A5, C#6, E6 (A major chord)
    
    notes.forEach((freq, i) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      const startTime = audioContext.currentTime + i * 0.08;
      // Much softer volume
      gainNode.gain.setValueAtTime(0.08, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.5);
    });
  };
};

export default function Wheel({ entries, isSpinning, onSpinComplete, winners = [], soundEnabled = true, colorTheme = 'teal' }) {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [targetRotation, setTargetRotation] = useState(0);
  const spinStartedRef = useRef(false);
  const lastTickAngleRef = useRef(0);
  const tickSoundRef = useRef(null);
  const winSoundRef = useRef(null);
  
  // Get colors from theme
  const COLORS = COLOR_THEMES[colorTheme]?.colors || COLOR_THEMES.teal.colors;
  
  // Initialize audio on first user interaction
  useEffect(() => {
    const initAudio = () => {
      if (!tickSoundRef.current) {
        tickSoundRef.current = createTickSound();
      }
      if (!winSoundRef.current) {
        winSoundRef.current = createWinSound();
      }
      document.removeEventListener('click', initAudio);
    };
    document.addEventListener('click', initAudio);
    return () => document.removeEventListener('click', initAudio);
  }, []);
  
  // Get unique entries for the wheel - memoize to prevent recreation
  const displayEntries = useMemo(() => {
    const uniqueEntries = [...new Set(entries.filter(Boolean))];
    return uniqueEntries.length > 0 ? uniqueEntries : ['Add entries...'];
  }, [entries]);
  
  // Draw the wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;
    
    ctx.clearRect(0, 0, size, size);
    
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-center, -center);
    
    const sliceAngle = (2 * Math.PI) / displayEntries.length;
    
    displayEntries.forEach((entry, index) => {
      const startAngle = index * sliceAngle - Math.PI / 2;
      const endAngle = startAngle + sliceAngle;
      
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      
      ctx.fillStyle = COLORS[index % COLORS.length];
      ctx.fill();
      
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + sliceAngle / 2);
      
      const fontSize = Math.max(10, Math.min(16, 200 / displayEntries.length));
      
      ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#1f2937';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      
      const textRadius = radius * 0.75;
      const displayText = entry.length > 12 ? entry.substring(0, 11) + '...' : entry;
      ctx.fillText(displayText, textRadius, 0);
      
      ctx.restore();
    });
    
    ctx.restore();
    
    ctx.beginPath();
    ctx.arc(center, center, 25, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.stroke();
    
  }, [displayEntries, rotation, COLORS]);
  
  // Handle spinning animation - only set target once when spin starts
  useEffect(() => {
    if (isSpinning && !spinStartedRef.current && winners.length > 0) {
      spinStartedRef.current = true;
      
      const winnerIndex = displayEntries.findIndex(entry => entry === winners[0]);
      
      // console.log('=== SPIN CALCULATION START ===');
      // console.log('Winner:', winners[0]);
      // console.log('Winner index in wheel:', winnerIndex);
      // console.log('Total entries:', displayEntries.length);
      // console.log('All entries:', displayEntries);
      
      if (winnerIndex !== -1) {
        const sliceAngle = 360 / displayEntries.length;
        // console.log('Slice angle (degrees per entry):', sliceAngle);
        
        // The wheel is drawn with:
        // - Slice 0 starts at -90° (top) and goes clockwise
        // - When rotation = 0, slice 0's CENTER is at: -90 + sliceAngle/2
        // - The arrow points at the TOP (at -90° or 270° in standard coords)
        
        // At rotation = 0:
        // - Slice i's center is at angle: -90 + i*sliceAngle + sliceAngle/2
        // - Which equals: -90 + (i + 0.5) * sliceAngle
        
        // For the winner slice to be at the top (under the arrow at -90°):
        // We need to rotate so winner's center aligns with -90° (top)
        // Winner's initial center position: -90 + (winnerIndex + 0.5) * sliceAngle
        // After rotation R, winner's center is at: -90 + (winnerIndex + 0.5) * sliceAngle + R
        // We want this to equal -90° (or equivalently 270°), so:
        // R = -((winnerIndex + 0.5) * sliceAngle)
        // But we want positive rotation, so: R = 360 - ((winnerIndex + 0.5) * sliceAngle) % 360
        
        const winnerCenterOffset = (winnerIndex + 0.5) * sliceAngle;
        // console.log('Winner center offset from top (at rotation=0):', winnerCenterOffset);
        
        // To bring winner to top, we rotate backwards by this amount (or forwards by 360 - amount)
        let targetFinalPosition = (360 - winnerCenterOffset) % 360;
        if (targetFinalPosition < 0) targetFinalPosition += 360;
        // console.log('Target final rotation (mod 360) to place winner at top:', targetFinalPosition);
        
        const currentMod = ((rotation % 360) + 360) % 360;
        // console.log('Current rotation mod 360:', currentMod);
        
        let extraRotation = targetFinalPosition - currentMod;
        if (extraRotation < 0) extraRotation += 360;
        // console.log('Extra rotation needed:', extraRotation);
        
        // Random spins between 5-8 to prevent prediction/cheating
        const fullSpins = Math.floor(5 + Math.random() * 4);
        const totalRotation = fullSpins * 360 + extraRotation;
        
        // console.log('Full spins:', fullSpins);
        // console.log('Total rotation to add:', totalRotation);
        // console.log('Final target rotation:', rotation + totalRotation);
        // console.log('Final rotation mod 360:', ((rotation + totalRotation) % 360).toFixed(2));
        // console.log('=== SPIN CALCULATION END ===');
        
        setTargetRotation(rotation + totalRotation);
      }
    }
    
    if (!isSpinning) {
      spinStartedRef.current = false;
    }
  }, [isSpinning, winners, displayEntries, rotation]);
  
  // Animate rotation
  useEffect(() => {
    if (!isSpinning) return;
    
    let animationId;
    const startRotation = rotation;
    const startTime = Date.now();
    const duration = 3000;
    const sliceAngle = 360 / displayEntries.length;
    
    lastTickAngleRef.current = startRotation;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const currentRotation = startRotation + (targetRotation - startRotation) * eased;
      setRotation(currentRotation);
      
      if (soundEnabled && tickSoundRef.current) {
        const rotationSinceLastTick = currentRotation - lastTickAngleRef.current;
        if (rotationSinceLastTick >= sliceAngle) {
          const speed = (1 - progress);
          const volume = Math.max(0.1, Math.min(0.4, speed * 0.5));
          tickSoundRef.current(volume);
          lastTickAngleRef.current = currentRotation;
        }
      }
      
      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        // Log final position verification
        const finalRotationMod = ((currentRotation % 360) + 360) % 360;
        const sliceAngleDeg = 360 / displayEntries.length;
        
        // console.log('=== SPIN COMPLETE VERIFICATION ===');
        // console.log('Final rotation:', currentRotation.toFixed(2));
        // console.log('Final rotation mod 360:', finalRotationMod.toFixed(2));
        
        // Calculate which slice is at the top (arrow position)
        // At rotation R, slice i's center is at: (i + 0.5) * sliceAngle + R - 90° from horizontal
        // The arrow is at top (-90° from horizontal or 270° in standard)
        // So we need: (i + 0.5) * sliceAngle + R ≡ 0 (mod 360) for slice i to be at top
        // Therefore: i = ((-R) / sliceAngle - 0.5) mod numSlices
        
        // Simpler: which slice center is closest to the top after rotation?
        let closestSlice = 0;
        let closestDistance = 360;
        
        displayEntries.forEach((entry, i) => {
          // Slice i's center after rotation (relative to top being 0)
          const sliceCenterAfterRotation = ((i + 0.5) * sliceAngleDeg + finalRotationMod) % 360;
          // Distance from top (0 degrees)
          const distanceFromTop = Math.min(sliceCenterAfterRotation, 360 - sliceCenterAfterRotation);
          
          // console.log(`  Slice ${i} (${entry}): center after rotation = ${sliceCenterAfterRotation.toFixed(1)}°, distance from top = ${distanceFromTop.toFixed(1)}°`);
          
          if (distanceFromTop < closestDistance) {
            closestDistance = distanceFromTop;
            closestSlice = i;
          }
        });
        
        const entryUnderArrow = displayEntries[closestSlice];
        // console.log('---');
        // console.log('Slice under arrow (index):', closestSlice);
        // console.log('Entry under arrow:', entryUnderArrow);
        // console.log('Expected winner:', winners[0]);
        // console.log('Match:', entryUnderArrow === winners[0] ? '✓ CORRECT' : '✗ MISMATCH');
        // console.log('=== END VERIFICATION ===');
        
        if (soundEnabled && winSoundRef.current) {
          winSoundRef.current();
        }
        onSpinComplete?.();
      }
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isSpinning, targetRotation, soundEnabled, displayEntries]);
  
  return (
    <div className="wheel-container relative flex items-center justify-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
        <div className="w-0 h-0 border-l-[15px] border-l-transparent 
                        border-r-[15px] border-r-transparent 
                        border-t-[25px] border-t-gray-600
                        drop-shadow-md" />
      </div>
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="max-w-full h-auto"
        />
      </motion.div>
      
      {displayEntries.length === 1 && displayEntries[0] === 'Add entries...' && (
        <div className="absolute inset-0 flex items-center justify-center 
                        bg-white/80 rounded-full">
          <p className="text-gray-400 text-center px-8">
            Add entries to<br />start spinning!
          </p>
        </div>
      )}
    </div>
  );
}
