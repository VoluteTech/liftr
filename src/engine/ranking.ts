export interface SetInput { kg: number; reps: number }

export function generalElo(ratings: readonly (number | undefined)[]) {
  const ranked = ratings.filter((rating): rating is number => rating !== undefined)
  return ranked.length ? Math.round(ranked.reduce((sum, rating) => sum + rating, 0) / ranked.length) : null
}

// Each 5 kg benchmark is a virtual opponent. Defeat each at most once.
export function rank(sets: SetInput[]) {
  let best = 0, rating = 1000
  return sets.map(({ kg, reps }, i) => {
    if (!Number.isFinite(kg) || kg <= 0 || kg > 600 || !Number.isInteger(reps) || reps < 1 || reps > 12) throw new Error('Invalid set')
    const estimate = Math.round(10 * kg * (1 + reps / 30)) / 10
    const previous = rating
    for (let target = 5 * (1 + Math.floor(best / 5)); target <= estimate; target += 5) {
      const expected = 1 / (1 + 10 ** ((1000 + target * 4 - rating) / 400))
      rating += Math.round(32 * (1 - expected))
    }
    best = Math.max(best, estimate)
    return { set: i + 1, estimate, best, rating, delta: rating - previous, next: 5 * (1 + Math.floor(best / 5)) }
  })
}
