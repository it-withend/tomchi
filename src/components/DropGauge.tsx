// Signature element: a droplet that fills with animated water to the
// level of today's irrigation need relative to peak-season need.
export function DropGauge({ fill, label }: { fill: number; label: string }) {
  const f = Math.max(0.06, Math.min(1, fill));
  const H = 190; // drop viewbox height
  const level = 190 - f * 160; // y of water surface inside drop

  return (
    <div className="relative mx-auto w-44">
      <svg viewBox="0 0 160 200" className="w-full drop-shadow-lg" role="img" aria-label={label}>
        <defs>
          <clipPath id="dropClip">
            <path d="M80 6 C80 6 22 84 22 130 a58 58 0 0 0 116 0 C138 84 80 6 80 6 Z" />
          </clipPath>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2ea3cc" />
            <stop offset="100%" stopColor="#0a5570" />
          </linearGradient>
        </defs>
        {/* vessel */}
        <path
          d="M80 6 C80 6 22 84 22 130 a58 58 0 0 0 116 0 C138 84 80 6 80 6 Z"
          fill="#ffffff" stroke="#0f7ba0" strokeWidth="3"
        />
        <g clipPath="url(#dropClip)">
          <g style={{ transform: `translateY(${level - H}px)`, transition: 'transform 1.2s cubic-bezier(.3,.7,.3,1)' }}>
            {/* two drifting wave layers + body of water, tall enough to cover the drop */}
            <g className="wave slow">
              <path d={`M-200 ${H} q25 -14 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 V${H + 260} H-200 Z`} fill="#7fc3dc" opacity="0.7" />
            </g>
            <g className="wave">
              <path d={`M-200 ${H + 6} q25 -12 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 V${H + 260} H-200 Z`} fill="url(#waterGrad)" />
            </g>
          </g>
        </g>
        {/* highlight */}
        <path d="M52 110 q-8 18 -6 34" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.8" />
      </svg>
    </div>
  );
}
