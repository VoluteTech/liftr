import { useState, type FormEvent } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { LineChart, ResponsiveContainer, Line, YAxis, XAxis, Tooltip } from 'recharts'
import { sets } from './db'
import { rank } from './ranking'

export default function App() {
  const rows = useLiveQuery(() => sets.orderBy('id').toArray())
  const progress = rank(rows ?? [])
  const last = progress.at(-1)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const data = new FormData(event.currentTarget)
    const input = { kg: Number(data.get('kg')), reps: Number(data.get('reps')) }
    setBusy(true)
    try {
      rank([input])
      await sets.add({ ...input, time: Date.now() })
      setNotice(`Saved ${input.kg} kg × ${input.reps} on this device.`)
    } catch { setNotice('Set not saved. Check your inputs and that browser storage is available.') }
    finally { setBusy(false) }
  }
  return <main className="max-w-xl mx-auto px-4 py-8 space-y-4">
    <header><small>LIFTR / PERSONAL LADDER</small><h1>Bench log</h1></header>
    <section><small>PERSONAL RATING</small><h2>{last?.rating ?? 1000} <span>pts</span></h2>
      <p>{!last ? 'Start at 1000. Log your first set to establish your bench mark.' : last.delta ? `+${last.delta} pts · Your estimated max reached new 5 kg benchmarks.` : '±0 pts · No new benchmark. Repeat and lighter sets never cost points.'}</p>
      <p>Next benchmark: {last?.next ?? 5} kg estimated max.</p></section>
    <section><h3>Log a set</h3><form onSubmit={save} className="grid grid-cols-2 gap-3">
      <label>Weight (kg)<input required type="number" step="0.1" min="0.1" max="600" name="kg" placeholder="60" /></label>
      <label>Reps<input required type="number" min="1" max="12" name="reps" placeholder="5" /></label>
      <button disabled={busy || !rows} className="col-span-2">{busy ? 'Saving…' : 'Save bench set'}</button></form><p role="status">{notice}</p></section>
    <section><h3>Estimated max · kg</h3>{last ? <ResponsiveContainer width="100%" height={160}><LineChart data={progress}><XAxis dataKey="set" tickLine={false}/><YAxis width={40}/><Tooltip/><Line type="linear" dataKey="estimate" name="Estimated max (kg)" stroke="#b5f885" isAnimationActive={false}/></LineChart></ResponsiveContainer> : <p>Your trend starts with your first set.</p>}
      <small>Single reps use actual weight. For 2–12 reps: weight × (1 + reps / 30).</small></section>
    <section><h3>Recent sets</h3>{!rows ? 'Loading…' : !rows.length ? 'No sets yet.' : <ol>{rows.slice(-10).reverse().map((row,i) => <li key={row.id}><b>{row.kg} kg × {row.reps}</b> · +{progress[rows.length-1-i].delta} pts<br/><small>{new Date(row.time).toLocaleString()}</small></li>)}</ol>}</section>
    <footer>Local to this browser · No account or cloud backup</footer></main>
}
