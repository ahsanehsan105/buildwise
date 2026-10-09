import { useMemo, useState } from 'react'
import { ArrowLeft, Plus, Printer, Search } from 'lucide-react'
import { printTableReport } from '@/lib/print-table-report'
import type { LabourContract } from '@/lib/api'
import type { Entry, Project } from './types'
import { money, moneyRate, type EntrySearchField } from './types'
import { EntryTable, PageHeading } from './shared'
import { LabourContractModal } from './labour-contract-modal'

type CostViewProps = {
  kind: 'labour' | 'material'
  project: Project
  rows: Entry[]
  total: number
  query: string
  onQueryChange: (query: string) => void
  searchField: EntrySearchField
  onSearchFieldChange: (field: EntrySearchField) => void
  onAdd: () => void
  onEdit: (entry: Entry) => void
  onDelete: (entry: Entry) => void
  isBusy: boolean
  onSaveLabourContract: (contract: Pick<LabourContract, 'length' | 'width' | 'rate'>) => Promise<boolean>
  contractError: string
  onBack: () => void
}

export function CostView({ kind, project, rows, total, query, onQueryChange, searchField, onSearchFieldChange, onAdd, onEdit, onDelete, isBusy, onSaveLabourContract, contractError, onBack }: CostViewProps) {
  const [isContractModalOpen, setIsContractModalOpen] = useState(false)
  const title = kind === 'labour' ? 'Labour cost' : 'Material cost'
  const labourContract = project.labourContract
  const contractAreas = labourContract?.areas || (labourContract?.length && labourContract.width
    ? [{ name: 'Ground floor', length: labourContract.length, width: labourContract.width }]
    : [])
  const contractArea = labourContract?.totalArea
    ?? contractAreas.reduce((sum, area) => sum + area.length * area.width, 0)
  const remaining = labourContract ? labourContract.total - total : 0
  const materialSummary = useMemo(() => {
    const groups = new Map<string, { item: string; unit: string; quantity: number; total: number }>()
    for (const entry of rows) {
      const key = `${entry.item.trim().toLowerCase()}\u0000${entry.unit.trim().toLowerCase()}`
      const group = groups.get(key) || { item: entry.item, unit: entry.unit, quantity: 0, total: 0 }
      group.quantity += entry.quantity
      group.total += entry.total
      groups.set(key, group)
    }
    return [...groups.values()].sort((first, second) => first.item.localeCompare(second.item))
  }, [rows])
  const labourSummary = useMemo(() => {
    const groups = new Map<string, { name: string; categories: Set<string>; dates: Set<string>; total: number }>()
    for (const entry of rows) {
      const key = entry.item.trim().toLowerCase()
      const group = groups.get(key) || { name: entry.item, categories: new Set<string>(), dates: new Set<string>(), total: 0 }
      group.categories.add(entry.category)
      group.dates.add(entry.date)
      group.total += entry.total
      groups.set(key, group)
    }
    return [...groups.values()].sort((first, second) => first.name.localeCompare(second.name))
  }, [rows])

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
        <div className="flex w-full items-center justify-between gap-4 rounded-xl bg-[#173c35] px-4 py-3 text-white sm:w-fit sm:min-w-44 sm:flex-col sm:items-start sm:gap-0">
          <p className="text-xs font-medium text-[#b9c8c0]">Section total</p>
          <p className="text-lg font-bold leading-tight">{money(total)}</p>
        </div>
      </PageHeading>
      {kind === 'labour' && (
        <section className="mb-5 -mt-3 overflow-hidden rounded-2xl border border-[#dfe4df] bg-[#fbfcfa]">
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
      <EntryTable
        kind={kind}
        rows={rows}
        onEdit={onEdit}
        onDelete={onDelete}
        isBusy={isBusy}
        toolbar={(
          <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row lg:max-w-2xl">
              <label className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#dfe4df] bg-white px-3 text-sm text-[#839088] transition focus-within:border-[#789b86] focus-within:ring-2 focus-within:ring-[#789b86]/15"><Search size={18} className="shrink-0" /><input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder={searchField === 'item' ? `Search ${kind === 'labour' ? 'name' : 'item'}...` : searchField === 'category' ? 'Search category...' : searchField === 'unit' ? 'Search unit...' : searchField === 'date' ? 'Search date...' : 'Search all fields...'} className="min-w-0 w-full bg-transparent outline-none placeholder:text-[#a6b1ab]" /></label>
              <div className="sm:w-40 sm:shrink-0">
                <label className="sr-only" htmlFor="ledger-search-field">Search by</label>
                <select id="ledger-search-field" value={searchField} onChange={(event) => onSearchFieldChange(event.target.value as EntrySearchField)} className="min-h-11 w-full rounded-xl border border-[#dfe4df] bg-white px-3 text-sm text-[#355047] outline-none transition focus:border-[#789b86] focus:ring-2 focus:ring-[#789b86]/15 sm:w-36 sm:shrink-0">
                  <option value="all">All fields</option>
                  <option value="item">{kind === 'labour' ? 'Name' : 'Item'}</option>
                  <option value="category">Category</option>
                  {kind === 'material' && <option value="unit">Unit</option>}
                  <option value="date">Date</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 lg:shrink-0">
              <button onClick={printLedger} className="flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[#dfe4df] bg-white px-3 text-sm font-semibold text-[#355047] transition hover:bg-[#f0f4ef] md:px-4"><Printer size={18} />Print / PDF</button>
              <button onClick={onAdd} className="flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#d9f073] px-3 text-sm font-bold text-[#173c35] transition hover:bg-[#cfe65f] md:px-4"><Plus size={18} />Add today</button>
            </div>
          </div>
        )}
        summary={query.trim() ? (
          <section aria-live="polite">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-[#173c35]">{kind === 'material' ? 'Material totals for matching entries' : 'Labour summary for matching entries'}</h2>
              <p className="text-xs text-[#718078]">{rows.length} matching {rows.length === 1 ? 'entry' : 'entries'} · {money(rows.reduce((sum, entry) => sum + entry.total, 0))} total</p>
            </div>
            {kind === 'material' ? (
              materialSummary.length ? (
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {materialSummary.map((group) => (
                    <div key={`${group.item}-${group.unit}`} className="rounded-xl border border-[#e7ebe7] bg-[#fbfcfa] px-4 py-3">
                      <p className="truncate text-sm font-semibold text-[#355047]">{group.item}</p>
                      <div className="mt-2 flex items-end justify-between gap-3">
                        <p className="text-xs text-[#718078]">Quantity <span className="font-semibold text-[#355047]">{group.quantity.toLocaleString()} {group.unit}</span></p>
                        <p className="text-sm font-bold text-[#173c35]">{money(group.total)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-[#718078]">No matching material records.</p>
            ) : (
              labourSummary.length ? (
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {labourSummary.map((group) => (
                    <div key={group.name.toLowerCase()} className="rounded-xl border border-[#e7ebe7] bg-[#fbfcfa] px-4 py-3">
                      <p className="truncate text-sm font-semibold text-[#355047]">{group.name}</p>
                      <p className="mt-1 truncate text-xs text-[#718078]">{[...group.categories].join(', ')}</p>
                      <div className="mt-2 flex items-end justify-between gap-3">
                        <p className="text-xs text-[#718078]">Worked <span className="font-semibold text-[#355047]">{group.dates.size} {group.dates.size === 1 ? 'day' : 'days'}</span></p>
                        <p className="text-sm font-bold text-[#173c35]">{money(group.total)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-[#718078]">No matching labour records.</p>
            )}
          </section>
        ) : undefined}
      />
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
