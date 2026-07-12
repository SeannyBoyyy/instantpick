import { COLOR_THEMES } from './Wheel';

// Inline SVG wheel logo. Colors follow whichever wheel theme is currently
// selected (matches Wheel.jsx exactly, so the header logo is never out of
// sync with the actual wheel), and stroke/hub colors follow darkMode the
// same way every other icon in the app does.
export default function Logo({ colorTheme = 'teal', darkMode = false, className = 'h-10 w-10' }) {
  const palette = COLOR_THEMES[colorTheme]?.colors || COLOR_THEMES.teal.colors;
  const segmentColors = [palette[0], palette[4], palette[8], palette[1], palette[5], palette[9]];
  const strokeColor = darkMode ? '#f1f5f9' : '#0f172a';
  const hubColor = darkMode ? '#1e293b' : '#ffffff';

  // 6 equal pie segments, 60deg apart, drawn as paths from center (50,50) radius 42
  const segments = segmentColors.map((color, i) => {
    const startAngle = i * 60 - 90;
    const endAngle = startAngle + 60;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const x1 = 50 + 42 * Math.cos(toRad(startAngle));
    const y1 = 50 + 42 * Math.sin(toRad(startAngle));
    const x2 = 50 + 42 * Math.cos(toRad(endAngle));
    const y2 = 50 + 42 * Math.sin(toRad(endAngle));
    return (
      <path
        key={i}
        d={`M50,50 L${x1},${y1} A42,42 0 0,1 ${x2},${y2} Z`}
        fill={color}
      />
    );
  });

  return (
    <svg viewBox="0 0 100 100" className={className} aria-label="InstantPick logo">
      {/* Pointer */}
      <path d="M50,2 L58,16 L42,16 Z" fill={strokeColor} />
      {/* Wheel segments */}
      <g stroke={strokeColor} strokeWidth="2" strokeLinejoin="round">
        {segments}
      </g>
      {/* Outer ring */}
      <circle cx="50" cy="50" r="42" fill="none" stroke={strokeColor} strokeWidth="3" />
      {/* Hub */}
      <circle cx="50" cy="50" r="10" fill={hubColor} stroke={strokeColor} strokeWidth="2.5" />
    </svg>
  );
}
