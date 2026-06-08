// Display labels for the project `domains` enum (defined in src/content.config.ts).
// Shared so the gallery filter (projects.astro) and the detail page ([slug].astro)
// show the same human-readable labels instead of the raw kebab-case values.
// Keep these keys in sync with the enum in the schema.
export const DOMAIN_LABELS = {
  web: 'Web',
  mobile: 'Mobile',
  'ai-ml': 'AI / ML',
  cybersecurity: 'Cybersecurity',
  'game-dev': 'Game Dev',
  hardware: 'Hardware',
  systems: 'Systems',
  infrastructure: 'Infrastructure',
} as const;
