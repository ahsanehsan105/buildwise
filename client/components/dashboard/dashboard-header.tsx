import { Bell, Menu } from 'lucide-react'
import type { User } from '@/lib/api'
import type { Project, ViewName } from './types'

type DashboardHeaderProps = {
  view: ViewName
  project: Project | null
  user: User
  onOpenMenu: () => void
}

export function DashboardHeader({ view, project, user, onOpenMenu }: DashboardHeaderProps) {
  const initials = user.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  const title = project && view !== 'dashboard'
    ? project.name
    : view === 'projects'
      ? 'New project'
      : `${view.charAt(0).toUpperCase()}${view.slice(1)}`

  return (
    <header className="z-10 flex h-[76px] shrink-0 items-center justify-between border-b border-[#dfe4df] bg-[#fbfcfa] px-5 sm:px-8">
      <button className="grid size-9 place-items-center rounded-lg text-[#52675d] hover:bg-[#e7f0df] lg:hidden" onClick={onOpenMenu} aria-label="Open menu"><Menu /></button>
      <div className="min-w-0 flex-1 pl-3 text-xs text-[#8c9791] sm:pl-0 sm:text-sm">
        <span className="hidden sm:inline">Workspace <span className="mx-2">/</span></span>
        <b className="block truncate text-[#26362f]">{title}</b>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <Bell aria-label="Notifications" className="size-4 text-[#718078] sm:size-5" />
        <div className="grid size-8 place-items-center rounded-full bg-[#dce9dc] text-xs font-bold text-[#275144]" aria-hidden="true">{initials}</div>
        <span className="hidden max-w-40 truncate text-sm font-semibold sm:block">{user.name}</span>
      </div>
    </header>
  )
}
