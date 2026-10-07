import { ArrowLeft, ClipboardList, MapPin, Plus } from 'lucide-react'
import type { Project } from './types'
import { EmptyState, PageHeading } from './shared'

type ProjectsViewProps = {
  projects: Project[]
  onNew: () => void
  onOpen: (project: Project) => void
}

export function ProjectsView({ projects, onNew, onOpen }: ProjectsViewProps) {
  return (
    <>
      <PageHeading eyebrow="Workspace" title="New project" description="Choose an existing property or start a new estimate.">
        <button onClick={onNew} className="flex w-fit items-center gap-2 rounded-xl bg-[#d9f073] px-4 py-2.5 text-sm font-bold text-[#173c35]"><Plus />Add project</button>
      </PageHeading>
      {projects.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <button key={project.id} onClick={() => onOpen(project)} className="rounded-2xl border border-[#dfe4df] bg-[#fbfcfa] p-5 text-left transition hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-8 flex items-start justify-between">
                <div className="grid size-11 place-items-center rounded-xl bg-[#e7f0df] text-[#527263]"><ClipboardList /></div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#d9e5eb] bg-[#e9eff2] px-3 py-1.5 text-xs font-semibold leading-none text-[#597589]">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-[#7896a8]" />
                  {project.status}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-[#173c35]">{project.name}</h2>
              <p className="mt-1 flex items-center gap-1 text-sm text-[#7d8982]"><MapPin size={14} />{project.location}</p>
              <div className="mt-6 border-t border-[#e7ebe7] pt-4 text-sm font-bold text-[#30433a]">{project.size} {project.unit}<span className="float-right text-[#386151]">Open <ArrowLeft className="inline rotate-180" size={14} /></span></div>
            </button>
          ))}
        </div>
      ) : <EmptyState title="No projects yet" description="Create a project to start tracking construction costs." onAction={onNew} actionLabel="Create project" />}
    </>
  )
}
