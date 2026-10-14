import React from 'react';

/*
 * Inline SVG icon set. Line icons use currentColor so CSS controls their colour;
 * illustrated icons (heart, star, avatar) carry the brand fills and take a `filled` prop where needed.
 */

const STROKE = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };

function Svg({ size = 24, viewBox = '0 0 24 24', className, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function SearchIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" {...STROKE} strokeWidth={2} />
      <path d="M15.5 15.5 20 20" {...STROKE} strokeWidth={2} />
    </Svg>
  );
}

export function CloseIcon(props) {
  return (
    <Svg {...props}>
      <path d="M5 5l14 14M19 5L5 19" {...STROKE} strokeWidth={2} />
    </Svg>
  );
}

/** Outlined heart used on recipe cards: white when idle, pink when the recipe is saved. */
export function HeartIcon({ filled = false, ...props }) {
  return (
    <Svg {...props}>
      <path
        d="M12 21.500C12 21.500 2 15 2 8.500C2 5.500 4.200 3.500 6.800 3.500C9 3.500 11 4.800 12 7C13 4.800 15 3.500 17.200 3.500C19.800 3.500 22 5.500 22 8.500C22 15 12 21.500 12 21.500Z"
        fill={filled ? 'var(--color-pink)' : 'var(--color-white)'}
        stroke="var(--color-ink)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Pink heart badge from the header (links to saved recipes). */
export function SavedBadgeIcon(props) {
  return (
    <Svg viewBox="0 0 44 44" size={44} {...props}>
      <path
        d="M22 40C22 40 3 28 3 15C3 9 7.5 5 12.5 5C16.500 5 20 7.500 22 11C24 7.500 27.500 5 31.500 5C36.500 5 41 9 41 15C41 28 22 40 22 40Z"
        fill="var(--color-pink)"
        stroke="var(--color-ink)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Round avatar placeholder: yellow head and shoulders on white. */
export function AvatarIcon({ size = 50, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" className={className} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="avatar-clip">
          <circle cx="25" cy="25" r="24" />
        </clipPath>
      </defs>
      <circle cx="25" cy="25" r="24.25" fill="var(--color-white)" stroke="var(--color-ink)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      <g clipPath="url(#avatar-clip)">
        <circle cx="25" cy="20" r="8.2" fill="var(--color-yellow)" stroke="var(--color-ink)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        <ellipse cx="25" cy="48" rx="15.5" ry="11.5" fill="var(--color-yellow)" stroke="var(--color-ink)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}

export function StarIcon({ filled = true, ...props }) {
  return (
    <Svg {...props}>
      <path
        d="m12 2.8 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1L3.2 9.3l6.1-.9L12 2.8Z"
        fill={filled ? 'var(--color-yellow)' : 'var(--color-white)'}
        stroke="var(--color-ink)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ArrowRightIcon({ size = 24, ...props }) {
  return (
    <Svg viewBox="0 0 24 24" size={size} {...props}>
      <path d="M2 12h20M16 6l6 6-6 6" {...STROKE} strokeWidth={1} />
    </Svg>
  );
}

export function ChevronIcon({ direction = 'down', ...props }) {
  const rotation = { down: 0, up: 180, left: 90, right: -90 }[direction];
  return (
    <Svg {...props}>
      <path d="m6 9 6 6 6-6" {...STROKE} transform={`rotate(${rotation} 12 12)`} />
    </Svg>
  );
}

export function PlusIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 4v16M4 12h16" {...STROKE} strokeWidth={1.4} />
    </Svg>
  );
}

export function MinusIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 12h16" {...STROKE} strokeWidth={1.4} />
    </Svg>
  );
}

export function CheckIcon(props) {
  return (
    <Svg {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" {...STROKE} strokeWidth={1.8} />
    </Svg>
  );
}

export function TrashIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 7h16M9 7V4.5h6V7M6.5 7l.8 12.5h9.4L17.5 7M10 11v5M14 11v5" {...STROKE} strokeWidth={1.3} />
    </Svg>
  );
}

export function DragHandleIcon(props) {
  return (
    <Svg {...props}>
      {[8.5, 15.5].flatMap((cx) => [5, 12, 19].map((cy) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2" fill="currentColor" />))}
    </Svg>
  );
}

export function ImageIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" {...STROKE} strokeWidth={1.3} />
      <circle cx="9" cy="10" r="1.6" {...STROKE} strokeWidth={1.2} />
      <path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5" {...STROKE} strokeWidth={1.2} />
    </Svg>
  );
}

export function ShareIcon(props) {
  return (
    <Svg {...props}>
      <path d="M21 3 3 10.5l7 2.5 2.5 7L21 3Z" fill="var(--color-blue)" stroke="var(--color-ink)" strokeWidth="1.2" strokeLinejoin="round" />
    </Svg>
  );
}

export function PrintIcon(props) {
  return (
    <Svg {...props}>
      <path d="M6 3h8l4 4v14H6V3Z" fill="var(--color-yellow)" stroke="var(--color-ink)" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M14 3v4h4M9 12h6M9 15.5h6" {...STROKE} strokeWidth={1.1} />
    </Svg>
  );
}

export function SaveHeartIcon(props) {
  return (
    <Svg {...props}>
      <path
        d="M12 21.500C12 21.500 2 15 2 8.500C2 5.500 4.200 3.500 6.800 3.500C9 3.500 11 4.800 12 7C13 4.800 15 3.500 17.200 3.500C19.800 3.500 22 5.500 22 8.500C22 15 12 21.500 12 21.500Z"
        fill="var(--color-pink)"
        stroke="var(--color-ink)"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function InstagramIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" {...STROKE} strokeWidth={1.8} />
      <circle cx="12" cy="12" r="4.2" {...STROKE} strokeWidth={1.8} />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </Svg>
  );
}

export function LinkedinIcon(props) {
  return (
    <Svg {...props}>
      <path
        fill="currentColor"
        d="M3.5 9h3.6v11.5H3.5V9Zm1.8-5.6a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2ZM9.4 9h3.4v1.6h.1c.5-.9 1.6-1.9 3.4-1.9 3.6 0 4.3 2.4 4.3 5.5v6.3h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.4V9Z"
      />
    </Svg>
  );
}

export function FacebookIcon({ circle = false, ...props }) {
  if (circle) {
    return (
      <Svg {...props}>
        <circle cx="12" cy="12" r="10.5" fill="currentColor" />
        <path
          fill="var(--color-white)"
          d="M13.4 22.4v-8h2.5l.4-3h-2.9V9.5c0-.8.3-1.4 1.500-1.400h1.500V5.400c-.3 0-1.200-.1-2.200-.1-2.200 0-3.700 1.400-3.700 3.800v2.300H7.900v3h2.600v8h2.900Z"
        />
      </Svg>
    );
  }
  return (
    <Svg {...props}>
      <path
        fill="currentColor"
        d="M13.6 21v-8h2.7l.4-3.200h-3.100V7.800c0-.9.3-1.500 1.600-1.500h1.700V3.400c-.3 0-1.300-.1-2.400-.1-2.400 0-4.100 1.500-4.100 4.200v2.300H7.600V13h2.800v8h3.200Z"
      />
    </Svg>
  );
}

export function XIcon(props) {
  return (
    <Svg {...props}>
      <path fill="currentColor" d="M17.8 3h3L14.2 10.6 22 21h-6.1l-4.8-6.3L5.6 21h-3l7.1-8.1L2.2 3h6.2l4.3 5.7L17.8 3Zm-1.1 16.2h1.7L7.6 4.7H5.8l10.9 14.5Z" />
    </Svg>
  );
}

export function GearIcon(props) {
  return (
    <Svg {...props}>
      <path
        d="M12.2 2h-.4a2 2 0 0 0-2 2v.2a2 2 0 0 1-1 1.7l-.4.2a2 2 0 0 1-2 0l-.2-.1a2 2 0 0 0-2.7.7l-.2.4a2 2 0 0 0 .7 2.7l.2.1a2 2 0 0 1 1 1.7v.5a2 2 0 0 1-1 1.7l-.2.1a2 2 0 0 0-.7 2.7l.2.4a2 2 0 0 0 2.7.7l.2-.1a2 2 0 0 1 2 0l.4.2a2 2 0 0 1 1 1.7v.2a2 2 0 0 0 2 2h.4a2 2 0 0 0 2-2v-.2a2 2 0 0 1 1-1.7l.4-.2a2 2 0 0 1 2 0l.2.1a2 2 0 0 0 2.7-.7l.2-.4a2 2 0 0 0-.7-2.7l-.2-.1a2 2 0 0 1-1-1.7v-.5a2 2 0 0 1 1-1.7l.2-.1a2 2 0 0 0 .7-2.7l-.2-.4a2 2 0 0 0-2.7-.7l-.2.1a2 2 0 0 1-2 0l-.4-.2a2 2 0 0 1-1-1.7V4a2 2 0 0 0-2-2Z"
        {...STROKE}
        strokeWidth={1.2}
      />
      <circle cx="12" cy="12" r="3" {...STROKE} strokeWidth={1.2} />
    </Svg>
  );
}

export function PencilIcon(props) {
  return (
    <Svg {...props}>
      <path d="M17 3.5a2.1 2.1 0 0 1 3 3L7.5 19 3 20.5 4.500 16 17 3.500Z" {...STROKE} strokeWidth={1.3} />
    </Svg>
  );
}
