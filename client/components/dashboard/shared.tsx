import { Pencil, Plus, Trash2, type LucideIcon } from 'lucide-react'
import type { Entry } from './types'
import { money } from './types'

export function PageHeading({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#a08a50]">{eyebrow}</p><h1 className="text-3xl font-semibold text-[#173c35] sm:text-4xl">{title}</h1><p className="mt-2 text-sm text-[#7a8780]">{description}</p></div>
      {children}
    </div>
  )
}

export function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-[#dfe4df] bg-[#fbfcfa] p-5">
      <Icon className="mb-5 text-[#527263]" />
      <p className="text-xs text-[#8a9690]">{label}</p>
      <p className="mt-1 truncate text-xl font-semibold text-[#173c35]">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </div>
  )
}

export function EntryTable({ rows, onEdit, onDelete, isBusy }: { rows: Entry[]; onEdit: (entry: Entry) => void; onDelete: (entry: Entry) => void; isBusy: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#dfe4df] bg-[#fbfcfa]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-[#f0f4ef] text-xs uppercase tracking-wider text-[#789087]"><tr><th className="px-5 py-4">Date</th><th className="px-5 py-4">Item</th><th className="px-5 py-4">Category</th><th className="px-5 py-4">Quantity</th><th className="px-5 py-4">Rate</th><th className="px-5 py-4 text-right">Total</th><th className="px-5 py-4 text-right">Actions</th></tr></thead>
          <tbody>{rows.map((entry) => <tr key={entry.id} className="border-t border-[#e7ebe7]"><td className="px-5 py-4 text-[#697a72]">{entry.date}</td><td className="px-5 py-4 font-semibold text-[#263d33]">{entry.item}</td><td className="px-5 py-4"><span className="rounded-full bg-[#e7f0df] px-2.5 py-1 text-xs font-semibold text-[#527263]">{entry.category}</span></td><td className="px-5 py-4">{entry.quantity} {entry.unit}</td><td className="px-5 py-4">{money(entry.rate)}</td><td className="px-5 py-4 text-right font-bold text-[#173c35]">{money(entry.total)}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => onEdit(entry)} disabled={isBusy} aria-label={`Edit ${entry.item}`} title="Edit entry" className="grid size-9 place-items-center rounded-lg text-[#527263] hover:bg-[#e7f0df] disabled:opacity-50"><Pencil size={16} /></button><button type="button" onClick={() => onDelete(entry)} disabled={isBusy} aria-label={`Delete ${entry.item}`} title="Delete entry" className="grid size-9 place-items-center rounded-lg text-red-700 hover:bg-red-50 disabled:opacity-50"><Trash2 size={16} /></button></div></td></tr>)}</tbody>
        </table>
      </div>
      {rows.length === 0 && <p className="p-8 text-center text-sm text-[#7d8982]">No entries match your search.</p>}
    </div>
  )
}

export function EmptyState({ title, description, onAction, actionLabel }: { title: string; description: string; onAction: () => void; actionLabel: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#cfd9d1] bg-[#fbfcfa] px-6 py-16 text-center">
      <h2 className="font-semibold text-[#173c35]">{title}</h2>
      <p className="mt-2 text-sm text-[#7d8982]">{description}</p>
      <button onClick={onAction} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#d9f073] px-4 py-2.5 text-sm font-bold text-[#173c35]"><Plus />{actionLabel}</button>
    </div>
  )
}
