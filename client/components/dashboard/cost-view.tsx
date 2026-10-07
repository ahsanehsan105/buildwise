import { ArrowLeft, Plus, Printer, Search } from 'lucide-react'
import { printTableReport } from '@/lib/print-table-report'
import type { Entry, Project } from './types'
import { money, moneyRate } from './types'
import { EntryTable, PageHeading } from './shared'

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
  onBack: () => void
}

export function CostView({ kind, project, rows, total, query, onQueryChange, onAdd, onEdit, onDelete, isBusy, onBack }: CostViewProps) {
  const title = kind === 'labour' ? 'Labour cost' : 'Material cost'

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
      <EntryTable kind={kind} rows={rows} onEdit={onEdit} onDelete={onDelete} isBusy={isBusy} />
    </>
  )
}
