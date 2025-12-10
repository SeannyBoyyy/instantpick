import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Professional color palette - muted teal/blue tones
const COLORS = [
  '#0d9488', // teal-600
  '#14b8a6', // teal-500
  '#5eead4', // teal-300
  '#99f6e4', // teal-200
  '#0891b2', // cyan-600
  '#06b6d4', // cyan-500
  '#67e8f9', // cyan-300
  '#a5f3fc', // cyan-200
  '#0284c7', // sky-600
  '#0ea5e9', // sky-500
  '#7dd3fc', // sky-300
  '#bae6fd', // sky-200
];

export default function Wheel({ entries, isSpinning, winner, onSpinComplete }) {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [targetRotation, setTargetRotation] = useState(0);
  
  // Get unique entries for the wheel
  const uniqueEntries = [...new Set(entries.filter(Boolean))];
  const displayEntries = uniqueEntries.length > 0 ? uniqueEntries : ['Add entries...'];
  
  // Draw the wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;
    
    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Save state and apply rotation
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-center, -center);
    
    const sliceAngle = (2 * Math.PI) / displayEntries.length;
    
    // Draw slices
    displayEntries.forEach((entry, index) => {
      const startAngle = index * sliceAngle - Math.PI / 2;
      const endAngle = startAngle + sliceAngle;
      
      // Draw slice
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      
      ctx.fillStyle = COLORS[index % COLORS.length];
      ctx.fill();
      
      // Draw border
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + sliceAngle / 2);
      
      // Calculate font size based on slice count and text length
      const maxTextLength = Math.min(entry.length, 12);
      const fontSize = Math.max(10, Math.min(16, 200 / displayEntries.length));
      
      ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#1f2937';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      
      // Position text
      const textRadius = radius * 0.75;
      const displayText = entry.length > 12 ? entry.substring(0, 11) + '…' : entry;
      ctx.fillText(displayText, textRadius, 0);
      
      ctx.restore();
    });
    
    ctx.restore();
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(center, center, 25, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.stroke();
    
  }, [displayEntries, rotation]);
  
  // Handle spinning animation
  useEffect(() => {
    if (isSpinning && winner) {
      // Find the index of the winner in the display entries
      const winnerIndex = displayEntries.indexOf(winner);
      if (winnerIndex === -1) return;
      
      // Calculate the angle for this slice
      // The pointer is at the top (12 o'clock position)
      // Slices are drawn starting from -90 degrees (top)
      const sliceAngle = 360 / displayEntries.length;
      
      // Calculate target angle: we want the winner slice center to be at top (0 degrees)
      // The slice at index 0 starts at top, so we need to rotate to bring winnerIndex to top
      // Add half slice to land in the middle of the slice
      const targetAngle = (winnerIndex * sliceAngle) + (sliceAngle / 2);
      
      // Random number of full rotations (3-4) plus the exact angle to land on winner
      const spins = 3 + Math.floor(Math.random() * 2);
      const newTarget = rotation + (spins * 360) + targetAngle - (rotation % 360);
      
      setTargetRotation(newTarget);
    }
  }, [isSpinning, winner, displayEntries]);
  
  // Animate rotation
  useEffect(() => {
    if (!isSpinning) return;
    
    let animationId;
    const startRotation = rotation;
    const startTime = Date.now();
    const duration = 2500; // 2.5 seconds
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const currentRotation = startRotation + (targetRotation - startRotation) * eased;
      setRotation(currentRotation);
      
      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        onSpinComplete?.();
      }
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isSpinning, targetRotation]);
  
  return (
    <div className="wheel-container relative flex items-center justify-center">
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
        <div className="w-0 h-0 border-l-[15px] border-l-transparent 
                        border-r-[15px] border-r-transparent 
                        border-t-[25px] border-t-gray-600
                        drop-shadow-md" />
      </div>
      
      {/* Wheel Canvas */}
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
      
      {/* Entry count overlay */}
      {uniqueEntries.length === 0 && (
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
