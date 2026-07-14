import type { ReactNode } from 'react';

// One cohesive line-icon set (24x24, currentColor stroke) so every icon in the
// app shares a style instead of mixed emoji. Icons inherit text color.
export type IconName =
  | 'drop' | 'calendar' | 'diagnosis' | 'waves' | 'rain' | 'thermometer'
  | 'check' | 'file' | 'send' | 'sparkles' | 'pool' | 'coins' | 'tap'
  | 'plus' | 'trash' | 'leaf' | 'sun' | 'help' | 'globe' | 'back'
  | 'trophy' | 'calculator' | 'tag' | 'bell' | 'chart' | 'sprout'
  | 'sandy' | 'loam' | 'clay' | 'furrow' | 'sprinkler' | 'droplet-grid'
  | 'user' | 'chevron' | 'growth' | 'satellite' | 'pin'
  | 'mic' | 'stop' | 'speaker';

const P: Record<IconName, ReactNode> = {
  drop: <path d="M12 3s6.5 6.8 6.5 11.2A6.5 6.5 0 0 1 5.5 14.2C5.5 9.8 12 3 12 3Z" />,
  'droplet-grid': <><path d="M12 3s6.5 6.8 6.5 11.2A6.5 6.5 0 0 1 5.5 14.2C5.5 9.8 12 3 12 3Z" /><path d="M9 14.5a3 3 0 0 0 3 3" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></>,
  diagnosis: <><path d="M3 12h4l2-5 3 10 2-5h5" /><circle cx="12" cy="12" r="9" opacity="0.35" /></>,
  waves: <><path d="M2 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /><path d="M2 13c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /><path d="M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /></>,
  rain: <><path d="M7 15a4.5 4.5 0 0 1-.5-9 6 6 0 0 1 11.5 1.5A3.8 3.8 0 0 1 17 15" /><path d="M8 19l-1 2M12 19l-1 2M16 19l-1 2" /></>,
  thermometer: <path d="M14 5a2 2 0 0 0-4 0v8.3a4 4 0 1 0 4 0V5Z" />,
  check: <path d="M20 6 9 17l-5-5" />,
  file: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h4" /></>,
  send: <><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7Z" /></>,
  sparkles: <><path d="M12 3l1.7 4.6L18 9.3l-4.3 1.7L12 15.6l-1.7-4.6L6 9.3l4.3-1.7L12 3Z" /><path d="M18.5 14.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" /></>,
  pool: <><path d="M2 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /><path d="M2 19c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /><path d="M7 12V5M17 12V5M7 8h10" /></>,
  coins: <><ellipse cx="8" cy="7" rx="5" ry="2.5" /><path d="M3 7v5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V7" /><path d="M11 15.2c.6 1.2 2.6 2.1 5 2.1 2.8 0 5-1.1 5-2.5v-5c0-1.3-1.9-2.3-4.4-2.5" /></>,
  tap: <><circle cx="12" cy="12" r="3" /><path d="M12 4V6M12 18v2M4 12h2M18 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  trash: <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M6 6l1 14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-14M10 11v6M14 11v6" />,
  leaf: <><path d="M4 20c0-8 6-13 16-13 0 10-6 15-16 13Z" /><path d="M4 20c3-6 7-9 12-10" /></>,
  sprout: <><path d="M12 21v-8" /><path d="M12 13C12 9 9 6 5 6c0 4 3 7 7 7Z" /><path d="M12 13c0-3.5 3-6 7-6 0 3.5-3 6-7 6Z" /></>,
  growth: <><path d="M3 3v18h18" /><path d="M7 15l4-4 3 3 6-7" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.5 4.5l1.5 1.5M18 18l1.5 1.5M19.5 4.5 18 6M6 18l-1.5 1.5" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 0 1 4.6 1.2c0 1.6-2.1 1.9-2.1 3.3" /><path d="M12 17.5v.01" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.7 2.7 2.7 15.3 0 18M12 3c-2.7 2.7-2.7 15.3 0 18" /></>,
  back: <path d="M15 6l-6 6 6 6" />,
  chevron: <path d="M9 6l6 6-6 6" />,
  trophy: <><path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" /><path d="M7 6H5a2 2 0 0 0 0 4h2M17 6h2a2 2 0 0 1 0 4h-2M9 20h6M12 13v7" /></>,
  calculator: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8" /><path d="M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" /></>,
  tag: <><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-6.2-6.2a2 2 0 0 1-.6-1.4V5a1 1 0 0 1 1-1h7.9a2 2 0 0 1 1.4.6l6.5 6.5a2 2 0 0 1 0 2.3Z" /><circle cx="8.5" cy="8.5" r="1.2" /></>,
  bell: <><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M10.5 20a1.6 1.6 0 0 0 3 0" /></>,
  chart: <path d="M4 20V4M4 20h16M8 20v-6M12 20v-10M16 20v-4" />,
  user: <><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></>,
  sandy: <><circle cx="17" cy="7" r="2.2" /><path d="M3 17c3-3.5 5-3.5 8 0M9 20c3-3.5 5-3.5 8 0" opacity="0.9" /><path d="M3 20c1.5-2 3-2 4.5 0" /></>,
  loam: <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 11h18" /><path d="M7 8.5v.01M12 8.5v.01M16 14v.01M9 14v.01" /></>,
  clay: <><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="M3 12h18M12 5v7M8 12v7M16 12v7" /></>,
  furrow: <path d="M4 8c2 1.5 14 1.5 16 0M4 13c2 1.5 14 1.5 16 0M4 18c2 1.5 14 1.5 16 0" />,
  sprinkler: <><path d="M12 4v5" /><path d="M8 9h8l-1 11H9L8 9Z" /><path d="M12 2v.01M6 5l.7.7M18 5l-.7.7" /></>,
  satellite: <><path d="M6.5 10.5 3 14l3 3 3.5-3.5" /><path d="M13.5 17.5 10 21l-3-3 3.5-3.5" /><path d="m9 12 3-3" /><path d="M10.5 7.5 16 2l6 6-5.5 5.5-6-6Z" /><path d="M16 16a4 4 0 0 0 4 4M18 21a7 7 0 0 0-7-7" /></>,
  pin: <><path d="M12 21s7-6.3 7-11a7 7 0 0 0-14 0c0 4.7 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></>,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" /></>,
  stop: <rect x="6" y="6" width="12" height="12" rx="2" />,
  speaker: <><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8 8 0 0 1 0 12" /></>,
};

export function Icon({
  name, size = 20, className, strokeWidth = 2.15,
}: { name: IconName; size?: number; className?: string; strokeWidth?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden focusable="false">
      {P[name]}
    </svg>
  );
}
