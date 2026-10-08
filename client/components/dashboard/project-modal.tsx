'use client'

import { useState } from 'react'
import { cities, type Project } from './types'
import { Field, ModalShell } from './modal-primitives'

type ProjectModalProps = {
  project?: Project
  onClose: () => void
  onSave: (project: Pick<Project, 'name' | 'location' | 'address' | 'unit' | 'size'>) => Promise<void>
  isSaving: boolean
  error: string
}

export function ProjectModal({ project, onClose, onSave, isSaving, error }: ProjectModalProps) {
  const [form, setForm] = useState({
    name: project?.name || '',
    location: project?.location || cities[0],
    address: project?.address || '',
    unit: project?.unit || 'Marla',
    size: String(project?.size || 10),
  })

  return (
    <ModalShell
      onClose={onClose}
      showDragHandle={false}
      header={(
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#a08a50]">Start a workspace</p>
          <h2 className="mt-0.5 text-lg font-semibold leading-tight text-[#173c35] sm:text-xl">{project ? 'Edit project' : 'Create a new project'}</h2>
        </div>
      )}
    >
      <div className="mt-2 flex flex-col gap-2.5">
        <Field label="Project name"><input placeholder="e.g. Bahria Town House" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
        <Field label="Pakistan city"><select value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })}>{cities.map((city) => <option key={city}>{city}</option>)}</select></Field>
        <Field label="Street / address"><input maxLength={200} placeholder="e.g. Street 12, Bahria Town" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Measurement"><select value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })}><option>Marla</option><option>Sq ft</option><option>Kanal</option></select></Field>
          <Field label="Size"><input type="number" min="0.01" step="any" value={form.size} onChange={(event) => setForm({ ...form, size: event.target.value })} /></Field>
        </div>
      </div>
      {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button disabled={isSaving || !form.name.trim() || !form.address.trim() || Number(form.size) <= 0} onClick={() => void onSave({ name: form.name.trim(), location: form.location, address: form.address.trim(), unit: form.unit, size: Number(form.size) })} className="mt-3 mb-2 w-full shrink-0 rounded-xl bg-[#d9f073] px-4 py-2.5 text-sm font-bold text-[#173c35] disabled:opacity-50">{isSaving ? 'Saving…' : project ? 'Save changes' : 'Create project'}</button>
    </ModalShell>
  )
}
