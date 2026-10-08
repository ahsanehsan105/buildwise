import { AlertTriangle, Trash2 } from 'lucide-react'
import { ModalShell } from './modal-primitives'

type ConfirmDeleteDialogProps = {
  title: string
  description: string
  isDeleting: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDeleteDialog({ title, description, isDeleting, onCancel, onConfirm }: ConfirmDeleteDialogProps) {
  return (
    <ModalShell onClose={onCancel}>
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-red-50 text-red-700">
        <AlertTriangle size={23} />
      </div>
      <h2 className="mt-3 text-center text-xl font-semibold text-[#173c35]">{title}</h2>
      <p className="mt-2 text-center text-sm leading-6 text-[#718078]">{description}</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button type="button" onClick={onCancel} disabled={isDeleting} className="rounded-xl border border-[#dfe4df] bg-[#fbfcfa] px-4 py-2.5 text-sm font-semibold text-[#355047] transition hover:bg-[#f0f4ef] disabled:opacity-50">Cancel</button>
        <button type="button" onClick={onConfirm} disabled={isDeleting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-800 disabled:opacity-50">
          <Trash2 size={16} />{isDeleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </ModalShell>
  )
}
