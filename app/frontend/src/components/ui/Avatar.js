const HUES = 3;

// "Amira Ben Salah" -> "AB", "admin@school.edu" -> "A"
function initialsOf(name) {
  const words = String(name || '')
    .split('@')[0]
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0][0];
  return words[0][0] + words[words.length - 1][0];
}

// The tint is picked from `seed`, so the same person always gets the same colour.
function hueOf(seed) {
  const text = String(seed ?? '');
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = (hash * 31 + text.charCodeAt(i)) % 9973;
  return (hash % HUES) + 1;
}

// Decorative: always shown next to the person's name, so it is hidden from screen readers.
export default function Avatar({ name, initials, seed, solid = false }) {
  const tone = solid ? 'is-solid' : `hue-${hueOf(seed ?? name)}`;
  return (
    <span className={`af-avatar ${tone}`} aria-hidden="true">
      {initials || initialsOf(name)}
    </span>
  );
}
