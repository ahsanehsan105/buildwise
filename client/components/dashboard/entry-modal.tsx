'use client'

import { useState } from 'react'
import type { Entry } from './types'
import { Field, ModalShell } from './modal-primitives'

type EntryModalProps = {
  kind: 'labour' | 'material'
  entry?: Entry
  onClose: () => void
  onSave: (entry: Omit<Entry, 'id' | 'total' | 'projectId' | 'type'>) => Promise<void>
  isSaving: boolean
  error: string
}

export function EntryModal({ kind, entry, onClose, onSave, isSaving, error }: EntryModalProps) {
  const [form, setForm] = useState({
    date: entry?.date || new Date().toISOString().slice(0, 10),
    item: entry?.item || '',
    category: entry?.category || '',
    quantity: String(entry?.quantity || 1),
    rate: entry ? String(entry.rate) : '',
  })
  const [rateEdited, setRateEdited] = useState(Boolean(entry))
  const quantity = Number(form.quantity)
  const rate = Number(form.rate)

  return (
    <ModalShell onClose={onClose}>
      <p className="text-xs font-bold uppercase tracking-[.16em] text-[#a08a50]">Daily ledger</p>
      <h2 className="mt-1 text-xl font-semibold text-[#173c35]">{entry ? 'Edit' : 'Add'} {kind === 'labour' ? 'labour' : 'material'} entry</h2>
      <div className="mt-3 grid shrink-0 grid-cols-2 gap-x-3 gap-y-2">
        <Field label="Date"><input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></Field>
        <Field label={kind === 'labour' ? 'Name' : 'Item'}><input placeholder={kind === 'labour' ? 'e.g. Mason crew' : 'e.g. Bricks (Awwal)'} value={form.item} onChange={(event) => setForm({ ...form, item: event.target.value })} /></Field>
        <Field label="Category"><input placeholder={kind === 'labour' ? 'e.g. Masonry' : 'e.g. Bricks'} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></Field>
        {kind === 'labour' ? (
          <Field label="Price (PKR)"><input type="number" min="0" step="any" placeholder="0" value={form.rate} onChange={(event) => { setForm({ ...form, rate: event.target.value }); setRateEdited(true) }} /></Field>
        ) : (
          <>
            <Field label="Quantity"><input type="number" min="0.01" step="any" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} /></Field>
            <Field label="Rate (PKR)"><input type="number" min="0" step="any" placeholder="0" value={form.rate} onChange={(event) => { setForm({ ...form, rate: event.target.value }); setRateEdited(true) }} /></Field>
          </>
        )}
      </div>
      {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button disabled={isSaving || !form.item.trim() || !form.date || (kind === 'material' && quantity <= 0) || !rateEdited || form.rate === '' || rate < 0} onClick={() => void onSave({ date: form.date, item: form.item.trim(), category: form.category, quantity: kind === 'labour' ? 1 : quantity, unit: entry?.unit || (kind === 'labour' ? 'job' : 'unit'), rate })} className="mt-3 w-full shrink-0 rounded-xl bg-[#d9f073] px-4 py-2.5 text-sm font-bold text-[#173c35] disabled:opacity-50">{isSaving ? 'Saving…' : entry ? 'Save changes' : 'Save daily entry'}</button>
    </ModalShell>
  )
}
