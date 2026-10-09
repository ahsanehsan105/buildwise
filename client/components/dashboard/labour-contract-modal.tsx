'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { LabourContract, LabourContractArea } from '@/lib/api'
import { money, moneyRate } from './types'
import { Field, ModalShell } from './modal-primitives'

type ContractAreaForm = { name: string; length: string; width: string }

type LabourContractModalProps = {
  contract: LabourContract | null
  onClose: () => void
  onSave: (contract: { areas: LabourContractArea[]; rate: number }) => Promise<boolean>
  isSaving: boolean
  error: string
}

function existingAreas(contract: LabourContract | null): ContractAreaForm[] {
  if (contract?.areas?.length) {
    return contract.areas.map((area) => ({
      name: area.name,
      length: String(area.length),
      width: String(area.width),
    }))
  }
  if (contract?.length && contract.width) {
    return [{ name: 'Ground floor', length: String(contract.length), width: String(contract.width) }]
  }
  return [{ name: 'Ground floor', length: '', width: '' }]
}

export function LabourContractModal({ contract, onClose, onSave, isSaving, error }: LabourContractModalProps) {
  const [areas, setAreas] = useState<ContractAreaForm[]>(() => existingAreas(contract))
  const [rateValue, setRateValue] = useState(contract ? String(contract.rate) : '')
  const rate = Number(rateValue)
  const parsedAreas = areas.map((area) => ({
    name: area.name.trim(),
    length: Number(area.length),
    width: Number(area.width),
  }))
  const areasValid = parsedAreas.length > 0 && parsedAreas.every((area, index) =>
    area.name.length > 0 && area.name.length <= 80
    && areas[index].length !== '' && Number.isFinite(area.length) && area.length > 0
    && areas[index].width !== '' && Number.isFinite(area.width) && area.width > 0)
  const valid = areasValid && rateValue !== '' && Number.isFinite(rate) && rate >= 0
  const totalArea = areasValid ? parsedAreas.reduce((sum, area) => sum + area.length * area.width, 0) : 0
  const updateArea = (index: number, field: keyof ContractAreaForm, value: string) => {
    setAreas((current) => current.map((area, areaIndex) => areaIndex === index ? { ...area, [field]: value } : area))
  }

  return (
    <ModalShell
      onClose={onClose}
      header={(
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#a08a50]">Labour agreement</p>
          <h2 className="mt-0.5 text-lg font-semibold leading-tight text-[#173c35] sm:text-xl">{contract ? 'Edit thakadar contract' : 'Add thakadar contract'}</h2>
        </div>
      )}
    >
      <p className="text-sm leading-5 text-[#718078]">Add each floor or extra area separately. All areas use the same agreed rate per square foot.</p>
      <div className="labour-contract-areas mt-3 flex flex-col gap-3">
        {areas.map((area, index) => (
          <section key={index} className="rounded-xl border border-[#e1e8e1] bg-[#f7f9f6] p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-wide text-[#718078]">Area {index + 1}</p>
              {areas.length > 1 && (
                <button type="button" onClick={() => setAreas((current) => current.filter((_, areaIndex) => areaIndex !== index))} aria-label={`Remove area ${index + 1}`} className="grid size-8 place-items-center rounded-lg text-red-700 transition hover:bg-red-50">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
            <Field label="Floor / area name"><input maxLength={80} placeholder="e.g. Ground floor, Mumty, Shade" value={area.name} onChange={(event) => updateArea(index, 'name', event.target.value)} /></Field>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <Field label="Length (ft)"><input type="number" min="0.01" step="any" placeholder="e.g. 54" value={area.length} onChange={(event) => updateArea(index, 'length', event.target.value)} /></Field>
              <Field label="Width (ft)"><input type="number" min="0.01" step="any" placeholder="e.g. 20" value={area.width} onChange={(event) => updateArea(index, 'width', event.target.value)} /></Field>
            </div>
          </section>
        ))}
        <button type="button" onClick={() => setAreas((current) => [...current, { name: '', length: '', width: '' }])} className="inline-flex w-fit items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#386151] transition hover:bg-[#e7f0df]">
          <Plus size={16} />Add another floor or area
        </button>
      </div>
      <div className="mt-3">
        <Field label="Labour rate (PKR / sq ft)"><input type="number" min="0" step="any" placeholder="e.g. 450" value={rateValue} onChange={(event) => setRateValue(event.target.value)} /></Field>
      </div>
      {valid && (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-[#f0f4ef] px-4 py-3">
          <div>
            <p className="text-xs text-[#718078]">Combined area · {totalArea.toLocaleString()} sq ft</p>
            <p className="mt-0.5 text-sm font-semibold text-[#355047]">{moneyRate(rate)} per sq ft</p>
          </div>
          <p className="text-right text-lg font-bold text-[#173c35]">{money(totalArea * rate)}</p>
        </div>
      )}
      {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button type="button" disabled={isSaving || !valid} onClick={() => void onSave({ areas: parsedAreas, rate })} className="mt-3 mb-1 w-full shrink-0 rounded-xl bg-[#d9f073] px-4 py-2.5 text-sm font-bold text-[#173c35] disabled:opacity-50">{isSaving ? 'Saving…' : contract ? 'Save changes' : 'Save contract'}</button>
    </ModalShell>
  )
}
