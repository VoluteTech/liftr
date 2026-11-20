export const exercises = { bench: 'Bench press', deadlift: 'Deadlift', squat: 'Squat', dips: 'Dips' } as const
export type Exercise = keyof typeof exercises
export const exerciseIds = Object.keys(exercises) as Exercise[]
export type Profile = { kg: number; sex: 'male' | 'female' }
const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Titan']
const divisions = ['I', 'II', 'III', 'IV', 'V']
// Initial game calibration, not population percentiles. Each entry is the
// e1RM/bodyweight threshold for division I of the corresponding tier.
const standards = {
  bench: { male: [0,.5,.85,1.15,1.5,1.85], female: [0,.3,.55,.8,1,1.25] },
  deadlift: { male: [0,1,1.5,2,2.5,3], female: [0,.75,1.15,1.55,2,2.5] },
  squat: { male: [0,.75,1.15,1.55,2,2.5], female: [0,.55,.85,1.2,1.6,2] },
  dips: { male: [0,1,1.2,1.4,1.65,1.9], female: [0,.85,1,1.2,1.4,1.65] },
}
export function tierFor(exercise: Exercise, best: number, profile: Profile) {
  const ratio = best / profile.kg
  const thresholds = standards[exercise][profile.sex]
  let tier = 0, division = 0
  for (let i = 0; i < thresholds.length; i++) {
    const width = (thresholds[i+1] ?? (2 * thresholds[i] - thresholds[i-1])) - thresholds[i]
    for (let j = 0; j < divisions.length; j++) {
      if (ratio + 1e-10 >= thresholds[i] + j * width / 5) { tier = i; division = j }
    }
  }
  return `${tiers[tier]} ${divisions[division]}`
}
