import { useState } from 'react'
import { ArrowLeft, Plus, Printer, Search } from 'lucide-react'
import { printTableReport } from '@/lib/print-table-report'
import type { LabourContract } from '@/lib/api'
import type { Entry, Project } from './types'
import { money, moneyRate } from './types'
import { EntryTable, PageHeading } from './shared'
import { LabourContractModal } from './labour-contract-modal'

type CostViewProps = {
  kind: 'labour' | 'material'
  project: Project
  rows: Entry[]
  total: number
  query: string
  onQueryChange: (query: string) => void
  onAdd: () => void
  onEdit: (entry: Entry) => void
  onDelete: (entry: Entry) => void
  isBusy: boolean
  onSaveLabourContract: (contract: Pick<LabourContract, 'length' | 'width' | 'rate'>) => Promise<boolean>
  contractError: string
  onBack: () => void
}

export function CostView({ kind, project, rows, total, query, onQueryChange, onAdd, onEdit, onDelete, isBusy, onSaveLabourContract, contractError, onBack }: CostViewProps) {
  const [isContractModalOpen, setIsContractModalOpen] = useState(false)
  const title = kind === 'labour' ? 'Labour cost' : 'Material cost'
  const labourContract = project.labourContract
  const contractAreas = labourContract?.areas || (labourContract?.length && labourContract.width
    ? [{ name: 'Ground floor', length: labourContract.length, width: labourContract.width }]
    : [])
  const contractArea = labourContract?.totalArea
    ?? contractAreas.reduce((sum, area) => sum + area.length * area.width, 0)
  const remaining = labourContract ? labourContract.total - total : 0

  function printLedger() {
    const exportTotal = rows.reduce((sum, entry) => sum + entry.total, 0)
    const headers = kind === 'labour'
      ? ['Date', 'Name', 'Category', 'Price (PKR)', 'Total (PKR)']
      : ['Date', 'Item', 'Category', 'Quantity', 'Rate (PKR)', 'Total (PKR)']
    printTableReport({
      title: `${project.name} · ${title}`,
      description: `${project.location} · ${project.size} ${project.unit}${query ? ` · Filter: ${query}` : ''}`,
      headers,
      rows: rows.map((entry) => kind === 'labour'
        ? [entry.date, entry.item, entry.category, moneyRate(entry.rate), money(entry.total)]
        : [entry.date, entry.item, entry.category, entry.quantity, moneyRate(entry.rate), money(entry.total)]),
      emptyMessage: 'No entries match the current ledger view.',
      total: { label: 'Displayed ledger total', value: money(exportTotal) },
    })
  }

  return (
    <>
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm font-bold text-[#527263]"><ArrowLeft />All projects</button>
      <PageHeading eyebrow={`${project.name} / daily ledger`} title={title} description={`${project.location} · ${project.size} ${project.unit}`}>
        <div className="flex gap-3">
          <button onClick={printLedger} className="flex items-center gap-2 rounded-xl border border-[#dfe4df] bg-[#fbfcfa] px-4 py-2.5 text-sm font-bold"><Printer />Print / PDF</button>
          <button onClick={onAdd} className="flex items-center gap-2 rounded-xl bg-[#d9f073] px-4 py-2.5 text-sm font-bold text-[#173c35]"><Plus />Add today</button>
        </div>
      </PageHeading>
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="rounded-2xl bg-[#173c35] px-5 py-3 text-white"><p className="text-xs text-[#b9c8c0]">Section total</p><p className="text-xl font-bold">{money(total)}</p></div>
        <label className="flex items-center gap-2 rounded-xl border border-[#dfe4df] bg-[#fbfcfa] px-3 py-2 text-sm text-[#839088]"><Search /><input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search item, category, date..." className="w-56 bg-transparent outline-none" /></label>
      </div>
      {kind === 'labour' && (
        <section className="mb-5 overflow-hidden rounded-2xl border border-[#dfe4df] bg-[#fbfcfa]">
          <div className="flex flex-col gap-3 border-b border-[#e7ebe7] bg-[#f7f9f6] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[#a08a50]">Thakadar contract</p>
              <p className="mt-1 text-sm text-[#718078]">{labourContract ? `${contractAreas.map((area) => `${area.name}: ${area.length} × ${area.width} ft`).join(' · ')} · ${moneyRate(labourContract.rate)} / sq ft` : 'Set the agreed plot size and labour rate to track your contract balance.'}</p>
            </div>
            <button type="button" onClick={() => setIsContractModalOpen(true)} className="w-fit shrink-0 rounded-xl border border-[#dfe4df] bg-white px-4 py-2 text-sm font-bold text-[#355047] transition hover:bg-[#e7f0ef]">{labourContract ? 'Edit contract' : 'Set contract'}</button>
          </div>
          {labourContract ? (
            <div className="grid gap-px bg-[#e7ebe7] sm:grid-cols-3">
              <div className="bg-[#fbfcfa] px-5 py-4"><p className="text-xs text-[#7d8982]">Agreed total</p><p className="mt-1 text-lg font-bold text-[#173c35]">{money(labourContract.total)}</p><p className="mt-1 text-xs text-[#8a9690]">{contractArea.toLocaleString()} sq ft combined</p></div>
              <div className="bg-[#fbfcfa] px-5 py-4"><p className="text-xs text-[#7d8982]">Paid to thakadar</p><p className="mt-1 text-lg font-bold text-[#355047]">{money(total)}</p><p className="mt-1 text-xs text-[#8a9690]">From recorded labour entries</p></div>
              <div className="bg-[#fbfcfa] px-5 py-4"><p className="text-xs text-[#7d8982]">{remaining >= 0 ? 'Remaining balance' : 'Paid over contract'}</p><p className={`mt-1 text-lg font-bold ${remaining >= 0 ? 'text-[#173c35]' : 'text-amber-700'}`}>{money(Math.abs(remaining))}</p><p className="mt-1 text-xs text-[#8a9690]">{remaining >= 0 ? 'Based on the agreed total' : 'Payments exceed the agreed total'}</p></div>
            </div>
          ) : (
            <p className="px-5 py-3 text-xs text-[#8a9690]">Payments are calculated from labour entries recorded below.</p>
          )}
        </section>
      )}
      <EntryTable kind={kind} rows={rows} onEdit={onEdit} onDelete={onDelete} isBusy={isBusy} />
      {kind === 'labour' && isContractModalOpen && (
        <LabourContractModal
          contract={labourContract}
          onClose={() => setIsContractModalOpen(false)}
          onSave={async (contract) => {
            const saved = await onSaveLabourContract(contract)
            if (saved) setIsContractModalOpen(false)
            return saved
          }}
          isSaving={isBusy}
          error={contractError}
        />
      )}
    </>
  )
}
