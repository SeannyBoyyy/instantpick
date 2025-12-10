/**
 * Picks random winners from a list of entries
 * @param {string[]} entries - Array of entry names
 * @param {number} count - Number of winners to select (default: 10)
 * @returns {string[]} Array of unique winner names
 */
export function pickWinners(entries, count = 10) {
  // Filter out empty entries and get unique names
  const unique = [...new Set(entries.filter(Boolean).map(e => e.trim()).filter(e => e.length > 0))];
  
  // Fisher-Yates shuffle for better randomization
  const shuffled = [...unique];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Return the requested number of winners (or all if less available)
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Parses textarea content into array of entries
 * @param {string} text - Multiline text content
 * @returns {string[]} Array of entry names
 */
export function parseEntries(text) {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

/**
 * Gets unique entries and identifies duplicates
 * @param {string[]} entries - Array of entry names
 * @returns {{ unique: string[], duplicates: string[] }}
 */
export function getDuplicateInfo(entries) {
  const seen = new Set();
  const duplicates = new Set();
  
  entries.forEach(entry => {
    if (seen.has(entry)) {
      duplicates.add(entry);
    }
    seen.add(entry);
  });
  
  return {
    unique: [...seen],
    duplicates: [...duplicates]
  };
}
