export function generateBossName(parts, random = Math.random) {
  const adjective = parts.adjectives[Math.floor(random() * parts.adjectives.length)];
  const noun = parts.nouns[Math.floor(random() * parts.nouns.length)];
  const words = parts.order === 'noun-adjective' ? [noun, adjective] : [adjective, noun];
  return words.join(parts.separator);
}
