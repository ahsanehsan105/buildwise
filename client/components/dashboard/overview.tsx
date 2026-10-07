import { ArrowLeft, ClipboardList, Package, Plus, Wallet } from 'lucide-react'
import type { Project } from './types'
import { money } from './types'
import { StatCard } from './shared'

type OverviewProps = {
  name: string
  projects: Project[]
  labour: number
  material: number
  onProjects: () => void
  onNew: () => void
}

export function Overview({ name, projects, labour, material, onProjects, onNew }: OverviewProps) {
  const today = new Intl.DateTimeFormat('en-PK', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Karachi',
  }).format(new Date())

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#a08a50]">{today}</p>
          <h1 className="text-3xl font-semibold text-[#173c35] sm:text-4xl">Welcome, {name}<span className="text-[#d9a441]">.</span></h1>
          <p className="mt-2 text-sm text-[#7a8780]">Manage your Pakistan construction projects and daily costs.</p>
        </div>
        <button onClick={onNew} className="flex w-fit items-center gap-2 rounded-xl bg-[#d9f073] px-4 py-2.5 text-sm font-bold text-[#173c35]"><Plus />New project</button>
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard icon={ClipboardList} label="Active projects" value={projects.length} />
        <StatCard icon={Wallet} label="Total labour" value={money(labour)} />
        <StatCard icon={Package} label="Total materials" value={money(material)} />
      </div>
      <section className="mt-8 rounded-2xl border border-[#dfe4df] bg-[#fbfcfa] p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-[#173c35]">Your construction workspace</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#7d8982]">Open New project to create a property, then record daily wages, bricks, rait, mati, cement and bajri in PKR.</p>
        <button onClick={onProjects} className="mt-6 flex items-center gap-2 rounded-xl border border-[#dfe4df] px-4 py-3 text-sm font-bold text-[#355047]">Open new project <ArrowLeft className="rotate-180" /></button>
      </section>
    </>
  )
}
