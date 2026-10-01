import type { ReactNode } from 'react'
import { X } from 'lucide-react'

export function ModalShell({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#173c35]/50 p-0 backdrop-blur-[3px] sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div role="dialog" aria-modal="true" className="buildwise-modal flex max-h-[94dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[1.25rem] bg-[#fbfcfa] p-4 shadow-2xl sm:max-h-[90dvh] sm:rounded-2xl sm:p-5">
        <div className="mb-2 flex shrink-0 items-center justify-between border-b border-[#e7ebe7] pb-2 sm:mb-3 sm:border-0 sm:pb-0">
          <div className="h-1.5 w-10 rounded-full bg-[#dfe8dc] sm:hidden" />
          <button className="ml-auto grid size-9 place-items-center rounded-xl text-[#718078] transition hover:bg-[#e7f0df] hover:text-[#173c35]" onClick={onClose} aria-label="Close dialog"><X /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="min-w-0 text-[13px] font-semibold text-[#30433a]">{label}<div className="mt-1.5">{children}</div></label>
}
