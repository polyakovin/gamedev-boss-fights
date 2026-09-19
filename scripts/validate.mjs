import { loadContent, validateContent } from '../lib/content.mjs';
const data = await validateContent(await loadContent());
console.log(`Valid: ${data.mechanics.length} mechanic(s), ${data.locales.length} languages.`);
