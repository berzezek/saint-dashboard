// src/stores/leads.ts
import { defineStore } from 'pinia'
import type { Lead } from '../types'

export type LeadStatus = 'NEW' | 'CALLBACK'
export type LeadRow = Lead & { totalPrice: number }

function calcTotalPrice(lead: Lead) {
  return (lead.parts ?? []).reduce((sum, p) => sum + p.price * p.value, 0)
}

// (опционально) стартовые данные, перенёс из компонента:
const initialLeads: Lead[] = [
  {
    id: 1,
    code: 'SPB123',
    description: 'Some desc',
    status: 'NEW',
    address: 'Lenin st. 105',
    customer: {
      id: 1, name: 'John Doe', email: 'john_doe@foo.bar', phone: '123-456-789', messenger: 'john_doe'
    },
    author: {
      id: 1, name: 'John Doe', email: 'john_doe@foo.bar', status: 'subscribed', location: 'Pushkina st. 40'
    },
    product: {
      id: 1, name: 'Super App', category: { id: 1, name: 'Bosch' }
    },
    parts: [{ id: 1, name: 'Change fuse', price: 100, value: 2 }, { id: 2, name: 'Clean filter', price: 150, value: 2 }]
  },
  {
    id: 2,
    code: 'SPB246',
    status: 'CALLBACK',
    description: 'Some desc',
    address: 'Lenin st. 106',
    customer: {
      id: 2, name: 'Jane Doe', email: 'jane_doe@foo.bar', phone: '987-654-321', messenger: 'jane_doe'
    },
    author: {
      id: 2, name: 'Jane Doe', email: 'jane_doe@foo.bar', status: 'unsubscribed', location: 'Pushkina st. 45'
    },
    product: {
      id: 2, name: 'New Product', category: { id: 2, name: 'Moulinex' }
    },
    parts: []
  }
]

export const useLeadsStore = defineStore('leads', {
  state: () => ({
    leads: initialLeads as Lead[],
    lead: {} as Lead,
    statusFilter: 'all' as 'all' | LeadStatus,
    isFetching: false as boolean
  }),
  getters: {
    /** Линии таблицы с предвычисленным totalPrice */
    rows(state): LeadRow[] {
      // @ts-ignore
      return state.leads.map(l => ({ ...l, totalPrice: calcTotalPrice(l) }))
    },
    /** Применённый фильтр по статусу */
    filteredRows(): LeadRow[] {
      if (this.statusFilter === 'all') return this.rows
      return this.rows.filter(l => l.status === this.statusFilter)
    },
    // @ts-ignore
    byId: (state) => (id: string | number ) => state.leads.find(l => l.id === id),
  },
  actions: {

    /** Частичное обновление по id */
    update(id: number, patch: Partial<Lead>) {
      const idx = this.leads.findIndex(l => l.id === id)
      if (idx === -1) return false
      this.leads[idx] = { ...this.leads[idx], ...patch }
      return true
    },
    /** Удаление по id */
    remove(id: number) {
      const idx = this.leads.findIndex(l => l.id === id)
      if (idx === -1) return false
      this.leads.splice(idx, 1)
      return true
    },
    setStatusFilter(status: 'all' | LeadStatus) {
      this.statusFilter = status
    },
    /** Имитация загрузки (если пригодится) */
    async fetchAll(fetcher?: () => Promise<Lead[]>) {
      try {
        this.isFetching = true
        const result = fetcher ? await fetcher() : []
        if (result.length) this.leads = result
      } finally {
        this.isFetching = false
      }
    },
  }
})