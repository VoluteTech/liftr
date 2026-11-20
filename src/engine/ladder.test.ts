import { expect, test } from 'vitest'
import { exerciseIds, tierFor } from './ladder'
const male = { sex: 'male', kg: 100 } as const
const tiers = ['Bronze','Silver','Gold','Platinum','Diamond','Titan']
const divisions = ['I','II','III','IV','V']
test.each(exerciseIds)('%s exposes all 30 divisions in order for both standards', exercise => {
  for (const sex of ['male','female'] as const) {
    const seen = new Set<string>()
    for (let kg=0; kg<=400; kg++) seen.add(tierFor(exercise, kg, { kg:100, sex }))
    expect([...seen]).toEqual(tiers.flatMap(t => divisions.map(d => `${t} ${d}`)))
  }
})
test('tier boundaries use relative load and exercise-specific standards', () => {
  expect(tierFor('bench',49.9,male)).toBe('Bronze V')
  expect(tierFor('bench',50,male)).toBe('Silver I')
  expect(tierFor('bench',25,{...male,kg:50})).toBe('Silver I')
  expect(tierFor('deadlift',50,male)).toBe('Bronze III')
})
