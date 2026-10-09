import type { CostEntry, Project as ApiProject } from '@/lib/api'

export type Project = ApiProject
export type Entry = CostEntry
export type EntrySearchField = 'all' | 'item' | 'category' | 'unit' | 'date'

export type ViewName = 'dashboard' | 'projects' | 'reports' | 'labour' | 'material'

export const cities = [
  'Lahore, Punjab',
  'Islamabad Capital',
  'Karachi, Sindh',
  'Rawalpindi, Punjab',
  'Faisalabad, Punjab',
  'Sahiwal, Punjab',
  'Okara, Punjab',
  'Peshawar, Khyber Pakhtunkhwa',
  'Multan, Punjab',
  'Gujranwala, Punjab',
  'Sialkot, Punjab',
  'Quetta, Balochistan',
]

export const money = (amount: number) => new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  maximumFractionDigits: 0,
}).format(amount)

export const moneyRate = (amount: number) => new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  maximumFractionDigits: 2,
}).format(amount)
