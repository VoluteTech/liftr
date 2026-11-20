import Dexie, { type EntityTable } from 'dexie'
import type { SetInput } from './ranking'
interface BenchSet extends SetInput { id: number; time: number }
const db = new Dexie('liftr') as Dexie & { sets: EntityTable<BenchSet, 'id'> }
db.version(1).stores({ sets: '++id' })
export const sets = db.sets
