/**
 * Inline SVG icon set. Every icon inherits currentColor and renders crisply at
 * any size. `icon()` returns a trusted string built only from this local map —
 * icon names are internal constants, never user input.
 */

const PATHS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h5v-6h4v6h5V9.5"/>',
  dashboard: '<rect x="3" y="3" width="7" height="8" rx="1.6"/><rect x="14" y="3" width="7" height="5" rx="1.6"/><rect x="14" y="12" width="7" height="9" rx="1.6"/><rect x="3" y="15" width="7" height="6" rx="1.6"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  'book-open': '<path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2.4 5.6L8 16l2.4-5.6z"/>',
  assignment: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2.5h6V4M8.5 10h7M8.5 14h7M8.5 18h4"/>',
  clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2.5h6V4M8.5 10h7M8.5 14h7"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 16v-5M12 16V7M17 16v-8"/>',
  'chart-bar': '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  progress: '<path d="M3 17l5-5 4 4 8-9"/><path d="M15 7h5v5"/>',
  bookmark: '<path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
  users: '<circle cx="9" cy="8" r="3.4"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 5.2A3.4 3.4 0 0 1 16 11M18 14.4c2.1.7 3.5 2.3 3.5 5.6"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  'arrow-right': '<path d="M4 12h16M14 6l6 6-6 6"/>',
  'arrow-left': '<path d="M20 12H4M10 6l-6 6 6 6"/>',
  'arrow-up-right': '<path d="M7 17 17 7M8 7h9v9"/>',
  'chevron-right': '<path d="m9 5 7 7-7 7"/>',
  'chevron-left': '<path d="m15 5-7 7 7 7"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'chevron-up': '<path d="m6 15 6-6 6 6"/>',
  check: '<path d="m4 12.5 5 5L20 6.5"/>',
  'check-circle': '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.7 2.7L16.5 9"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  play: '<path d="M8 5.5v13l11-6.5z"/>',
  quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.2 9a3 3 0 0 1 5.6 1.4c0 2-2.8 2.2-2.8 4M12 17.5h.01"/>',
  sparkles: '<path d="m12 3 1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.9 2.1 2.1.9-2.1.9L19 21l-.9-2.1-2.1-.9 2.1-.9z"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4v1.5A3.5 3.5 0 0 0 7.5 11H8M16 6h4v1.5A3.5 3.5 0 0 1 16.5 11H16M12 13v5M8 21h8M9 21v-3h6v3"/>',
  flame: '<path d="M12 22c4 0 7-2.8 7-7 0-3-1.6-5.4-4-7.5.3 2.4-.7 3.9-2 4.5.3-3.5-1.4-7-4.5-9.5.2 3.5-1.4 5.6-3 8A7.7 7.7 0 0 0 5 15c0 4.2 3 7 7 7z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 15v3.5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V15"/>',
  download: '<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 15v3.5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V15"/>',
  file: '<path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z"/><path d="M14 2v5h5M9 13h6M9 17h6"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6"/><path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13M9 7V4h6v3"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
  flask: '<path d="M9 2h6M10 2v6L4.5 19a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 8V2"/><path d="M7.5 15h9"/>',
  beaker: '<path d="M6 2h12M7 2v16a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V2"/><path d="M7 12h10"/>',
  chip: '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  planet: '<circle cx="12" cy="12" r="7"/><path d="M5 12c0 2.8 3.1 5 7 5s7-2.2 7-5" opacity=".45"/><path d="M3.5 15.5c-1.8 1.1-2.4 2.4-1.6 3.1 1.3 1.3 6.4-.8 11.4-4.7S21.4 5 20.1 3.7c-.7-.7-2 .2-3.5 2"/>',
  sprout: '<path d="M12 21v-8"/><path d="M12 13C12 8.5 8.8 6 4 6c0 4.7 3.2 7 8 7zM12 13c0-3.6 2.4-5.5 6-5.5 0 3.6-2.4 5.5-6 5.5z"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"/><path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12"/>',
  wrench: '<path d="M14.7 6.3a4.5 4.5 0 0 0-6 6L3 18l3 3 5.7-5.7a4.5 4.5 0 0 0 6-6L14 13l-3-3z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.6 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.6-3.8-9S9.5 5.5 12 3z"/>',
  hand: '<path d="M7 12V6a1.6 1.6 0 0 1 3.2 0v5M10.2 11V4.5a1.6 1.6 0 0 1 3.2 0V11M13.4 11V5.5a1.6 1.6 0 0 1 3.2 0V13M16.6 10.5V8a1.6 1.6 0 0 1 3.2 0v7c0 3.5-2.8 6-6.5 6-2.3 0-3.8-1-5-2.7L4 12.5a1.7 1.7 0 0 1 2.6-2.1L9 12.5"/>',
  calculator: '<rect x="4" y="2" width="16" height="20" rx="2.5"/><rect x="7.5" y="5.5" width="9" height="4" rx="1"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>',
  lightbulb: '<path d="M9 18h6M10 21h4"/><path d="M8.5 15c-1.2-1-2-2.5-2-4.2A5.5 5.5 0 0 1 12 5.2a5.5 5.5 0 0 1 5.5 5.6c0 1.7-.8 3.2-2 4.2-.8.7-1.2 1.3-1.3 2.2H9.8c-.1-.9-.5-1.5-1.3-2.2z"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
  mail: '<rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="m3 6 9 6.5L21 6"/>',
  'eye': '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  'eye-off': '<path d="M3 3l18 18M10.6 5.1A9.9 9.9 0 0 1 12 5c6.4 0 10 7 10 7a15.8 15.8 0 0 1-3.4 4.1M6.2 6.2C3.7 7.9 2 12 2 12s3.6 7 10 7a10 10 0 0 0 4.3-.9"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  alert: '<path d="M12 3 2.5 20h19z"/><path d="M12 9v5M12 17.5h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
  refresh: '<path d="M20 7v5h-5"/><path d="M20 12A8 8 0 1 0 18 6L20 8"/>',
  star: '<path d="m12 3 2.7 5.8 6.3.8-4.6 4.4 1.2 6.3L12 17.4 6.4 20.3l1.2-6.3L3 9.6l6.3-.8z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
  external: '<path d="M14 3h7v7M21 3l-9 9"/><path d="M18 13v5a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3h5"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/>',
  camera: '<path d="M4 7h3l2-3h6l2 3h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/><circle cx="12" cy="13" r="4"/>',
  graduation: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.5V17c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5M22 9v5"/>',
  school: '<path d="M3 21V9l9-5 9 5v12"/><path d="M9 21v-6h6v6M3 21h18M7 11h.01M12 11h.01M17 11h.01"/>',
  'map-pin': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="2.8"/>',
  phone: '<path d="M21 16.5v2.6a2 2 0 0 1-2.2 2A19.7 19.7 0 0 1 2.9 5.2 2 2 0 0 1 4.9 3h2.6a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8.5 10.5a16 16 0 0 0 5 5l1.1-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z"/>',
  send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  layers: '<path d="m12 2 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 8 5-3 5 3-1.5-8"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  notebook: '<rect x="4" y="3" width="15" height="18" rx="2"/><path d="M19 7h2M19 12h2M19 17h2M8 7h6M8 11h6"/>',
  'trending-up': '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  hash: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
  scale: '<path d="M12 3v18M7 21h10M5 7h14M5 7l-3 7a3.5 3.5 0 0 0 7 0zM19 7l3 7a3.5 3.5 0 0 1-7 0z"/>',
  'life-buoy': '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m4.9 4.9 4.2 4.2M14.9 14.9l4.2 4.2M19.1 4.9l-4.2 4.2M9.1 14.9l-4.2 4.2"/>',
  'rotate-ccw': '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  hourglass: '<path d="M7 2h10M7 22h10M7 2v4c0 3 5 5 5 6s-5 3-5 6v4M17 2v4c0 3-5 5-5 6s5 3 5 6v4"/>',
  wifi: '<path d="M2 8.5a15 15 0 0 1 20 0M5.5 12a10 10 0 0 1 13 0M9 15.5a5 5 0 0 1 6 0M12 19h.01"/>',
  offline: '<path d="M3 3l18 18"/><path d="M8.5 8.5A15 15 0 0 1 22 8.5M5.5 12a10 10 0 0 1 5-2.4M12 19h.01"/>',
  spark: '<path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3"/>'
};

