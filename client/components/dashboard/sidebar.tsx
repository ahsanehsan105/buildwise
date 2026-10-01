'use client'

import { BarChart3, ClipboardList, LayoutDashboard, LogOut, Package, Ruler, Users, X } from 'lucide-react'
import type { ViewName } from './types'

type SidebarProps = {
  open: boolean
  view: ViewName
  hasSelectedProject: boolean
  onNavigate: (view: ViewName) => void
  onClose: () => void
  onLogout: () => void
}

export function Sidebar({ open, view, hasSelectedProject, onNavigate, onClose, onLogout }: SidebarProps) {
  return (
    <>
      {open && <button aria-label="Close menu" className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-[86vw] max-w-[300px] flex-col overflow-hidden border-r border-[#dfe4df] bg-[#fbfcfa] px-4 py-5 transition-transform lg:sticky lg:top-0 lg:w-[258px] lg:shrink-0 lg:translate-x-0 lg:px-5 lg:py-6 ${open ? 'translate-x-0' : 'pointer-events-none -translate-x-[110%] lg:pointer-events-auto'}`}>
        <div className="flex items-start justify-between">
          <Brand />
          <button className="grid size-9 place-items-center rounded-xl text-[#718078] hover:bg-[#e7f0df] lg:hidden" onClick={onClose} aria-label="Close sidebar"><X /></button>
        </div>
        <nav className="flex flex-col gap-1.5" aria-label="Main navigation">
          <NavItem active={view === 'dashboard'} icon={LayoutDashboard} label="Dashboard" onClick={() => onNavigate('dashboard')} />
          <NavItem active={view === 'projects'} icon={ClipboardList} label="New project" onClick={() => onNavigate('projects')} />
          <NavItem active={view === 'reports'} icon={BarChart3} label="Reports" onClick={() => onNavigate('reports')} />
        </nav>
        <p className="mb-3 mt-9 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#a0aaa5]">Project costs</p>
        {hasSelectedProject ? (
          <nav className="flex flex-col gap-1.5" aria-label="Project costs">
            <NavItem active={view === 'labour'} icon={Users} label="Labour cost" onClick={() => onNavigate('labour')} />
            <NavItem active={view === 'material'} icon={Package} label="Material cost" onClick={() => onNavigate('material')} />
          </nav>
        ) : <p className="px-3 text-xs leading-relaxed text-[#8a9690]">Open a project to manage its daily cost entries.</p>}
        <div className="mt-auto shrink-0 border-t border-[#e7ebe7] pt-4">
          <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#74817b]"><LogOut />Logout</button>
        </div>
      </aside>
    </>
  )
}

function Brand() {
  return (
    <div className="mb-10 flex items-center gap-2.5 px-2">
      <div className="grid size-9 place-items-center rounded-xl bg-[#173c35] text-[#d9f073]"><Ruler /></div>
      <div><p className="text-[15px] font-bold">Buildwise</p><p className="text-[10px] uppercase tracking-[.18em] text-[#8a9590]">Cost intelligence</p></div>
    </div>
  )
}

function NavItem({ active, icon: Icon, label, onClick }: { active: boolean; icon: typeof LayoutDashboard; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium ${active ? 'bg-[#e7f0df] text-[#173c35]' : 'text-[#74817b]'}`}>
      <Icon />{label}
    </button>
  )
}
