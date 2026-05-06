export function Logo({ size = 50 }: { size?: number }) {

  return (

    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="logo-glow">

      <defs>

        <filter id="glow">

          <feGaussianBlur stdDeviation="3.5" result="blur"/>

          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>

        </filter>

      </defs>

      <g filter="url(#glow)" stroke="#00ff41" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round">

        <line x1="100" y1="18" x2="100" y2="32"/>

        <line x1="100" y1="32" x2="36" y2="160"/>

        <line x1="36" y1="160" x2="50" y2="160"/>

        <line x1="100" y1="32" x2="164" y2="160"/>

        <line x1="164" y1="160" x2="150" y2="160"/>

        <line x1="50" y1="160" x2="150" y2="160"/>

        <line x1="64" y1="120" x2="136" y2="120"/>

      </g>

      <circle cx="100" cy="18" r="8" fill="#00ff41" filter="url(#glow)"/>

      <circle cx="36" cy="160" r="8" fill="#00ff41" filter="url(#glow)"/>

      <circle cx="164" cy="160" r="8" fill="#00ff41" filter="url(#glow)"/>

      <circle cx="64" cy="120" r="6" fill="#00ff41" filter="url(#glow)"/>

      <circle cx="136" cy="120" r="6" fill="#00ff41" filter="url(#glow)"/>

    </svg>

  )

}
