'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ApiError, apiRequest, clearToken, getToken, type CostEntry, type LabourContract, type Project, type User } from '@/lib/api'
import { useToast } from '@/components/toast-provider'
import { CostView } from './cost-view'
import { ConfirmDeleteDialog } from './confirm-delete-dialog'
import { DashboardHeader } from './dashboard-header'
import { EntryModal } from './entry-modal'
import { Overview } from './overview'
import { ProjectModal } from './project-modal'
import { ProjectsView } from './projects-view'
import { ReportsView } from './reports-view'
import { Sidebar } from './sidebar'
import type { Entry, ViewName } from './types'

function readDashboardLocation(projects: Project[]) {
  const params = new URLSearchParams(window.location.search)
  const requestedView = params.get('view')
  const validViews: ViewName[] = ['dashboard', 'projects', 'reports', 'labour', 'material']
  let view = validViews.includes(requestedView as ViewName) ? requestedView as ViewName : 'dashboard'
  const requestedProjectId = params.get('project')
  const projectId = projects.some((project) => project.id === requestedProjectId) ? requestedProjectId : null

  if ((view === 'labour' || view === 'material') && !projectId) view = 'projects'
  return { view, projectId }
}

export function DashboardApp() {
  const router = useRouter()
  const showToast = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [view, setView] = useState<ViewName>('dashboard')
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState<'project' | 'labour' | 'material' | 'edit-entry' | null>(null)
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null)
  const [entryToEdit, setEntryToEdit] = useState<Entry | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{ type: 'project'; project: Project } | { type: 'entry'; entry: Entry } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [pageError, setPageError] = useState('')
  const [mutationError, setMutationError] = useState('')
  const [loadAttempt, setLoadAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function loadWorkspace() {
      if (!getToken()) {
        router.replace('/login')
        return
      }

      setIsLoading(true)
      setPageError('')
      try {
        const [profile, result] = await Promise.all([
          apiRequest<{ user: User }>('/auth/me'),
          apiRequest<{ projects: Project[] }>('/projects'),
        ])
        if (cancelled) return
        setUser(profile.user)
        setProjects(result.projects)
        const location = readDashboardLocation(result.projects)
        setView(location.view)
        setSelectedProjectId(location.projectId)
      } catch (requestError) {
        if (cancelled) return
        if (requestError instanceof ApiError && requestError.status === 401) {
          clearToken()
          router.replace('/login')
          return false
        }
        setPageError(requestError instanceof Error ? requestError.message : 'Unable to load your workspace.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadWorkspace()
    return () => { cancelled = true }
  }, [loadAttempt, router])

  useEffect(() => {
    if (isLoading) return

    function restoreLocation() {
      const location = readDashboardLocation(projects)
      setView(location.view)
      setSelectedProjectId(location.projectId)
      setQuery('')
      setMutationError('')
    }

    window.addEventListener('popstate', restoreLocation)
    return () => window.removeEventListener('popstate', restoreLocation)
  }, [isLoading, projects])

  const selectedProject = projects.find((project) => project.id === selectedProjectId) || null
  const allEntries = useMemo(() => projects.flatMap((project) => project.entries || []), [projects])
  const labourTotal = useMemo(() => allEntries.filter((entry) => entry.type === 'labour').reduce((total, entry) => total + entry.total, 0), [allEntries])
  const materialTotal = useMemo(() => allEntries.filter((entry) => entry.type === 'material').reduce((total, entry) => total + entry.total, 0), [allEntries])
  const visibleEntries = useMemo(() => {
    if (!selectedProject || (view !== 'labour' && view !== 'material')) return []
    const search = query.trim().toLowerCase()
    return selectedProject.entries
      .filter((entry) => entry.type === view)
      .filter((entry) => `${entry.item} ${entry.category} ${entry.date}`.toLowerCase().includes(search))
      .sort((first, second) => second.date.localeCompare(first.date))
  }, [query, selectedProject, view])
  const selectedTotal = (selectedProject?.entries || [])
    .filter((entry) => entry.type === view)
    .reduce((total, entry) => total + entry.total, 0)

  function navigate(nextView: ViewName, projectId = selectedProjectId) {
    setView(nextView)
    setSelectedProjectId(projectId)
    setSidebarOpen(false)
    setQuery('')
    setMutationError('')
    const params = new URLSearchParams()
    if (nextView !== 'dashboard') params.set('view', nextView)
    if (projectId) params.set('project', projectId)
    const queryString = params.toString()
    window.history.pushState(null, '', queryString ? `/dashboard?${queryString}` : '/dashboard')
  }

  async function createProject(data: Pick<Project, 'name' | 'location' | 'address' | 'unit' | 'size'>) {
    setIsSaving(true)
    setMutationError('')
    try {
      const result = await apiRequest<{ project: Project }>('/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      setProjects((current) => [result.project, ...current])
      setModal(null)
      navigate('labour', result.project.id)
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        clearToken()
        router.replace('/login')
        return
      }
      setMutationError(requestError instanceof Error ? requestError.message : 'Unable to save this project.')
    } finally {
      setIsSaving(false)
    }
  }

  async function updateProject(data: Pick<Project, 'name' | 'location' | 'address' | 'unit' | 'size'>) {
    if (!projectToEdit) return
    setIsSaving(true)
    setMutationError('')
    try {
      const result = await apiRequest<{ project: Project }>(`/projects/${projectToEdit.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
      setProjects((current) => current.map((project) => project.id === result.project.id ? result.project : project))
      setModal(null)
      setProjectToEdit(null)
      showToast('Project updated.')
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        clearToken()
        router.replace('/login')
        return
      }
      setMutationError(requestError instanceof ApiError && (requestError.status === 404 || requestError.status === 405)
        ? 'The configured API does not support project updates yet. Deploy the latest server changes, then try again.'
        : requestError instanceof Error ? requestError.message : 'Unable to update this project.')
    } finally {
      setIsSaving(false)
    }
  }

  async function saveLabourContract(contract: Pick<LabourContract, 'length' | 'width' | 'rate'>): Promise<boolean> {
    if (!selectedProject) return false
    setIsSaving(true)
    setMutationError('')
    try {
      const result = await apiRequest<{ labourContract: LabourContract }>(`/projects/${selectedProject.id}/labour-contract`, {
        method: 'PATCH',
        body: JSON.stringify(contract),
      })
      setProjects((current) => current.map((project) => project.id === selectedProject.id
        ? { ...project, labourContract: result.labourContract }
        : project))
      showToast('Thakadar contract saved.')
      return true
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        clearToken()
        router.replace('/login')
        return false
      }
      setMutationError(requestError instanceof ApiError && (requestError.status === 404 || requestError.status === 405)
        ? 'The configured API does not support labour contracts yet. Deploy the latest server changes, then try again.'
        : requestError instanceof Error ? requestError.message : 'Unable to save the labour contract.')
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteProject(project: Project) {
    setIsSaving(true)
    try {
      await apiRequest<{ message: string }>(`/projects/${project.id}`, { method: 'DELETE' })
      setProjects((current) => current.filter((currentProject) => currentProject.id !== project.id))
      if (selectedProjectId === project.id) navigate('projects', null)
      setPendingDelete(null)
      showToast('Project deleted.')
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        clearToken()
        router.replace('/login')
        return
      }
      showToast(requestError instanceof Error ? requestError.message : 'Unable to delete this project.')
    } finally {
      setIsSaving(false)
    }
  }

  async function createEntry(kind: 'labour' | 'material', data: Omit<Entry, 'id' | 'total' | 'projectId' | 'type'>) {
    if (!selectedProject) return
    setIsSaving(true)
    setMutationError('')
    try {
      const result = await apiRequest<{ entry: CostEntry }>(`/projects/${selectedProject.id}/entries`, {
        method: 'POST',
        body: JSON.stringify({ ...data, type: kind }),
      })
      setProjects((current) => current.map((project) => project.id === selectedProject.id
        ? { ...project, entries: [result.entry, ...project.entries] }
        : project))
      setModal(null)
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        clearToken()
        router.replace('/login')
        return
      }
      setMutationError(requestError instanceof Error ? requestError.message : 'Unable to save this entry.')
    } finally {
      setIsSaving(false)
    }
  }

  async function updateEntry(entry: Entry, data: Omit<Entry, 'id' | 'total' | 'projectId' | 'type'>) {
    if (!selectedProject) return
    setIsSaving(true)
    setMutationError('')
    try {
      const result = await apiRequest<{ entry: CostEntry }>(`/projects/${selectedProject.id}/entries/${entry.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
      setProjects((current) => current.map((project) => project.id === selectedProject.id
        ? { ...project, entries: project.entries.map((currentEntry) => currentEntry.id === entry.id ? result.entry : currentEntry) }
        : project))
      setModal(null)
      setEntryToEdit(null)
      showToast('Entry updated.')
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        clearToken()
        router.replace('/login')
        return
      }
      setMutationError(requestError instanceof Error ? requestError.message : 'Unable to update this entry.')
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteEntry(entry: Entry) {
    if (!selectedProject) return
    setIsSaving(true)
    try {
      await apiRequest<{ message: string }>(`/projects/${selectedProject.id}/entries/${entry.id}`, { method: 'DELETE' })
      setProjects((current) => current.map((project) => project.id === selectedProject.id
        ? { ...project, entries: project.entries.filter((currentEntry) => currentEntry.id !== entry.id) }
        : project))
      setPendingDelete(null)
      showToast('Entry deleted.')
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        clearToken()
        router.replace('/login')
        return
      }
      showToast(requestError instanceof Error ? requestError.message : 'Unable to delete this entry.')
    } finally {
      setIsSaving(false)
    }
  }

  function logout() {
    clearToken()
    showToast('You have been logged out.')
    router.replace('/login')
    router.refresh()
  }

  if (isLoading) {
    return <main className="grid h-dvh place-items-center bg-[#f4f5f2] text-sm font-medium text-[#527263]" role="status">Loading your workspace…</main>
  }

  if (pageError || !user) {
    return (
      <main className="grid h-dvh place-items-center bg-[#f4f5f2] px-5 text-[#18211f]">
        <section className="w-full max-w-md rounded-2xl border border-[#dfe4df] bg-[#fbfcfa] p-7 text-center">
          <h1 className="text-xl font-semibold text-[#173c35]">Workspace unavailable</h1>
          <p className="mt-2 text-sm text-[#7a8780]">{pageError || 'Sign in to open your workspace.'}</p>
          {pageError ? <button onClick={() => setLoadAttempt((attempt) => attempt + 1)} className="mt-5 rounded-xl bg-[#173c35] px-4 py-2.5 text-sm font-bold text-white">Try again</button> : <button onClick={() => router.replace('/login')} className="mt-5 rounded-xl bg-[#173c35] px-4 py-2.5 text-sm font-bold text-white">Go to sign in</button>}
        </section>
      </main>
    )
  }

  return (
    <main className="h-dvh overflow-hidden bg-[#f4f5f2] text-[#18211f]">
      <div className="flex h-full min-h-0">
        <Sidebar
          open={sidebarOpen}
          view={view}
          hasSelectedProject={Boolean(selectedProject)}
          onNavigate={navigate}
          onClose={() => setSidebarOpen(false)}
          onLogout={logout}
        />
        <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <DashboardHeader view={view} project={selectedProject} user={user} onOpenMenu={() => setSidebarOpen(true)} />
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
            <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10">
              {view === 'dashboard' && <Overview name={user.name} projects={projects} onProjects={() => navigate('projects')} onNew={() => { setMutationError(''); setModal('project') }} labour={labourTotal} material={materialTotal} />}
              {view === 'projects' && <ProjectsView projects={projects} onNew={() => { setProjectToEdit(null); setMutationError(''); setModal('project') }} onEdit={(project) => { setProjectToEdit(project); setMutationError(''); setModal('project') }} onDelete={(project) => setPendingDelete({ type: 'project', project })} onOpen={(project) => navigate('labour', project.id)} />}
              {(view === 'labour' || view === 'material') && selectedProject && (
                <CostView
                  kind={view}
                  project={selectedProject}
                  rows={visibleEntries}
                  total={selectedTotal}
                  query={query}
                  onQueryChange={setQuery}
                  onAdd={() => { setMutationError(''); setModal(view) }}
                  onEdit={(entry) => { setEntryToEdit(entry); setMutationError(''); setModal('edit-entry') }}
                  onDelete={(entry) => setPendingDelete({ type: 'entry', entry })}
                  isBusy={isSaving}
                  onSaveLabourContract={saveLabourContract}
                  contractError={mutationError}
                  onBack={() => navigate('projects', null)}
                />
              )}
              {view === 'reports' && <ReportsView labour={labourTotal} material={materialTotal} projects={projects} />}
            </div>
          </div>
        </section>
      </div>
      {modal === 'project' && <ProjectModal key={projectToEdit?.id || 'new-project'} project={projectToEdit || undefined} onClose={() => { setModal(null); setProjectToEdit(null) }} onSave={projectToEdit ? updateProject : createProject} isSaving={isSaving} error={mutationError} />}
      {(modal === 'labour' || modal === 'material') && <EntryModal key={modal} kind={modal} onClose={() => setModal(null)} onSave={(entry) => createEntry(modal, entry)} isSaving={isSaving} error={mutationError} />}
      {modal === 'edit-entry' && entryToEdit && <EntryModal key={entryToEdit.id} kind={entryToEdit.type} entry={entryToEdit} onClose={() => { setModal(null); setEntryToEdit(null) }} onSave={(data) => updateEntry(entryToEdit, data)} isSaving={isSaving} error={mutationError} />}
      {pendingDelete && (
        <ConfirmDeleteDialog
          title={pendingDelete.type === 'project' ? 'Delete this project?' : 'Delete this entry?'}
          description={pendingDelete.type === 'project'
            ? `“${pendingDelete.project.name}” and all its cost entries will be permanently deleted. This action cannot be undone.`
            : `“${pendingDelete.entry.item}” will be permanently deleted. This action cannot be undone.`}
          isDeleting={isSaving}
          onCancel={() => { if (!isSaving) setPendingDelete(null) }}
          onConfirm={() => void (pendingDelete.type === 'project' ? deleteProject(pendingDelete.project) : deleteEntry(pendingDelete.entry))}
        />
      )}
    </main>
  )
}
