'use client'

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/$/, '')
const TOKEN_KEY = 'buildwise_token'

export type CostEntry = {
  id: string
  projectId: string
  type: 'labour' | 'material'
  date: string
  item: string
  category: string
  quantity: number
  unit: string
  rate: number
  total: number
}

export type Project = {
  id: string
  name: string
  location: string
  address: string
  unit: string
  size: number
  status: string
  entries: CostEntry[]
}

export type User = { id: string; name: string; email: string }

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message)
    this.name = 'ApiError'
  }
}

export function getToken() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY) || window.sessionStorage.getItem(TOKEN_KEY)
}

export function saveToken(token: string, remember = true) {
  clearToken()
  const storage = remember ? window.localStorage : window.sessionStorage
  storage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(TOKEN_KEY)
  window.sessionStorage.removeItem(TOKEN_KEY)
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new ApiError(`Cannot reach Buildwise API at ${API_URL}. Make sure the server is running and allows this app's origin.`, 0)
  }
  const responseText = await response.text()
  let payload: { message?: string } = {}
  if (responseText) {
    try {
      payload = JSON.parse(responseText) as { message?: string }
    } catch {
      if (!response.ok) {
        throw new ApiError(`API request failed (${response.status} ${response.statusText}). The server returned an unexpected response.`, response.status)
      }
      throw new ApiError('The server returned an invalid response. Please try again.', response.status)
    }
  }
  if (!response.ok) throw new ApiError(payload.message || `API request failed (${response.status} ${response.statusText}).`, response.status)
  if (!responseText) throw new ApiError('The server returned an empty response. Please try again.', response.status)
  return payload as T
}
