import { expect, test } from 'vitest'
import { generalElo, rank } from './ranking'
test('general Elo averages ranked exercises equally and rounds to whole points', () => {
  expect(generalElo([1247, undefined, 1100, undefined])).toBe(1174)
  expect(generalElo([1247, undefined])).toBe(1247)
  expect(generalElo([undefined, undefined])).toBeNull()
})
test('first benchmark is a win against the 5 kg opponent', () => {
  expect(rank([{kg:5,reps:1}])[0]).toMatchObject({estimate:5.2,rating:1017,delta:17,next:10})
})
test('repeat and light days are neutral; new benchmarks count once', () => {
  const results = rank([60,60,40,65].map(kg => ({kg,reps:5})))
  expect(results[0].estimate).toBe(70)
  expect(results.slice(1,3).map(x => x.delta)).toEqual([0,0])
  expect(results[3].delta).toBeGreaterThan(0)
  expect(results[3].rating).toBe(rank([{kg:65,reps:5}])[0].rating)
})
test.each([[0,5],[60,1.5],[NaN,1],[60,13]])('rejects invalid set %s × %s', (kg,reps) => expect(() => rank([{kg,reps}])).toThrow())
