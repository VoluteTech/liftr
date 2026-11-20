import { useState } from 'react'
import { useProfile, useSets, saveProfile } from './db/index'
import { exercises, exerciseIds, tierFor, type Exercise } from './engine/ladder'
import { rank } from './engine/ranking'
import ExerciseLog from './features/ExerciseLog'

export default function App() {
  const [selected, select] = useState<Exercise | null>(null)
  const [message, setMessage] = useState('')
  const rows = useSets(), profile = useProfile()
  if (selected) return <ExerciseLog key={selected} exercise={selected} back={() => select(null)} />
  return <main className="max-w-xl mx-auto px-4 py-8 space-y-4">
    <header><small>LIFTR / PERSONAL LADDER</small><h1>Your exercises</h1>
      <p>Select an exercise to log a set or see its history.</p></header>
    {exerciseIds.map(id => {
      const last = rows && rank(rows.filter(row => row.exercise === id)).at(-1)
      return <button key={id} className="exercise-card" onClick={() => select(id)}>
        <strong>{exercises[id]}</strong>
        {!rows ? <small>Loading history…</small> : last ? <><span>{last.rating} Elo</span><small>{profile ? tierFor(id, last.best, profile) : 'Set your ranking profile below to see your tier.'}</small></> : <><span>Unranked</span><small>No sets logged yet · Log your first set →</small></>}
      </button>
    })}
    {profile !== undefined && <details><summary>Ranking profile{profile ? ` · ${profile.kg} kg` : ' · Not set'}</summary>
      <p>Elo rewards new strength benchmarks. Your tier compares your best estimated max with standards for your exercise, sex and current bodyweight.</p>
      <form className="grid gap-3 mt-3" onSubmit={async event => {
        event.preventDefault(); const data = new FormData(event.currentTarget)
        const sex = data.get('sex'); if (sex !== 'male' && sex !== 'female') return
        try { await saveProfile({ kg: Number(data.get('kg')), sex }); setMessage('Profile saved. Tiers updated.') }
        catch { setMessage('Could not save profile on this device.') }
      }}><label>Bodyweight (kg)<input name="kg" required type="number" min="1" max="600" step="0.1" defaultValue={profile?.kg}/></label>
        <label>Strength standard <select name="sex" required defaultValue={profile?.sex ?? ''}><option value="" disabled>Choose standard</option><option value="female">Female</option><option value="male">Male</option></select></label>
        <button>Save ranking profile</button><p role="status">{message}</p></form></details>}
  </main>
}
