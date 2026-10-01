'use client'

import { useState } from 'react'
import { cities, type Project } from './types'
import { Field, ModalShell } from './modal-primitives'

type ProjectModalProps = {
  onClose: () => void
  onCreate: (project: Pick<Project, 'name' | 'location' | 'unit' | 'size'>) => Promise<void>
  isSaving: boolean
  error: string
}

export function ProjectModal({ onClose, onCreate, isSaving, error }: ProjectModalProps) {
  const [form, setForm] = useState({ name: '', location: cities[0], unit: 'Marla', size: '10' })

  return (
    <ModalShell onClose={onClose}>
      <p className="text-xs font-bold uppercase tracking-[.16em] text-[#a08a50]">Start a workspace</p>
      <h2 className="mt-1 text-xl font-semibold text-[#173c35]">Create a new project</h2>
      <div className="mt-3 flex flex-col gap-2.5">
        <Field label="Project name"><input placeholder="e.g. Bahria Town House" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
        <Field label="Pakistan city"><select value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })}>{cities.map((city) => <option key={city}>{city}</option>)}</select></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Measurement"><select value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })}><option>Marla</option><option>Sq ft</option><option>Kanal</option></select></Field>
          <Field label="Size"><input type="number" min="0.01" step="any" value={form.size} onChange={(event) => setForm({ ...form, size: event.target.value })} /></Field>
        </div>
      </div>
      {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button disabled={isSaving || !form.name.trim() || Number(form.size) <= 0} onClick={() => void onCreate({ name: form.name.trim(), location: form.location, unit: form.unit, size: Number(form.size) })} className="mt-3 w-full shrink-0 rounded-xl bg-[#d9f073] px-4 py-2.5 text-sm font-bold text-[#173c35] disabled:opacity-50">{isSaving ? 'Saving…' : 'Create project'}</button>
    </ModalShell>
  )
}