const ALIASES = {
  assignment: 'assignment',
  quiz: 'quiz',
  explore: 'compass',
  dashboard: 'dashboard',
  learn: 'book-open',
  progress: 'chart',
  settings: 'settings',
  profile: 'user',
  notifications: 'bell',
  bookmarks: 'bookmark',
  mathematics: 'calculator',
  science: 'flask',
  english: 'book',
  'social-science': 'globe',
  computer: 'chip',
  'computer-studies': 'chip',
  'science-everyday-life': 'flask',
  technology: 'chip',
  'how-things-work': 'gear',
  'space-universe': 'planet',
  'nature-environment': 'leaf',
  'agriculture-farming': 'sprout',
  'machines-engineering': 'wrench',
  'experiments-discoveries': 'beaker',
  'general-knowledge': 'globe',
  'practical-life-skills': 'hand',
  'career-awareness': 'compass',
  'interesting-facts': 'sparkles',
  'multiple-choice': 'list',
  'true-false': 'scale'
};

/**
 * @param {string} name icon key
 * @param {number} size pixel size
 * @param {string} className extra classes
 * @returns {string} trusted SVG markup
 */
export function icon(name, size = 20, className = '') {
  const key = ALIASES[name] || name;
  const markup = PATHS[key] || PATHS.book;
  return `<svg class="icon ${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${markup}</svg>`;
}

export function hasIcon(name) {
  return Boolean(PATHS[ALIASES[name] || name]);
}
