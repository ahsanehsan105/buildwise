import { Package, Printer, Users, Wallet } from 'lucide-react'
import { printTableReport } from '@/lib/print-table-report'
import type { Project } from './types'
import { money, moneyRate } from './types'
import { PageHeading, StatCard } from './shared'

type ReportsViewProps = {
  labour: number
  material: number
  projects: Project[]
}

export function ReportsView({ labour, material, projects }: ReportsViewProps) {
  const total = labour + material

  function printProject(project: Project) {
    const entries = project.entries || []
    const projectTotal = entries.reduce((sum, entry) => sum + entry.total, 0)
    printTableReport({
      title: `${project.name} · Construction Cost Report`,
      description: `${project.location} · ${project.size} ${project.unit} · ${project.status}`,
      headers: ['Date', 'Type', 'Item', 'Category', 'Quantity', 'Unit', 'Rate (PKR)', 'Total (PKR)'],
      rows: entries.map((entry) => [
        entry.date,
        entry.type === 'labour' ? 'Labour' : 'Material',
        entry.item,
        entry.category,
        entry.quantity,
        entry.unit,
        moneyRate(entry.rate),
        money(entry.total),
      ]),
      emptyMessage: 'No construction costs recorded for this project yet.',
      total: { label: 'Total project cost', value: money(projectTotal) },
    })
  }

  return (
    <>
      <PageHeading eyebrow="Portfolio report" title="Cost summary" description="A complete PKR overview across your construction workspace." />
      <div className="grid gap-5 md:grid-cols-3">
        <StatCard icon={Wallet} label="Grand total" value={money(total)} />
        <StatCard icon={Users} label="Labour cost" value={money(labour)} />
        <StatCard icon={Package} label="Material cost" value={money(material)} />
      </div>
      <section className="mt-8 overflow-hidden rounded-2xl border border-[#dfe4df] bg-[#fbfcfa]">
        <div className="border-b border-[#e7ebe7] p-5"><h2 className="font-semibold text-[#173c35]">Project register</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-[#f0f4ef] text-xs uppercase tracking-wider text-[#789087]"><tr><th className="px-5 py-4">Project</th><th className="px-5 py-4">Location</th><th className="px-5 py-4">Area</th><th className="px-5 py-4 text-right">Combined cost</th><th className="px-5 py-4 text-right">Report</th></tr></thead>
            <tbody>{projects.map((project) => {
              const projectTotal = project.entries.reduce((sum, entry) => sum + entry.total, 0)
              return <tr key={project.id} className="border-t border-[#e7ebe7]"><td className="px-5 py-4 font-semibold">{project.name}</td><td className="px-5 py-4">{project.location}</td><td className="px-5 py-4">{project.size} {project.unit}</td><td className="px-5 py-4 text-right font-bold">{money(projectTotal)}</td><td className="px-5 py-4 text-right"><button onClick={() => printProject(project)} title={`Print ${project.name} report`} aria-label={`Print ${project.name} report`} className="inline-grid size-9 place-items-center rounded-lg text-[#527263] hover:bg-[#e7f0df]"><Printer size={18} /></button></td></tr>
            })}</tbody>
          </table>
        </div>
      </section>
    </>
  )
}
