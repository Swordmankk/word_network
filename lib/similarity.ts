"use client"

export function calculateSimilarities(words: string[]) {
  const similarities = []

  for (let i = 0; i < words.length; i++) {
    const row = []
    for (let j = 0; j < words.length; j++) {
      if (i === j) {
        row.push(1.0)
      } else {
        const word1 = words[i]
        const word2 = words[j]

        const minLength = Math.min(word1.length, word2.length)
        let commonPrefix = 0
        for (let k = 0; k < minLength; k++) {
          if (word1[k] === word2[k]) {
            commonPrefix++
          } else {
            break
          }
        }

        const prefixSimilarity = commonPrefix / minLength
        const lengthSimilarity = 1 - Math.abs(word1.length - word2.length) / Math.max(word1.length, word2.length)
        const similarity = 0.4 * prefixSimilarity + 0.4 * lengthSimilarity + 0.2 * Math.random()

        row.push(Math.max(0, Math.min(1, similarity)))
      }
    }
    similarities.push(row)
  }

  return similarities
}
