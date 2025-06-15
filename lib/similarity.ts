"use client"

// Generate mock similarity data between words
export function calculateSimilarities(words: string[]) {
  const similarities = []

  // Create a similarity matrix with mock data
  for (let i = 0; i < words.length; i++) {
    const row = []
    for (let j = 0; j < words.length; j++) {
      if (i === j) {
        // Words are identical to themselves
        row.push(1.0)
      } else {
        // Generate similarity based on word patterns
        // This is a simplified approach that creates more meaningful connections
        // than pure random values
        const word1 = words[i]
        const word2 = words[j]

        // Check for common prefixes or similar word lengths
        const minLength = Math.min(word1.length, word2.length)
        let commonPrefix = 0
        for (let k = 0; k < minLength; k++) {
          if (word1[k] === word2[k]) {
            commonPrefix++
          } else {
            break
          }
        }

        // Calculate similarity based on common prefix and length difference
        const prefixSimilarity = commonPrefix / minLength
        const lengthSimilarity = 1 - Math.abs(word1.length - word2.length) / Math.max(word1.length, word2.length)

        // Combine factors with some randomness
        const similarity = 0.4 * prefixSimilarity + 0.4 * lengthSimilarity + 0.2 * Math.random()

        // Ensure similarity is between 0 and 1
        row.push(Math.max(0, Math.min(1, similarity)))
      }
    }
    similarities.push(row)
  }

  return similarities
}
